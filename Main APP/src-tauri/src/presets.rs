//! Preset index for the Azy "Presets" pane.
//!
//! Premiere stores effect presets as `*.prfpset` files. We index the standard Adobe
//! folders plus any folder the user pinned in the pane, and hand the UI a flat JSON
//! list (id / name / bin / kind). Nothing is copied or modified — this is read-only.

use serde::Serialize;
use std::path::{Path, PathBuf};

#[derive(Serialize)]
pub struct Preset {
    pub id: String,
    pub name: String,
    pub bin: String,
    pub kind: &'static str,
}

fn home() -> Option<PathBuf> {
    std::env::var_os("USERPROFILE")
        .or_else(|| std::env::var_os("HOME"))
        .map(PathBuf::from)
}

/// Every folder Premiere may keep `.prfpset` files in, newest version first.
fn default_roots() -> Vec<PathBuf> {
    let mut out = Vec::new();
    let Some(h) = home() else { return out };

    let adobe = h.join("Documents").join("Adobe").join("Premiere Pro");
    if let Ok(rd) = std::fs::read_dir(&adobe) {
        let mut versions: Vec<PathBuf> = rd.flatten().map(|e| e.path()).filter(|p| p.is_dir()).collect();
        // "25.0" > "9.0" for us: sort as strings, descending, so current versions lead.
        versions.sort_by(|a, b| b.file_name().cmp(&a.file_name()));
        for v in versions {
            push_profiles(&v, &mut out);
        }
    }
    out.push(h.join("Documents").join("Adobe").join("Common").join("Effect Presets"));
    out.push(h.join("Documents").join("Adobe").join("Premiere Pro").join("Effect Presets"));
    out
}

/// `Profile-<user>/Effect Presets` inside one Premiere version folder.
fn push_profiles(version: &Path, out: &mut Vec<PathBuf>) {
    let Ok(rd) = std::fs::read_dir(version) else { return };
    for e in rd.flatten() {
        let p = e.path();
        let name = e.file_name().to_string_lossy().to_lowercase();
        if !name.starts_with("profile") || !p.is_dir() {
            continue;
        }
        out.push(p.join("Effect Presets"));
        out.push(p.join("Effect Presets").join("Presets"));
    }
}

fn walk(dir: &Path, bin: &str, depth: u32, out: &mut Vec<Preset>) {
    if depth > 4 {
        return;
    }
    let Ok(rd) = std::fs::read_dir(dir) else { return };
    for e in rd.flatten() {
        let p = e.path();
        if p.is_dir() {
            let sub = e.file_name().to_string_lossy().to_string();
            let next = if bin.is_empty() { sub } else { format!("{bin} / {sub}") };
            walk(&p, &next, depth + 1, out);
            continue;
        }
        let ext = p.extension().and_then(|s| s.to_str()).unwrap_or("").to_lowercase();
        let (kind, is) = match ext.as_str() {
            "prfpset" => ("preset", true),
            "kys" => ("effect", true),
            _ => ("preset", false),
        };
        if !is {
            continue;
        }
        let stem = p.file_stem().map(|s| s.to_string_lossy().to_string()).unwrap_or_default();
        let path = p.to_string_lossy().to_string();
        out.push(Preset {
            id: path.clone(),
            name: stem,
            bin: if bin.is_empty() { "Effect Presets".to_string() } else { bin.to_string() },
            kind,
        });
    }
}

/// `preset_list` — JSON array string, de-duplicated by file path.
#[tauri::command]
pub fn preset_list(extra: Option<Vec<String>>) -> Result<String, String> {
    let mut roots = default_roots();
    for e in extra.unwrap_or_default() {
        let p = PathBuf::from(&e);
        if p.is_dir() {
            roots.push(p);
        }
    }

    let mut found: Vec<Preset> = Vec::new();
    for r in roots {
        if !r.is_dir() {
            continue;
        }
        let label = r.file_name().map(|s| s.to_string_lossy().to_string()).unwrap_or_default();
        // A pinned folder names its bin after the folder itself.
        let base = if label.eq_ignore_ascii_case("Effect Presets") { String::new() } else { label };
        walk(&r, &base, 0, &mut found);
    }

    let mut seen = std::collections::HashSet::new();
    found.retain(|p| seen.insert(p.id.clone()));
    found.sort_by(|a, b| a.bin.to_lowercase().cmp(&b.bin.to_lowercase()).then(a.name.to_lowercase().cmp(&b.name.to_lowercase())));

    serde_json::to_string(&found).map_err(|e| e.to_string())
}
