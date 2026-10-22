# Azy — Technical Architecture

> Verified against v1.21.0 (`230747a`). Each section separates **Verified** facts (read in the source) from **Assumptions / Needs verification**.
> The older [`azy/presets/ARCHITECTURE.md`](../azy/presets/ARCHITECTURE.md) ("v13 platform", UXP runtime + CEP surface) is **superseded** by this file wherever they disagree.

---

## 1. Technology stack (verified)

| Layer | Technology | Source |
|---|---|---|
| Desktop shell | **Electron 31.7.7** (`^31` in devDeps), Chromium 126 | `azy/package-lock.json` |
| Packaging | **electron-builder 24.13.3**: NSIS one-click per-user installer (`install.exe`), portable via `tools/build-portable.js` | `package.json` `build` |
| Runtime deps | **None** (all logic is in-repo; the engine is pre-bundled) | `package.json` |
| UI | Vanilla HTML/CSS/JS (no framework). Multiple renderer scripts share `window` globals | `index.html` |
| Preset engine | Pre-bundled `presets/engine.js` (about 17.6k lines), originally built from a TypeScript monorepo (`packages/core`, `packages/shared`, connector). **That source is not in this repo** — `azy-presets-src.zip` is an old v1.0.0 app copy with no `.ts` files (verified). Edit `engine.js` and the minified `presets/connector/index.js` directly and keep `test/fixtures/mock-connector.js` in step by hand | `presets/README.md`, `azy/README.md` |
| Premiere integration | **CEP** extension (HTML panel + **ExtendScript ES3** host) | `presets/connector/` |
| Native (Windows) | C helper `presets/native/dagger-native.c` → `assets/dagger-native.exe` (mouse hook/cursor). PowerShell key host + C# `AzyKeys` (compiled at runtime) | `dagger-main.js`, `flow-selected.js` |
| CI | GitHub Actions `windows-latest`, Node 22 | `.github/workflows/installer.yml` |
| App id | `com.notsk.azy`, publisher `notsk`, main `main.js` | `package.json` |

## 2. Source layout (verified)

```
azy/
  main.js            main process: workspace windows, settings, pins, fs, player, drag, shortcuts glue
  preload.js         contextBridge → window.api (app) + window.presets (feature IPC, PRESET_INVOKE list)
  player-preload.js  player window bridge
  renderer.js        Files grid (buildCard), Apply/Auto-Cut/Auto Scale, window.azyApplyButton, keyboard
  index.html         workspace UI; loads scripts in a FIXED ORDER (see §3)
  sounds-store.js    Sounds library persistence (main side)
  styles.css, design-tokens.css
  presets/
    presets-main.js     lazy engine boot, IPC registration, Snap/Speed/window/Move shortcuts, favourites relink
    ipc-channels.js     channel names (azy:presets:*, :ppro:*, :flow:*, :snap:*, + Azy helpers)
    panel-host.js       serves the Azy UI to the Premiere panel (/panel/*, RPC, SSE)
    engine.js           bundled engine (parser, index, watcher, bridge server, protocol, Premiere module mgmt)
    preset-identity.js  name+bin verification on every apply (v1.21)
    local-presets.js    fallback copies of favourite/pinned presets (v1.20)
    pin-order.js        Files pin reorder (v1.21)
    flow-selected.js    Delete→diff→Ctrl+Z probe, key host (AzyKeys/WScript)
    dagger-main.js      wheels, native helper, pins export/import, gain copies
    dagger-action-main.js  action/level popups (retire, CLOSE_ANIM_MS 170)
    *-renderer.js, *.html, *.css   Snap, Speed, Dagger, Flow, Presets UIs
    azy-*.js            shared renderer modules (theme engine, motion, shell nav, wait, undo, sounds…)
    connector/          CEP extension (CSXS/manifest.xml, index.html, index.js [minified], host/azy.jsx)
    panel/              panel-shim.js + panel.css for the hosted panel
    native/             dagger-native.c
  assets/  build-res/installer.nsh  tools/build-portable.js  test/  docs/MOTION.md
```

## 3. Processes and windows (verified)

- **Workspaces** (`main.js`): `WORKSPACES = ['all','files','presets','flow','snap']` (where `snap` = Settings). **Only the front workspace keeps a renderer.**
  - A switch creates a new `BrowserWindow` at the exact same bounds (`loadFile('index.html', {query:{ws}})`).
  - Handshake: the renderer acknowledges `azy:ws:entered` after its opacity-zero first frame.
  - The old window is retired after `WS_LEAVE_MS` 180 ms (`WS_ENTER_PREROLL_MS` 42).
  - Rationale: each hidden renderer costs 80–150 MB, and the old model reached 600–900 MB.
