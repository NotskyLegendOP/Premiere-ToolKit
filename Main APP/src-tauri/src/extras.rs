// Premiere Toolbox extras: yt-dlp downloader (with live progress) + folder scan with modified time.
// Put this file next to main.rs (src-tauri/src/extras.rs).
use serde::Serialize;
use std::io::{BufRead, BufReader, Read};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{Instant, UNIX_EPOCH};
use tauri::{AppHandle, Emitter};

#[cfg(windows)]
use std::os::windows::process::CommandExt;

fn quiet(c: &mut Command) {
    #[cfg(windows)]
    {
        c.creation_flags(0x0800_0000); // no black console window
    }
    let _ = c;
}

fn works(prog: &str, pre: &[&str], probe: &str) -> bool {
    let mut c = Command::new(prog);
    c.args(pre).arg(probe).stdout(Stdio::null()).stderr(Stdio::null());
    quiet(&mut c);
    c.status().map(|s| s.success()).unwrap_or(false)
}

fn local_dir() -> Option<PathBuf> {
    std::env::var_os("LOCALAPPDATA").map(PathBuf::from)
}
fn tool_dir() -> Option<PathBuf> {
    local_dir().map(|d| d.join("PremiereToolbox"))
}
fn winget_dir(sub: &str) -> Option<PathBuf> {
    local_dir().map(|d| d.join("Microsoft").join("WinGet").join(sub))
}

// Finds yt-dlp on PATH, in the winget folders (works even before a PATH refresh), next to the app, or via python.
fn find_ytdlp() -> Option<(String, Vec<String>)> {
    let mut cands: Vec<(String, Vec<String>)> = vec![("yt-dlp".into(), vec![])];
    let mut files: Vec<PathBuf> = Vec::new();
    if let Some(d) = tool_dir() {
        files.push(d.join("yt-dlp.exe"));
    }
    if let Some(d) = winget_dir("Links") {
        files.push(d.join("yt-dlp.exe"));
    }
    if let Some(pk) = winget_dir("Packages") {
        if let Ok(rd) = std::fs::read_dir(&pk) {
            for e in rd.flatten() {
                if e.file_name().to_string_lossy().to_lowercase().starts_with("yt-dlp") {
                    files.push(e.path().join("yt-dlp.exe"));
                }
            }
        }
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(d) = exe.parent() {
            files.push(d.join("yt-dlp.exe"));
        }
    }
    for f in files {
        if f.is_file() {
            cands.push((f.to_string_lossy().to_string(), vec![]));
        }
    }
    cands.push(("python".into(), vec!["-m".into(), "yt_dlp".into()]));
    cands.push(("py".into(), vec!["-m".into(), "yt_dlp".into()]));
    for (p, pre) in cands {
        let pr: Vec<&str> = pre.iter().map(|s| s.as_str()).collect();
        if works(&p, &pr, "--version") {
            return Some((p, pre));
        }
    }
    None
}

// None = not found, Some(None) = on PATH, Some(Some(dir)) = found in that folder.
fn find_ffmpeg() -> Option<Option<String>> {
    if works("ffmpeg", &[], "-version") {
        return Some(None);
    }
    let mut dirs: Vec<PathBuf> = Vec::new();
    if let Some(d) = tool_dir() {
        dirs.push(d);
    }
    if let Some(d) = winget_dir("Links") {
        dirs.push(d);
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(d) = exe.parent() {
            dirs.push(d.to_path_buf());
        }
    }
    if let Some(pk) = winget_dir("Packages") {
        if let Ok(rd) = std::fs::read_dir(&pk) {
            for e in rd.flatten() {
                if !e.file_name().to_string_lossy().to_lowercase().contains("ffmpeg") {
                    continue;
                }
                let base = e.path();
                dirs.push(base.clone());
                dirs.push(base.join("bin"));
                if let Ok(rd2) = std::fs::read_dir(&base) {
                    for s in rd2.flatten() {
                        dirs.push(s.path().join("bin"));
                    }
                }
            }
        }
    }
    for d in dirs {
        let f = d.join("ffmpeg.exe");
        if f.is_file() && works(&f.to_string_lossy(), &[], "-version") {
            return Some(Some(d.to_string_lossy().to_string()));
        }
    }
    None
}

