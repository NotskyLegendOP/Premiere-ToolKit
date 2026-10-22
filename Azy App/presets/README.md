# presets/ — Premiere Pro presets inside Azy

| File | What it is |
| --- | --- |
| `presets-main.js` | Main-process side. Lazily boots the engine on first use, registers IPC, keeps favourites relinked. Required by `main.js`. |
| `presets-renderer.js` | The Presets view. Loaded by `index.html` after `renderer.js`; reuses its toast, icons and dock. |
| `presets.css` | Only the additions: the Files/Presets switch, panes, star/count badges. Tokens come from `styles.css`. |
| `ipc-channels.js` | Channel names (main side). The preload repeats the list because it runs sandboxed. |
| `engine.js` | Prebuilt bundle of the preset engine: `.prfpset` parser, folder index + watcher, Premiere-profile reader, loopback bridge server, connector protocol. Source: the `azy-presets` repo (`packages/core`, `packages/shared`); rebuild with `node tools/bundle-engine.js`. |
| `connector/` | The UXP panel that runs inside Premiere Pro 2026. Load it with UXP Developer Tools. |

State lives under `%APPDATA%/Azy/presets/`:
`presets/pinned-folders.json`, `presets/preset-index.json` (rebuildable),
`presets/preset-meta.json` (favourites: id + name/bin fingerprint only),
`presets/premiere-sources.json`, `bridge/` (pairing tokens), `presets.log`.

## Snap Action (Shift+Space)

A quick-apply window for the things that live **inside Premiere**: its native effects and the
presets saved in its Effects panel. Press the hotkey (default `Shift+Space`) anywhere — it is a
system-wide `globalShortcut`, so it works while Azy is minimized or behind Premiere.

The **Snap** tab (third mode tab beside Files and Presets) holds its settings, stored in
`userData/presets/snap-settings.json`:

* **Shortcut** — click the keycap, press a new combination (needs Ctrl/Alt/Shift or an F-key; Esc
  cancels), or reset to Shift+Space. Re-registered live; if another app owns the combination the
  tab says so and the previous hotkey keeps working.
* **Only when a clip is selected** (default on) — the hotkey is ignored unless Premiere reports at
  least one selected clip. Because of this gate the engine now boots ~1.5 s after Azy starts
  (previously only when the Presets tab was opened) so it already knows Premiere's selection.
* **Hide after applying** (default on).
* **Open Snap Action** — opens it regardless of the selection gate. **Refresh from Premiere** —
  re-fetches the effect list.

Layout, top to bottom: header (home · Snap Action · Pr connection dot · refresh · pair · pin · close),
search box, `N items · M favorited` + `All | Video | Audio | ★` filter, grouped rows
(**PRESETS** then **EFFECTS**; each row = icon · name · Preset/Effect tag · Video/Audio tag · ★),
and a footer with the key hints and the live Premiere selection.

| Key | Does |
|---|---|
| type | filters instantly (local index — no IPC per keystroke) |
| ↑ ↓ / PgUp PgDn | move; the active row shows **Apply ↵** |
| Enter / click | apply to the clips selected in Premiere; window hides on success unless pinned |
| Ctrl+D | star / unstar |
| Tab / Shift+Tab | cycle All → Video → Audio → ★ ; Ctrl+F = ★ |
| Ctrl+R | re-fetch the effect list from Premiere |
| Esc | clear the query, then hide |

Files: `snap.html`, `snap.css` (tokens from `styles.css` only), `snap-renderer.js`; window + shortcut
in `presets-main.js` (`initSnapAction`); catalogue/search/favorites/apply in the engine
(`azy-presets/packages/core/src/snap/snap-action.ts`) behind the `azy:presets:snap:*` channels.

Where the data comes from:

* **Effects** — the connector's `listEffects` (`VideoFilterFactory.getMatchNames/getDisplayNames`,
  `AudioFilterFactory.getDisplayNames`; Premiere ≥ 25.6). Fetched when the panel connects, cached
  in `userData/presets/presets/snap-effects-cache.json` so the list is there before Premiere is.
  Motion / Opacity / Time Remapping are hidden (they are on every clip already).
* **Presets** — Premiere's own `Effect Presets and Custom Items.prfpset` (same reader the Presets
  tab uses). Premiere's UXP API has no preset enumeration, so the built-in presets that ship in the
  install folder are not listed — only the ones the user has saved.
* **Favorites** — ids only, in the existing `preset-meta.json`:
  `effect:video:<matchName>`, `effect:audio:<displayName>`, or the preset's `ppro_…#n` id.

Applying: effects go over the new `applyEffect` protocol command (factory `createComponent` /
`createComponentByDisplayName`, default parameters, appended to each selected track item);
presets go through the existing `applyPreset` plan. Both are gated on a live selection check
(`NO_TARGET_CLIP`, `NO_ACTIVE_SEQUENCE`, …) and confirmed with the connector's result.

Known limits: audio effects can only be addressed by **localized display name** (UXP has no match
names for audio), so on a non-English Premiere the cached audio list is per-language; effect
parameters are Premiere's defaults (a .prfpset preset, not Snap Action, is how you keep tuned
values); Shift+Space is skipped with a console warning if another app owns it — the Snap button
still works.

Tests: `node test/snap-smoke.js` (real `presets-main.js` + engine + mock Premiere, renderer in
jsdom; needs `JSDOM_PATH` or jsdom installed, and `npm run build:mock` in azy-presets) plus the
static checks in `test/test-presets.js` §2b.

## Flow (keyframe easing)

A third tab beside Files / Presets. Built-in easings (Ease In, Ease Out, Ease In & Out, Smooth,
Linear, Hold) plus your own saved curves; click one and the keyframes of the clips selected in
Premiere get that easing in a single undoable step ("Azy Flow: <preset>").

**Workflow (Premiere is the source of truth):**
1. In Premiere, select the clip(s) whose keyframes you want to ease.
2. Optionally set sequence In/Out marks around the keyframes (the *In/Out* toggle, on by default,
   limits Flow to keyframes inside those marks; no marks = all keyframes of the selection).
3. Click a preset in Azy's Flow tab. Ctrl+Z in Premiere undoes.

