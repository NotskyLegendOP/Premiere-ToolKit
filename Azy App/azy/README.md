# Azy v1.3.0

**Azy** is a compact, always-on-top Windows workspace for browsing media, applying Premiere Pro presets and Flow keyframes, using Snap Action, and dragging files directly into Premiere. It keeps the existing all-in-one window and dark, customisable accent identity while keeping everyday media work quick and low-friction.

## v1.3.0 — Flow Selected actually detects, glass reference skin everywhere

- **Selected keyframes now really detect**: before the Delete/Ctrl+Z probe runs, Azy focuses
  Effect Controls with Premiere's own default panel shortcut (Shift+5), so Delete lands on the
  panel that owns the highlight instead of whatever you clicked last (usually the timeline,
  where it silently did nothing). One plain-Delete retry covers remapped shortcuts; Ctrl+Z is
  still only ever sent after Delete demonstrably removed keys.
- **The waiting pop-up is the reference glass dialog**: AZY / DAGGER brand bar with minimize +
  hide, orbit ring, big action title, the preset/operation name beneath, live stage line, and
  Cancel + gradient Minimize at the bottom. Minimizing still collapses to the corner pill.
- **Speed window rebuilt to the reference card**: keyframe-pair card with the live key count,
  gradient percent dial with a travelling knob, Clip / Playhead segment, −/+ slider card with
  the typed percent pill and 50/100/200 scale — plus the **Selected Keyframes** button and
  "Apply to selected only" toggle, so Speed shares Flow's probe-backed Selected scope.
- **The whole app wears the reference skin**: gradient logo tile + wide AZY wordmark with
  Ctrl F chips and real minimize/close buttons, four glass nav segments with a glowing
  active tab, pill footer (Connected · On top · build), glass explorer rail with glowing
  active row, round Pin-folder button, centred play ring on media thumbs, uppercase meta,
  rounded-2xl glass cards with gradient rims across Files, Presets, Flow and Sounds.

## v1.2.1 — Sounds goes media-parallel: pins, explorer rail, card board

- **Sound folders are pinned directories now**, exactly like media pins: *Pin folder* in the Files toolbar pins a folder of sounds (walked recursively for audio), *Unpin* drops the current one, *refresh* rescans, *Up* returns to All Sounds. The broken *Add SFX* tile and *New folder* button are gone — pinning replaces both.
- **The rail is the explorer rail**: same head/sections/rows as media, carrying All Sounds, Favorites and your pinned sound folders with live counts.
- **Cards return to the reference layout**: play button + waveform on top, name, format chip and size, Apply at the playhead — star on hover for Favorites.
- **The Sounds toolbar row now matches media's** (Up, section switch, volume, waves eye, refresh, wheel, Unpin, Pin folder); the eye toggles waveform art in Sounds.
- Store rewrite: one `sounds.json` of pins + favorites, recursive depth-capped scan, no hand-maintained file lists — which is also why the old "Error invoking remote method" paths cannot come back.

## v1.2.0 — Flow glitch fixed, presets target the new effect, glassy Dagger pop-ups

- **Fixed the `flowOp is not defined` glitch** on every Dagger Flow release (a scoping bug introduced with the Selected-scope default); a contract test now pins the declaration order.
- **Preset values land on the effect instance the apply created.** Appending a second Transform/Blur/etc. writes the preset's params to the NEW component; when Premiere refuses an append the apply now fails honestly instead of silently re-tuning the older instance. Fixed intrinsics (Motion/Opacity/Volume/Panner) remain the single documented in-place exception. New targeting test asserts component indices.
- **Audio Level (Dagger SFX): ±5 dB buttons** (arrows still nudge 1 dB), the level is **remembered in the shared settings file** — reopen, sector switch or full restart all come back where you left it.
- **Speed pop-up is now a frosted-glass card** (transparent window, blur, soft border/shadow, no drifting aurora) with a **mode badge** that makes the target unambiguous: *Whole clip*, *Selected keyframes only* (accent-lit), or *Keyframe pair at playhead* — plus the typed-percent pill back in the slider row.
- **Cohesive micro-interactions** across Dagger → Speed → Audio: hover tints, 96% press-scale, fast transitions, focus rings; no new continuous animations, spinner rings run only while an operation is in flight.

