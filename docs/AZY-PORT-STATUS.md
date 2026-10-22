# Azy layout → Premiere ToolKit (`Main APP`) — port status

**Branch:** `arena/6e4de7d2-premiere-toolkit`
**Target:** `Main APP/` (Vite + React + Tauri). The `Azy App/` folder is the reference/spec and was **not** modified.

This document is the "what is done / what is left" map. It is written so the next session can pick
up without re-reading the whole diff.

---

## 1. What was actually done

The **Azy shell and its six areas were rebuilt inside the Toolbox's own React app**, on top of the
Toolbox's existing theme engine — not copied from the Electron app.

| Kept exactly as it was | Rebuilt for the Toolbox |
|---|---|
| `theme8` theme system: `PRESETS`, the colour pickers, QuickStyle gear panels, glass/blur/radius/glow/border dials, background image, click effects, window size | The shell: header, sector tabs with the gliding accent pill, pane switching |
| `Captions` / `Basic`, `Downloader`, `Graph` components (only re-framed by `.az-legacy`) | Files, SFX, Presets, Flow, Speed, Snap, Settings |
| The existing radial wheel (`src/Wheel.tsx`) and its style editor | Wheel contents now point at the new sectors |
| The Tauri commands the old code already used (`scan_folder(_v2)`, `drag_icon`, `save_trim`, `send_curve`, `bridge_status`, `dl_*`, `words_srt`, …) | A single `api.ts` façade + demo fallback (see §6) |

Two guardrails from `Azy App/docs/ui_ux.md §1` were treated as binding:

* **Themes change colours, never structure.** Every new surface reads `--a`, `--bg`, `--panel`,
  `--radius`, `--txt`, `--blur` through the new `--az-*` token layer. No new component hardcodes a
  theme colour.
* **Animations never delay anything.** Navigation is 200 ms and exempt from the animation-speed
  dial; popups close on a 150–170 ms fade after the result is already known.

---

## 2. Status at a glance

| # | Part | Status |
|---|---|---|
| 0 | Foundations — tokens, motion, dials, undo, toasts, modals, API façade | ✅ done |
| 1 | Shell & navigation — header, sigil, Premiere link chip, 9 sectors, status bar, keys | ✅ done |
| 2 | Files — pins (+reorder), search, sort, grid/list, Ctrl-select, dock, drag-out, Apply, stars | ✅ done (Apply needs the bridge, §4.1) |
| 3 | SFX — folders (+reorder), favourites, waveforms, audition, Apply, hold-to-set level card | ✅ done (Apply needs the bridge) |
| 4 | Presets — pin chips, bins, starred filter, apply on click, apply-with-speed prompt | 🟡 UI done · preset **index** still needed from the Rust side (§4.2) |
| 5 | Flow — Clip/Playhead/Selected scopes, 12 easing presets with curves, Apply, Move-keys pill | ✅ done (apply/keys need the bridge) |
| 6 | Speed — always opens at 100 %, quick steps, live end-calculation hint, Regenerate | ✅ done (apply needs the bridge) |
| 7 | Snap — palette, search, ↑↓/⏎, starred-only, selection gate, hide-after-apply | ✅ done (apply needs the bridge) |
| 8 | Settings — 7 tabs: Look, Interface, Files & SFX, Panels, Shortcuts, Snap, About | ✅ done |
| 9 | Premiere wiring (Rust + CEP host) for the new actions | ⬜ left — exact contracts in §4.1 |
| 10 | Toolbox tools kept — Captions/Basic, Downloader, Graph, wheel | ✅ done |
| 11 | Azy features deliberately not ported in this pass | ⬜ left — list in §4.3 |

Legend: ✅ in the code · 🟡 partial · ⬜ not done.

---

## 3. Part by part

### Part 0 — Foundations  ✅
* `src/azy/tokens.css` — the Azy design tokens, derived from the Toolbox theme (`--az-*`), plus the
  performance / reduced-motion variants.
* `src/azy/azy.css` — shell, tabs, pins, cards, dock, sounds, presets, flow, settings, popups,
  status bar, toasts, modals, empty states. Namespaced (`az-*`) so the legacy panes are untouched;
  the few legacy `nav button` / `header` / `section` rules that would leak into the new shell are
  explicitly neutralised.