**Files:** `flow-renderer.js` (tab), engine `Flow` in `engine.js`, `applyEasing` in the *same*
connector plugin (`connector/`), storage `userData/presets/presets/flow-presets.json`
(real Premiere parameters only: `first/middle/last` ∈ `linear|bezier|hold` + optional cubic-bezier
`{x1,y1,x2,y2,steps}`), favorites/last-used in the shared `preset-meta.json`.
IPC: `azy:presets:flow:{status,list,get,setFavorite,create,update,delete,duplicate,keyframes,apply}`,
event `azy:presets:evt:flowChange`.

**Verified against Premiere Pro 2026 UXP typings — honest limitations:**
- There is **no API to read which keyframes are selected in Effect Controls**, so Flow targets the
  keyframes of the *selected clips* (optionally windowed by In/Out). Azy shows no fake timeline.
- UXP can set a keyframe's temporal interpolation (`linear`, `bezier`, `hold`, etc.) but **cannot set
  bezier handle influence/velocity**. "Ease In/Out" therefore use Premiere's own bezier defaults;
  custom curves are realised by **sampling extra keyframes** along the curve (`steps` per pair),
  which is real and undoable but adds keyframes rather than shaping handles.
- Only video clip components with existing keyframes are touched; audio clips/clips without
  keyframes produce a "No keyframes selected in Premiere." toast and no undo entry.
- Everything here was tested with the mock connector + `test/flow-smoke.js`; treat the Premiere
  2026 run as the acceptance step (checklist in `docs/`).

### Fix (v2): "This Premiere build can't edit keyframe interpolation via UXP"
Premiere 26.x does not export the `Keyframe` class / `Constants.InterpolationMode` enum object even
though every `ComponentParam` keyframe method (`getKeyframeListAsTickTimes`, `getKeyframePtr`,
`createSetInterpolationAtKeyframeAction`, `createKeyframe`, all 25.6+) exists. The capability probe
wrongly required those objects and disabled Flow on a connected 2026 host. Capabilities now key
off the methods Flow calls; interpolation ids fall back to Premiere's numeric values (linear 0,
hold 4, bezier 5). Regression test: `packages/connector/test/capabilities.test.ts`.
**Reinstall the Premiere panel** (`connector/`) — the fix lives in the plugin bundle.

### Fix (v3): built-ins now produce visible easing
Mode-only "bezier" keyframes keep Premiere's existing (linear) velocity on their handles, so Ease In /
Out / In & Out / Smooth looked identical to Linear. UXP has no handle/influence API, so the four
easing built-ins are now **sampled curves** (8 extra keyframes per keyframe pair, snapped to whole
frames, all keyframes set to Bezier): Ease In = ease-out-quad (decelerate into the last key),
Ease Out = ease-in-quad, Ease In & Out = ease-in-out-cubic, Smooth = CSS ease. Linear and Hold are
still mode-only. Trade-off: the run gains keyframes (visible in Effect Controls); Ctrl+Z removes them.

## Flow inside the Premiere panel (v4)

The Azy Connector panel in Premiere now has the same Flow: Azy's preset tiles (built-in + your custom
curves, favorites ★), the same In/Out toggle and search, applied to the selected clips' keyframes by
the **same `applyEasing`** function Azy's Flow tab calls over the bridge. One plugin, one engine, one
preset list.

```
Azy Flow tab ──(existing bridge)──▶ Azy Connector panel ──▶ Premiere keyframes
      ▲  flowPresets (push) / flowSync (pull) / flowApplied / flowUsed  ▲
      └──────────────── both sides show the same result ────────────────┘
```

- **Preset list** — Azy pushes `flowPresets` on connect and on every change (create/edit/delete/star);
  the panel caches it (`localStorage`) so it still works with Azy closed (falls back to built-ins on
  first ever run). The panel never edits presets — that stays in Azy's curve editor.
- **Apply from Azy** → connector applies → Azy toasts, panel flashes the tile (`flowApplied`).
- **Apply from the panel** → connector applies locally → `flowUsed` → Azy records lastUsed/useCount
  and toasts "*Preset* applied in Premiere → N keyframes".
- **Feedback** in the panel message line for: no clip selected, no keyframes (in the In/Out range),
  no sequence, Premiere-side failure/partial, Azy disconnected ("open Azy to sync your presets").
- Files: `packages/connector/src/flow-panel.ts` (UI), `packages/shared/src/flow.ts`
  (`flowGlyphPath`, `FlowPresetList`), protocol additions in `packages/shared/src/protocol.ts`.
- Tests: `packages/connector/test/flow-panel.test.ts` (5, jsdom), round-trip in
  `packages/core/test/flow.test.ts`, Azy-side `test/flow-smoke.js` §5b.

## v5 — Flow method rebuilt the way the established Premiere easing tools work

Research (Flow by Zack Lovatt/renderTom is **After Effects-only**; the Premiere tools — Easify,
Smoothify, Eaze's default mode — all use the same method because Premiere's API cannot set Bezier
handle values): **bake the curve** — write one keyframe per frame between each pair of the user's
keyframes, values following the cubic-bezier. That is now Azy Flow's method too:

- `curve.steps: 0` = bake every frame (default for Ease In / Ease Out / Ease In & Out / Smooth and
  new custom presets); `2–24` = sparse sampling (still available).
- **Re-apply replaces**: the connector remembers the anchors it baked around (per clip/parameter)
  and removes the old in-betweens before writing the new curve — swap curves freely.
- **Linear** un-bakes (removes the in-betweens, anchors back to linear). **Hold** likewise.
- Anchors keep *linear* interpolation (the curve is in the values); frame grid from the sequence.
- Capped at 600 baked keyframes per pair (10 s @ 60 fps; beyond that every Nth frame).

Panel UI (`connector/`): graph editor (drag the two handles / type cubic-bezier numbers / 8 shape
buttons) on the left, Azy's preset tiles on the right (click = load + apply, Shift+click = load
only), **Apply** and **Linear** buttons, In/Out toggle, search. Curve, In/Out and preset cache
persist across panel reloads.

## v6 — presets apply with their own easing (baked), Flow UI hardening