## v1.1.9 — Sounds search joins the shared keyboard paths

- `Ctrl+F` now focuses the **Sounds search** when the Sounds section is open (media search otherwise), `Escape` clears it first, and typing in it suppresses app-wide shortcuts exactly like the media search does.
- The brand mark lost its boxed chip on every surface (the base rule kept a fill+ring for non-minimal contexts; both are gone now), so the logo blends into the title strip everywhere.
- New contract tests pin the Ctrl+F / Escape / typing-parity behaviour.

## v1.1.8 — packaging fix, Sounds rows + search, blended logo

- **Installer fix:** `sounds-store.js` was missing from the packaged file allowlist, so the installed app crashed at boot ("Cannot find module './sounds-store'") and everything registered after it — pin folder included — stopped answering. It now ships in the asar, and a new test fails the build if any module main.js requires is ever left out of the allowlist again.
- **Sounds now read like the media rows:** one row per sound — waveform thumb with the play button on the left, name + format/size on the right, star and Apply at the end — instead of the tile grid. A **search field** with a live count pill narrows the library in place (works inside any folder scope).
- **The Azy mark blends into the title strip** — the boxed chip behind the logo is gone; the glyph now floats on the chrome.

## v1.1.7 — Sounds section, glassy dagger popup, always-append presets

- **Files is now two sections.** A compact Media/Sounds switch sits in the Files toolbar row. Media (videos, images, everything else) is untouched; **Sounds** is its own library — folders you create, an *Add SFX* tile that opens an audio-only picker (mp3/wav/ogg/flac/m4a/aac/aif/wma), favorite stars with a Favorites scope, and cards showing a seeded waveform, format chip and size. The library lives in its own `sounds.json` in userData.
- **Sounds play beside the file.** No dock, no preview panel — each card has its own play button driving one shared audio element, and the compact volume button up in the toolbar saves its level across restarts.
- **Apply inserts at the playhead.** A card's Apply button goes through exactly the SFX dagger path (`placeAudio`): free audio track at the playhead, or a new track when every one is busy.
- **The dagger waiting popup is now a compact glass card**: transparent, ~300×176, with a five-ring spinner (each ring its own rotation/wobble/dash animation), a glitch sweep, and both **Cancel** and **Minimize** buttons. Minimized it shrinks to a draggable pill in the corner and restores on click; Cancel aborts the running operation through the engine.
- **Presets always add a new effect instance.** Applying a preset now appends a fresh effect even when the same one (e.g. Transform) is already on the clip — except Premiere/After Effects intrinsic matches (Motion, Opacity, Volume, Panner, Time Remapping, Speed), which must stay singleton.
- **The dagger Flow wheel now defaults to the Selected scope** (select your keyframes in Effect Controls first) on every open.

New tests: sounds store unit tests (folders, dedupe, favorites, missing-file flags, persistence), a jsdom UI suite driving the real markup (section switch, play toggle, Apply → playhead, volume persistence), and updated dagger/flow/preset contracts.

## v1.1.6 — Flow "Selected" now really detects highlighted keyframes

Premiere exposes **no scripting API** for the keyframes highlighted in Effect Controls (checked across CEP ExtendScript, the QE DOM and UXP 25.6+ — the same wall every other tool hits). Azy v1.1.6 gets around it by watching what Premiere itself does:

1. Azy reads the complete keyframe inventory of the selected clip(s) — every parameter, key time and value.
2. Azy sends **Delete** to Premiere. Effect Controls deletes *only the highlighted keys* — that is Premiere's own native behaviour, so the detection is exact.
3. Azy re-reads the inventory: the keys that disappeared **are** the highlighted ones, identified to the tick.
4. Azy sends **Ctrl+Z**: Premiere restores those keys exactly as they were, and Azy verifies the restore key-for-key. If Premiere somehow did not give a key back, Azy re-adds it from the value captured in step 1 and says so in a warning.
5. Only then does the chosen easing (Ease In/Out/custom curve, Hold, Linear, speed…) apply — filtered to exactly the detected keys. Nothing else on the clip is touched, and the easing itself stays one normal Ctrl+Z undo.