* `src/azy/motion.css` — keyframes and the motion rules (one-shot card stagger, ambient layer that
  freezes while you work, reduced-motion / performance fallbacks).
* `src/azy/state.ts` — the Azy dials (`perf`, `motion`, `fps`, `animSpeed`, web opacity/density,
  dock, thumbs, Auto-Cut/Scale, gain, hold modifier, Snap gates, sound folders) persisted in
  `localStorage`. Also the **window-local undo stack** and the starred-items store.
* `src/azy/ui.tsx` — `Btn`, `Ib`, `Chip`, `Seg`, `Toggle`, `Field`, `Modal`, `Confirm`, `Toaster`,
  `toast()`, `SliderCard`, `EaseCurve`, `Empty`, `Busy`, `useKey`, `useEscape`.
* `src/azy/theme.ts` — the only bridge to the existing theme (`loadTheme` / `applyTheme`).
* `src/azy/libs.ts` — pinned folders, sharing the old `libs` / `activeLib` keys, so existing
  sections survive.

### Part 1 — Shell & navigation  ✅
`src/azy/Shell.tsx`
* Header: sigil (opens the wheel), sector crumb + context, live **Premiere link chip** (Connected /
  Offline / Demo), 34 px.
* One tab row: Files · SFX · Presets · Flow · Speed · Captions · Downloader · Graph · Settings.
  Inactive tabs are icon-only, the active tab expands its label; the accent pill glides on switch.
  `Ctrl+1…9` jumps to a sector. **Speed is a launch sector** — it opens the Speed window and leaves
  the pane you were on in place.
* Status bar: connection + selection text, Undo chip when something is undoable, Snap button,
  **On top** toggle, close. `Esc` asks the active page first (`azy-escape-request`), and only hides
  the window when nobody consumed it.
* Ambient layer: three accent orbs + a faint web drawn from theme tokens; it pauses while you
  scroll/click/type and is off in performance mode or with glow off.

### Part 2 — Files  ✅
`src/azy/pages/Files.tsx`
* Pinned folders as chips — **drag to reorder, `Alt+←/→`, double-click to rename, ✕ to unpin**.
  Reorder and unpin are undoable (`Ctrl+Z`).
* Search in place (non-matching cards are filtered, the folder never blanks), sort (Newest, Oldest,
  A–Z, Z–A, Type), grid/list view (both undoable and remembered).
* Click selects · **Ctrl/Cmd-click only** for multi-select · `Esc` clears · `Enter`/double-click
  opens the preview.
* Preview **dock** below the panel (borrowed height, never squeezes the grid) with real
  video/image/audio previews, Drag, Apply, close. `Ctrl+Shift+P` toggles it.
* **Apply** on every card → `placeMedia` with Auto-Cut / Auto-Scale flags; buttons report "…" while
  the bridge works and the toast carries the honest result.
* Drag-out via the Tauri drag plugin (keeps the existing `drag_icon` fallback).
* Starred files + a Starred filter; audio cards keep the **existing waveform + trim** component
  (`AudioCard`) so the cut-and-drag feature did not regress.

### Part 3 — SFX  ✅
`src/azy/pages/Sounds.tsx`
* Folder rail: drag to reorder, `Alt+↑/↓`, double-click to rename, add folder, remove (undoable),
  plus a virtual **Favourites** folder.
* Compact sound rows (deliberately conservative): play/pause, **waveform** (decoded once and cached;
  demo rows get a stable synthetic shape), star, gain badge, Apply.
* Apply places at the playhead through `placeAudio` with the remembered gain.
* **Level card** opens only while the hold modifier (Shift/Alt/off) is down on Apply — a top-right
  frosted card with −5 / slider / +5 / value, Cancel and Confirm. The value is remembered **only on
  Confirm**; it is also reachable from the dB chip in the toolbar.
* Drag a row into Premiere (native drag).