- **Preset easing is now exact.** Premiere's UXP API has no setter for Bézier handles, so previously a
  preset's eased keyframes were created with Premiere's default handles ("note: custom bezier handles
  are not settable"). The connector now reads the handle/influence values saved in the `.prfpset`
  tuple, builds the segment's value-vs-time curve, and *bakes* it — one linear keyframe per sequence
  frame between each eased pair (`bakePresetEasing` in `executor.ts`, `segmentCurve` in shared
  `flow.ts`). Same method Flow uses, so the motion is identical to dragging the preset in Premiere.
  Anchors of a baked segment stay linear; Hold keyframes and non-numeric params are left untouched.
- Keyframe values are coerced to the param's runtime type before `createKeyframe` (`makeKeyframe`),
  and reads unwrap Premiere 26's `{ value }` keyframe wrapper.
- Result state: informational notes never downgrade SUCCESS to PARTIAL; real warnings are shown with
  their text in the Presets and Snap toasts.
- Flow panel: UXP-safe CSS (flex only, explicit sizes), mouse + pointer drag with document-level
  tracking, plain text inputs for x1/y1/x2/y2.

## v7 — presets apply natively (like Premiere), bake only when needed; Flow robustness

- **Native-first apply.** Keyframes and their interpolation mode (Linear / Bezier / Hold / Ease)
  are re-created exactly as saved — the Effect Controls panel shows the same two keyframes with the
  same handles Premiere itself creates when the preset is dragged on. Per-frame baking now happens
  **only** for segments whose `.prfpset` handles were hand-tuned (`hasCustomHandles`), since UXP
  cannot set handle values. Slopes are interpreted per second and normalised by segment duration.
- Large keyframe batches (Flow bakes, preset bakes) are committed in chunks of 120 actions under
  one undo label; a rejected action is reported, never swallows the apply.
- Flow panel: Apply is only disabled while busy (stale selection cache no longer blocks it), the
  selection is re-read on click / when the mouse enters the panel, a hung apply auto-resets after
  20 s and times out at 30 s with a clear message.

## v8 — preset apply = Premiere's own result; Flow: strength + density, 2-keyframe fix

**Presets (default, "native")** — exactly what Premiere produces when the preset is dragged onto
the clip: the effect is appended, every parameter set, the preset's keyframes re-created at the
retimed positions with their saved interpolation (Linear / Bezier / Hold). No extra keyframes are
ever added. The single thing UXP cannot do is set *custom* Bézier handle values; those keyframes get
Premiere's default handles (a note is reported, result stays SUCCESS). `options.easing: "exact"`
opts a call into per-frame baking of such segments — off by default. This is the same approach the
command-bar tools use (they either drive the UI or set parameters through the API; none can write
handle values either).

**Flow** (baked keyframes, like Smoothify / EasyTimeline):
- *Strength* slider (0–100 %) blends the curve toward linear — dial an ease down without touching
  handles. *Keyframes* slider: bake every 1–6 frames (fewer = easier to hand-edit; Premiere
  interpolates linearly between). Both persist; the graph and dot preview show the effective curve.
  `FlowCurve.every` (1–6) carries the density through the shared protocol; Azy's Flow tab exposes it
  as the "every" field.
- 2-keyframe clips: keyframe values are read through three fallbacks (`getValueAtTime`,
  `getKeyframePtr().value`, `findNearestKeyframe().value`, all unwrapping `{value}`); a pair whose
  value still can't be read is reported ("N keyframe pair(s) skipped…") instead of silently doing
  nothing.
- Apply is only disabled while an apply is running; the selection is re-read on click and on
  hover; hung applies auto-reset (20 s) / time out (30 s); transactions are chunked (120 actions).

## v10 — Azy inside Premiere (Presets / Flow / Snap as a docked panel)

The Azy panel in Premiere now shows **Azy's own interface** — the same Presets, Flow and
Snap tabs, same look, same behaviour — instead of the compact status/Flow panel. The Files
tab stays in the desktop app (it needs OS drag & drop that Premiere's WebView can't do).

How it works (one plugin, one engine, one protocol — nothing duplicated):

* `presets/panel-host.js` — the bridge's loopback HTTP server (the port the connector already
  dials) additionally serves the app UI under `/panel/*`:
  * static: `index.html`, `styles.css`, `renderer.js`, the presets/flow/snap renderers (allow-list only);
  * `POST /panel/rpc` — calls the very same `ipcMain.handle` table the Electron window uses
    (`azy:presets:*`); 
  * `GET /panel/events` — Server-Sent Events carrying the same `azy:presets:evt:*` broadcasts.
  * Every request must carry the paired connector token (`?t=` / `X-Azy-Token`); unpaired → 401.
    Plain HTTP outside `/panel` still gets 426, and only loopback clients are served.
* `presets/panel/panel-shim.js` — injected before `renderer.js` in the served page; recreates
  `window.presets` (and an inert `window.api`) over fetch + EventSource so the unchanged renderer
  scripts run as-is. `presets/panel/panel.css` hides app-only chrome (Files tab, window buttons,
  folder pickers) and shows an "Azy app is not running" strip when the event stream drops
  (EventSource reconnects on its own).
* Connector (`packages/connector/src/azy-view.ts`): once paired + connected, the UXP panel creates a
  `<webview>` pointing at `http://127.0.0.1:<port>/panel/?t=<token>` and hides its native UI; on
  disconnect it shows the native status panel again (pairing code entry, "Looking for Azy…").
  Panel menu: **Reload Azy panel**. Manifest: `requiredPermissions.webview` (loopback domains),
  larger preferred panel size.
* Broadcasts to the panel go through the same `getWindows()` list (`panelHost.targets()`), so
  favourites, selection changes, Flow edits etc. stay in sync between the app window and the panel.

Requirements / limits (honest):
* WebView panels need UXP 9.x, i.e. **Premiere 26.2 or newer** (26.0 still works but keeps the
  compact panel; the connector feature-detects `<webview>`).
* Premiere's WebView has no OS dialogs: "Pin folder" / "Locate presets file" say to do it in the
  Azy app window. The Snap floating window is still owned by the desktop app.