Safety rules built into the probe:

- If nothing was highlighted (or Effect Controls did not have keyboard focus), the inventory does not change, **Ctrl+Z is never sent** (it would eat your own last undo), and the apply is refused with guidance instead of falling back to the whole clip.
- Inside the Azy panel, clicking a Flow tile no longer moves keyboard focus out of Effect Controls, so the probe's Delete lands where your highlighted keys are.
- Keystrokes are OS-native (PowerShell `SendKeys` on Windows, System Events on macOS) and only ever reach the Premiere window, activated by process ID.

This required three small, surgical additions to the connector bundle (`values` on request in `flowKeyframes`, an explicit per-keyframe filter in `applyEasing`, and a `restoreKeys` emergency-restore handler) plus the new desktop-side probe module `presets/flow-selected.js`. Clip, Playhead, Speed, Presets and everything else are unchanged; Selected remains Flow-only and still means *only* natively highlighted keys — no Azy picker.

New tests: probe unit tests (happy path, nothing-highlighted refusal without Ctrl+Z, broken-undo fallback restore, malformed states), scope-policy routing tests, and the mocked-Premiere smoke test now runs the whole Selected flow end to end — highlight → detect → restore → ease exactly those keys.

## v1.1.5 — compact headers, all-Files rows and unified colour

- Restored landscape preview rows for **folders, images and other files**, as well as video/audio. The same thumbnail/decode pipeline, hover preview, Ctrl/Cmd multi-selection, native drag and double-click handlers remain. Presets/Flow stay name-only tiles; Presets still has no preview.
- Merged Files title/actions, Presets source chips/Add library, and Flow targeting/actions into compact headers. Removed the redundant Files breadcrumb strip. Header Up, Alt+Up and Explorer path navigation remain. Flow target health is a focusable status dot with a full accessible label/tooltip.
- Darker near-black shell gradients. All eight palettes now drive folder icons, secondary controls, Dagger details, media-player controls and utility surfaces. Live settings changes reach the player, open Dagger action popup and authenticated Premiere panel; panel colour changes also update desktop preferences. Media pixels, palette-choice swatches and semantic warning/error colours are intentionally not recoloured.
- **104 additional interaction presets**: 26 component families × enter, leave, press and focus. These are delegated, short transform/opacity treatments, not 104 idle loops. Reduced-motion disables them, native dragging cancels them, and no more than six run together. [Motion inventory and guardrails](docs/MOTION.md).
- Added browser checks for all 104 event routes, 340–760px header bounds, eight folder/player palettes and live panel/popup changes. The existing real WebM, Flow overlap, Files-only preview, undo, large-folder, native input-fence and mocked-host tests remain.

Native highlighted Effect Controls keyframes are still **not** supported by Selected. Clip/Playhead/Speed paths and the connector bundle are unchanged. Live Premiere and installer acceptance still need Windows hands-on validation.

## v1.1.4 — screenshot fixes and glass styling

- Fixed overlapping Flow group headings and cards by removing misleading intrinsic-size containment from Presets/Flow cards and sizing grid rows from their content. Mixed custom/built-in libraries are tested at 340–760px, 100%/125% scaling, after resize and scroll.
- Restored wide, cinematic **video and audio** thumbnail rows with their type/date caption and existing native drag / double-click behavior. Image and folder thumbnail geometry remains unchanged.
- Removed the Presets preview entirely: no eye button, delayed hover renderer, metadata fetch or borrowed dock height. The dock is Files-only, and closes when leaving Files. Files preview and its Settings toggle remain.
- Added **Violet, Rose, Mint and Amber** alongside the four existing colour choices. Palettes are validated and saved by the main process, with matching desktop, Snap/Speed, Dagger wheel and action-popup accents.
- Dark static gradients, translucent surfaces, softer borders and restrained accents. No animated background or per-file backdrop blur; image thumbnails keep inexpensive flat surfaces for smooth browsing.

Regression coverage includes a real decoded WebM thumbnail, Files-to-Presets dock transitions, native Selected fail-closed behavior, narrow Settings, palette persistence and undo. Native Premiere integration still needs hands-on Windows validation; its connector bundle is unchanged.