- **Workspace window options:**
  - `frame:false`, `alwaysOnTop` (default on), 470×800 default, `minWidth` 340, `backgroundColor #060606`.
  - `contextIsolation:true`, `nodeIntegration:false`.
  - `webSecurity:false` (so local video frames can be drawn to canvas for thumbnails).
  - `backgroundThrottling:false`.
  - `defaultFontFamily` Segoe UI / Consolas.
  - UI scale = `webContents.setZoomFactor`.
- **Feature windows:**
  - Snap (`snap.html`), Speed (`speed.html`), Dagger wheel (`dagger.html`, 460 px, click-through, released after 15 s idle), Dagger action popup (`dagger-action.html`, strict CSP), player (`player.html`).
  - Snap, Speed, window toggle and Move use `globalShortcut` (defaults `Shift+Space`, `Shift+Alt+S`, `Shift+Alt+A`, `Ctrl+Alt+P`). If registration fails, the previous hotkey is kept and the UI says so.
- **Renderer script order** (`index.html`): it matters because the first grid render happens before later scripts load. That's why `window.azyApplyButton` lives in `renderer.js`.
  - `azy-theme-engine` → `azy-web` → `azy-motion` → `azy-artwork` → `azy-ui` → `azy-characters` → `azy-undo` → **`renderer.js`** →
  - `azy-status` → `azy-speed` → `azy-wait` → `azy-done-sfx` → `azy-ui-sounds` → `azy-scope` → `azy-speed-prompt` → `azy-pair` → `azy-dagger-pins` →
  - `presets-renderer` → `snap-settings` → `flow-renderer` → `azy-connection` → `azy-welcome` → `dagger-audio` → `sounds-view` → `azy-interactions` → `azy-shell`.

## 4. Premiere integration: CEP connector

### Verified
- **Extension:**
  - Bundle `com.azy.premiere.connector` **v1.6.0** (manifest and `azy.jsx` `VERSION`). Panel id `com.azy.premiere.connector.panel`.
  - Host `PPRO [23.0, 99.9]`, CSXS 11.0. MainPath `index.html`, ScriptPath `host/azy.jsx`.
  - CEF flags: `--enable-nodejs`, `--mixed-context` (the reverse link uses Node `net`), plus file-access / insecure-content flags.
  - `AutoVisible`; starts on `ApplicationActivate`.
