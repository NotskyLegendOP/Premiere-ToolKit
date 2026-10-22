# Azy — Bugs and Fixes

> Verified against v1.21.0 (`230747a`) and the git history (138 commits).
>
> **Verification levels** (a bug is only "Confirmed fixed" with real-Premiere or user confirmation):
> - **CI**: covered by automated suites against simulated Premiere / fake DOM / Chromium on Windows CI.
> - **User-confirmed**: the user reported it working in real Premiere.
> - **Unverified**: shipped, but no real-Premiere confirmation recorded.
>
> Unless a row says otherwise, real-Premiere confirmation is **Unknown**. These docs don't record any explicit user confirmations from past sessions.

---

## Awaiting real-Premiere verification

These are the v1.21.0 and v1.22.0 fixes. They are implemented and pass CI (simulated Premiere), and the **user hasn't verified them in Premiere yet**. Don't mark them fixed until they have.

| # | Problem (as requested) | Fix in v1.21.0 | Tests | What to verify in Premiere |
|---|---|---|---|---|
| 1 | **Media Apply placed media on the wrong track.** Before v1.21 it could disturb or overlap existing content, and it guessed 5 s when the length was unknown. *Exact original symptom wording: Unknown.* | `azy.jsx` `placeMedia`: uses the **lowest V track free for the full length**, and the audio tracks at the same index must also be free. No length guessing (if the length is unknown, the track must be empty after the playhead). Per-file multi-channel `AUDIO_SPAN`. | `test-place-media` (42 checks, simulated Premiere) | Apply onto a timeline with clips on V1/A1 under the playhead. The clip should land on V2 (or the next free track), and nothing existing should move or be overwritten. Also try stereo/5.1 audio. |
| 2 | **Windows "ding" during Flow Selected** (keys sent when Premiere wasn't properly foreground). | The PowerShell key host compiles the native **`AzyKeys`** C# helper (`NATIVE_KEYS_CS`). No activation if Premiere is already in front; otherwise a verified foreground hand-off before any key. Virtual keys, with Delete marked extended. WScript fallback, and the `mode` query reports native or wscript. | `test-keyhost` §8 compiles the helper on the Windows CI runner | Run Flow › Selected with Azy focused and with Premiere focused. There should be no ding, and the right keys should be detected. |
| 3 | Flow Selected detection too slow. | Activation is skipped when Premiere is in front. The post-key wait after Delete/Undo went 220 → **30 ms** (the post-Shift+5 settle keeps 220 ms, and the 400 ms focus settle is kept). | `test-probe-speed`, `test-flow-selected` | Detection is faster and still correct on many keyframes. |
| 4 | Popups held completion while animating. | Dagger `retire()` = 170 ms exit, then hide. `closeSpeedAnimated`. `azy-wait` closes at once on success. | `test-dagger-actions`, others | Popups disappear instantly after success; errors stay readable. |
| 5 | **Audio Level card looked like glass on solid black.** | Root cause: `presets/palette.css` painted `.dagger-action-body` solid. Made it transparent and redesigned the card as glass in `dagger-action.css`. | CI (rendering) | Shift-hold an SFX apply. The card should be translucent over Premiere. |
| 6 | Pinned folders (Files) couldn't be reordered. | Drag (strip + rail) or `Alt+Arrow`, with undo. `presets/pin-order.js`. Atomic `pins.json`. | `test-pin-order` (real Chromium) | Reorder, restart, and the order is kept. *(Sounds: see v1.22 #10.)* |
| 7 | **Wrong preset applied** from favourites, Snap or Dagger pins after presets were added or removed in Premiere. Root cause: Premiere-profile presets were identified by position (`ppro_<src>#N`), and Premiere rewrites that file. | `presets/preset-identity.js` checks **name + bin** on every apply. A moved preset is relinked (pins and favourites follow). Ambiguous names or a different preset in the slot are **refused, and nothing is applied**. | `test-preset-identity` | Star or pin a preset, add or delete presets above it in Premiere's Effects panel, then apply from the Presets, Snap and Dagger surfaces. The exact preset should be applied, or a clear refusal shown. |

### v1.22.0 (committed, not yet released; verified in simulation / Chromium / CI only)

| # | Problem (as requested) | Root cause → fix | Tests | What to verify in Premiere |
|---|---|---|---|---|
| 8 | **Windows error sound during Flow / Speed detection.** | (a) The key host's "wait until Ctrl/Shift/Alt are released" used `Control.ModifierKeys` (= `GetKeyState`, the console thread's own queue), which always reads "released" there — so it **never waited**. A still-held modifier (Dagger Flow gesture, Ctrl+Alt+P, Shift/Alt-click) merged with the injected key, e.g. Alt+Shift+5, which has no menu match → Windows ding. (b) Releasing Alt over Premiere arms its menu bar, so the next key also dings and is eaten. Fix in `presets/flow-selected.js` native `AzyKeys`: `WaitMods` polls the **physical** keyboard (`GetAsyncKeyState`, up to 2.5 s); `CancelMenu` sends `WM_CANCELMODE` only when Premiere reports menu mode (no keystroke). If still held / menu stays open, **nothing is sent** and a clear message is shown (`MODIFIERS_HELD`, `PREMIERE_MENU_OPEN`); the probe stops before any Delete. WScript fallback unchanged. | `test-keyhost` (34), C# compile on Windows CI | Trigger Flow › Selected and Speed detection from the Dagger gesture and with Shift/Alt held briefly: no ding, correct detection. Hold Ctrl for 3 s: a "let go of Ctrl…" message, nothing changed. |
| 9 | **App ↔ extension connection unreliable** (duplicate links, wrong status, failed requests after reconnect). | Connector (`presets/connector/index.js`, now **1.7.0**): the forward loop no longer overwrites an adopted reverse socket (closes the loser); a stale socket's close no longer fails the live socket's requests or flips the status to "searching"; replies go back on the socket the request came from; a superseded session is retired cleanly. Engine: `ReverseDialer` waits while a forward handshake is in flight (`authPending`), so it no longer opens a second link that replaces the first. | `test-connector-link` (17; reproduces the race on the old code), smoke suites | Start Azy then Premiere, and Premiere then Azy: connects once, status "connected". Quit/restart Azy while Premiere stays open: reconnects within a few seconds and Apply works. *Premiere must be restarted once so the 1.7.0 panel loads.* |
| 10 | **Sound folders couldn't be arranged.** | Drag in the Sounds rail or `Alt+Up/Down` (focus kept), `Ctrl+Z` undo. `sounds-reorder-folders` reuses `pin-order.js` (`reorderBy`, unknown/duplicate ids ignored, bad payload = no change, no rescan). `sounds.json` writes are now atomic (tmp + rename). | `test-sound-folder-order` (28; real store + real UI in Chromium, incl. reload) | Reorder, restart Azy: order kept; pin, unpin and open folders still work. |
| 11 | **Volume popup didn't match the Speed / Snap popups.** | `dagger-action.html/.css`: Speed-style frosted card, accent icon tile + bold title, inset slider card (−5 · slider · +5 · value pill), scale −24 / 0 dB / +12, full-width accent Apply, key hint. The read-only meter is now a real slider. `-` now steps −5 like `+` / the button (was −1). Window 300×176 → 312×204. Same ids, keys, IPC and remembered level. Toast and pill unchanged. | `test-dagger-actions` (slider/keys), screenshots in Chromium | Shift-hold an SFX apply on Dark and a coloured theme: readable, translucent, compact; drag, ±5, arrows, Enter, Esc. |