## v1.1.3 — Flow targeting safeguards and UI refinement

**Native selected-keyframe application is still unavailable with the shipped CEP connector.** “Selected” means only keys highlighted in Premiere Effect Controls, never a separate Azy picker. The new option explains this limitation and blocks apply. The main process also rejects Selected and unknown scope requests before any host call, so they cannot silently become Clip edits. No connector bundle was patched.

- Clip and Playhead remain operational. The Dagger Flow wheel remains explicitly **Clip-only**; its existing waiting popup and host path are unchanged.
- Speed has its own Clip / Playhead preference; it does not inherit an unsupported Selected mode.
- Scope supports arrow keys, Home/End, persisted choice and Ctrl+Z.
- Fixed Enter/Space bubbling from favorite/pin controls into a card's apply action.
- Changing scope during a Shift-click Speed prompt now cancels the pending apply.
- Clearer neutral text, quieter controls, less duplicated status text and a full-area curve editor, including narrow-window layout and Escape/focus restoration.
- Fixed stale no-results messages, blank filter feedback and lingering Flow warning styles.

The browser and mocked-host tests cover these paths; actual Premiere native interaction still needs Windows testing. This release does **not** claim to read or apply to highlighted keys.

## v1.1.2 — compact UI and reliability fixes

- One compact header per section; no repeated Workbench / Deck / Studio marketing copy.
- Flat controls, stable tabs, square name-only thumbnails and compact Explorer rows.
- Files leaves at least 60% of a 470 × 760 window available for media. All four sections and every Settings category are checked down to 340px wide.
- Fixed vertically stacked toolbar actions, narrow-window overflow, stale loading/error tiles, and recursive rendering in folders above 640 files. A 1,600-file regression covers listing, search and recovery.
- Refresh updates changed file types and metadata rather than keeping stale drag/preview handlers. Thumbnail byte accounting no longer double-counts updates.
- Settings Preview now actually saves on click; frame-rate and startup undo restore the pre-change values. Async undo waits for success, refuses concurrent undo and retains failed entries for retry. Different favorites no longer overwrite each other's undo entries.
- The same compact skin is served in the Premiere panel. Dagger waiting/SFX gain popups and the uploaded Clip / Playhead connector remain unchanged.

### Downloads and builds

The branch's **Installer** GitHub Actions run produces **Azy-install** (`install.exe`) and **Azy-portable** (`Azy-Portable-v1.1.5.exe`). Download the artifact ZIP and extract it before running the EXE. Source is available through GitHub's commit archive. GitHub sign-in is required for private repository downloads.

Build locally on Windows with Node 22: run `build-installer.cmd`, or `npm ci && npm run dist:release`. Output is in `dist/`.

**Validation limits:** browser fixtures and the mocked connector verify application behavior, not a live Premiere installation. Native drag/drop, the popup over Premiere, Windows scaling/multiple monitors and host undo still require the real-Windows checklist. Azy undo is window-local and covers registered UI actions, not every possible external or filesystem side effect. Premiere edits must be undone in Premiere itself.

---

## What Azy does

### Files — fast media browsing and drag-out