// One-time download of yt-dlp.exe into %LOCALAPPDATA%\PremiereToolbox
fn download_ytdlp() -> Result<(), String> {
    let dir = tool_dir().ok_or("LOCALAPPDATA not set")?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let out = dir.join("yt-dlp.exe");
    let out_s = out.to_string_lossy().to_string();
    let url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";

    let mut c = Command::new("curl.exe");
    c.args(["-L", "--fail", "-s", "-o", out_s.as_str(), url]).stdout(Stdio::null()).stderr(Stdio::null());
    quiet(&mut c);
    let ok = c.status().map(|s| s.success()).unwrap_or(false);
    if ok && out.is_file() {
        return Ok(());
    }

    let ps = format!(
        "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -UseBasicParsing -Uri '{url}' -OutFile '{out_s}'"
    );
    let mut p = Command::new("powershell");
    p.args(["-NoProfile", "-NonInteractive", "-Command", ps.as_str()]).stdout(Stdio::null()).stderr(Stdio::null());
    quiet(&mut p);
    let ok2 = p.status().map(|s| s.success()).unwrap_or(false);
    if ok2 && out.is_file() {
        Ok(())
    } else {
        let _ = std::fs::remove_file(&out);
        Err("download failed, check your internet".to_string())
    }
}

#[derive(Serialize, Clone)]
struct Prog {
    done: f64,
    total: f64,
    speed: f64,
    eta: f64,
    file: String,
}

fn run(app: &AppHandle, url: String, mode: String, quality: String, dir: String) -> Result<String, String> {
    let (prog, pre) = match find_ytdlp() {
        Some(x) => x,
        None => {
            let _ = app.emit("dl-status", "yt-dlp not found - downloading it once (about 15 MB)...");
            download_ytdlp().map_err(|e| {
                format!("yt-dlp not found and auto-install failed ({e}). Open PowerShell and run: winget install yt-dlp.yt-dlp  (then restart this app)")
            })?;
            find_ytdlp().ok_or_else(|| {
                "yt-dlp not found. Open PowerShell and run: winget install yt-dlp.yt-dlp  (then restart this app)".to_string()
            })?
        }
    };
    std::fs::create_dir_all(&dir).map_err(|e| format!("Cannot use folder: {e}"))?;
    let ff = find_ffmpeg();
    let has_ff = ff.is_some();

    let mut a: Vec<String> = pre;
    for x in [
        "--no-playlist", "--no-colors", "--windows-filenames", "--no-mtime", "--encoding", "utf-8",
        "--quiet", "--progress", "--newline",
        "--progress-template",
        "download:PTBP|%(progress.downloaded_bytes)s|%(progress.total_bytes)s|%(progress.total_bytes_estimate)s|%(progress.speed)s|%(progress.eta)s|%(progress.filename)s",
        "-P", dir.as_str(),
        "-o", "%(title).150s [%(id)s].%(ext)s", "--print", "after_move:filepath",
    ] {
        a.push(x.to_string());
    }
    if let Some(Some(d)) = &ff {
        a.extend(["--ffmpeg-location".to_string(), d.clone()]);
    }
    if mode == "audio" {
        if has_ff {
            a.extend(["-x".to_string(), "--audio-format".to_string(), quality.clone()]);
        } else {
            a.extend(["-f".to_string(), "ba[ext=m4a]/ba".to_string()]);
        }
    } else {
        let h = quality.parse::<u32>().ok();
        if has_ff {
            let f = match h {
                Some(h) => format!("bv*[height<={h}]+ba/b[height<={h}]/b"),
                None => "bv*+ba/b".to_string(),
            };
            a.extend(["-f".to_string(), f, "-S".to_string(), "vcodec:h264,res,acodec:aac".to_string(), "--merge-output-format".to_string(), "mp4".to_string()]);
        } else {
            let f = match h {
                Some(h) => format!("b[height<={h}]/b"),
                None => "b".to_string(),
            };
            a.extend(["-f".to_string(), f]);
        }
    }
    a.push(url);

    let mut c = Command::new(&prog);
    c.args(&a).stdin(Stdio::null()).stdout(Stdio::piped()).stderr(Stdio::piped());
    quiet(&mut c);
    let mut child = c.spawn().map_err(|e| format!("Could not start yt-dlp: {e}"))?;

    // read stderr on its own thread so the pipe never fills up and blocks yt-dlp
    let stderr = child.stderr.take();
    let err_thread = std::thread::spawn(move || {
        let mut s = String::new();
        if let Some(mut e) = stderr {
            let mut buf = Vec::new();
            let _ = e.read_to_end(&mut buf);
            s = String::from_utf8_lossy(&buf).to_string();
        }
        s
    });

    let mut last_path = String::new();
    let mut last_emit: Option<Instant> = None;
    if let Some(so) = child.stdout.take() {
        let mut rd = BufReader::new(so);
        let mut buf: Vec<u8> = Vec::new();
        loop {
            buf.clear();
            match rd.read_until(b'\n', &mut buf) {
                Ok(0) | Err(_) => break,
                Ok(_) => {}
            }
            let line = String::from_utf8_lossy(&buf).trim().to_string();
            if line.is_empty() {
                continue;
            }
            if let Some(rest) = line.strip_prefix("PTBP|") {
                let f: Vec<&str> = rest.splitn(6, '|').collect();
                if f.len() == 6 && last_emit.map(|t| t.elapsed().as_millis() >= 200).unwrap_or(true) {
                    let num = |s: &str| s.trim().parse::<f64>().ok();
                    let name = Path::new(f[5].trim())
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();
                    let _ = app.emit(
                        "dl-progress",
                        Prog {
                            done: num(f[0]).unwrap_or(0.0),
                            total: num(f[1]).or(num(f[2])).unwrap_or(0.0),
                            speed: num(f[3]).unwrap_or(0.0),
                            eta: num(f[4]).unwrap_or(-1.0),
                            file: name,
                        },
                    );
                    last_emit = Some(Instant::now());
                }
            } else {
                last_path = line; // the --print after_move:filepath line
            }
        }
    }
    let status = child.wait().map_err(|e| format!("yt-dlp: {e}"))?;
    let se = err_thread.join().unwrap_or_default();
    if status.success() {
        Ok(last_path)
    } else {
        let tail: Vec<&str> = se.lines().filter(|l| !l.trim().is_empty()).collect();
        let n = tail.len().saturating_sub(4);
        let msg = tail[n..].join("\n");
        Err(if msg.is_empty() { format!("yt-dlp failed ({status})") } else { msg })
    }
}