* Verified with the mock Premiere + jsdom (`test/panel-smoke.js`: auth, allow-list, RPC, SSE, page
  boots and applies Flow from the panel). Not yet exercised in a real Premiere 26.2 WebView — first
  thing to check there is that `http://127.0.0.1` loads in the webview (permissions) and the CSS
  renders (the panel uses Chromium-class WebView, not UXP's CSS subset, so the app CSS should apply).

## v11 — Azy as a CEP extension (the blinkl.io way)

`presets/cep/` is a **CEP extension** (`com.azy.panel`, Window → Extensions → Azy) — a thin
Chromium shell that hosts Azy's own interface, so Presets / Flow / Snap in Premiere look and
behave exactly like the app window. Files stays in the desktop app. Works on every Premiere
that still ships CEP (2020 → 2026), no UXP WebView requirement.

* **Discovery:** on boot Azy writes `<userData>/bridge/panel.json` `{ port, token }` (user-only
  0600, deleted on quit). The CEP shell (`panel.js`, Node enabled) reads it, probes
  `http://127.0.0.1:<port>/panel/…`, then loads Azy's UI in a full-size iframe. If Azy isn't running
  it shows "Looking for Azy…" and keeps polling every 3 s; if Azy restarts on another port it reloads.
* **Same engine, same protocol:** the page is served by `panel-host.js` (see v10) — RPC goes to the
  same `ipcMain` handlers, events arrive over SSE, Premiere operations still run through the Azy
  connector. Nothing is duplicated; the CEP panel has no ExtendScript of its own.
* **Install:** `npm run install:cep` (copies to the per-user CEP extensions folder and enables
  `PlayerDebugMode` for the unsigned build; `npm run uninstall:cep` reverses it). For a store/ZXP
  build sign `presets/cep` with ZXPSignCmd. The app also answers `azy:presets:cepDir`.
* UXP connector unchanged (still the Premiere-side worker; its own WebView mode from v10 remains as
  a fallback for hosts without CEP).
* Tested with mock Premiere + jsdom (`test/panel-smoke.js`, 40 checks). Not yet loaded in a real
  Premiere CEP host — first thing to confirm there: `--enable-nodejs` grants `fs` in the panel.

## v13 — Azy platform: the extension is an Azy module

See `presets/ARCHITECTURE.md`. Summary of the migration (incremental, nothing rewritten):

* **Core:** `CommandBus` (`AZY_COMMAND {capability, action, params, target}` → structured result,
  target gating) and `ModuleManager` + `premiere-module.ts` (host-aware detection, auto
  install/update of the CEP surface, UPIA-based UXP install when available, one `AzyStatus`).
  New IPC: `azyStatus`, `azyCommand`, `moduleRepair`, `moduleRefresh`; event `azyStatus`.
* **UXP plugin → "Azy Runtime":** its own Flow UI (`flow-panel.ts`) and pairing form are gone; it
  shows one status line, links with Azy automatically ("auto" code while Azy's panel is open in
  Premiere), keeps a hidden "Advanced: link with a code" fallback. Version 1.0.0.
* **Desktop:** all "connector / pairing code" wording replaced by the module manager's summary
  (`presets/azy-status.js` shared by Presets/Flow/Snap); Snap pane got an "Azy in Premiere Pro"
  card with Check/Fix; footer click explains or repairs instead of printing codes.
* **Install experience:** install Azy → Azy installs its Premiere panel by itself; `install.js` and
  the `install:cep` scripts were removed (Azy does it). Set `AZY_NO_MODULE_INSTALL=1` to disable
  (used by tests).
* Tests: `packages/core/test/azy-platform.test.ts` (bus + module manager, 8), `test/platform-smoke.js`
  (real engine + mock Premiere through the bus, 13). All previous suites unchanged and green.
* Honest limits: UXP plugins cannot be installed by copying files — Adobe's UPIA/.ccx or the UXP
  Developer Tool is required; Azy detects the installer and otherwise shows exactly one manual step.
  The `.ccx` packaging step (zip of `presets/connector` renamed `.ccx`) is not yet in the build.

## v14 — one Azy in Premiere; Flow diagnostics

* **One extension.** The UXP plugin *is* the Azy panel: `Window › UXP Plugins › Azy` shows Azy's own
  Presets / Flow / Snap UI (WebView, Premiere 26.2+). The CEP extension is no longer installed on
  26.2+; Azy only installs it as a legacy surface on 25.6–26.1 (no WebView there). The module card
  and every hint now point to the single place: Window › UXP Plugins › Azy.
* **Flow "not working" on a clip that clearly has keyframes** (Position, 2 keyframes): on 26.x the
  "synchronous" `isTimeVarying()` / `getKeyframeListAsTickTimes()` return Promises inside
  `lockedAccess`, so the scan saw `false` / `[]` and reported NO_KEYFRAMES. The runtime now collects
  raw results under the lock and awaits them outside; the keyframe list is the ground truth (the
  time-varying flag is only a hint). NO_KEYFRAMES now carries a diagnostic message (which clips,
  how many parameters scanned / keyframed, In/Out window in effect) and Flow shows that message
  verbatim instead of the generic "No keyframes selected".
* Applying presets from inside Premiere: works through the same panel (select clip → click preset);
  see the answer text for what the UXP API allows.

## v15 — Azy Keyframe Engine: the dozens-of-keyframes method, optimized, + Adjust Speed

**Method (unchanged on purpose).** Presets and Flow both write a keyframe on *every sequence frame*
between the animation's anchor keyframes, with values following the segment's curve — exactly the
frame placement of the original `sampleCurve()` (first in-between on the next frame boundary after A,
one per frame strictly before B). Density is never thinned for performance: the only keyframes ever
dropped are in-betweens whose neighbours on both sides hold the *identical* value (a flat stretch —
removing them has no visual effect). Hold keyframes are never baked through.

**What was optimized is the processing, not the animation**
(`azy-presets/packages/shared/src/keyframe-engine.ts`, one engine for Presets, Flow, the mock host
and the tests):

| Stage | Before | Now |
|---|---|---|
| Curve solve | Newton+bisection from scratch per keyframe | Warm-started sampler (x is monotonic per segment → 1–2 iterations); on-grid segments share a cached y-table per curve × frame count, so the same curve on 10 clips / 10 segments solves once |
| Generation | interleaved with host calls | Whole sequence pre-computed up front, ordered, deduped, values converted to host objects once |
| Insertion | 120–250 per transaction, no breathing room | 400 per transaction (one undo label → single Ctrl+Z), `runBatches()` yields to the host between transactions so Premiere's UI and the Azy panel stay responsive; a rejected batch is retried in halves so one bad action never sinks 400 keyframes |
| Ceiling | 600 per pair (thinned above) | 20 000 per segment (≈5.5 min @ 60 fps) — every frame below it |
| Speed | — | applied to anchor timing *before* generation, so 200 % simply produces the same motion over half the frames |

Engine cost is ~2 ms per 10 000 keyframes; the remaining time is Premiere's own transaction work.
Presets: `options.easing` defaults to `"exact"` (baked); `"native"` still opts out for scripts.

**Adjust Speed** — one control (`presets/azy-speed.js`) mounted in both toolbars, identical in the
app and inside the Premiere panel; nothing else in the Flow interface moved.

    Speed   −  ────────●────────  +   100%

- 100 % = as designed, 50 % = half speed (twice as long), 200 % = twice as fast (half as long); 10–1000 %.
- Drag (log scale: 100 % dead-centre, 50 %/200 % symmetric) · − / + and scroll step through 10 · 25 · 50 · 75 · 100 · 125 · 150 · 200 · 300 … · arrow keys do the same.
- Click the value to type (`150`, `150%`, `1.5x`), Enter/Esc; double-click the value or slider for 100 %; a small ↺ appears whenever it is not at 100 %.
- Remembered per tab; greyed out while an apply is running.
- Travels as `options.speed` (presets) / `speed` (Flow, also on `AZY_COMMAND flow.apply`); the runtime rescales keyframe timing around the first keyframe — values/motion untouched.

**Smoother apply UX.** Click → card enters an *applying* shimmer immediately (Azy never blocks; the
IPC is async with a 120 s budget); re-clicks are ignored while in flight; after 2.5 s a quiet
"Premiere is writing keyframes" hint; on return the card flashes *done* (or shakes on failure) and
the toast says what happened, including the speed used. Reduced-motion is respected.

Verified: 97 engine/runtime unit tests (`npx vitest run` in azy-presets — original frame placement,
off-grid anchors, 1-frame/same-frame anchors, very long segments, 10×/0.1× speed, holds, cache ==
fresh solve, batch isolation) and all Azy suites (`node test/run.js`, incl. end-to-end speed 200 %
through the module bus). Not yet exercised inside a real Premiere 2026 session.

## v16 — UXP only again · Azy Speed Engine (first + last keyframe → Flow regenerates) · wait overlay

**Premiere connection: UXP only, like before.** The CEP extension is gone (`presets/cep/` removed,
no `cepDir` channel, not packaged). Azy in Premiere = the single UXP plugin (`presets/connector/`),
paired to the app over the local authenticated bridge exactly as before. The module manager now lists
only the runtime part; a CEP "Azy" left over from an older install is retired automatically.

**Method: the original dozens-of-keyframes approach, tuned for quality.** Nothing was replaced by an
interpolation scheme. The shared engine writes one keyframe on every sequence frame between the
animation's anchors (same placement as the original `sampleCurve`), values from the exact cubic-bezier
solve; ceiling 20 000 per segment; the only keyframes ever dropped are in-betweens that are identical to
both neighbours. Batches of 400 per transaction, one undo label, yields between transactions so Azy and
Premiere stay responsive. Processing may take longer on long clips — that is intended and shown.

**Azy Speed Engine — one rule everywhere.** For every speed change (Presets at ≠100 %, Flow at ≠100 %,
the Speed window, the shortcut):

    first keyframe (value kept)  →  Flow  →  regenerate every in-between at the new duration  →  last keyframe (value kept)

Implemented as `ApplyEasingRequest.boundaries: "outer"` in the runtime (`connector/src/premiere/flow.ts`):
the run's first and last keyframes are the boundaries, everything between them is cleared and regenerated
by the Flow curve through the engine; keyframes outside the run (or outside In/Out) are untouched. No
timestamp stretching. At exactly 100 % with `boundaries` unset, Flow keeps intermediate anchors as before.

**Azy Speed window (`presets/speed.html`, shortcut `Shift+Alt+S`, changeable in the Snap tab).** Global
hotkey, gated on ≥1 selected clip (toggle in settings), opens a 380×300 always-on-top window: reads the
selected clips' keyframes (In/Out respected), reports "First → last keyframe · Position, Scale · N
keyframes" or exactly what is missing (no selection / one keyframe / none inside In/Out), a large
`150 %` readout with a plain-language hint ("Faster · 4.00 s → 2.67 s"), the same slider as the tabs,
Reset to 100 %, Apply (Enter), Esc closes, hides on blur unless applying. Flow used = the last-used curve
preset, else Smooth. Shortcut recorder shares Snap's rules (needs a modifier). `Shift+Alt+S` is not a
default Premiere shortcut.

**Wait overlay (`presets/azy-wait.js`).** Shown in the tab/window during any apply: three-ring orbit,
title "Generating Smooth Animation", live stage text from the runtime's `operationProgress` events
(Preparing → Calculating Flow → Generating keyframes → Applying → Finalizing), five stage dots, and a
progress bar **only when the runtime reports real done/total** (keyframe writes) — otherwise
indeterminate. Minimum 420 ms on screen, done/fail end states, reduced-motion respected. Azy never blocks:
the IPC is async; re-clicks are ignored while running.

**Speed control** unchanged from v15 (shared `azy-speed.js`; slider, − / +, scroll, type a value,
double-click/↺ reset), now also embedded in the Speed window.

Verified: 98 unit tests (`npx vitest run`) incl. a new Speed-Engine test on the mock host (200 %: first
keyframe untouched, last lands at half the span with its value, middle original gone, dense in-betweens,
re-apply doesn't stack) and all Azy suites (`node test/run.js`). Not yet exercised inside a real
Premiere 2026 session.

## v17 — link code dialog is back · Cancel while applying

**Pairing (the pin system) is visible again, like before.**
- Azy: the status pill / "Premiere is running but not linked" state opens a small **Link Premiere** dialog
  (`presets/azy-pair.js`) showing the 6‑digit code, a countdown and "New code". It closes itself as soon
  as Premiere links. Auto-link (the panel finding Azy by itself) still works — the code is only the fallback.
- Premiere panel: the code field is shown directly ("Enter the link code shown in the Azy app") instead
  of being hidden behind an *Advanced* toggle. *Reset link* lives under Advanced.

**Cancel during apply.**
- The wait overlay gets a **Cancel** button (Presets, Flow, Speed window). It sends
  `cancelOperation(operationId)` to the Premiere runtime; the connector stops between keyframe batches
  and answers `state: "CANCELLED"` with the number of keyframes already written. The toast says so and
  reminds that **Ctrl+Z in Premiere** reverts them (there is no partial rollback API; documented, not faked).
- New IPC: `azy:presets:cancelOperation`; `flowApply(id, scope, speed, boundaries, operationId)` and
  `applyPreset(id, target, { speed, operationId })` accept the renderer's operation id so Cancel targets the
  right run.

Tests: `test/flow-smoke.js` 5c covers the dialog code and Cancel against the mock; `npx vitest run` in
azy-presets (98). Not yet exercised in a real Premiere 2026 session.

## v17.1 — "No keyframes inside In/Out" fix · everything is blocked while Premiere works

- **Flow / Speed said "No keyframes inside In/Out"** although the clip had dozens of Scale keyframes
  (screenshot, Premiere 2026). Root cause: the sequence In/Out window, translated into clip time, didn't
  contain them. The connector now falls back: keyframes exist on the selection but none inside In/Out →
  it uses all keyframes on the selected clip(s) and adds a warning to the result ("no keyframes inside the
  sequence In/Out — applied to all keyframes…"). The mock follows the same rule.
- **Nobody touches anything until the job is done.** The runtime now emits `operationState`
  (`started | finished | cancelled | failed`, with `kind` flow/speed/preset) for every apply. Every Azy
  surface that did not start the job mirrors it: the main window, the Snap and Speed pop-ups and the Azy
  panel inside Premiere show a full-window overlay with the operation name, real stages and a **Cancel**
  button (the native UXP panel shows its own veil `#busy`). The originating window's own overlay now
  covers its whole window too. Cancel from any surface stops the connector between keyframe batches;
  what was written stays undoable with Ctrl+Z.
- Premiere itself can't be locked by an extension (no UXP API for that); the panel and every Azy window
  are, and the overlay text asks not to change the selection until it finishes.

Tests: `test/flow-smoke.js` 5d (mirror overlay in a second window + panel receives started→finished).

## v17.2 — Flow not baking in-betweens · density guarantee (≤ 10 s gaps = every frame)

- **Symptom** (screenshot): "Ease In → 1 property, 2 keyframes" — the interpolation modes were set but
  no keyframes were baked between the two Position keyframes. Baking is skipped when a keyframe value
  can't be read as a number/point. On 26.x Position has been seen to come back in shapes the reader
  didn't recognise (PointF with getters / numeric strings / `[x, y]` / `"x, y"` / nested `{value}`).
  `coerceKeyValue` now handles all of them (unit-tested), and when nothing can be baked the result is
  no longer a green "SUCCESS" — it is PARTIAL/FAILED with the exact reason (value shape not recognised,
  same value on both keyframes, only one keyframe, closer than one frame) and the raw shape is logged.
- **Density guarantee** (Speed Engine): any gap between two anchors up to **10 s** gets a keyframe on
  **every frame**, at any speed and frame rate — the per-segment safety ceiling can no longer thin it.
  Longer gaps still bake per frame up to the ceiling (≥ 10 s worth of frames, whatever the ceiling).
  Slowing a preset therefore regenerates the full-density curve over the longer duration.

## v17.3 — stray first keyframe at 0 / (0,0)

A keyframe appeared at the very start of the clip with value (0,0) after a Flow apply. Two ways that
can happen on 26.x and both are now closed:
- a `{x,y}` literal (or a PointF whose numbers didn't stick) handed to `createKeyframe` → value (0,0).
  Points are now always real `PointF`s and the created object is verified to carry the requested numbers
  (constructor → `create()` → property assignment fallbacks);
- `kf.position = TickTime` not sticking → keyframe added at tick 0. Every keyframe is now created via
  `makeKeyframeAt`, which reads the position/value back and refuses (reported as a rejected action)
  instead of writing a wrong keyframe. In-betweens are also hard-clamped to strictly between the first
  and last anchor; moved anchors (speed) are verified before the original is removed.
Tests: `packages/connector/test/flow-apply.test.ts` (Position bake: no keyframe at 0, no (0,0), grid, monotonic; 50 % speed).

## v17.4 — Scope: Clip · In/Out · Playhead (Flow and Speed)

Flow and Speed now work on a chosen range of keyframes, the same range control in the Flow tab, the
Speed window and Azy inside Premiere (`presets/azy-scope.js`, persisted, kept in sync across windows):
- **Clip** — every keyframe of the selected clip(s) (default).
- **In/Out** — only keyframes inside the sequence In/Out marks (falls back to the whole clip when none
  are set, with a warning).
- **Playhead** — only the **keyframe pair the playhead sits in**, per property. Park the playhead
  between the two keyframes you want to ease/retime and click a preset. Anchors are told apart from
  Azy's own baked in-betweens (anchor memory / density rule), so re-applying replaces just that segment.
  Playhead outside the keyframes → clear message, nothing written. Speed at the playhead only retimes
  a segment when no keyframes follow it on that property (otherwise it would run into them); it says so.
- **Property**: the runtime already accepts `scope.properties` (e.g. `["Position"]`); the UI keeps to
  Premiere's own scoping — UXP exposes **no selected-keyframes / selected-property API**, so Azy does not
  fake a keyframe picker. Selecting keyframes in Effect Controls therefore has no effect on Azy; use
  the playhead or In/Out instead (documented, not invented).
Tests: connector `flow-apply.test.ts` (playhead segment, out-of-range), `flow-smoke.js` (scope control +
playhead re-bake leaves the other segment byte-for-byte untouched).


## v17.5 — Speed keeps the ease

Changing speed no longer re-shapes the animation. The Speed window (global shortcut) now applies
the built-in **Keep ease** mode (`flow:builtin:keep`):

- Before clearing the in-betweens, the runtime **measures the ease already on the keyframes**
  (normalised progress vs. time, per first→last pair; points are projected on the first→last line).
- The Speed Engine re-bakes that exact profile at the new duration (max density, first + last keyframe
  are the boundaries) — nothing is swapped for Smooth or the last-used Flow preset.
- If a property only had two plain linear keyframes there is no ease to keep; it is retimed linearly
  and the result reports "N parameter(s) had no ease to keep".
- The Flow tab is unchanged: clicking a preset there still applies **that** preset's curve, with the
  speed slider retiming it. Keep ease is hidden from the preset grid (it is not a shape).

## v17.6 — Speed overlay in Flow · speed asked per preset · In/Out removed

- **Flow speed overlay** (Smoothify-style): while the Flow speed slider is dragged / scrolled / stepped,
  a big live read-out ("251 % · 2.51× faster · 40 % of the duration") floats over the grid and fades
  ~0.9 s after the last change. Nothing else in the Flow interface moved.
- **Presets tab: no speed slider any more.** Clicking a preset opens a small Azy speed card first
  (big value, slider, ± / scroll / type, `Enter` = apply, `Esc` / backdrop = cancel; the last value is
  remembered). Cancelling touches nothing in Premiere. The Apply button reads "Apply at 150 %" when
  not at 100 %.
- **In/Out is gone everywhere.** Flow scope is now *Clip* or *Playhead* only (`FlowScope.range:
  "all" | "playhead"`); the runtime ignores sequence In/Out marks completely, so a forgotten In/Out
  can no longer shrink or hide the keyframes. `FlowKeyframesResult.range` is kept for wire
  compatibility and is always `null`.

## v17.7 — Shift for speed · velocity indicator on the graph

- **No speed sliders anywhere** (Presets and Flow toolbars). A plain click applies the preset / Flow
  ease **directly at 100 %**. **Shift + click** opens the small Azy speed card first; it *always*
  opens at 100 % — no value is ever remembered — Enter applies, Esc/Cancel aborts before Premiere is
  touched. The global Speed window (shortcut) is unchanged and still keeps the ease.
- **Velocity indicator** in the Flow curve editor (Smoothify-style): a dashed curve over the graph
  shows the speed of the motion (dy/dt of the ease) — peaking where the value changes fastest, flat for
  linear — with the peak multiplier labelled. A `velocity` checkbox next to the numbers hides it.
  Read-only: it never changes what is applied.
- The earlier numeric "speed value overlay" from v17.6 was removed (misread request).

## v17.8 — ≥ 60 keyframes per second

- The Azy keyframe engine now bakes on a grid of **at least 59.5 keyframes per second**, whatever the
  sequence frame rate: the frame is subdivided evenly when needed — 23.976/24 fps → 3 per frame
  (≈ 72/s), 25 → 75/s, 29.97/30 → 2 per frame (60/s), 50 → 100/s, 59.94/60 → one per frame.
  Premiere stores keyframe times in ticks, so sub-frame keyframes are valid, undoable and render.
- **Density guarantee window is 9 s**: any gap between two anchors up to 9 s is always on the full
  grid, at any speed; only longer gaps are subject to the 20 000-per-segment safety ceiling.
- Applies to Presets, Flow, Keep-ease speed changes and the Speed window alike (one engine).
  `bakeGridTicks(frameTicks)` / `ENGINE_MIN_RATE` / `ENGINE_DENSE_MAX_SECONDS = 9` in
  `packages/shared/src/keyframe-engine.ts`; Azy's own baked in-betweens are still recognised as such
  (anything closer than 1.5 frames), so re-applying replaces instead of stacking.

## v17.9 — speed previews · newest-first files · drag fixes

- **Flow tiles preview the speed**, not the value: each card's glyph is the velocity of the ease over
  time (flat = linear/constant speed, hump = Smooth, ramp up = Ease In, ramp down = Ease Out, zero =
  Hold). The editor graph still shows the value curve with the velocity overlay.
- **Files: newest first.** `list-directory` now stats each entry and sorts files by modified time
  descending (folders stay on top, alphabetical). A file you just exported appears at the top.
- **Fixed: dragging out of Azy duplicated the file** when the drag ended back over the Azy window
  (Explorer-drop import kicked in and copied it as "name (2)"). The main process now remembers the
  paths of the current outgoing drag and `import-dropped-items` skips them, plus anything already
  living in the open folder; the renderer also ignores a drop whose paths equal its own drag.
  `skipped` is reported ("That file is already in this folder").
- **Drag image = Azy tile.** Dragging any file out of Azy shows a dark rounded tile with the Azy mark
  (`assets/drag-tile.png`) — no file-type icon, no name, no path — like dragging from a Premiere panel.

## v17.10 — My presets first · bigger previews · smaller drag tile · transitions in Snap

- Flow grid: **My presets** section now sits above **Built-in**; tile glyphs are 44 px (was 30).
- Drag image while dragging a file out of Azy is a 56 px tile (was 96 px).
- **Snap Action now includes Premiere's video transitions.** Source: UXP `TransitionFactory.
  getVideoTransitionMatchNames()` (≥ 25.6), synced with the effects and cached to disk. Applying one
  (`applyTransition` command) uses `TransitionFactory.createVideoTransition(matchName)` +
  `AddTransitionOptions` (1 s, single-sided) and `createAddVideoTransitionAction` on **both edges** of
  each selected video clip, in one undoable transaction ("Azy Snap: Cross Dissolve"). Audio clips are
  skipped; a capability `addTransitions` gates it and the UI shows "This Premiere build can't add
  transitions" otherwise. Rows show a *Transition* tag; order when browsing: Presets · Transitions ·
  Effects. Favorites work (ids `transition:video:<matchName>`). Audio transitions: not exposed by UXP.

## v17.11 — Transition placement + show/hide Azy shortcut

**Snap Action → transitions now have a placement.** While a transition row is highlighted a small
chooser appears above the list — **Start / End / Both / Between clips** (also `Alt+1…4`). The choice
is remembered.

- **Start** / **End** — that edge of every selected clip. If another clip touches that edge, Premiere
  gets a normal double-sided transition centred on the cut; if nothing is there it is single-sided
  (same as Alt-dragging a transition in Premiere).
- **Both** — both edges (the previous behaviour, still the default).
- **Between clips** — only on cuts where a neighbouring clip actually touches the selected clip,
  centred on the cut. Clips with no adjoining clip are skipped with a warning; if none of the
  selected clips touches another, the apply is refused with a clear message instead of doing
  something else.

Neighbours are detected on the same video track by exact start/end tick match. Audio clips are
still not transition targets (no UXP audio transition API).

Plumbing: `snapApply(id, target, { edges })` → `rt.snap.apply(id, target, opId, { edges })` →
`ApplyTransitionRequest.edges: "start" | "end" | "both" | "cuts"`; the module runtime scans the
tracks once per apply and sets `forceSingleSided` per edge. `AZY_COMMAND snap.apply` accepts
`options.edges` too. Mock connector reproduces the neighbour logic (`doubleSided` on each entry).

**Show / hide Azy shortcut** (Settings → Snap Action, default `Shift+Alt+A`, rebindable, stored in
`userData/presets/window-settings.json`). Global: if Azy is in front it minimises; if it is
minimised, hidden or just behind Premiere it is restored and brought to the front. IPC
`azy:presets:windowToggle / windowGetSettings / windowSetSettings`, event `windowSettings`.

Tests: core vitest 112 (new placement test), `test/snap-smoke.js` covers the chooser, all three
placements against the mock's adjoining clips, and the window shortcut (minimise → restore →
raise, rebinding, persistence).

### v17.11.1 — placement moved into a popup
The Start / End / Both / Between-clips chooser is no longer in the Snap Action list. Applying a
transition (Enter / Apply) now opens a small popup asking where it should go; pick with a click,
↑↓ + Enter, or keys 1–4; Esc / Cancel / clicking outside applies nothing. The last choice is
preselected next time. Effects and presets still apply directly.

### v17.11.2 — fix: placement popup never appeared
The popup markup sat *below* the `<script>` tags in snap.html, so when snap-renderer.js ran the
element did not exist yet and the code silently fell back to "both". Moved the markup above the
scripts; the fallback now shows a toast; the smoke test runs the renderer against only the DOM that
precedes the scripts (as Electron does), so this class of bug is caught.

## v18.0 — Finalization pass (smoothness · fps target · installer · first run · connection UI)

### Smoothness / performance (measured, not guessed)
A new real-Chromium stress suite (`test/ui-stress.js`: 400-file grid, tab flicking, typing,
hover sweeps, scrolling, fps switching, 12 rounds with heap sampling) drove the changes:

| | before | after |
|---|---|---|
| frames rendered during the run | 598 in 15.7 s | 676 in 11.5 s |
| p95 frame time | 50 ms | 16.8 ms |
| long frames (> 2.5× budget) | 49 / 597 | 1 / 675 |
| heap drift over 6 rounds | 0 MB | 0 MB |

Root causes fixed at the source:
* Aurora blobs no longer use `filter: blur(58px)` (a 62vw blurred, drifting layer under every
  glass surface was the largest per-frame cost); the softness now comes from the gradient. The
  drift pauses while Azy is behind another window or while a grid is being scrolled.
* Chips lost their per-element `backdrop-filter` (a dozen blur passes per strip).
* File/preset/Flow cards: `contain: layout paint style` + `content-visibility: auto`, so a
  400-file folder lays out and paints like a 40-file one; only the first screenful plays the
  entrance animation; the skeleton shimmer runs only on tiles in view.
* Grid built in a `DocumentFragment` (one layout instead of N); search coalesced to one
  render per frame; each loaded Files image/video keeps one 240 px canonical source/element for
  the active Files session, then releases it only on Files-sector exit or native minimise.
* Pin-strip glide is time-based (identical feel at 60/90/120 Hz).
* Main process: `enable-gpu-rasterization` / `enable-zero-copy`; single-instance lock (a
  second launch focuses the existing window instead of fighting over the bridge port).

### 120 FPS UI + selector
Settings › Snap › **Animation: 60 / 90 / 120** (default 120). Sets `data-fps` on `<html>` —
CSS motion tokens (`--t-fast/--t-med`) adapt, and `azyMotion.frame()` throttles JS-driven
motion to the target. Only Azy's own interface; Premiere/sequence fps untouched. Persisted in
`settings.json` (`uiFps`).

### Animations / states
Pane switch (transform+opacity, restartable), button `:focus-visible` rings, `:active`
press, `.is-loading` ring / `.is-done` pop / `.is-error` shake via `azyMotion.flash/loading`,
disabled state, skeleton tiles while a slow folder lists (only after 120 ms so quick opens
never flash), status dot with real state transitions. Everything stays greyscale/token-only.

### Connection indicator (status bar)
`presets/azy-connection.js`: Connecting… · Connected · Reconnecting… · Waiting for Premiere ·
Premiere unavailable · Premiere version unsupported · module needs attention (click → repair).
"Connected" appears only after the engine handshake (hello → token check → identity → ping
heartbeat every 5 s); after 45 s of "Connecting…" it says plainly that the panel isn't linked
yet and how to open it. The Premiere-side client now caps its reconnect back-off at 10 s (was
30 s) so an Azy restart is picked up within seconds.

### First run
`presets/azy-welcome.js`: one card — Azy installation · Premiere Pro (detected + version) ·
Azy in Premiere Pro · Connection — using the real module manager/connector state, then
"Everything is ready." A **Fix it** button appears only when repair can actually help. Shown
once (`welcomed` flag), never inside the Premiere panel.

### Installer / packaging
* `tools/pack-ccx.js` (part of `bundle:azy`) builds `presets/azy-premiere-runtime.ccx` — the
  UXP package Adobe's Unified Plugin Installer Agent installs silently. It is unpacked from
  the asar so both the installer and Azy's own repair can hand it to UPIA.
* `build-res/installer.nsh` (NSIS hooks): install registers the Premiere module through UPIA
  when present and logs the result to `%APPDATA%\Azy\install.log`; uninstall removes the
  module via UPIA, the start-with-Windows entry and the bridge/link tokens. Presets and
  favourites are kept. Azy re-verifies on launch, so a machine without UPIA is guided (single
  double-click step) rather than told "success".
* **Launch Azy with Windows** toggle (`app.setLoginItemSettings`), **Diagnostics › Open log**
  (reveals `presets.log` in userData). No ports/tokens/paths anywhere in the UI.

### Honest limits (unchanged by this pass)
Adobe does not let an external app open a UXP panel; Azy prepares everything and the panel
links itself the moment it is opened (Window › UXP Plugins › Azy) — or auto-links if it was
left open, since Premiere restores panels. Installing the UXP runtime needs Adobe's UPIA.

### v18.0 — CEP decision + built installer
**CEP vs UXP (task 48):** kept UXP. Checked against Adobe's own statements: as of Premiere
25.6 CEP is superseded, supported only ~one calendar year after UXP shipped, and Premiere 2026
users already report CEP panels no longer loading. More to the point, CEP does not solve the
problem: a CEP panel can be `AutoVisible`/`StartOn` inside Premiere, but no external app can
open a CEP panel either — the same "open it once, it links and stays linked" flow applies.
Switching would trade a live platform for a dying one for zero UX gain, so no.

**Installer:** `dist/install.exe` now builds from Linux too (electron-builder + wine for the
icon/version stamp). 78 MB one-click NSIS, per-user, no admin: Electron app + Azy Core +
bridge + UXP runtime (`.ccx`, unpacked) + `installer.nsh` hooks (UPIA install/remove,
start-up entry + link-token cleanup, `%APPDATA%\Azy\install.log`). Desktop + Start-menu
shortcut, runs Azy when done. Unsigned (SmartScreen will show "unknown publisher" until a
code-signing certificate is added: `win.certificateFile` / `certificateSubjectName`).