- Pin frequently used folders and move between them from the pin strip.
- Search filters the current folder in place — the matching cards stay where they are and the rest are set aside, not destroyed, so the folder never blanks or re-flows while you type. Use the breadcrumb, the Up button, or `Alt+Up` to step out.
- **Sort and view:** `Sort` orders the board (newest, name, name Z–A, oldest, type) with folders kept first, and `View` switches the same cards between the media grid and the roomier Explorer list, whose rail carries your pinned folders and the current path. Both are remembered per machine, both are style-only: no re-listing, no second decoder, no re-fetch, and `Ctrl+Z` puts the view back.
- **Selection:** `Select all` picks up every visible media file (click it again to let go); a plain click selects exactly one file; `Ctrl`/`Cmd`+click adds or removes another, and `Esc` clears. Nothing else is needed and there is no selection bar, count or Clear button to read — the ring on the card is the whole indication.
- **Double-click opens what the file is:** a video goes to the player window, a sound auditions in the preview dock with its transport (double-click again to pause), a still is held in the dock first and opened in the viewer on the second double-click, and any other file gets its preview held up. A single click still only selects, and a drag that actually moves still wins: double-clicking never interferes with dragging files into Premiere.
- **Undo:** `Ctrl+Z` and `Ctrl+Shift+Z` reverse and replay registered Azy actions such as view, sort, filter, selection, pins and preference changes. These are window-local stacks; typing keeps the field's own undo. This is not a promise to reverse every disk operation or host edit. Undo Premiere changes in Premiere.
- **Preview dock:** hovering a file glides a compact preview out of the strip below the panel — the window borrows that height instead of squeezing the file grid, so nothing reflows. `Enter` opens what you selected and `Space` auditions a selected sound.
- The dock is one on/off decision: the eye in the Files toolbar, **Settings › Files preview**, or `Ctrl+Shift+P`. Off returns the strip height. Presets, Flow and Settings never open the dock.
- Drag video, audio, images, and other files directly into Premiere, Explorer, or another Windows target.
- Video posters use lazy, bounded thumbnail work. A direct hover takes priority over unrelated background decoding; unsupported media safely falls back to its normal icon rather than stalling the folder.
- **Sounds section:** the Media/Sounds switch in the Files toolbar opens a dedicated audio library — your own sound folders, an *Add SFX* picker, favorites, per-card play buttons with waveforms, a persistent preview-volume control, and an **Apply** that inserts the sound at the playhead exactly like the SFX dagger. The Media section above is completely untouched by it.

### Presets — find and apply with less friction

- Pin folders of `.prfpset` files.
- Browse and star existing Premiere presets so favorites stay easy to reach.
- Select clips in Premiere, then click a preset in Azy to apply it. There is no Presets preview panel; the card tooltip retains the effect details.
- Status feedback makes connection, processing, success, and recoverable failures clear without blocking routine work.

### Flow — focused keyframe work

