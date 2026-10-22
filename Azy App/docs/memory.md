# Azy — Memory (read this first)

> This is the first file to read in every AI or developer session. It is short on purpose. The details are in the five linked files.
> Last verified against the code: **v1.21.0** (commit `230747a`), 2026-10-02.

## 1. What Azy is (one paragraph)

Azy is a **Windows desktop companion app for Adobe Premiere Pro** built on Electron 31. It runs as a small, frameless, always-on-top window beside Premiere and offers:
- a media and SFX browser with drag-out
- one-click Premiere **Presets**
- **Flow**: keyframe easing applied to the keyframes you select
- **Speed** retiming
- **Snap Action**: a quick-apply search
- **Dagger** radial wheels opened by mouse-button holds

It talks to Premiere through a bundled **CEP extension** (`com.azy.premiere.connector`) over a loopback WebSocket.

## 2. Status

| Item | Value |
|---|---|
| App version | **1.22.0** (`azy/package.json`). v1.21.0 is the latest *published* release; 1.22.0 is committed but not released (no installer requested) |
| Connector | CEP `com.azy.premiere.connector` **1.7.0** (v1.22 link fixes; Azy auto-updates an installed 1.6.0 at start — Premiere must be restarted to load it), Premiere Pro **23.0 – 99.9** (2023 → 2026+) |
| Platform shipped | Windows x64 (NSIS `install.exe` + portable exe) |
| Tests | `azy/test/run.js`, **51 suites**; CI = `.github/workflows/installer.yml` on `windows-latest` |
| Awaiting user verification in real Premiere | All 7 v1.21.0 items and the 4 v1.22.0 items. See [bugs_and_fixes.md](bugs_and_fixes.md#awaiting-real-premiere-verification) |

## 3. Critical instructions (the user's standing rules, never drop them)

1. **Inspect the code before changing it.** Fix root causes. No fake fixes, fake loaders or fake performance. Never claim testing or optimisation that wasn't done.
2. **No redesigns** unless explicitly asked. That applies especially to the layout and the Files/Sounds cards. **Never reintroduce the v1.6.0 row cards or the merged/unified explorer shell** (the user rejected it, and it was reverted in v1.6.1).
3. **Default theme = Dark (`noir`, black + white).** Dark red (`crimson`) stays built in. No blue or purple in the default theme. **No corner glow.** Other accent colours only in user-created custom themes. Never reset theme choices or delete custom themes.
4. **Never break** shortcuts, drag-and-drop, Premiere communication, pins (Files and Dagger) or saved settings.
5. **Premiere safety:**
   - Never touch unrelated clips, tracks, keyframes or source files.
   - Never add duplicate Motion effects.
   - Media Apply never overwrites or moves existing clips.
   - Unsafe or ambiguous operations are **blocked, not guessed**. That covers Flow and also preset identity.
6. **Animations and sounds never delay** a click, an apply, a cancel or a result. The success SFX plays only after real success, and never on fail or cancel. Sounds never overlap.
7. **Never claim a cancel succeeded when it didn't.** Use the honest strings, e.g. "Stopped — N change(s) already applied (Ctrl+Z to undo)".
8. **Use stable preset identity (name + bin)**, never list positions.
9. **Releases are built only when the user asks.** Normal commits use `[skip ci]`. A release commit uses `[publish]`. Then report the installer, portable and both zip links.
10. **Always show a progress board with an ETA** while working.
11. **Docs rule:** never mark a bug fixed without verification. Mark unknowns as *Unknown* or *Needs verification*.

The full list of UI rules is in [ui_ux.md §1](ui_ux.md#1-design-requirements-and-preferences-binding).

## 4. Key decisions (current)

| Decision | Where it's recorded |
|---|---|
| The Premiere integration is **CEP only**. UXP was abandoned, and the installer deletes the old UXP plugin folder. | [technical_architecture.md §4](technical_architecture.md#4-premiere-integration-cep-connector) |
| Selected keyframes are found with the **Delete → diff → Ctrl+Z probe**, because no Premiere API exposes the keyframe selection. | [technical_architecture.md §6](technical_architecture.md#6-flow-selected-keyframe-detection-the-probe) |
| Only **one workspace window** is resident at a time. A sector switch opens a new window at the same bounds and retires the old one. | [technical_architecture.md §3](technical_architecture.md#3-processes-and-windows) |
| Single design: the **"Spider" glow skin** (`uiSkin: 'glow'`). The "Clean" style was removed in v1.16. | [ui_ux.md](ui_ux.md) |
| Glow is **On/Off only** (the strength slider was removed in v1.19). There is no other intensity control. | [ui_ux.md §4](ui_ux.md#4-customise-dials-settings--customise) |
| Local copies of favourite and Dagger-pinned presets are used **only when the original is gone**. Writes are async. | [features.md](features.md#presets) |

## 5. The other knowledge files

| File | Read it when… |
|---|---|
| [project_overview.md](project_overview.md) | You need purpose, scope, components, supported versions and current state |
| [features.md](features.md) | You are touching or asking about any feature (implemented, partial, requested) |
| [ui_ux.md](ui_ux.md) | You are changing anything visual: themes, colours, glass, motion, popups, navigation |
| [bugs_and_fixes.md](bugs_and_fixes.md) | You are fixing a bug, or before claiming something works |
| [technical_architecture.md](technical_architecture.md) | You are changing the main process, IPC, the connector, the engine, the build or the tests |

## 6. Consult before you change…

| Area | Read first | Key code |
|---|---|---|
| Any UI/CSS | `ui_ux.md`, [`azy/docs/MOTION.md`](../azy/docs/MOTION.md) | `azy/presets/azy-skin.css`, `azy-foundation.css`, `themes.css`, `azy-motion.css`, `azy/design-tokens.css` |
| Themes and settings | `ui_ux.md §3`, `technical_architecture.md §7` | `azy/main.js` (`loadSettings`, `normalizeUiTheme`, `migrateThemes`), `presets/azy-theme-engine.js` |
| Premiere operations | `technical_architecture.md §4–6`, `bugs_and_fixes.md` | `presets/connector/host/azy.jsx` (ES3!), `presets/engine.js`, `presets/flow-selected.js` |
| Preset apply | `features.md §Presets`, `bugs_and_fixes.md` | `presets/preset-identity.js`, `presets-main.js`, `local-presets.js` |
| Dagger | `features.md §Dagger` | `presets/dagger-main.js`, `dagger-action-main.js`, `azy-dagger-pins.js`, `presets/native/` |
| Tests and CI | `technical_architecture.md §9` | `azy/test/run.js`, `.github/workflows/installer.yml` |

## 7. Other existing docs (don't duplicate them, link to them)

- [`azy/README.md`](../azy/README.md): user guide (install, first use, keyboard, connector recovery, build, troubleshooting) and the v1.1.x–v1.3.0 changelog. *Its title "v1.3.0" and the portable file-name example "v1.1.5" are stale.*
- [`azy/WINDOWS_V1_0_VALIDATION.md`](../azy/WINDOWS_V1_0_VALIDATION.md): the v1.0.0 release validation and real-Windows acceptance checklist.
- [`azy/docs/MOTION.md`](../azy/docs/MOTION.md): 104 interaction motion presets in 26 families.
- [`azy/presets/README.md`](../azy/presets/README.md): the internal engine history (v2–v18) for Snap, Flow and Speed. **Its UXP statements are historical**, superseded by CEP.
- [`azy/presets/ARCHITECTURE.md`](../azy/presets/ARCHITECTURE.md): the "v13 platform" design. **Outdated** on UXP; see technical_architecture.md.
- [`azy/presets/connector/README.md`](../azy/presets/connector/README.md): the CEP connector and manual recovery.
- [`note.md`](../note.md): the older AI handoff notes. **Legacy.** This `docs/` folder is canonical. Stale points in it: the "Dark Red default" (now Dark/`noir`), "v1.18.0" (now v1.21.0) and "46 suites" (now 48).

## 8. Workflow essentials

- The app lives in `azy/`. Run `npm start`, `npm test` (= `node test/run.js`, about 6 min, so run it in the background) and `npm run dist:release`.
- **Releasing:**
  1. Bump `azy/package.json`, then grep the tests for pinned version strings.
  2. Commit with `[publish]` and push.
  3. CI (about 10 min) runs the suites, builds, and creates a **draft** release.
  4. Run `gh release edit vX --draft=false --latest`.
- CI checks out Windows CRLF files, so test regexes must tolerate `\r\n`. ui-stress frame timing is **advisory** on CI; functional checks block.
- Edit files with exact-match replacements, not blind `sed`.
