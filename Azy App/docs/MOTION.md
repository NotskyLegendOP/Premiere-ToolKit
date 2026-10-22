# Azy interaction motion — v1.1.5

104 new named presets, generated from 26 real component families and four event phases. They are small interaction variations, not 104 standalone cinematic sequences. `azy-interactions.js` is loaded by the desktop/embedded panel, player, Snap, Speed and Dagger action surfaces. Dagger wheel geometry/native hit-testing is not animated by this controller.

## Inventory

Every row supplies `azy-<family>-enter`, `-leave`, `-press` and `-focus`.

| Family | Production selectors | Durations (enter / leave / press / focus), ms |
| --- | --- | --- |
| workspace | `.mode-tab` | 150 / 120 / 100 / 180 |
| file-row | `#fileGrid .file-card` | 152 / 122 / 102 / 182 |
| preset-tile | `#presetGrid .file-card` | 154 / 124 / 104 / 184 |
| flow-tile | `#flowGrid .file-card` | 156 / 126 / 106 / 186 |
| source | `.pins-strip .chip` | 158 / 128 / 108 / 188 |
| explorer | `.files-sidebar-nav-item` | 160 / 130 / 110 / 190 |
| filter | `.file-filter-btn,.preset-filter-btn` | 162 / 132 / 112 / 192 |
| view | `.file-view-btn` | 164 / 134 / 114 / 194 |
| sort | `.file-sort-control select` | 166 / 136 / 116 / 196 |
| search | `.search-input:not(.flow-name)` | 168 / 138 / 118 / 198 |
| library-action | `.hero-action` | 170 / 140 / 120 / 200 |
| wheel | `.wheel-btn` | 172 / 142 / 122 / 202 |
| scope | `.azy-scope-btn` | 174 / 144 / 124 / 204 |
| curve-value | `.flow-curve-nums input,.flow-name` | 176 / 146 / 126 / 206 |
| curve-action | `.flow-editor button` | 178 / 148 / 128 / 208 |
| settings-category | `.settings-cat` | 180 / 150 / 130 / 210 |
| theme | `#themeSeg .snap-seg-btn` | 182 / 152 / 132 / 212 |
| segment | `.snap-seg-btn` | 184 / 154 / 134 / 214 |
| switch | `.snap-switch` | 186 / 156 / 136 / 216 |
| shortcut | `.snap-keycap` | 188 / 158 / 138 / 218 |
| favorite | `.fav-badge,.flow-edit-badge` | 190 / 160 / 140 / 220 |
| speed | `.azy-speed-step,.azy-speed-value,.azy-speed-reset,.speed-reset,.speed-apply` | 192 / 162 / 142 / 222 |
| player | `.btn,.preview-transport button` | 194 / 164 / 144 / 224 |
| popup | `.gain-row button,.buttons button,#close,.snap-row,.snap-dialog-opt,.snap-dialog-cancel,.welcome-actions button` | 196 / 166 / 146 / 226 |
| quick-action | `.chip,.text-action,.pin-toggle` | 198 / 168 / 148 / 228 |
| utility-icon | `.icon-btn` | 200 / 170 / 150 / 230 |

## Routing and safeguards

- Enter: pointer boundary lift/fade and return. Leave: short settling fade. Press: compression/rebound. Focus: opacity reveal while the CSS focus ring remains visible. Editable controls never translate. Enter/Space also trigger button press feedback without intercepting the action.
- One animation per element, at most six in a window. No periodic timers, MutationObservers, grid-wide entrance waves or permanent `will-change` layers.
- Delegated document listeners work on dynamically created cards without per-item listeners or layout reads. They never prevent default or stop propagation.
- Native drag start, window blur, hidden documents and switching on reduced-motion cancel active effects. Reduced-motion suppresses new effects. No motion changes the thumbnail decoder, selection model or filesystem.
- `test-compact-motion.js` checks 104 unique names/definitions, dispatches every route against production DOM controls, and tests compact geometry, palette propagation and motion cancellation. Some routes are exercised in inactive panes to cover controls without invoking their destructive actions. Browser layout/thumbnail and scrolling stress suites separately exercise the visible UI.