### Part 4 — Presets  🟡
`src/azy/pages/Presets.tsx`
* Pin chips for `.prfpset` folders (persisted), bin chips (All / Premiere / Transitions / Effects…),
  breadcrumb + count, Starred filter, search.
* Preset cards with the `{}` / `T` / `fx` tile, name, bin, star.
* Click = apply (`expectName` + `expectBin` are sent, so the host can refuse an ambiguous or moved
  preset instead of guessing).
* **Hold the hold modifier + click** → the small "Apply with speed" card (50/100/150/200 %,
  Plain apply, Apply x %).
* When no list is available the pane shows an honest empty state instead of inventing presets.

### Part 5 — Flow  ✅
`src/azy/pages/Flow.tsx`
* Scope segmented control: Clip / Playhead / Selected, with the one-line explanation of each.
* 12 easing presets, each drawn as a real cubic-bezier curve; Enter applies the current one.
* The **Move selected keyframes → playhead** control is a small pill in the header (Start/End),
  exactly as required.
* Bottom hint states the guarantee: one undoable step, values/easing/unselected keys untouched.

### Part 6 — Speed  ✅
`src/azy/SpeedWindow.tsx`
* Centred glass window that **always opens at 100 %**; big numeric field, ↑/↓ ±5, quick chips,
  Selected-keys / Whole-clip scope, Enter to apply, Esc to close.
* Two-line "Now / Result" calculation is always visible and never claims a duration it does not know.
* **Regenerate** resets to 100 % and says plainly that nothing was sent to Premiere.
* On success the window closes instantly; the toast carries the result.

### Part 7 — Snap  ✅
`src/azy/SnapPalette.tsx`
* `Shift+Space` from anywhere in the app, or the ⚙/Command button in the status bar.
* Search + ↑/↓ + ⏎, starred-only filter, "only with a selection" gate, "hide after apply" —
  all persisted in the Azy dials and editable in Settings › Snap.
* Uses the real preset list when the app can provide one, the demo list otherwise.

