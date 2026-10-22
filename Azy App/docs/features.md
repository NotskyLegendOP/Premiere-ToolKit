# Azy — Features

> Verified against v1.21.0 (`230747a`).
>
> **Status legend:**
> - ✅ **Implemented**: in the code, covered by the CI suites (simulated Premiere).
> - 🟡 **Implemented, awaiting real-Premiere verification**: shipped, but the user hasn't confirmed it in a live Premiere yet.
> - 🟠 **Partial**: some of it exists, some doesn't.
> - 🔵 **Requested / planned**: asked for, not implemented.
> - 💡 **Idea**: not requested, only a possibility. Do not build without asking.
>
> "Implemented" never means "verified in real Premiere" unless stated. For the user-facing guide, see [`azy/README.md`](../azy/README.md).

---

## Files (media browser)

| Feature | Status | Behaviour and requirements |
|---|---|---|
| Pinned folders | ✅ | Pin chips in a strip, plus a rail in list view. Stored in `%APPDATA%\Azy\pins.json` (atomic writes). |
| **Pinned-folder reorder** | 🟡 v1.21 | Drag a chip in the strip or rail, or use `Alt+Arrow`. Undoable. `presets/pin-order.js` `reorderPinList`: unknown or duplicate paths are ignored, omitted pins keep their relative order, and a bad payload changes nothing. IPC `reorder-pins`. |
| Search in place | ✅ | Non-matching cards are set aside, not destroyed, so the folder never blanks or reflows. |
| Sort and View | ✅ | Sort by newest, name, Z–A, oldest or type, with folders first. View is grid or Explorer list. Remembered per machine and undoable. |
| Selection | ✅ | Click = one item. **Ctrl/Cmd+click only** for multi-select. `Esc` clears. The ring on the card is the only indicator, with no selection bar. |
| Double-click | ✅ | Video opens the player window. Sound auditions in the dock. Image goes to the dock, then the viewer. Never interferes with dragging. |
| Drag-out | ✅ | Native drag into Premiere, Explorer or other targets (`start-native-drag`). **Must never break.** |
| Preview dock | ✅ | Hover preview in a strip borrowed *below* the panel, so the grid doesn't reflow. One on/off switch: the eye icon, *Settings › Files preview* or `Ctrl+Shift+P`. |
| Thumbnails | ✅ | Lazy, bounded decoding. Hover gets priority. Unsupported media falls back to an icon. |
| Window-local undo | ✅ | `Ctrl+Z` / `Ctrl+Shift+Z` for registered Azy UI actions only. Premiere edits are undone in Premiere. |
| Import dropped items | ✅ | Drop files onto a folder to copy them (`import-dropped-items`). |
| **Apply (media to timeline)** | 🟡 v1.21 | The Apply button on every card places media at the playhead via `placeMedia` (`azy.jsx`). **v1.21 rules:** use the **lowest video track that is free for the clip's full length**, and the audio tracks at the same index must be free too. Never overwrite, move or disturb existing clips. If the length is unknown, it is **never guessed**: the track must be empty after the playhead. The multi-channel audio span is learned per file (`AUDIO_SPAN`). |
| Auto-Cut | ✅ (v1.18 rule) | Toggle (`azy.files.autoCut`). Keeps the **first 2 s** as one clip (images also get 2 s). Done through a source in/out read-back with a `TrackItem.end` fallback. **Source marks are always restored.** Never modifies unrelated content. |
| Auto Scale | ✅ (video only since v1.19) | Toggle (`azy.files.autoScale`). Sets Motion › Scale **180** on the *newly placed video only*. Never images, audio, presets or existing clips. |
| Video player window | ✅ | `player.html`: fit, fullscreen, volume that survives a restart (`settings.json`). Preview seek **never moves the Premiere playhead**. |

## SFX / Sounds library