- **Install:**
  - The NSIS hook (`build-res/installer.nsh`) copies `resources\app.asar.unpacked\presets\connector` to `%APPDATA%\Adobe\CEP\extensions\com.azy.premiere.connector\`.
  - It sets `HKCU\Software\Adobe\CSXS.{9,10,11,12}\PlayerDebugMode = 1` (the extension is unsigned).
  - It **deletes the old UXP plugin folder** `%APPDATA%\Adobe\UXP\Plugins\External\com.azy.premiere.connector` and logs to `%APPDATA%\Azy\install.log`.
  - Uninstall removes the extension and leaves PlayerDebugMode alone.
  - `asarUnpack` covers `presets/connector/**` and `assets/**`.
- **Self-repair:**
  - The engine's `registerPremiereModule` manages the live part "runtime" (CEP target `com.azy.premiere.connector`, `PREMIERE_MIN_VERSION 23.0.0`, `CSXS_VERSIONS [9,10,11,12]`; PlayerDebugMode via the registry on Windows or `defaults` on macOS).
  - It also tracks the legacy parts `legacyCep` (`com.azy.panel`) and `legacyUxp` (`__legacy_uxp__`), both bundled `0.0.0`, as leftovers to clean up.
  - Settings exposes *module repair* (`azy:presets:moduleRepair`).
- **Panel content:**
  - `connector/index.html` is a status page that iframes Azy's own UI from `http://127.0.0.1:<port>/panel/?t=<token>`, served by `presets/panel-host.js`.
  - Static files come from an allow-list, RPC is `POST /panel/rpc` (it calls the same `ipcMain` handlers), and events use SSE at `/panel/events`.
  - The Files tab is hidden in the panel.
- **ExtendScript host ops** (`host/azy.jsx`, **ES3**: no `let`/arrow functions/JSON polyfill assumptions):
  `hostInfo, probe, getState, getSelection, resolveTargets, neighbours, sequenceFrameTicks, listEffects, listTransitions, components, valuesAt, addEffects, fingerprints, setValue, writeKeyframes, moveKeys, addTransition, placeAudio, placeMedia, timelineSignature, ping`.
  The higher-level operations (preset apply, Flow easing, Speed) are composed in the connector `index.js` and the engine.

### History (why CEP)
The project went back and forth: CEP in engine v11, then "UXP only again" in engine v16, then the "v18.0 CEP decision" section of `presets/README.md`, which actually argues for **keeping UXP**. The **shipping code since Azy v1.x is CEP-only**, and the installer removes UXP. **Treat every UXP statement in `presets/README.md` and `presets/ARCHITECTURE.md` as historical.** The exact reason for the final switch to CEP is not recorded in the repo. **Unknown**; possibly the UXP runtime needed Adobe's UPIA and couldn't be opened by an external app.

### Assumptions / Needs verification
- How long CEP keeps loading in future Premiere releases: **Unknown** (Adobe deprecation risk).
- Behaviour on Premiere 2026 builds specifically: the manifest range covers them. A real-world check is **Needs verification** for each new Premiere release.

## 5. Bridge, pairing and data flow (verified)

```
 Azy renderer ──ipc (window.presets / window.api)──▶ Electron main (presets-main, engine)
                                                         │  WebSocket server  ws://127.0.0.1:47811–47820
                                                         │  (also ::1), subprotocol "azy-bridge-v1",
                                                         │  max frame 4 MB, loopback-only HTTP
                                                         ▼
                         CEP panel in Premiere (index.js) ──evalScript──▶ host/azy.jsx (ExtendScript)
                                                         ▲                    │
                     reverse link: Azy dials INTO the     │                    ▼
                     panel at the port announced in      │              Premiere DOM / QE
                     %APPDATA%\Azy\bridge\ (ReverseDialer)
```

- **Lazy start:** nothing listens until the renderer's first `azy:presets:boot`. Snap's selection gate boots the engine about 1.5 s after launch.
- **Pairing:** tokens are stored in `%APPDATA%\Azy\bridge\`. There are three ways in:
  - a typed **6-digit code**
  - **"auto"**, allowed while Azy's own panel is open
  - a **per-run local secret** from `bridge/panel.json` (user-only permissions)
- **Panel requests** carry the paired token (`?t=` / `X-Azy-Token` / cookie). Non-loopback HTTP gets a 426.
- **Apply flow** (preset): renderer → `azy:presets:applyPreset` (re-handled by `preset-identity.js`, which verifies `expectName`/`expectBin`) → engine plan → connector → `azy.jsx` (`addEffects`, `setValue`, `writeKeyframes`…) → one undoable step in Premiere.
- **Media flow:** `renderer.js` → `P.placeMedia(path, name, {kind, keepSeconds, scale})` → engine forwards the args → `azy.jsx placeMedia`. Sounds → `placeAudio` with the gain-adjusted copy from `%APPDATA%\Azy\Dagger Audio\`.

## 6. Flow Selected keyframe detection (the probe)

**Verified:**
- No Premiere API exposes the keyframes selected in Effect Controls (confirmed earlier against Adobe's scripting docs).
- `presets/flow-selected.js` does this:
  1. Snapshot the keyframes.
  2. Send a **real Delete**.
  3. Diff the inventory to see what disappeared (those were the selected keys).
  4. Send **Ctrl+Z** to restore.
- **Keys are sent by a PowerShell key host:**
  - It compiles a native `AzyKeys` C# helper (`NATIVE_KEYS_CS`) and sends virtual keys, with Delete marked extended.
  - It skips activation if Premiere is already in front; otherwise it does a verified foreground hand-off.
  - Fallback is WScript (only on `HOST_START_FAILED`). It idles out after 25 min (`KEYHOST_IDLE_MS`).
- **Timing:** focus settle 400 ms, post-Shift+5 220 ms, post-Delete/Undo 30 ms (v1.21), polls `FAST_POLLS [35,60,100]`.
- **Safety:**
  - Unsafe or ambiguous states are blocked.
  - A failed inventory read after Delete is never treated as "busy".
  - A blind second Delete is never sent.

**Limitation:** this depends on focus and timing. It's only verifiable on real Windows + Premiere (pwsh/C# can't be compiled in the Linux sandbox; Windows CI compiles the helper in `test-keyhost` §8).

## 7. Persistence (verified)

Everything lives in `%APPDATA%\Azy\` (Electron `userData`).

| File | Content |
|---|---|
| `settings.json` | volume/muted, `uiFps`, `uiTheme`, `uiCustomThemes`, migration flags (`themeFoundation`, `themesV2`, `themesV3`), `uiSpeedHold`, `uiPerf`, `uiMotion`, `uiWebs`, `uiCharacters`, `uiSkin` ('glow'), the Customise dials, `previewPanel`, `launchAtLogin`, `welcomed`, `audioGainDb`. A corrupt file is backed up as `.corrupt-<ts>`. |
| `pins.json` | Files pinned folders, in order (atomic writes) |
| `window-state.json` | window bounds |
| `presets/` | `pinned-folders.json`, `preset-index.json` (rebuildable), `preset-meta.json` (favourites: id + name/bin), `premiere-sources.json`, `local-presets.json`, `snap-settings.json`, `speed-settings.json`, `window-settings.json`, `flow-move-settings.json`, `dagger-settings.json` (+ `.bak`), `presets.log` |
| `bridge/` | pairing tokens, `panel.json` (port + per-run secret) |
| `Dagger Audio/` | cached gain-adjusted WAV copies |
| `install.log` | installer hook log |
| renderer `localStorage` | `azy.files.autoCut`, `azy.files.autoScale`, `azy.done.sfx*`, `azy.ui.sounds`, Files sort/view |

Sounds library storage details (`sounds-store.js`): **Needs verification** (file names not listed here).

## 8. Build and release (verified)

- `npm start` · `npm test` (`node test/run.js`) · `npm run dist` (NSIS) · `npm run dist:portable` · `npm run dist:release`.
- `build.files` is an **explicit allow-list**: main.js, sounds-store.js, preload.js, player-preload.js, renderer.js, player.js, index.html, player.html, styles.css, package.json, `presets/**/*`, `assets/**/*`. **A new top-level file must be added there** (the v1.1.8 packaging bug).
- **NSIS:**
  - one-click, per-user, `asInvoker`, output `install.exe`
  - includes `build-res/installer.nsh`
  - keeps AppData on uninstall
  - creates Desktop and Start-menu shortcuts
  - unsigned
- **CI** (`installer.yml`): runs on every push except `[skip ci]`. Steps:
  1. `npm ci`
  2. browser test tools
  3. `npm test` (blocking, except ui-stress timing, which is advisory)
  4. build
  5. artifacts `Azy-install` and `Azy-portable`
  6. the release step
- **Release step:** runs if `[publish]` is in the commit message, a tag is pushed, or `publish` is set on manual dispatch. It creates a **draft** release `v<package.json version>` and uploads `Azy Setup vX.exe` (shown as `Azy.Setup.vX.exe`), `Azy-Portable-vX.exe` and the two zips. A maintainer then runs `gh release edit vX --draft=false --latest`.

## 9. Tests (verified)

- `azy/test/run.js` runs **48 suites** in a fixed order: theme/skin/motion/token contracts, preset identity and targeting, pins, sounds, undo, Dagger, `place-media` (simulated Premiere), main/renderer/player harnesses, Snap/Flow/panel smoke tests (Playwright/jsdom), Flow scope/selected/keyhost/probe-speed/move, UI polish, `ui-stress`, `platform-smoke`.
- Harnesses: `renderer-harness.js` (fake DOM), `main-harness.js`, `browser-fixture.js`, `fixtures/mock-connector.js` (generated from the engine source).
- Local run needs `PLAYWRIGHT_PATH`, `JSDOM_PATH` and fonts. It takes about 6 min, so run it in the background. Locally, `test-ui-polish` and `test-compact-motion` fail for environment reasons only.
- **What the tests can't prove:** real Premiere behaviour, native drag/drop, focus/key timing, Windows scaling and multiple monitors. Use the checklist in [`azy/WINDOWS_V1_0_VALIDATION.md`](../azy/WINDOWS_V1_0_VALIDATION.md).

## 10. Constraints enforced in code and tests

- `azy-foundation.css`: no hex. `azy-skin.css`: no bare hex/rgb outside `var()` fallbacks. Skin rules need `body.minimal-ui` + `:is(...)`; Dagger card overrides need `html[data-skin] …`.
- Every `/* M### */` motion block must animate. The `awlPop` and `aw16Pop` keyframes must stay.
- No stray high-codepoint characters in `index.html` or `renderer.js`.
- Several tests pin handler *shapes* by regex (test-presets, test-shell-nav, test-customise, test-flow-selected §7, test-keyhost §6–8, test-pin-order). Changing those handlers means updating the tests deliberately.
- **Main process:** no synchronous fs writes in background work. Atomic sync writes only on explicit user actions.

## 11. Known limitations (summary)

- Windows-only build. macOS: Unknown.
- CEP deprecation risk.
- Unsigned installer.
- Electron 31 can't natively resize transparent frameless windows (custom handles are used instead).
- The selected-keyframe probe depends on focus and timing.
- Azy undo is window-local and doesn't cover Premiere edits.
- See [bugs_and_fixes.md](bugs_and_fixes.md#open--unresolved).
