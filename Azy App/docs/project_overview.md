# Azy — Project Overview

> Verified against v1.21.0 (`230747a`). See [memory.md](memory.md) for the rules and decisions.

## 1. Purpose

Azy speeds up repetitive editing work in **Adobe Premiere Pro**. It is a compact companion window that sits on top of Premiere. It lets an editor:
- browse and drag media and SFX
- apply presets, easing and speed changes to the current selection with one click, hotkey or mouse gesture

It does this without opening Premiere's own panels, and without touching anything the user didn't select.

## 2. What it does (summary)

Each item is detailed in [features.md](features.md).

| Sector (nav order, `Ctrl+1…6`) | Summary |
|---|---|
| **Files** | Pinned media folders, search, sort/view, drag into Premiere or Explorer, preview dock, video player, **Apply** (places media at the playhead, with optional Auto-Cut and Auto Scale) |
| **SFX** (Sounds) | Audio library: pinned sound folders, favourites, waveforms, preview volume, Apply at the playhead with a remembered gain level |
| **Presets** | Pinned `.prfpset` folders plus starred presets from Premiere's own profile. Click to apply to the selected clips |
| **Flow** | Easing presets applied to keyframes. Scope is Clip, Playhead or **Selected** (the keys highlighted in Effect Controls). Also *Move Selected Keyframes → Playhead* |
| **Speed** | A separate window that retimes keyframe animation (opens at 100%) |
| **Settings** | Colour/theme, Customise dials, shortcuts, Snap, Dagger, Files preview, FPS target, start-at-login, logs and connector repair |

**Global tools:**
- **Snap Action** (`Shift+Space`): a quick-apply search for Premiere effects, presets and transitions.
- **Dagger** radial wheels (default `Ctrl + right mouse` and others).
- **Show/hide Azy** (`Shift+Alt+A`), **Speed** (`Shift+Alt+S`) and **Move keys to playhead** (`Ctrl+Alt+P`).

## 3. Supported environments

| Item | Supported | Source |
|---|---|---|
| OS | **Windows 10/11 x64** (the only built target) | `package.json` `build.win` |
| macOS | Some code paths exist (e.g. `defaults` for PlayerDebugMode, macOS key handling), but **nothing is built or tested**. Needs verification. | engine.js |
| Premiere Pro | **23.0 and later** (2023, 2024, 2025, 2026+). The connector manifest covers `[23.0, 99.9]`, CSXS 11.0. The engine's `PREMIERE_MIN_VERSION` is `23.0.0`. | `presets/connector/CSXS/manifest.xml`, `engine.js` |
| CEP runtimes | PlayerDebugMode is set for CSXS 9, 10, 11 and 12 (the extension is unsigned) | `build-res/installer.nsh`, engine `CSXS_VERSIONS` |
| Premiere 2026 / CEP deprecation | Adobe is moving to UXP. How long CEP keeps working in future Premiere builds is **Unknown**, and it's a risk to watch. | — |
| Without Premiere | Files browsing and drag-out work. Presets, Flow, Speed, Snap and Apply need Premiere and the connector. | `azy/README.md` |

## 4. Major components

Full detail is in [technical_architecture.md](technical_architecture.md).

1. **Electron main process** (`azy/main.js`): windows, settings, pins, file system, players and global shortcuts.
2. **Workspace renderer** (`azy/index.html` + `renderer.js` + `presets/*.js`): the Files, SFX, Presets, Flow and Settings UI.
3. **Feature windows:**
   - Snap (`snap.html`)
   - Speed (`speed.html`)
   - Dagger wheel (`dagger.html`)
   - Dagger action/level popup (`dagger-action.html`)
   - Video player (`player.html`)
4. **Preset engine** (`presets/engine.js`, a pre-bundled build; its TypeScript source is **not** in this repo):
   - the `.prfpset` parser and index
   - the Premiere profile reader
   - the loopback bridge server
   - the connector protocol
5. **CEP Connector** (`presets/connector/`): a panel inside Premiere (`index.html`/`index.js`) plus the ExtendScript host (`host/azy.jsx`), which performs every timeline edit.
6. **Native helpers (Windows):**
   - the Dagger mouse-hook helper (`presets/native/dagger-native.c` → `assets/dagger-native.exe`)
   - the PowerShell **key host** with the compiled `AzyKeys` C# helper, which sends keys for Flow Selected detection
7. **Installer** (electron-builder NSIS with `build-res/installer.nsh`): installs per-user, copies the connector, sets PlayerDebugMode and removes the old UXP plugin.

## 5. Goals

These are the project goals as the user has stated them across sessions:
- **Reliability over features.** A smaller set of reliable improvements beats many risky ones.
- **Accuracy over speed**, and never guess. Ambiguous Premiere state means refusing with a clear message.
- **Performance is a core requirement.** Only the visible workspace keeps a renderer. Animations are cheap and never block.
- **A stable, familiar UI.** Evolve it, don't redesign it. The theme changes colours, never structure.
- **Honest feedback.** Real Cancel, truthful status, success SFX only on success.

## 6. Current state (v1.21.0)

- **Released:** v1.21.0 is the *Latest* GitHub Release. Its assets are `Azy.Setup.v1.21.0.exe`, `Azy-Portable-v1.21.0.exe` and zip copies of both.
- **v1.21.0 changes** (all 7 are implemented and pass CI against simulated Premiere; **real-Premiere verification by the user is pending**):
  1. Media Apply uses the lowest free video track
  2. Native `AzyKeys`, so Flow Selected makes no Windows "ding"
  3. Faster Flow detection
  4. Popups close instantly
  5. Glass Audio Level card
  6. Files pinned-folder reorder
  7. Preset identity by name + bin
- **Open request:** pinned-folder reorder for the **Sounds** library (not implemented).
- **Distribution:** unsigned, so Windows SmartScreen shows "unknown publisher". Code signing is not configured.

## 7. Repository map

```
/                        repo root
├─ docs/                 ← this knowledge base (canonical)
├─ note.md               legacy AI handoff notes (partly stale)
├─ azy-presets-src.zip   an old v1.0.0 copy of the app (NOT the engine source — it contains no .ts files)
├─ .github/workflows/installer.yml   Windows CI: tests → build → optional release
└─ azy/                  the Electron app (npm package "azy")
   ├─ main.js, preload.js, renderer.js, index.html, styles.css, design-tokens.css
   ├─ player.* , sounds-store.js, player-preload.js
   ├─ presets/           feature modules, CSS, engine.js, connector/, native/, panel/
   ├─ assets/            icons, sounds, artwork, dagger-native.exe
   ├─ build-res/installer.nsh, tools/build-portable.js
   ├─ docs/MOTION.md, README.md, WINDOWS_V1_0_VALIDATION.md
   └─ test/              run.js + 48 suites, harnesses, fixtures
```
