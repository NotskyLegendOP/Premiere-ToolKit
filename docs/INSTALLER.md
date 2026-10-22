# Premiere Toolbox — installer build

Version **0.4.0** (Azy layout). The installer is a normal Tauri 2 Windows bundle:

| Output | Path after a build |
| --- | --- |
| NSIS setup (recommended) | `Main APP/src-tauri/target/release/bundle/nsis/Premiere Toolbox_0.4.0_x64-setup.exe` |
| MSI (optional) | `Main APP/src-tauri/target/release/bundle/msi/Premiere Toolbox_0.4.0_x64_en-US.msi` |
| Portable app | `Main APP/src-tauri/target/release/premiere-toolbox.exe` |

The sandbox this repo was assembled in has no Rust toolchain and no Wine, so the `.exe`
cannot be compiled there. Both supported paths below produce it from the same source.

---

## 1. Build it on your own Windows machine (fastest, ~10 min first time)

Requirements:

- **Node.js 20+** — <https://nodejs.org>
- **Rust (MSVC)** — <https://rustup.rs> → default host `x86_64-pc-windows-msvc`
- **Visual Studio Build Tools** with *Desktop development with C++*
- WebView2 runtime (already installed on Windows 10/11)

Then:

```bat
cd "Main APP"
npm ci
npm run tauri -- build
```

or just **double-click `Main APP\build-installer.bat`** (wraps `build-installer.ps1`,
checks that node + cargo exist, then prints the finished installer paths).

First run downloads NSIS + WiX; expect 5–15 minutes of compiling.

> The NSIS installer is per-user (`installMode: currentUser`), so it needs no admin
> rights and installs into `%LOCALAPPDATA%\Premiere Toolbox`.

## 2. Build it in GitHub Actions (no local toolchain needed)

`.github/workflows/build.yml` builds the same bundles on `windows-latest`.

1. Push this branch, or open the repo → **Actions → Build installer → Run workflow**.
2. When the run finishes, download the **`PremiereToolbox-<sha>`** artifact — it holds
   the `-setup.exe` and `.msi`.
3. Pushing a tag like `v0.4.0` additionally creates a **draft GitHub Release** with both
   installers attached.

Nothing needs to be signed for personal use; Windows SmartScreen will show
"Unknown publisher" until you use a code-signing certificate.

---

## What is inside the bundle

- `src-tauri/src/main.rs` — `scan_folder`, `save_trim`, `drag_icon`, `send_curve`,
  `bridge_status`, and the loopback bridge on `127.0.0.1:47800`.
- `src-tauri/src/extras.rs` — `dl_run`, `scan_folder_v2` (yt-dlp / ffmpeg via `Command`).
- `src-tauri/src/captions.rs` — `words_srt`, `save_text_file`.
- Plugins: `dialog`, `drag`, `global-shortcut`.
- Two windows: `main` (the Azy workspace) and `wheel` (transparent, always-on-top,
  starts hidden — the global shortcut shows it over Premiere).

The bridge on port 47800 is what the Premiere panel talks to: `GET /pending`,
`POST /result`. If the port is taken the app still starts; only the Premiere round-trip
stops working.

## Notes / caveats

- `npm ci` is required (lockfile is committed). `npm install` also works.
- Cancel an in-flight build by closing the console; `target/` is git-ignored.
- Unsigned builds sometimes get quarantined by AV heuristics; allow the file if your AV
  flags a freshly compiled binary.
- Version lives in three places and must match: `package.json`, `src-tauri/Cargo.toml`,
  `src-tauri/tauri.conf.json`, and the `premiere-toolbox` entry in `Cargo.lock`.
