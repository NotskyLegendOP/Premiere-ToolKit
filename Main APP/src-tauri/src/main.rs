#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod captions;
mod extras;
mod presets;
use serde::Serialize;
use std::{fs, path::Path};

#[derive(Serialize)]
struct Asset { name: String, path: String, ext: String, kind: &'static str, size: u64 }

fn kind(ext: &str) -> &'static str {
    match ext {
        "mp4"|"mov"|"avi"|"mkv"|"webm"|"m4v"|"wmv"|"flv"|"mxf" => "video",
        "mp3"|"wav"|"m4a"|"aac"|"flac"|"ogg"|"aif"|"aiff" => "audio",
        "png"|"jpg"|"jpeg"|"gif"|"svg"|"webp"|"bmp"|"tif"|"tiff" => "image",
        _ => "other",
    }
}

fn walk(dir: &Path, out: &mut Vec<Asset>) {
    let Ok(rd) = fs::read_dir(dir) else { return };
    for e in rd.flatten() {
        let p = e.path();
        if p.is_dir() { walk(&p, out); continue; }
        let ext = p.extension().and_then(|s| s.to_str()).unwrap_or("").to_lowercase();
        let k = kind(&ext);
        if k == "other" { continue; }
        let size = e.metadata().map(|m| m.len()).unwrap_or(0);
        out.push(Asset { name: e.file_name().to_string_lossy().into(), path: p.to_string_lossy().into(), ext, kind: k, size });
    }
}

#[tauri::command]
async fn scan_folder(path: String) -> Result<Vec<Asset>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let p = Path::new(&path);
        if !p.is_dir() { return Err(format!("Folder not found or unavailable: {path}")); }
        let mut v = Vec::new(); walk(p, &mut v);
        v.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
        Ok(v)
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
fn save_trim(key: String, name: String, bytes: Vec<u8>) -> Result<String, String> {
    let clean = |s: &str| -> String { s.chars().map(|c| if c.is_alphanumeric() || " ._-()".contains(c) { c } else { '_' }).collect() };
    let base = std::env::var_os("LOCALAPPDATA").map(std::path::PathBuf::from).unwrap_or_else(std::env::temp_dir)
        .join("PremiereToolbox").join("trims").join(clean(&key));
    fs::create_dir_all(&base).map_err(|e| e.to_string())?;
    let p = base.join(clean(&name));
    fs::write(&p, bytes).map_err(|e| e.to_string())?;
    Ok(p.to_string_lossy().into())
}

#[tauri::command]
fn drag_icon() -> Result<String, String> {
    let p = std::env::temp_dir().join("premiere_toolbox_drag.png");
    fs::write(&p, include_bytes!("../icons/icon.png")).map_err(|e| e.to_string())?;
    Ok(p.to_string_lossy().into())
}


// ---- Premiere bridge: tiny local HTTP server (127.0.0.1:47800) ----
use std::io::{BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::Mutex;
use std::time::{Duration, Instant};

struct Bridge { pending: Option<String>, result: Option<String>, last_poll: Option<Instant>, taken: bool, replied: i64 }
static BR: Mutex<Bridge> = Mutex::new(Bridge { pending: None, result: None, last_poll: None, taken: false, replied: -1 });

fn respond(s: &mut TcpStream, status: &str, body: &str) {
    let r = format!("HTTP/1.1 {status}\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}", body.len());
    let _ = s.write_all(r.as_bytes());
}

fn handle(mut s: TcpStream) {
    let _ = s.set_read_timeout(Some(Duration::from_secs(3)));
    let mut rd = BufReader::new(s.try_clone().unwrap());
    let mut line = String::new();
    if rd.read_line(&mut line).is_err() { return; }
    let mut parts = line.split_whitespace();
    let (method, path) = (parts.next().unwrap_or("").to_string(), parts.next().unwrap_or("").to_string());
    let mut len = 0usize;
    let mut chunked = false;
    loop {
        let mut h = String::new();
        if rd.read_line(&mut h).is_err() || h.trim().is_empty() { break; }
        let hl = h.to_lowercase();
        if let Some(v) = hl.strip_prefix("content-length:") { len = v.trim().parse().unwrap_or(0); }
        if hl.starts_with("transfer-encoding:") && hl.contains("chunked") { chunked = true; }
    }
    // Some clients (Premiere's UXP fetch) send the body in chunks without a Content-Length.
    let mut raw: Vec<u8> = Vec::new();
    if chunked {
        loop {
            let mut sz = String::new();
            if rd.read_line(&mut sz).is_err() { break; }
            let n = usize::from_str_radix(sz.trim().split(';').next().unwrap_or("0"), 16).unwrap_or(0);
            if n == 0 { let mut t = String::new(); let _ = rd.read_line(&mut t); break; }
            let mut chunk = vec![0u8; n];
            if rd.read_exact(&mut chunk).is_err() { break; }
            raw.extend_from_slice(&chunk);
            let mut crlf = String::new(); let _ = rd.read_line(&mut crlf);
        }
    } else if len > 0 {
        raw = vec![0u8; len];
        let _ = rd.read_exact(&mut raw);
    }
    let body = String::from_utf8_lossy(&raw).to_string();
    match (method.as_str(), path.as_str()) {
        ("OPTIONS", _) => respond(&mut s, "204 No Content", ""),
        ("GET", "/pending") => {
            let mut b = BR.lock().unwrap(); b.last_poll = Some(Instant::now());
            match b.pending.take() { Some(j) => { b.taken = true; respond(&mut s, "200 OK", &j) }, None => respond(&mut s, "204 No Content", "") }
        }
        ("POST", "/result") => {
            { let mut b = BR.lock().unwrap(); b.replied = body.len() as i64; if !body.is_empty() { b.result = Some(body); } }
            respond(&mut s, "200 OK", "{}");
        }
        _ => respond(&mut s, "404 Not Found", "{}"),
    }
}

fn serve() {
    let Ok(l) = TcpListener::bind("127.0.0.1:47800") else { return };
    for st in l.incoming().flatten() { std::thread::spawn(|| handle(st)); }
}

#[derive(Serialize)]
struct Status { connected: bool, result: Option<String>, taken: bool, replied: i64 }

#[tauri::command]
fn send_curve(json: String) -> Result<(), String> {
    let mut b = BR.lock().map_err(|e| e.to_string())?; b.pending = Some(json); b.result = None; b.taken = false; b.replied = -1; Ok(())
}
#[tauri::command]
fn bridge_status() -> Status {
    let b = BR.lock().unwrap();
    Status { connected: b.last_poll.map(|t| t.elapsed() < Duration::from_secs(3)).unwrap_or(false), result: b.result.clone(), taken: b.taken, replied: b.replied }
}

fn main() {
    std::thread::spawn(serve);
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_drag::init())
        .invoke_handler(tauri::generate_handler![captions::words_srt, captions::save_text_file, scan_folder, drag_icon, save_trim, send_curve, bridge_status, extras::dl_run, extras::scan_folder_v2, extras::silence_scan, extras::write_text, presets::preset_list])
        .run(tauri::generate_context!())
        .expect("error while running app");
}