**Repro for #7 (the original bug):**
1. Star preset "B" (or pin it to a Dagger wheel).
2. In Premiere's Effects panel, add or delete a preset that sorts before "B".
3. Apply "B" from Azy.
4. Before v1.21, the preset now sitting at B's old index was applied.

---

## Open / unresolved

| Problem | Status | Notes |
|---|---|---|
| CEP deprecation in future Premiere | **Risk, Unknown** | Adobe is moving to UXP. An older (undated) note in [`presets/README.md`](../azy/presets/README.md) §v18.0 cites reports of CEP panels not loading in Premiere 2026. Current status on the latest Premiere builds: **Needs verification**. |
| Installer is unsigned | Open (by design for now) | SmartScreen shows "unknown publisher". |
| Native resizing of transparent frameless windows on Windows | Upstream limitation | Fixed only in Electron ≥ 40.8.3 (electron/electron#50301). Azy is on 31.7.7 and uses custom resize handles (e.g. Snap edge resize). |
| No API for "selected keyframes" in Premiere | Platform limitation | That's why the Delete → diff → Ctrl+Z probe exists (see technical_architecture.md §6). It depends on focus and timing. Unsafe results are blocked. |
| `ProjectItem.setInPoint/setOutPoint` docs contradict each other (seconds vs ticks) | Mitigated | Auto-Cut calls with seconds, **reads back** `getInPoint/getOutPoint`, retries with a ticks string, otherwise aborts (places the whole clip, restores the marks and explains why). `clearInPoint/clearOutPoint` restore full-range items. |
| macOS | Unknown | Not built or tested. |
| Local-sandbox-only test failures | Dev environment, not product | `test-ui-polish` and `test-compact-motion` fail in Linux sandboxes (fonts/env) even on older code. They pass on Windows CI. |

---

## Fix history (most recent first)

Real-Premiere confirmation is **Unknown** for all of these unless noted. "CI" means it shipped with passing suites.

| Version / commit | Bug | Root cause → fix | Verified by |
|---|---|---|---|
| v1.20.0 `40a3210` | Local preset copies could block the main process | Writes made asynchronous | CI |
| v1.20.0 `e99dacb` | Flow Selected detection slow (874 → 629 ms simulated) | Parallel baselines, focus settle from focus-key landing, `FAST_POLLS [35,60,100]` | CI (`test-probe-speed`) |
| v1.19.0 `c8e5f7c` | Colour audit: hardcoded colours in toasts, connect status, the offline banner, scope notes and waveforms | Moved to tokens | CI (`test-color-theme`) |
| v1.19.0 | `powershell.exe` key host lingered | Exits after 25 min idle (`KEYHOST_IDLE_MS`) | CI (`test-keyhost` §7) |
| v1.18.0 `9f9c780` | Speed showed "1× faster" at 1000%; end calculation not always visible | Calculation fixed; two-line hint always visible | CI |
| v1.18.0 `41d5354` | Test failed on Windows CRLF checkout | Regexes tolerate `\r\n` | CI |
| v1.17.x `211ec2e` | Speed calculation invisible after reopen | Reopen restores the window, guarded resize, sequence-checked non-blanking reads | CI |
| (loadSettings) | Dagger audio level never restored on launch | Restore code sat after an early return (unreachable). Moved. | CI |
| v1.16.0 `ff68c27` | Web toggle glitch; corner glows | Fixed the toggle; corner glows removed | CI |
| v1.15.1 `fe84fa1` | Presets modified an existing effect instance instead of the new one | Always target the **newly created** effect instance | CI |
| v1.15.x | CI ui-stress frame-timing flakiness | Timing checks are advisory; functional checks block (user decision) | CI |
| v1.15.0 | Jank: per-frame repaint on cards, html class churn restyling the grid | Instant card glow, no busy-pause class toggling, ambient web lite on software rendering | CI (`ui-stress`) |
| v1.11.1 `e8e8335` | **Move-to-Playhead deleted keys** | Confused clip-local and sequence time. Corrected, plus rollback on host refusal. | CI |
| `bcf5101` | Colour theme selection didn't apply | The main process rejected every AZY 2.0 palette id. Whitelist fixed. | CI |
| `e324cbc` | Popups and the player didn't follow the theme | Theme validation and applier updated | CI |
| `2e39183` | Artwork missing in the Premiere panel | Sprite and stylesheet added to the panel host's allow-list | CI |
| v1.6.1 `0103e90` | The user rejected the unified-explorer redesign | **Reverted** to the v1.5.0 Files/Sounds UX | User decision |
| v1.3.0 `c63326f`, v1.1.6 `9ca3f09` | Flow "Selected" didn't detect highlighted keyframes | Native detection via the Delete/diff/Undo probe | CI |
| v1.2.0 `9150640` | Flow release glitch; presets targeting the wrong effect | Fixed; presets target the appended effect | CI |
| v1.1.8 `c479cf4` | `sounds-store.js` missing from the packaged asar | Added to `build.files` | CI / build |
| (architecture) | 600–900 MB memory footprint | Only the front workspace window keeps a renderer; the Dagger wheel window is released after 15 s idle | CI (`test-workspace-transition`); `test/mem-probe.js` is a manual tool, not a suite |
| (CI) | Synchronous fs writes in background main-process work broke `snap-smoke` on Windows | Background writes are async. Sync atomic writes only on explicit user action (pins). | CI |

Older changelog detail (v1.1.2–v1.3.0) is in [`azy/README.md`](../azy/README.md). The engine-era fixes (Flow v2–v17.x, e.g. "No keyframes inside In/Out", the stray first keyframe at 0/(0,0), density guarantees) are in [`azy/presets/README.md`](../azy/presets/README.md).

---

## Hazards and lessons (to avoid regressions)

- **Probe:**
  - Never treat a failed inventory read after Delete as "busy".
  - Never send a blind second Delete.
  - The probe uses a **real Delete then Ctrl+Z**.
  - Keep the 400 ms focus settle and the 220 ms post-Shift+5 settle.
- **Key host:** fall back to WScript **only** on `HOST_START_FAILED`.
- **New server (connector) requests** need handlers in both test mocks.
- **`dagger-action-main.js` ready-to-show trap:** guard with `s.closing` inside the handler.
- **Theme id `mono`:** don't use it as a new theme id (it's a legacy alias → `midnight`).
- **Gating:** toggling classes on `<html>` for gating is a dead end (it restyles the whole grid).
- **Name clash:** top-level `const` names collide across renderer scripts. `window.azyMotion` belongs to `renderer.js`.
- **Version bumps:** tests pin version strings, so grep the tests when bumping.
- **`test-assets`** bans stray high-codepoint characters in `index.html` and `renderer.js` (use `\u` escapes).
