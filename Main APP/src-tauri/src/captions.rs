// Word-by-word SRT: ffmpeg cuts/converts the audio, whisper.cpp transcribes it (one word per subtitle).
use serde::Deserialize;
use std::{fs, process::Command};
#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[derive(Deserialize)]
pub struct Req {
    media: String,
    start: f64,
    dur: f64,
    ffmpeg: String,
    whisper: String,
    model: String,
    lang: String,
    threads: u32,
}

fn run(mut c: Command) -> Result<std::process::Output, String> {
    #[cfg(windows)]
    c.creation_flags(0x08000000); // no console window
    let name = format!("{:?}", c.get_program());
    c.output().map_err(|e| format!("could not start {name}: {e}"))
}

fn work(r: Req) -> Result<String, String> {
    let tmp = std::env::temp_dir().join("ptb_captions");
    fs::create_dir_all(&tmp).map_err(|e| e.to_string())?;
    let wav = tmp.join("voice.wav");
    let prefix = tmp.join("voice");
    let srt = tmp.join("voice.srt");
    let _ = fs::remove_file(&wav);
    let _ = fs::remove_file(&srt);

    // 1) audio -> 16 kHz mono wav
    let ff = if r.ffmpeg.trim().is_empty() { "ffmpeg".to_string() } else { r.ffmpeg.clone() };
    let mut c = Command::new(&ff);
    c.args(["-y", "-hide_banner", "-loglevel", "error"]);
    if r.start > 0.0 { c.arg("-ss").arg(format!("{:.3}", r.start)); }
    c.arg("-i").arg(&r.media);
    if r.dur > 0.0 { c.arg("-t").arg(format!("{:.3}", r.dur)); }
    c.args(["-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le"]).arg(&wav);
    let o = run(c)?;
    if !o.status.success() || !wav.exists() {
        return Err(format!("ffmpeg failed (is ffmpeg installed?): {}", String::from_utf8_lossy(&o.stderr)));
    }

    // 2) whisper.cpp -> SRT with one word per subtitle
    let mut w = Command::new(&r.whisper);
    w.arg("-m").arg(&r.model).arg("-f").arg(&wav);
    w.args(["-ml", "1", "-sow", "-osrt", "-np"]).arg("-of").arg(&prefix);
    w.arg("-l").arg(if r.lang.trim().is_empty() { "auto" } else { r.lang.trim() });
    if r.threads > 0 { w.arg("-t").arg(r.threads.to_string()); }
    let o = run(w)?;
    if !srt.exists() {
        return Err(format!("whisper produced no output: {} {}", String::from_utf8_lossy(&o.stderr), String::from_utf8_lossy(&o.stdout)));
    }
    let text = fs::read_to_string(&srt).map_err(|e| e.to_string())?;
    let _ = fs::remove_file(&wav);
    Ok(text)
}

#[tauri::command]
pub async fn words_srt(req: Req) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || work(req)).await.map_err(|e| e.to_string())?
}

// Saves the finished SRT / TXT next to the voice-over file (UTF-8).
#[tauri::command]
pub fn save_text_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content.as_bytes()).map_err(|e| format!("could not save {path}: {e}"))
}
