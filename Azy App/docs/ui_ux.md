# Azy — UI / UX and Design System

> Verified against v1.21.0 (`230747a`). Motion catalogue: [`azy/docs/MOTION.md`](../azy/docs/MOTION.md) (104 presets in 26 families, not duplicated here).
> **§1 is binding.** Every item there is a user instruction. Don't drop or soften one without the user's explicit say-so.

---

## 1. Design requirements and preferences (binding)

### Structure and layout
- **No redesigns.** Evolve; don't replace. Don't replace working systems for cosmetic reasons, and don't do unnecessary architecture rewrites.
- **Never reintroduce the v1.6.0 row cards or merged/unified Files+Sounds shell.** Keep Files and Sounds **conservative**, with the v1.5.0 compact card look.
- **Themes change colours, never structure.**
- Cards show the **name only**. No unnecessary panels.
- The Move-to-Playhead control stays a **small pill** in the Flow header.
- Files must leave at least 60% of a 470 × 760 window for media. Every section works down to **340 px** wide.

### Colour
- **Default theme = Dark (`noir`): black surfaces, white/grey accent, no colour.** (v1.20. Before that, Dark red was the default from v1.12 to v1.19.)
- **Dark red (`crimson`) stays a built-in option.**
- **No blue or purple in the default theme.** Other accent colours appear **only in user-created custom themes**.
- **No corner glow** anywhere. No excess glow. Glow is **On/Off only**, with no strength or intensity control.
- No hardcoded colours in features. Use tokens (enforced by tests: `azy-foundation.css` bans hex; `azy-skin.css` bans bare hex/rgb outside `var()` fallbacks).
- **Never reset theme choices or delete custom themes** (migrations only add).
- The colour wheel: **any colour** can be picked and produces a suitable, readable theme.

### Motion
- **Animations never delay** clicks, Premiere operations, cancels, results or popup completion.
- UI animations are 120–220 ms. Navigation switches take ≤ 220 ms, and **navigation timing is exempt from the animation-speed dial**.
- **No constant movement.** The ambient web holds still while you actively work (scroll, click, type) and resumes about 1.2 s later.
- Performance modes and reduced motion **tone the look down** without breaking it. Performance mode must stay smooth.
- The Dagger glow is smooth (a prerendered glow wedge, no filters).

### Popups and feedback
- Popups appear **top-right**. Glass, translucent.
- The Dagger and Speed popups are translucent. **Snap is 30% translucent glass.**
- Popups have a **real Cancel**. Never claim a cancel succeeded when it didn't.
- Popups **close instantly** after success, with a 150–200 ms fade that never holds up the result. Errors stay readable.
- **Speed minimises on Regenerate. Snap closes instantly after apply.**
- The sound-level popup opens **only on a Shift hold** (the configured hold modifier).

### Sound
- UI sounds are quiet (20–30%; `azy-ui-sounds.js` default volume 0.25) and **single-instance**, so they never overlap.
- The success/confirmation SFX plays **only after real success**, never on fail or cancel.
- SFX never delay applying.

### Interaction
- Keep drag-and-drop working everywhere it works today.
- Multi-select with **Ctrl/Cmd only**.
- Don't globally capture Premiere's keys. Global shortcuts are only Azy's own configurable ones.
- Never trade accuracy for speed, and no fake loaders.
- Keep the **Dagger concept and redesign** (v1.14) and the original **sigil** in the header.

---

## 2. Visual language: the "Spider" design

- A single skin: **Spider / glow** (`uiSkin` is always `'glow'`; "Clean" was removed in v1.16).
- A very dark layered base with theme-tinted glass. Optional **ambient spider web** (`uiWebs`, with density and opacity dials) and six original **spider-universe artworks** (`uiCharacters`, `presets/azy-artwork.js`).
- Header: an original sigil, the sector crumb, and the Premiere link chip (connection status).
- CSS layers, in load order (the order matters):
  1. `design-tokens.css` (loaded first in every window)
  2. `styles.css`
  3. `presets/azy-foundation.css`
  4. `themes.css`
  5. `azy-skin.css`
  6. feature CSS
  7. `azy-custom.css` (the newest overrides)
  8. `azy-motion.css`

### Design tokens (`azy/design-tokens.css`, the single source of visual truth)