| Feature | Status | Behaviour |
|---|---|---|
| Sounds section | ✅ | Opened with the Media/Sounds switch, or the **SFX** sector (`Ctrl+2`). Your own sound folders, an *Add SFX* picker, favourites, per-card play button with waveform, persistent preview volume. Store: `sounds-store.js`; view: `presets/sounds-view.js`. |
| Compact cards | ✅ | The v1.5.0 compact reference look. **Must stay conservative. No row-card redesign.** |
| Apply sound | ✅ | `window.azySoundApply` inserts at the playhead (`placeAudio`), like the SFX Dagger, at the saved `audioGainDb` (−24 to +12 dB). Gain copies are cached in `%APPDATA%\Azy\Dagger Audio\`. |
| Sound-level card | ✅ | **Only** opens when the hold modifier (`window.azyHold`, Shift by default) is held. The level is remembered only on **Confirm**. |
| Apply visual restore | ✅ | After Apply, the restore is visual only (Prompt 11 rule). |
| **Sound folder arranging** | 🟡 v1.22 | Drag folders in the Sounds rail, or `Alt+Up/Down`; `Ctrl+Z` undoes. Saved in `sounds.json` (atomic) and kept across restarts. Pin, unpin and opening are unchanged. |

## Presets

| Feature | Status | Behaviour |
|---|---|---|
| Pinned `.prfpset` folders | ✅ | Indexed and watched by the engine. State is in `%APPDATA%\Azy\presets\` (`pinned-folders.json`, `preset-index.json`). |
| Premiere's own presets | ✅ | Read from the profile's *Effect Presets and Custom Items.prfpset*. Only **starred** ones are shown. |
| Click to apply | ✅ | Applies to the clips selected in Premiere. Presets always target the **newly created effect instance** (v1.15.1) and never alter existing keyframes. Never search effects by name alone. |
| "Apply with speed" hold | ✅ | Holding the configured modifier (`uiSpeedHold`: Shift by default, or Alt, or Off) while clicking a Preset or Flow tile asks for a speed first. |
| **Stable preset identity** | 🟡 v1.21 | `presets/preset-identity.js`: every Presets, Snap and Dagger apply checks **name + bin**, not the `ppro_<src>#N` position. If a preset moved, it is relinked, and favourites and Dagger pins follow it. If the name is ambiguous, or a different preset is now in the slot, the apply is **refused and nothing is applied** (see the messages in [bugs_and_fixes.md](bugs_and_fixes.md)). Callers send `expectName` / `expectBin`. |
| Favourite relink | ✅ | `relinkPremiereFavorites` moves stars back to the intended preset after Premiere reorders its file. |
| Local preset copies | ✅ v1.20 | `presets/local-presets.js` → `presets/local-presets.json`. Copies of favourite and Dagger-pinned presets, **used only when the original is gone**. Writes are async (they never block the main process). |
| Cancel while applying | ✅ | A real cancel with honest result strings (see [ui_ux.md §7](ui_ux.md#7-popups-overlays-and-feedback)). |

## Flow (keyframe easing)

| Feature | Status | Behaviour |
|---|---|---|
| Easing presets | ✅ | Built-in and user easing presets are applied to keyframes in **one undoable transaction**. History is in [`azy/presets/README.md`](../azy/presets/README.md) (v2–v17). |
| Scope: Clip / Playhead | ✅ | Clip = every keyframe of the selected clips. Playhead = only the keyframe pair around the playhead, per property. (In/Out scope was removed in engine v17.6.) |
| **Scope: Selected** | ✅ (faster in v1.20/v1.21 🟡) | The keys highlighted in Effect Controls, found with the **Delete → diff → Ctrl+Z probe** (see [technical_architecture.md §6](technical_architecture.md#6-flow-selected-keyframe-detection-the-probe)). Unsafe or ambiguous results are **blocked**. |
| No Windows "ding" | 🟡 v1.21 | Keys are sent by the native `AzyKeys` helper. No activation if Premiere is already in front. Otherwise there is a verified foreground hand-off before any key is sent. WScript is kept as a fallback. |
| Move Selected Keyframes → Playhead | ✅ (v1.11, fixed v1.11.1) | `Ctrl+Alt+P` (configurable; works with Flow closed). Mode is Start or End. Values, easing and spacing never change. Refuses if a non-selected key is in the way, or if any key would land outside its clip. Rolls back on a host refusal. The UI is a **small pill** in the Flow header (it must stay small). |
| Flow wheel | ✅ | Dagger `Ctrl+Shift + right mouse`. Pinned easing presets at 100% speed, defaulting to Selected keys. |

## Speed

| Feature | Status | Behaviour |
|---|---|---|
| Azy Speed window | ✅ | `Shift+Alt+S`. **Always opens at 100%.** Retimes keyframe animation. Selected speed applies **only to selected keys**. The end calculation is always visible as a two-line hint. Speed calculations must not be changed without a request. |
| Regenerate | ✅ | Speed **minimises on Regenerate** (Prompt 8). |
| Closing | 🟡 v1.21 | `closeSpeedAnimated`: closes instantly with a short fade that never delays the result. |

## Snap Action

| Feature | Status | Behaviour |
|---|---|---|
| Quick-apply window | ✅ | `Shift+Space` (global shortcut, configurable). Searches Premiere effects, presets and transitions, with a star filter. Settings are in `presets/snap-settings.json`. |
| Selection gate | ✅ | *Only when a clip is selected* is on by default. |
| Hide after applying | ✅ | On by default. **Snap closes instantly after apply.** |
| Look | ✅ | 30% translucent glass, glow skin, edge resize (v1.15). |
| Transition placement popup | ✅ | engine v17.11. |

## Dagger (radial wheels)

| Feature | Status | Behaviour |
|---|---|---|
| Wheels | ✅ | Default bindings (`dagger-main.js` `WHEELS`): **Azy** `Ctrl+Right` (up to 7 items), **SFX** `Alt+Right` (8), **Presets** `Shift+Right` (8), **Flow** `Ctrl+Shift+Right` (8). Each can be rebound to any mouse button except left (right, middle, 4, 5) with zero or more modifiers. The exact modifier set must match. |
| Hub = cancel | ✅ | Releasing in the hub (22% dead zone) does nothing. |
| Native helper | ✅ | `assets/dagger-native.exe` handles the mouse hook and cursor. Windows-specific. The wheel window is released after 15 s idle. |
| Pins | ✅ | Stored in `presets/dagger-settings.json` (atomic, with `.bak`). Pins are references (path/id). **Never lose pins.** |
| Pins export/import | ✅ v1.18 | Schema `azy.dagger-pins` v1. Import previews, then **merge** or **replace**. On failure the current pins are kept. |
| Action popups | ✅ / 🟡 v1.21 close | Applying/Applied/level card (`dagger-action.html`, strict CSP). `retire()` = 170 ms exit, then hide. The renderer stays alive 0.7 s for the chime. Errors stay readable. |
| **Sound volume card** | 🟡 v1.22 | Matches the Speed / Snap popups: frosted card, icon tile + title, inset slider (−5 · slider · +5 · value), full-width Apply. Drag the slider, ±5 buttons or `+`/`-`, arrows ±1, Enter, Esc. (v1.21 made it translucent: `palette.css` no longer paints `.dagger-action-body` solid.) |
| Default action | ✅ | Dagger Flow defaults to *Select keyframes*. Cards show the **name only**. |

## Settings and app-level

| Feature | Status | Notes |
|---|---|---|
| Colour themes | ✅ | Built-ins **Dark (`noir`, default)** and **Dark red (`crimson`)**. Custom themes (max 24) come from the editor or **"From a colour…"** (any colour produces a suitable theme, v1.19). See [ui_ux.md §3](ui_ux.md#3-themes-and-colour). |
| Customise dials | ✅ | Glow On/Off, web opacity, web density, corner radius, glass %, animation speed, UI scale. See [ui_ux.md §4](ui_ux.md#4-customise-dials-settings--customise). |
| Performance / motion modes | ✅ | `uiPerf` full, balanced or performance. `uiMotion` system, reduced or full. They tone the look down; they never remove function. |
| UI FPS target | ✅ | 60, 90 or 120 (an upper motion target). |
| Webs / characters | ✅ | The ambient spider web and artwork can be toggled (`uiWebs`, `uiCharacters`). |
| UI sounds | ✅ | Single-instance, quiet (20–30%). Gated by `azy.ui.sounds`. The success chime is `presets/azy-done-sfx.js`. |
| Shortcuts | ✅ | Configurable Snap, Speed, show/hide window and Move-keys shortcuts. **Premiere keys are never captured globally.** |
| Start at login, logs, connector repair, welcome | ✅ | `launchAtLogin`, *open logs* (`presets.log`), module repair, first-run welcome. |
| Always on top | ✅ | On by default (`toggle-always-on-top`). |
| PowerShell key host idle close | ✅ v1.19 | `KEYHOST_IDLE_MS` = 25 min. |

## Requested / planned (not implemented)

| Item | Source | Notes |
|---|---|---|
| Real-Premiere confirmation of the v1.21 and v1.22 items | User | See [bugs_and_fixes.md](bugs_and_fixes.md#awaiting-real-premiere-verification). |

## Ideas (not requested — ask before building)

- 💡 Code-signing the installer, to remove the SmartScreen "unknown publisher" warning (`win.certificateFile`).
- 💡 Upgrading Electron (≥ 40.8.3 fixes native resizing of transparent frameless windows on Windows; Azy uses custom resize handles on 31).
- 💡 A UXP connector if Adobe drops CEP. **Unknown** timeline, and the history shows UXP had real problems (see technical_architecture.md §4).

## Removed / rejected (do not reintroduce)

- v1.6.0 unified Files explorer / row cards (reverted in v1.6.1 at the user's request).
- The "Clean" UI style (removed in v1.16; the Spider glow design is the only one).
- The Glow Strength slider (v1.19, now On/Off).
- Built-in blue/purple/etc. accents as offered choices (v1.17). Old selections were migrated to custom themes.
- The Presets preview panel (removed; tooltips keep the details).
- Corner glows.
- The old 5 s length guess in Media Apply (v1.21).
- Flow In/Out scope (engine v17.6).