### Part 8 — Settings  ✅
`src/azy/pages/Settings.tsx` — seven tabs:
1. **Look** — theme presets (all the old ones **plus a new `Azy` preset**, so the Azy palette is
   available without overwriting anyone's theme), colours, glass/blur/glow/border/radius, background
   image, click effect.
2. **Interface** — animation speed, performance mode, motion mode, FPS target, web opacity/density,
   window size, always-on-top, font size, thumbnail width.
3. **Files & SFX** — Auto-Cut, Auto-Scale, preview dock, thumbnails, hold modifier, remembered gain.
4. **Panels** — the original folder-box / asset-card / General / Downloader size controls.
5. **Shortcuts** — wheel keybind capture, the wheel style editor, the full key table.
6. **Snap** — the three Snap gates, Dagger bindings reference, wheel preview.
7. **About** — build/bridge status, port notes, resets, and the "honest results" contract.

### Part 9 — Premiere wiring  ⬜ (see §4.1)
The UI is finished and calls one façade (`src/azy/api.ts`). In the packaged app the façade speaks the
**same protocol the Downloader/Captions/Basic already use**: `send_curve` + poll `bridge_status`.
The host side (`presets/connector/host/azy.jsx` in the Toolbox build) and the Rust
`src-tauri/src/main.rs` need the new message handlers before the actions reach a real timeline.

### Part 10 — Toolbox tools  ✅
`src/azy/pages/Tools.tsx` frames the untouched `General` (Captions/Basic), `Downloader` and `Graph`
components, adds a small header strip and a live "working" indicator for the Downloader.

---

## 4. What is left

### 4.1 Premiere bridge — the one blocking item
Nothing new reaches a real timeline until the host answers these messages. The UI sends:

| Payload (`type`) | Fields the UI sends | What the host must do |
|---|---|---|
| `ptb-place-media` | `path`, `name`, `autoCut`, `autoScale` | place at the playhead on the **lowest video track free for the clip's full length** (audio at the same index too), never overwrite; Auto-Cut = keep the first 2 s; Auto-Scale = Motion › Scale 180 on the **new** clip only |
| `ptb-place-audio` | `path`, `name`, `gainDb` | insert audio at the playhead on a free audio track with the gain applied |
| `ptb-preset` | `name`, `bin`, `expectName`, `expectBin`, `speed` | apply to the selection; refuse (never guess) if the name+bin no longer match; optional speed first |
| `ptb-flow` | `scope` (`clip`/`playhead`/`selected`), `easing` | one undoable transaction; Scope=Selected uses the Delete→diff→Ctrl+Z probe and refuses unsafe results |
| `ptb-move-keys` | `mode` (`start`/`end`) | move the selected keys to the playhead, values/easing unchanged, refuse if a non-selected key is in the way |
| `ptb-speed` | `percent`, `scope` | retime the animation (minimise on Regenerate is handled in the UI) |
| `ptb-snap` | `name`, `bin`, `kind`, `expectName`, `expectBin` | quick-apply effects / presets / transitions |
| `ptb-import` | `paths` | already spoken by Downloader/Captions — reuse it |

Everything is wrapped so the UI shows a refusal verbatim; **no fake success path exists**.

Also needed:
* a `preset_list` Tauri command (JSON array of `{ id, name, bin, kind, starred }`) for the Presets
  grid and Snap. Today the UI falls back to an empty, honest state.
* `core:window:allow-set-always-on-top` (and optionally `allow-set-position`) in
  `src-tauri/capabilities/default.json`; the status-bar toggle already catches and reports the
  refusal.

### 4.2 Preset identity details
`Azy App` identifies presets by **name + bin**, relinks favourites, keeps local copies and refuses
ambiguous applies. The UI already sends `expectName`/`expectBin` and surfaces refusals, but the
relink / local-copy / refusal logic lives in the host — see §4.1.

### 4.3 Azy features not ported in this pass
| Item | Why it is left | Notes |
|---|---|---|
| Video player window (`player.html`) | The Toolbox plays video inside the preview dock | A separate window needs a second Tauri window + transport controls |
| CEP panel mirroring the same UI (`panel-host.js`) | Toolbox ships its own `premiere-panel/` | Would need the Azy loopback static server or a shared build |
| Dagger **radial wheel** implementation | The Toolbox already has a wheel (`src/Wheel.tsx`) — kept, and pointed at the new sectors | Azy's native mouse-hook helper is Windows-only Electron code |
| Flow "Selected" probe + `AzyKeys` helper | Needs the host + native key sender | UI exposes the scope and blocks nothing itself |
| JSON persistence in `%APPDATA%` | This app already uses `localStorage` everywhere | Migration would be a separate, careful change |
| Sound gain copies / cached audio | Needs the host to render a gain copy | UI sends `gainDb` |
| Custom theme editor incl. "From a colour…" | The old preset/picker editor is kept | `themeFromColor` style generation would be new work |
| Artwork set / webs / characters | Not shipped with this repo's Main APP | The ambient layer is token-drawn instead |
| Welcome, logs, connector repair, auto-update | Out of scope for the layout port | |
| `uiScale` and an enforced FPS cap | FPS target is currently a stored dial only | Would need a rAF budget or CSS gating |
| Per-kind drag icons | Uses the existing `drag_icon` fallback | The old canvas icon can be restored if wanted |

### 4.4 Known small caveats
* Hover actions on a Files card overlay the meta line while hovering (by design, Azy-style).
* In the **browser preview** there is no Premiere and no media: demo items, a demo link chip and
  clearly-labelled demo results. The desktop build never uses the demo data.
* The Azy preset's near-white accent puts dark text on accent buttons (`--az-on-accent`), matching
  Azy's noir theme; other Toolbox presets keep their own contrast.
* The ambient web is CSS only (three orbs + one SVG). It is off in performance mode and with glow
  off.

---

## 5. Files

### New
```
Main APP/src/azy/tokens.css          Azy tokens derived from the Toolbox theme
Main APP/src/azy/azy.css             shell, cards, docks, settings, popups, status bar
Main APP/src/azy/motion.css          keyframes + performance/reduced-motion rules
Main APP/src/azy/state.ts            Azy dials, undo stack, stars, pins helpers
Main APP/src/azy/api.ts              one façade for Tauri/Premiere + demo fallback
Main APP/src/azy/theme.ts            bridge to the existing theme
Main APP/src/azy/libs.ts             pinned folders (shared with the old libs key)
Main APP/src/azy/ui.tsx              primitives, toasts, modals, Esc/hotkey hooks
Main APP/src/azy/Shell.tsx           header, sector tabs, panes, status bar, ambient layer
Main APP/src/azy/SpeedWindow.tsx     the Speed window
Main APP/src/azy/SnapPalette.tsx     Snap Action palette
Main APP/src/azy/pages/Files.tsx     Files + preview dock
Main APP/src/azy/pages/Sounds.tsx    SFX + level card + waveforms
Main APP/src/azy/pages/Presets.tsx   Presets + apply-with-speed
Main APP/src/azy/pages/Flow.tsx      Flow + move-keys pill
Main APP/src/azy/pages/Settings.tsx  the seven settings tabs
Main APP/src/azy/pages/Tools.tsx     Captions/Basic, Downloader, Graph framing
Main APP/vite.config.ts              dev/preview host settings (0.0.0.0 + allowed hosts)
docs/AZY-PORT-STATUS.md              this file
```

### Changed
```
Main APP/src/main.tsx     Shell instead of the old tab bar; wheel now targets the new sectors
Main APP/src/Settings.tsx adds the "Azy" theme preset (nothing else touched)
Main APP/index.html       color-scheme: dark (native controls/scrollbars)
```

Nothing in `Azy App/` was modified.

---

## 6. Run and verify

```bash
cd "Main APP"
npm install
npm run dev        # browser preview: demo media, demo presets, no Premiere needed
npm run build      # production bundle (passes)
npm run tauri dev  # the real app: needs Rust + the backend items in §4.1
```

**What was verified here**
* `npm run build` completes (esbuild/Vite, 1900+ modules).
* A headless (jsdom) render pass was run against the real bundle: every sector mounts, the Speed and
  Snap windows open, Files shows 14 cards with the dock/select/star/search/list-view/Apply paths
  exercised, SFX shows 10 rows with waveforms, playing state and Apply, Presets shows 12 cards and
  applies, Flow renders 12 curves and applies/moves keys, all seven Settings tabs mount, `Ctrl+3`
  switches sectors, `Alt+→` reorders pins, `Alt+↑` reorders sound folders, and `Esc` clears the
  selection first and only then hides the window. **0 runtime errors.**

**What was not verified**
* A pixel-level check in a real Chromium/WebView2 (no browser is available in this environment) —
  the layout follows the sizes above but should be eyeballed once at 1080 × 760 and at the 760 px floor
  (the shell is a wide two-column layout, not the old narrow stack).
* Anything against a real Premiere project — see §4.1.

---

## 8. Installer + source package — done

| Item | Status |
| --- | --- |
| Rust backend restored into `Main APP/src-tauri/src/` (`main.rs`, `captions.rs`, `extras.rs`) | done |
| New `presets.rs` → registered `preset_list`; `silence_scan` and `write_text` now registered too | done |
| `tauri.conf.json` for 0.4.0: Azy-sized `main` window + transparent `wheel` window, per-user NSIS, icon/publisher | done |
| `capabilities/default.json`: `main` + `wheel`, dialog / drag / global-shortcut / window perms | done |
| `.github/workflows/build.yml`: windows-latest → NSIS `.exe` + `.msi`, artifacts, release on `v*` tag | done — **run 39834417387 green in 5m15s** |
| `build-installer.ps1` / `build-installer.bat` for a local Windows build | done |
| `docs/INSTALLER.md` (both build paths, output paths, caveats) | done |
| Installer actually produced and published | done — release `v0.4.0`, `Premiere.Toolbox_0.4.0_x64-setup.exe` 2 MB + `.msi` 3 MB |
| Source package | done — `PremiereToolbox-0.4.0-source.zip` (4.5 MB, 269 files) |
| Signed binary | not done — needs a code-signing certificate; Windows shows "Unknown publisher" |
| Run the installed app against a real Premiere project | not done — no Windows/Premiere in this environment |