#[tauri::command]
pub async fn dl_run(app: AppHandle, url: String, mode: String, quality: String, dir: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || run(&app, url, mode, quality, dir))
        .await
        .map_err(|e| e.to_string())?
}

#[derive(Serialize)]
pub struct Asset {
    name: String,
    path: String,
    ext: String,
    kind: String,
    size: u64,
    modified: u64,
}

fn kind_of(ext: &str) -> &'static str {
    match ext {
        "mp4" | "mov" | "mkv" | "avi" | "webm" | "m4v" | "mxf" | "wmv" | "flv" => "video",
        "mp3" | "wav" | "m4a" | "aac" | "flac" | "ogg" | "aif" | "aiff" | "wma" | "opus" => "audio",
        "png" | "jpg" | "jpeg" | "gif" | "webp" | "bmp" | "tif" | "tiff" => "image",
        _ => "other",
    }
}

fn walk(dir: &Path, depth: u32, out: &mut Vec<Asset>) {
    let rd = match std::fs::read_dir(dir) {
        Ok(r) => r,
        Err(_) => return,
    };
    for e in rd.flatten() {
        let p = e.path();
        let name = e.file_name().to_string_lossy().to_string();
        if name.starts_with('.') || name.eq_ignore_ascii_case("desktop.ini") || name.eq_ignore_ascii_case("thumbs.db") {
            continue;
        }
        let md = match e.metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };
        if md.is_dir() {
            if depth < 3 {
                walk(&p, depth + 1, out);
            }
            continue;
        }
        let ext = p.extension().map(|x| x.to_string_lossy().to_lowercase()).unwrap_or_default();
        let modified = md.modified().ok().and_then(|t| t.duration_since(UNIX_EPOCH).ok()).map(|d| d.as_secs()).unwrap_or(0);
        out.push(Asset {
            kind: kind_of(&ext).to_string(),
            name,
            path: p.to_string_lossy().to_string(),
            ext,
            size: md.len(),
            modified,
        });
    }
}

#[tauri::command]
pub fn scan_folder_v2(path: String) -> Result<Vec<Asset>, String> {
    let p = Path::new(&path);
    if !p.is_dir() {
        return Err(format!("Folder not found: {path}"));
    }
    let mut v = Vec::new();
    walk(p, 0, &mut v);
    Ok(v)
}

// ---------- Silence remover helpers (ffmpeg silencedetect) ----------
#[derive(Serialize)]
pub struct SilenceScan {
    duration: f64,
    silences: Vec<[f64; 2]>,
    width: u32,
    height: u32,
    fps: f64,
    has_video: bool,
    sample_rate: u32,
    channels: u32,
}

fn ffmpeg_prog() -> Option<String> {
    match find_ffmpeg() {
        Some(None) => Some("ffmpeg".to_string()),
        Some(Some(d)) => Some(Path::new(&d).join("ffmpeg.exe").to_string_lossy().to_string()),
        None => None,
    }
}