- Apply Azy’s existing Flow/easing presets to the keyframes of the clips Premiere has selected.
- **Scope** decides which keyframes move: `Clip` (every keyframe of the selected clip(s) — the default, and what it always did) or `Playhead` (only the keyframe pair around the playhead, per property). Park the playhead between the two keyframes you want eased and the whole rest of the animation is left exactly as it was. That is how Premiere's own scripting describes a keyframe-scoped edit: the engine reports keyframes but has no list of "the ones highlighted in Effect Controls", so Azy does not pretend otherwise and does not rebuild a picker on top of it — the reason Flow exists is that it writes in one undoable transaction, and nothing in its way should be able to break that.
- Nothing is applied by accident: with no clip selected Azy says so instead of writing anywhere, every apply stays one undoable step inside Premiere, and Speed keeps its own `Clip`-scope path because retiming moves keyframes across the clip.
- **Move Selected Keyframes → playhead** translates the keyframes highlighted in Effect Controls so the group **starts** (earliest key) or **ends** (latest key) exactly on the playhead — select dozens of keys, park the playhead, press `Ctrl+Alt+P` (configurable, works with the Flow panel closed). Values, easing and the internal spacing never change; the offset is computed once and the whole group lands as one undoable step. If a non-selected key already sits where the group would land, Azy refuses rather than overwrite it. Timing is measured on the sequence timeline (keyframe times are clip-local in Premiere, so each clip's position and in-point are accounted for); if any key would land outside its clip, nothing moves, and if Premiere rejects a single key mid-move the whole move is rolled back. The control lives as a compact pill in the Flow header: ➜ · Start/End · shortcut.
- The separate **Azy Speed** window always opens at **100%**; changing it affects only the current deliberate operation and does not restore an old standalone value next time.

### Settings and Snap — configuration without clutter

- Choose the UI target of 60, 90, or 120 FPS; this is an upper motion target, not a forced redraw rate.
- Choose Azy’s color treatment, whether the preview panel is on at all, start-at-login, logs, module repair, and Dagger options.
- Snap Action provides its existing keyboard-driven effect/preset/transition workflow with concise, clear configuration.

### Dagger

Releasing inside the hub does nothing: the centre of a wheel is a cancel zone, on every wheel, so a gesture that never reached a section cannot apply a preset, place a sound or open a window. Off the hub, the section under the pointer is what fires.

Dagger remains a local-only radial workflow for Azy actions. Its Windows helper is intentionally narrow in scope: it handles the specific native cursor/hook behavior that Electron cannot reliably provide alone. The default gesture is **Ctrl + right mouse**, configurable from Settings. See `WINDOWS_V1_0_VALIDATION.md` before using it in a production Premiere workflow on a new Windows machine.

---

## Install Azy — recommended method

### What you need

- A 64-bit Windows PC.
- No Node.js, npm, or developer tools are needed to use the installer.
- Adobe Premiere Pro is optional for Files browsing/dragging, but required for Presets, Flow, and Snap workflows. The bundled CEP Connector targets Premiere Pro 2023–2026+.

### Steps

1. Download or copy **`install.exe`** to the Windows PC.
2. Extract the downloaded artifact ZIP before running the installer.
3. Close a running copy of Azy, then double-click the installer.
4. Accept the normal Windows security prompt if one appears. The installer is **per-user** and does not require administrator elevation.
5. Azy launches after install. It also creates Desktop and Start-menu shortcuts.
6. If Premiere was already open during the first install, restart Premiere once.
7. In Premiere, open **Window → Extensions → Azy**. The Connector should link automatically while Azy is running.

The installer copies the Connector automatically. You do **not** need to install Node.js, copy the plugin manually, or enter a code under normal circumstances.

### Installed locations

| Data | Normal location |
|---|---|
| Azy application | `%LOCALAPPDATA%\Programs\azy\` |
| Premiere CEP Connector | `%APPDATA%\Adobe\CEP\extensions\com.azy.premiere.connector\` |
| Azy settings, pins, window state, logs | `%APPDATA%\Azy\` |

Windows can vary the capitalization of these folder names; the paths are otherwise per-user.

---

## Run the portable build

1. Copy **`Azy-Portable-v1.1.5.exe`** to a normal user-writable folder, for example `C:\Tools\Azy` or a USB drive.
2. Double-click it to run Azy. It does not create a conventional installed application entry or shortcuts.
3. Let Azy complete its normal Connector check/repair on first launch, then restart Premiere if its Extensions menu was already open.

The portable build is useful for trying Azy or carrying it between compatible Windows machines. It still uses normal per-user Azy settings and Connector locations so that the app can work with Premiere safely.

---

## First-use guide

### Browse and drag media

1. Open **Files**.
2. Click **Pin folder**, choose a media folder, then click its pin chip whenever you want to return.
3. Type in the search field to narrow the visible files.
4. Click files to select them; hold Ctrl while clicking to select more than one.
5. Hover a card for a preview. For a video, double-click the card to open the player.
6. Drag a card or selected group onto Premiere’s Project panel or timeline.

### Apply a preset

1. In Premiere, select the intended clip(s) or keyframes.
2. In Azy, open **Presets**.
3. Click a saved preset card to apply it. Use the star/favorites flow to keep Premiere presets visible in Azy.
4. Read the non-blocking status message if Azy needs Premiere to be open or a selection to be made.

### Use Flow and Speed

1. Select the target keyframes in Premiere.
2. Open **Flow**, choose the desired existing easing, and apply it.
3. Open **Azy Speed** only when you want an intentional timing adjustment. It opens at **100%** every time; choose a value and apply it for the current operation.

### Use Snap Action

1. Select a clip in Premiere.
2. Open **Snap Action** with its configured shortcut or from Azy.
3. Navigate with the arrow keys, press Enter to apply, and press Esc to dismiss.

---

## Keyboard essentials

| Shortcut | Result |
|---|---|
| `Ctrl+F` | Focus the current Files/Presets search field. |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo and redo the last thing Azy changed. Typing in a field is left to that field's own undo. |
| `Ctrl+Shift+P` | Toggle the Files preview preference. Other workspaces never open a preview panel. |
| `Enter` | Open the selected file by kind: player, viewer, or the preview dock. |
| `Space` | Audition (or stop) the selected sound in the preview dock. |
| `Alt+Up` | Up one folder. |
| `F5` | Re-read the current folder. |
| `Ctrl+T` | Toggle Azy always-on-top. |
| `Esc` | Let go of one thing at a time — search text, then a pinned preview, then the selection, and only then close Azy—so an accidental first press does not immediately quit. |
| `Ctrl+W` | Close Azy. |
| `Shift+Space` | Default Snap Action shortcut (configurable). |
| `Ctrl + right mouse` | Default Dagger gesture (configurable; Windows-only native behavior). |
| `Space` / `K` | Play/pause in the video player. |
| `←` / `→` | Seek 5 seconds in the player. |
| `J` / `L` | Seek 10 seconds in the player. |
| `M` | Mute in the player. |
| `F` | Fullscreen in the player. |

---

## Connector setup and recovery

### Normal setup

The NSIS installer copies the CEP Connector and sets the per-user Adobe CEP debug mode necessary for the bundled Connector. Azy also checks the module at launch and can repair a stale or incomplete copy.

If Azy does not appear in Premiere:

1. Quit and restart Premiere once after the first Azy installation.
2. Make sure Azy is running.
3. Click the Azy/Premiere status line or use the relevant Settings repair action when Azy reports that the module needs attention.
4. Check that this file exists:
   ```text
   %APPDATA%\Adobe\CEP\extensions\com.azy.premiere.connector\host\azy.jsx
   ```
5. Open **Window → Extensions → Azy** in Premiere.

### Manual Connector recovery

Use this only if automatic repair reports a problem:

1. Close Premiere.
2. Copy the contents of this source tree’s `presets/connector/` directory into:
   ```text
   %APPDATA%\Adobe\CEP\extensions\
   ```
   The resulting folder must be named `com.azy.premiere.connector`.
3. Start Azy and use module repair if prompted.
4. Restart Premiere and open **Window → Extensions → Azy**.

The Connector is local-only and talks to the local Azy bridge. It is not a cloud service.

---

## Updating, reinstalling, and uninstalling

### Update or reinstall

1. Close Azy and Premiere if practical.
2. Run the newer `install.exe` or later Azy installer.
3. It replaces the application at the same per-user location and refreshes the Connector.
4. Restart Premiere after a Connector update.

Your pins and normal preferences are deliberately retained across an ordinary reinstall.

### Uninstall completely

1. Open **Settings → Apps → Installed apps** in Windows.
2. Find **Azy** and select **Uninstall**.
3. The uninstaller removes the installed app and the Azy CEP Connector.
4. To remove personal settings and logs as well, delete:
   ```text
   %APPDATA%\Azy\
   ```
5. If you used a portable copy, delete the portable `.exe` yourself too.

The uninstaller intentionally leaves Adobe’s shared `PlayerDebugMode` setting unchanged because other CEP extensions may depend on it.

---

## Run from source code

The source archive intentionally does **not** include `node_modules`; npm recreates it from the supplied `package-lock.json`. Its top level contains two sibling folders:

- `azy\` — the complete Electron application that you run and package.
- `azy-presets\` — the readable TypeScript source workspace used to regenerate Azy's bundled Premiere Connector and preset engine. It includes its own lockfile and build scripts.

The prebuilt `presets\engine.js` and deployable `presets\connector\` folder are already present in `azy\`, so ordinary source runs and release builds do not need a separate connector build first.

### Prerequisites for development

- Node.js LTS (Node 20.x is recommended).
- npm, included with Node.js.
- A Windows system for producing/running the Windows release artifacts.

### Steps

```bat
:: Open Command Prompt in the extracted Azy source folder
npm ci
npm start
```

Use `npm ci` for a reproducible install from `package-lock.json`. Use `npm install` only when intentionally changing dependencies.

### Run tests

```bat
npm test
```

The supplied test fixture lets `npm test` run from the standalone `azy\` folder; it does not depend on a separately installed companion project. The release QA also uses local jsdom and Playwright browser tooling; these are development-only tools and are not included in the app installer.

### Rebuild the bundled Connector and preset engine (maintainers)

Do this only after intentionally editing the TypeScript Connector/engine source in the sibling `azy-presets\` folder. It rebuilds the deployable Connector, `azy\presets\engine.js`, and the test-only mock fixture together:

```bat
cd ..\azy-presets
npm ci
npm run bundle:azy
cd ..\azy
npm test
```

For this source delivery, the regenerated Connector and engine were independently rebuilt and byte-compared with the deployable copies before packaging.

---

## Build release artifacts from source

After `npm ci` completes:

```bat
:: Standard one-click installer
npm run dist

:: Portable executable
npm run dist:portable

:: Both artifacts
npm run dist:release
```

Outputs are written to `dist\`:

| Command | Output |
|---|---|
| `npm run dist` | `dist\install.exe` |
| `npm run dist:portable` | `dist\Azy-Portable-v1.1.5.exe` |
| `npm run dist:release` | Both artifacts above |

For a beginner-friendly installer-only build, double-click **`build-installer.cmd`**. For a portable build, double-click **`build-portable.cmd`**. Both scripts run from their own folder and explain missing Node.js/build-tool errors.

The release package includes the Connector source/payload, Dagger helper asset, app assets, source build configuration, and required runtime files. Tests and development dependencies are deliberately excluded from end-user packages.

---

## Troubleshooting

| Symptom | What to do |
|---|---|
| `npm` is not recognized | Install Node.js LTS, then open a new Command Prompt. |
| Source app opens blank or fails to start | Run `npm ci` again and then `npm start` from the project root. |
| Azy will not move or close | It is intentionally frameless. Drag by the top grabber/pin strip/status area; use Esc or Ctrl+W to close. |
| Azy is not in Premiere’s Extensions menu | Restart Premiere once, run Azy, use module repair, and confirm the Connector path above exists. |
| Azy says Premiere is not connected | Start Premiere, open the Azy extension panel, make a Premiere selection when the action requires one, and wait for the status line to update. |
| A video has no poster or cannot play in Azy | Some codecs—such as certain MXF, ProRes, or camera-specific variants—are not decodable by Chromium. The file remains usable: it keeps its icon and can still be dragged into Premiere. Azy bounds the failed thumbnail attempt so it does not stall the folder. |
| Video posters seem slow | Confirm the file is on a local drive rather than a slow network/removable drive. Hover the intended card: direct hover work pre-empts unrelated background decoding. For a reproducible remaining issue, record extension, codec, resolution, storage type, and a short screen capture. |
| Dagger behaves unexpectedly | Turn it off in Settings and follow `WINDOWS_V1_0_VALIDATION.md` on a real Windows machine. Report monitor arrangement, scaling, mouse binding, and Windows/Premiere version. |
| Memory remains high after long media browsing | Move focus back to Premiere or another app so Azy can trim regenerable thumbnails; check that stale workspace windows are not open. Record private working set and PSS/process details before reporting. |

## Maintainer notes

- Main source: `main.js`, `renderer.js`, `styles.css`, `index.html`, and `presets/`.
- Connector source: `presets/connector/`.
- Native Dagger helper source/build script: `presets/native/`.
- Test suite: `test/`.
- Windows installer hooks: `build-res/installer.nsh`.
- Real-Windows final acceptance plan: `WINDOWS_V1_0_VALIDATION.md`.

Azy v1.1.2 simplifies the interface while retaining the existing all-in-one workflow and host integration.

### Dagger apply popups (1.1.1)

- Preset and Flow wheel actions open a compact, always-on-top waiting window without taking focus from Premiere. It stays until the actual apply settles; it never invents a percentage. Success closes automatically, while errors stay readable until dismissed. Additional wheel applies are ignored while a prompt/apply is active.
- The SFX wheel opens **Sound volume** before insertion. Use **− / +** (or the keyboard keys) in 1 dB steps, from −24 to +12 dB, then **Apply sound** / Enter. Cancel or Escape inserts nothing. The playhead at confirmation is the insertion point.
- **0 dB inserts the original media.** Nonzero gain renders a mono/stereo 16-bit WAV copy under Azy's user-data **Dagger Audio** folder; it does not edit the original or modify Premiere's clip-gain control. These copies are permanent media references: do not delete them while projects use them. Gain that would clip is refused, rather than silently distorting the sound. Unsupported formats/multichannel audio and oversized sounds can still be inserted unchanged at 0 dB.
- The existing Preset, Flow and audio-placement host calls are unchanged; no connector bundle patch is required. Premiere edits are undone inside Premiere.