| Group | Values |
|---|---|
| Background ladder | `--azy-bg-0 #060606` app · `-1 #0a0a0a` wells/rails · `-2 #0e0e0e` panels/cards · `-3 #141414` elevated |
| Surfaces (translucency) | card `rgba(14,14,14,.6)` · card-hi `.72` · glass `rgba(14,14,14,.72)` · popup `rgba(10,10,10,.55)` · modal `rgba(6,6,6,.72)` · input `.55` · nav `rgba(10,10,10,.42)` · raise `rgba(255,255,255,.05/.09)` |
| Text | `--azy-text-1 #f1f1f1` · `-2 #bdbdbd` · `-3 #838383` · `-4 #515151` disabled · `-inv #0f0f0f` |
| Radius (× `--azy-round`) | xs 6 · sm 9 · md 12 (cards) · lg 16 (panels/glass) · xl 20 (popups) · 2xl 24 px |
| Motion (× `--azy-speed-k`) | `--azy-dur-1` 120 ms · `-2` 160 ms · `-3` 220 ms · ease `cubic-bezier(.3,.7,.3,1)` · ease-out `(.2,.8,.2,1)` |
| Blur | `--azy-blur` 14 px · strong 18 px (reduced by the quality mode) |
| Fonts | `"Segoe UI Variable Text", "Segoe UI", system-ui` · mono `"Cascadia Mono", "JetBrains Mono", Consolas`. Electron `defaultFontFamily` is set to Segoe UI (this avoids the Times New Roman serif fallback on Windows). |

Accent tokens come from the theme: `--hue-rgb`, `--hue`, `--hue-deep`, `--hue-soft`, plus `--azy-on-accent` (text on an accent fill; dark for `noir`).

---

## 3. Themes and colour

| Theme id | Label | Offered? | Accent |
|---|---|---|---|
| `noir` | **Dark (default)** | ✅ | `#ececf0` (deep `#9d9da6`, soft `#fff`, on-accent `#0a0a0c`). Quieter webs. |
| `crimson` | Dark red | ✅ | `#d6283f` (deep `#a3172c`, soft `#ff8f9c`) |
| `custom:<id>` | user-named | ✅ (max **24**, `uiCustomThemes`) | Made in the Customise editor or with **"From a colour…"** (`themeFromColor(hex)`). The name follows the hue until the user types one. |
| `dark-red`, `deep-purple`, `indigo`, `dark-blue`, `dark-cyan`, `dark-emerald`, `dark-magenta`, `dark-orange`, `graphite`, `midnight`, `obsidian`, `void`, `panels` | — | ❌ `legacy: true` | Kept in `themes.css` only so old settings load. They migrate to a custom theme (v1.17, `themesV2`). |

**Migrations** (`main.js` `loadSettings` / `migrateThemes`) run **once** each and never delete anything:
- `themeFoundation`: the pre-1.12 default.
- `themesV2`: old accents become custom themes.
- `themesV3`: v1.20 `crimson` → `noir` once. Picking Dark red afterwards sticks.

A custom selection whose theme no longer exists falls back to the default. Unreadable `settings.json` is backed up as `settings.json.corrupt-<ts>` before defaults are written.

---

## 4. Customise dials (Settings › Customise)

These are clamped in `main.js` `normalizeCustomise`, so the renderer can't make the UI unreadable.

| Setting | Range / values | Default |
|---|---|---|
| `uiGlow` | On (1) / Off (0). Legacy slider values migrate: 0 → Off, anything else → On | On |
| `uiWebOpacity` | 0 – 2 × | 1 |
| `uiWebDensity` | light / normal / dense | normal |
| `uiRadius` | 0 – 2 × corner roundness | 1 |
| `uiGlass` | 0 – 100 % panel translucency | 30 |
| `uiAnimSpeed` | 0.5 – 2 × (2 = twice as fast). **Doesn't affect nav timing.** | 1 |
| `uiScale` | 0.85 – 1.3 (window zoom factor, so pointer maths stay in sync) | 1 |

Other appearance settings:
- `uiPerf`: full / balanced / performance.
- `uiMotion`: system / reduced / full.
- `uiFps`: 60 / 90 / **120**.
- `uiWebs` and `uiCharacters`: on by default.
- `previewPanel`: on by default.

---

## 5. Layout and windows