fn num_after(line: &str, key: &str) -> Option<f64> {
    let i = line.find(key)? + key.len();
    let t: String = line[i..]
        .trim_start()
        .chars()
        .take_while(|c| c.is_ascii_digit() || *c == '.' || *c == '-')
        .collect();
    t.parse::<f64>().ok()
}

fn scan_silence(path: String, thr: f64, min_s: f64) -> Result<SilenceScan, String> {
    let ff = ffmpeg_prog().ok_or_else(|| {
        "ffmpeg not found. Open PowerShell and run: winget install Gyan.FFmpeg  (then restart this app)".to_string()
    })?;
    if !Path::new(&path).is_file() {
        return Err(format!("File not found: {path}"));
    }
    let mut c = Command::new(&ff);
    c.args(["-hide_banner", "-nostats", "-i", path.as_str(), "-vn", "-af"])
        .arg(format!("silencedetect=noise={thr}dB:d={min_s}"))
        .args(["-f", "null", "-"])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::piped());
    quiet(&mut c);
    let out = c.output().map_err(|e| format!("Could not start ffmpeg: {e}"))?;
    let text = String::from_utf8_lossy(&out.stderr).to_string();

    let mut sil: Vec<[f64; 2]> = Vec::new();
    let mut open_at: Option<f64> = None;
    let (mut dur, mut w, mut h, mut fps) = (0.0f64, 0u32, 0u32, 0.0f64);
    let (mut has_v, mut has_a, mut sr, mut ch) = (false, false, 48000u32, 2u32);
    for line in text.lines() {
        if let Some(v) = num_after(line, "silence_start:") {
            open_at = Some(v.max(0.0));
        } else if line.contains("silence_end:") {
            if let (Some(e), Some(s)) = (num_after(line, "silence_end:"), open_at.take()) {
                sil.push([s, e]);
            }
        } else if dur == 0.0 && line.contains("Duration:") {
            if let Some(i) = line.find("Duration:") {
                let t = line[i + 9..].trim().split(',').next().unwrap_or("");
                let p: Vec<&str> = t.split(':').collect();
                if p.len() == 3 {
                    dur = p[0].trim().parse::<f64>().unwrap_or(0.0) * 3600.0
                        + p[1].parse::<f64>().unwrap_or(0.0) * 60.0
                        + p[2].parse::<f64>().unwrap_or(0.0);
                }
            }
        } else if !has_v && line.contains(" Video:") && !line.contains("attached pic") {
            has_v = true;
            for tok in line.split(", ") {
                let t = tok.trim();
                if t.ends_with(" fps") {
                    fps = t.trim_end_matches(" fps").trim().parse::<f64>().unwrap_or(0.0);
                } else if w == 0 {
                    if let Some(first) = t.split_whitespace().next() {
                        if let Some((a, b)) = first.split_once('x') {
                            if let (Ok(a), Ok(b)) = (a.parse::<u32>(), b.parse::<u32>()) {
                                if a >= 16 && b >= 16 {
                                    w = a;
                                    h = b;
                                }
                            }
                        }
                    }
                }
            }
        } else if !has_a && line.contains(" Audio:") {
            has_a = true;
            for tok in line.split(", ") {
                let t = tok.trim();
                if t.ends_with(" Hz") {
                    sr = t.trim_end_matches(" Hz").trim().parse::<u32>().unwrap_or(48000);
                } else if t == "mono" {
                    ch = 1;
                } else if t == "stereo" {
                    ch = 2;
                }
            }
        }
    }
    if !has_a {
        return Err("This file has no audio track.".to_string());
    }
    if dur <= 0.0 {
        let tail: Vec<&str> = text.lines().filter(|l| !l.trim().is_empty()).collect();
        let n = tail.len().saturating_sub(3);
        return Err(format!("ffmpeg could not read this file:\n{}", tail[n..].join("\n")));
    }
    if let Some(s) = open_at {
        if dur > s {
            sil.push([s, dur]); // silence runs to the end of the file
        }
    }
    Ok(SilenceScan { duration: dur, silences: sil, width: w, height: h, fps, has_video: has_v, sample_rate: sr, channels: ch })
}

#[tauri::command]
pub async fn silence_scan(path: String, thr: f64, min_s: f64) -> Result<SilenceScan, String> {
    tauri::async_runtime::spawn_blocking(move || scan_silence(path, thr, min_s))
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
pub fn write_text(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, content).map_err(|e| format!("Could not write {path}: {e}"))
}