- **Main workspace window:** frameless and always on top by default. Default size **470 × 800**, minimum width 340. Dark `#060606` background before first paint (no white flash). Rounded corners. Custom drag regions: the grabber, the pin strip and the status bar. Closes with `Esc` / `Ctrl+W`.
- **One visible Azy window at a time.** Switching sector opens the next window at the **exact bounds** of the current one, with a 180 ms leave and an enter preroll. The old renderer is retired.
- Feature windows: Snap (glass, edge resize), Speed, the Dagger wheel (460 px square, transparent, click-through), the Dagger action/level card (top-right) and the video player.
- **Preview dock:** borrows height *below* the panel instead of squeezing the grid.

## 6. Navigation

Sectors are in `presets/azy-shell.js` `SECTORS`. The tab row has a gliding accent indicator. Keyboard: `←/→/Home/End` move within the tab row (ARIA tabs), and `Ctrl+1…6` jump to a sector.

| Key | Sector | Kind |
|---|---|---|
| `Ctrl+1` | Files | pane |
| `Ctrl+2` | SFX | state (Sounds inside Files) |
| `Ctrl+3` | Presets | pane |
| `Ctrl+4` | Flow | pane |
| `Ctrl+5` | Speed | launches the Speed window |
| `Ctrl+6` | Settings | pane (includes Snap settings) |

Other keys:
- Files: `Alt+Up` (folder up), `Alt+Arrow` on a pin (reorder), `Enter`/`Space` (open / audition), `Ctrl+Shift+P` (preview dock), `Ctrl+Z` / `Ctrl+Shift+Z` (UI undo).
- Global defaults: `Shift+Space` Snap · `Shift+Alt+S` Speed · `Shift+Alt+A` show/hide Azy · `Ctrl+Alt+P` move keys to the playhead.
- The full user keyboard table is in [`azy/README.md` › Keyboard essentials](../azy/README.md).

## 7. Popups, overlays and feedback

- **Processing overlay** (`presets/azy-wait.js`): blocks input while Premiere works. Has a real Cancel. On success it closes at once.
- **Dagger action popups** (`dagger-action.html` with a strict CSP): Applying, Applied, the error card and the **Sound volume** card. Since v1.22 the volume card follows the Speed popup's vocabulary (frosted card with accent hairline, gradient icon tile + 13.5px/750 title, inset slider card, accent-gradient primary; Dark theme's near-white accent gets dark text). Its rules are scoped under `body.dagger-action-body #gain` so the skin's generic popup tint doesn't override them; the toast and pill faces are unchanged.
- **Toasts and the status bar:** a connection indicator (Premiere link chip) and compact status messages.
- **Honest result strings** (keep them exact):
  - "Cancelled — nothing was changed in Premiere"
  - "Stopped — N change(s) already applied (Ctrl+Z to undo)"
  - "Cancelled — nothing was inserted"
  - Preset refusal (ambiguous): "Several presets in Premiere are called “X”, so Azy didn’t guess — nothing was applied…"
  - Preset refusal (moved or removed): "“X” moved or was removed in Premiere’s presets, and Azy never applies a different preset — nothing was applied. Star or pin it again from the Presets list."
  - Old extension: "Auto-Cut / Auto Scale need the updated Premiere extension — restart Premiere Pro once…"

## 8. Motion system

- `presets/azy-motion.css` + `azy-motion.js` (`window.azyLife`; `window.azyMotion` belongs to `renderer.js`).
- `presets/azy-interactions.js`: the 104 presets documented in [`azy/docs/MOTION.md`](../azy/docs/MOTION.md).
- Rules enforced by tests:
  - Every `/* M### */` block must animate (test-motion).
  - Don't delete the `awlPop` / `aw16Pop` keyframes.
  - Use the CSS `scale` property, not `transform`, on centred elements.
- Card motion is grid-safe: instant card glow, no per-frame repaint, hover effects paused while scrolling, and active-state pops only on click.

## 9. Premiere panel UI

The CEP panel (`presets/connector/index.html` + `index.js`) shows a status page and embeds an iframe of **the same Azy UI**. That UI is served by Azy itself over loopback at `http://127.0.0.1:<port>/panel/` by `presets/panel-host.js`, using an allow-listed `STATIC` file set and `presets/panel/panel-shim.js` + `panel.css`. So Presets, Flow and Snap look and behave the same inside Premiere. **The Files tab is hidden in the panel** because it needs OS drag-and-drop. If the bundle fails to boot, the panel shows "Azy runtime failed to start" with a hint to use *Repair* instead of staying blank. Pixel-level parity with the desktop window: **Needs verification**.
