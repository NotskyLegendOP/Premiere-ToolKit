/* Dagger — the Azy wheel (hold Ctrl + right mouse button).
 *
 *   hold Ctrl and press the right mouse button   →  the wheel opens under the cursor
 *   move the mouse                                →  the sector under the cursor lights up
 *   let go (either key)                           →  that section opens; the wheel closes
 *
 * Like a game weapon wheel: while it is open the OS cursor is warped to the wheel's centre and
 * confined to the wheel's disc. In Hold mode it is hidden (the needle is the pointer); in Toggle
 * mode it stays visible as a normal arrow, because there you click to pick. A tiny bundled Windows companion owns the direct
 * Win32 hook/cursor boundary because JavaScript cannot synchronously consume a mouse click.
 * Everything the wheel opens already exists — Files / Presets / Flow / Snap tabs of the main
 * window, the Snap Action popup and the Speed window — so this module only routes; it owns no
 * feature of its own. Nothing is ever sent to Premiere from here.
 */
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { start: startNativeDagger } = require('./dagger-native');

// Default order of the main wheel (the user can reorder it in Settings › Dagger). Releasing on
// the hub does nothing: the hub is the part of the wheel you pass through, not a target.
const SECTIONS = [
  { id: 'files',   label: 'Files' },
  { id: 'sfx',     label: 'SFX' },
  { id: 'presets', label: 'Presets' },
  { id: 'flow',    label: 'Flow' },
  { id: 'snap',    label: 'Snap Action' },
  { id: 'speed',   label: 'Speed' },
  { id: 'settings', label: 'Settings' },
  { id: 'all',     label: 'Azy' }
];
/* Three wheels share one window, one hook and one choreography; only the modifier, the items
   and what "release" does differ:
     main    Ctrl  + right button   sections of Azy (above)
     sfx     Alt   + right button   pinned sound effects → placed at the playhead on a free audio track
     presets Shift + right button   pinned presets → applied to the selected clip(s)
     flow    Ctrl+Shift + right btn  pinned Flow easings → applied to the keys highlighted in
                                     Premiere Effect Controls (native Selected detection)
   Items of sfx/presets/flow are the user's pins (max 8 per wheel; stored as identifiers/paths only). */
const WHEELS = {
  main:    { id: 'main',    title: 'Azy',     modifier: 'ctrl',  button: 2, max: 8 },
  sfx:     { id: 'sfx',     title: 'SFX',     modifier: 'alt',   button: 2, max: 8 },
  presets: { id: 'presets', title: 'Presets', modifier: 'shift', button: 2, max: 8 },
  // Flow wheel: Ctrl+Shift + right button → pinned Flow easing presets applied to the selected clips'
  // keyframes (same flowApply as a click on the Flow tile, speed 100%).
  flow:    { id: 'flow',    title: 'Flow',    modifier: 'ctrl+shift', button: 2, max: 8 }
};
// The values above are the DEFAULT bindings. The user can rebind each wheel in Settings → Dagger
// (modifiers + mouse button); settings.binds[wheel] = { modifier: 'ctrl+alt', button: 3 } overrides.
// Mouse buttons follow the native helper's stable IDs: 2 = right, 3 = middle, 4 / 5 = side buttons. Left is never allowed.
// A binding is any mouse button (2 = right, 3 = middle, 4 / 5 = side buttons; left is never allowed
// because it would hijack every click) with ZERO or more modifiers held — e.g. a bare side button
// or Alt + middle. Modifiers are optional; the exact held set must match (Ctrl+Shift ≠ Ctrl).
const BUTTON_NAMES = { 1: 'Left mouse', 2: 'Right mouse', 3: 'Middle mouse', 4: 'Mouse 4', 5: 'Mouse 5' };
// v1.23: a binding may also be a keyboard key (Windows virtual-key code, 1–255, never a bare modifier),
// and each wheel has a mode: 'hold' (release picks) or 'toggle' (press opens; click / Enter picks;
// press again or Esc cancels). The only thing refused is a bare LEFT button, because that would take
// every click away from the machine (including the click needed to undo the setting).
const MODE_NAMES = { hold: 'Hold', toggle: 'Toggle' };
const MOD_VKS = new Set([16, 17, 18, 160, 161, 162, 163, 164, 165, 91, 92]);
const KEY_NAMES = { 8: 'Backspace', 9: 'Tab', 13: 'Enter', 19: 'Pause', 20: 'Caps Lock', 27: 'Esc', 32: 'Space', 33: 'Page Up', 34: 'Page Down', 35: 'End', 36: 'Home', 37: 'Left', 38: 'Up', 39: 'Right', 40: 'Down', 45: 'Insert', 46: 'Delete', 186: ';', 187: '=', 188: ',', 189: '-', 190: '.', 191: '/', 192: '`', 219: '[', 220: '\\', 221: ']', 222: "'" };
function keyName(vk) {
  vk = Number(vk);
  if (KEY_NAMES[vk]) return KEY_NAMES[vk];
  if (vk >= 48 && vk <= 57) return String.fromCharCode(vk);
  if (vk >= 65 && vk <= 90) return String.fromCharCode(vk);
  if (vk >= 96 && vk <= 105) return 'Num ' + (vk - 96);
  if (vk >= 112 && vk <= 135) return 'F' + (vk - 111);
  return 'Key ' + vk;
}
const validKey = (k) => Number.isInteger(Number(k)) && Number(k) >= 1 && Number(k) <= 255 && !MOD_VKS.has(Number(k)) && ![1, 2, 4].includes(Number(k));
const normMode = (m) => (m === 'toggle' ? 'toggle' : 'hold');
const MOD_ORDER = ['ctrl', 'alt', 'shift'];
function normMods(m) { return MOD_ORDER.filter((k) => String(m || '').split('+').includes(k)).join('+'); }
function bindOf(id) {
  const d = WHEELS[id]; const b = settings.binds && settings.binds[id];
  const mode = normMode(b && b.mode);
  if (b && validKey(b.key)) return { modifier: normMods(b.modifier), button: 0, key: Number(b.key), mode };
  if (!b || !BUTTON_NAMES[b.button]) return { modifier: d.modifier, button: d.button, key: 0, mode };
  return { modifier: normMods(b.modifier), button: Number(b.button), key: 0, mode };
}
function bindLabel(b) { const mods = b.modifier ? b.modifier.split('+').map((k) => ({ ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift' })[k]) : []; return [...mods, b.key ? keyName(b.key) : BUTTON_NAMES[b.button]].join(' + '); }
const bindSig = (b) => `${b.modifier}/${b.key ? 'k' + b.key : 'b' + b.button}`;
const WHEEL_SIZE = 460;            // css px, square window
const DEAD_ZONE = 0.27;            // fraction of the radius that selects nothing (the hub)
// Stickiness so a pointer resting on a border does not flip between two slices every frame:
// a lit slice stays lit until the pointer is EDGE_HYST_DEG past its border, and the hub only
// clears a lit slice once the pointer is DEAD_HYST (fraction of the radius) inside the hub rim.
// Selecting a *new* slice from rest still uses the exact borders, so the hit-test is unchanged.
const EDGE_HYST_DEG = 2.5;
const DEAD_HYST = 0.02;
let ctx = null;
let actionPopups = null;
let win = null;
// The radial has its own renderer only while it is in use. Leaving a transparent BrowserWindow
// hidden all day costs another Chromium process (~50–100 MB), so release it after a short idle.
let wheelIdleTimer = null;
const WHEEL_IDLE_WINDOW_MS = 15 * 1000;
let hook = null;                    // native companion handle while enabled
let nativeDriver = null;            // direct Win32 hook/cursor companion (private inherited pipe)
let open = false;                   // wheel id while open, else false
let centre = { x: 0, y: 0 };
let hover = null;                   // item id under the cursor
let items = [];                     // items of the open wheel
// The helper tags every native gesture. Keeping that id until the visual close
// completes rejects stale move/close/restore traffic from a prior rapid session.
let nativeSession = 0;
// Settings' Preview action auto-cancels after two seconds. Associate that timer
// with the helper session it opened so an old timer cannot cancel a newer hold.
let nativePreviewToken = 0;
let pendingNativePreview = null;
let pendingNativePreviewTimer = null;
let activeNativePreview = 0;
let nativePreviewTimer = null;
let settings = { enabled: true, pins: { sfx: [], presets: [], flow: [] } };
let hookOk = false;

// ---------- settings ----------
function settingsFile() { return path.join(ctx.app.getPath('userData'), 'presets', 'dagger-settings.json'); }
function loadSettings() {
  // v1.18: a damaged settings file never costs the user their pins — fall back to the last good
  // copy (written on every successful save) before falling back to defaults.
  const read = (f) => { const v = JSON.parse(fs.readFileSync(f, 'utf8')); if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('bad'); return v; };
  let raw = null;
  try { raw = read(settingsFile()); } catch (err) {
    if (err && err.code !== 'ENOENT') { try { raw = read(settingsFile() + '.bak'); console.warn('[dagger] settings file unreadable — restored from the last good copy'); } catch { raw = null; } }
  }
  settings = { enabled: true, ...(raw || {}) };
  settings.enabled = settings.enabled !== false;
  // Existing entries keep any extra metadata (forward compatible); only shape is enforced.
  const pins = settings.pins && typeof settings.pins === 'object' ? settings.pins : {};
  settings.pins = {
    sfx: Array.isArray(pins.sfx) ? dedupe(pins.sfx.filter((p) => p && typeof p.path === 'string' && p.path), (p) => p.path).slice(0, WHEELS.sfx.max) : [],
    presets: Array.isArray(pins.presets) ? dedupe(pins.presets.filter((p) => p && typeof p.id === 'string' && p.id), (p) => p.id).slice(0, WHEELS.presets.max) : [],
    flow: Array.isArray(pins.flow) ? dedupe(pins.flow.filter((p) => p && typeof p.id === 'string' && p.id), (p) => p.id).slice(0, WHEELS.flow.max) : []
  };
  settings.binds = sanitizeBinds(settings.binds);
  settings.order = sanitizeOrder(settings.order);
}
// Main-wheel order: every section exactly once; unknown ids dropped, missing ones appended.
function sanitizeOrder(raw) {
  const ids = SECTIONS.map((x) => x.id);
  const main = Array.isArray(raw && raw.main) ? raw.main.filter((id, i, a) => ids.includes(id) && a.indexOf(id) === i) : [];
  // A section added in a newer version (e.g. SFX) is slotted in after the one it follows in the default
  // order, instead of landing behind the Azy tile at the end of an older saved order.
  ids.forEach((id, i) => {
    if (main.includes(id)) return;
    const prev = i > 0 ? main.indexOf(ids[i - 1]) : -1;
    if (prev >= 0) main.splice(prev + 1, 0, id); else main.push(id);
  });
  return { main };
}
function orderedSections() { return settings.order.main.map((id) => SECTIONS.find((x) => x.id === id)); }
/** Move item `from` → `to` inside a wheel's list (main = section order; sfx/presets/flow = the pins). */
function reorderWheel(wheel, from, to) {
  const list = wheel === 'main' ? settings.order.main : settings.pins[wheel];
  if (!Array.isArray(list)) return;
  from = Number(from); to = Number(to);
  if (!(from >= 0 && from < list.length && to >= 0 && to < list.length) || from === to) return;
  const [it] = list.splice(from, 1); list.splice(to, 0, it);
}
// Keep only valid, mutually distinct bindings (two wheels on one gesture would be ambiguous).
function sanitizeBinds(raw) {
  const out = {};
  const seen = new Set();
  for (const id of Object.keys(WHEELS)) {
    const b = raw && raw[id];
    const modifier = b ? normMods(b.modifier) : '';
    const mode = normMode(b && b.mode);
    const button = b && BUTTON_NAMES[b.button] ? Number(b.button) : 0;
    const key = b && validKey(b.key) ? Number(b.key) : 0;
    if (key) out[id] = { modifier, key, button: 0, mode };
    else if (button && !(button === 1 && !modifier)) out[id] = { modifier, button, mode };
    else if (b && !button && !key && b.mode) out[id] = { modifier: WHEELS[id].modifier, button: WHEELS[id].button, mode }; // mode-only change keeps the default gesture
  }
  for (const id of Object.keys(WHEELS)) {
    const eff = out[id] || { modifier: WHEELS[id].modifier, button: WHEELS[id].button, key: 0 };
    const sig = bindSig({ modifier: eff.modifier, button: eff.button, key: eff.key || 0 });
    if (seen.has(sig)) delete out[id]; else seen.add(sig);
  }
  return out;
}
function dedupe(list, key) { const seen = new Set(); return list.filter((x) => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; }); }
// Pins as references (paths / ids + display metadata), never copies of the files or presets.
const PIN_KEY = { sfx: (p) => p.path, presets: (p) => p.id, flow: (p) => p.id };
function sanitizePins(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const str = (v, max = 400) => String(v == null ? '' : v).slice(0, max);
  return {
    sfx: dedupe((Array.isArray(r.sfx) ? r.sfx : []).filter((p) => p && typeof p.path === 'string' && p.path && p.path.length < 4096).map((p) => ({ path: p.path, name: str(p.name || path.basename(p.path)) })), PIN_KEY.sfx),
    presets: dedupe((Array.isArray(r.presets) ? r.presets : []).filter((p) => p && typeof p.id === 'string' && p.id && p.id.length < 512).map((p) => ({ id: p.id, name: str(p.name || p.id) })), PIN_KEY.presets),
    flow: dedupe((Array.isArray(r.flow) ? r.flow : []).filter((p) => p && typeof p.id === 'string' && p.id && p.id.length < 512).map((p) => ({ id: p.id, name: str(p.name || p.id), easing: easingOf(p) })), PIN_KEY.flow)
  };
}
/** Atomic save: temp file + rename, and the previous good file is kept as .bak. Throws when strict. */
function saveSettings(strict) {
  const file = settingsFile(), tmp = file + '.tmp';
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(tmp, JSON.stringify(settings, null, 2));
    try { JSON.parse(fs.readFileSync(file, 'utf8')); fs.copyFileSync(file, file + '.bak'); } catch { /* no good previous copy to keep */ }
    fs.renameSync(tmp, file);
    try { process.emit('azy:dagger-pins-changed'); } catch { /* local preset copies resync (v1.20) */ }
  } catch (err) {
    try { fs.unlinkSync(tmp); } catch { /* nothing to clean */ }
    if (strict) throw err;
  }
}
// ---------- pins export / import (v1.18) ----------
const PINS_SCHEMA = 'azy.dagger-pins';
const PINS_VERSION = 1;
function pinsDocument() {
  return { schema: PINS_SCHEMA, version: PINS_VERSION, app: (ctx.app.getVersion && ctx.app.getVersion()) || '', exportedAt: new Date().toISOString(),
    pins: { sfx: settings.pins.sfx.map((p) => ({ path: p.path, name: p.name })), presets: settings.pins.presets.map((p) => ({ id: p.id, name: p.name })), flow: settings.pins.flow.map((p) => ({ id: p.id, name: p.name, easing: p.easing || null })) } };
}
/** Validate an exported file. Newer versions are read for the fields this version knows. */
function parsePinsDocument(text) {
  let doc;
  try { doc = JSON.parse(String(text).replace(/^\uFEFF/, '')); } catch { throw new Error('That file is not valid JSON.'); }
  if (!doc || typeof doc !== 'object' || doc.schema !== PINS_SCHEMA) throw new Error('That file is not an Azy Dagger pins export.');
  const version = Number(doc.version);
  if (!Number.isInteger(version) || version < 1) throw new Error('The pins file has no valid version.');
  if (!doc.pins || typeof doc.pins !== 'object') throw new Error('The pins file contains no pins.');
  return { version, pins: sanitizePins(doc.pins), newer: version > PINS_VERSION };
}
/** Merge keeps the current pins first (order preserved) and appends new ones; replace uses the file's. */
function planImport(incoming, mode) {
  const out = {}, report = {};
  for (const w of ['sfx', 'presets', 'flow']) {
    const cur = settings.pins[w], key = PIN_KEY[w], max = WHEELS[w].max;
    const have = new Set(cur.map(key));
    const fresh = incoming[w].filter((p) => !have.has(key(p)));
    const list = mode === 'replace' ? incoming[w].slice() : cur.concat(fresh);
    out[w] = list.slice(0, max);
    report[w] = { incoming: incoming[w].length, duplicates: incoming[w].length - fresh.length, added: mode === 'replace' ? out[w].length : Math.max(0, out[w].length - cur.length), dropped: Math.max(0, list.length - max), missing: w === 'sfx' ? incoming.sfx.filter((p) => !fs.existsSync(p.path)).length : 0 };
  }
  return { pins: out, report };
}
let pendingImport = null; // { token, pins, version, newer, file }
function broadcastPins() { for (const wc of ctx.getWindows()) { try { wc.send('azy:dagger:evt:settings', view()); } catch { /* closing */ } } }
function view() {
  const wheels = Object.values(WHEELS).map((w) => { const b = bindOf(w.id); return { ...w, modifier: b.modifier, button: b.button, key: b.key || 0, mode: b.mode, label: bindLabel(b), defaultLabel: bindLabel({ modifier: w.modifier, button: w.button }), isDefault: b.modifier === w.modifier && b.button === w.button && !b.key && b.mode === 'hold' }; });
  // Pinned sounds whose file moved are flagged (at most 8 stats); the reference itself is kept.
  const pins = { ...settings.pins, sfx: settings.pins.sfx.map((p) => { try { return fs.existsSync(p.path) ? p : { ...p, missing: true }; } catch { return p; } }) };
  return { ...settings, pins, available: hookOk, confine: !!nativeStatus.confine, native: { ...nativeStatus }, sections: settings.order.main, sectionLabels: Object.fromEntries(SECTIONS.map((x) => [x.id, x.label])), wheels, buttons: BUTTON_NAMES };
}
// Items each wheel shows. sfx/presets come from pins; an empty wheel shows one "pin something" hint.
function itemsFor(id) {
  if (id === 'main') return orderedSections();
  if (id === 'sfx') return settings.pins.sfx.map((p) => ({ id: 'sfx:' + p.path, label: p.name || path.basename(p.path), kind: 'sfx', path: p.path }));
  if (id === 'presets') return settings.pins.presets.map((p) => ({ id: 'preset:' + p.id, label: p.name || p.id, kind: 'preset', presetId: p.id, presetName: p.name || '', presetBin: typeof p.bin === 'string' ? p.bin : null }));
  // Flow pins carry the easing (curve / first / middle / last) so the wheel can draw each preset's
  // speed-curve preview — the same glyph as the Flow tile — without asking the engine while open.
  if (id === 'flow') return settings.pins.flow.map((p) => ({ id: 'flow:' + p.id, label: p.name || p.id, kind: 'flow', flowId: p.id, easing: p.easing || null }));
  return [];
}

// ---------- cursor/input implementation ----------
// Windows is served by the bundled direct helper below. The desktop release is Windows x64, so
// there is intentionally no asynchronous JavaScript FFI fallback here: an observed mouse event
// cannot undo a right click that Windows has already delivered to Premiere. Unsupported platforms
// leave the desktop-only dagger unavailable instead of pretending to block input.
// What the Windows helpers managed to bind — shown in Settings › Dagger so a broken piece is visible.
const nativeStatus = { platform: process.platform, driver: null, warp: null, confine: null, hide: null, clickGuard: null, error: null };

// ---------- direct Windows dagger companion ----------
// A JS FFI callback cannot synchronously return 1 from WH_MOUSE_LL: by the time Node sees it,
// Windows has already forwarded the right click to Premiere. On Windows the helper owns that
// very small native boundary (hook + cursor only) and talks to this process through inherited
// stdin/stdout — no network socket and no user data.
function broadcastDaggerSettings() {
  if (!ctx) return;
  for (const wc of ctx.getWindows()) { try { wc.send('azy:dagger:evt:settings', view()); } catch { /* closing */ } }
}
function driverBindings() {
  return Object.fromEntries(Object.keys(WHEELS).map((id) => [id, bindOf(id)]));
}
function physicalToDip(x, y) {
  const p = { x: Math.round(Number(x) || 0), y: Math.round(Number(y) || 0) };
  try { if (ctx && ctx.screen && ctx.screen.screenToDipPoint) return ctx.screen.screenToDipPoint(p); } catch { /* old Electron / tests */ }
  return p;
}

/* v29's cursor path is deliberately a single transaction: the native helper picks the actual
   monitor centre, blanks system cursors, warps once, and confines the pointer. BrowserWindow uses
   DIPs, so Electron maps that already-final physical point only for drawing. Never convert it back
   and issue a second SetCursorPos — a second asynchronous warp was the source of the visible hitch. */
function wheelCentreForNativePhysical(x, y) {
  const dip = physicalToDip(x, y);
  return { x: Math.round(Number(dip && dip.x) || 0), y: Math.round(Number(dip && dip.y) || 0) };
}
function nativeError(part, code) {
  nativeStatus[part] = false;
  nativeStatus.error = `${part}: Win32 error ${Number(code) || 0}`;
  broadcastDaggerSettings();
}
function clearNativePreviewTimer() {
  if (nativePreviewTimer) clearTimeout(nativePreviewTimer);
  nativePreviewTimer = null;
}
function clearPendingNativePreview() {
  if (pendingNativePreviewTimer) clearTimeout(pendingNativePreviewTimer);
  pendingNativePreviewTimer = null;
  pendingNativePreview = null;
}
function armPendingNativePreview(token, driver, wheel) {
  clearPendingNativePreview();
  pendingNativePreview = { token, driver, wheel };
  // A V command issued while another physical hold is already active deliberately
  // produces no O event. Expire its bookkeeping quickly so a later real gesture
  // cannot inherit the preview auto-cancel timer.
  pendingNativePreviewTimer = setTimeout(() => {
    if (pendingNativePreview && pendingNativePreview.token === token && pendingNativePreview.driver === driver) clearPendingNativePreview();
  }, 650);
  if (pendingNativePreviewTimer.unref) pendingNativePreviewTimer.unref();
}
function armNativePreviewCancel(token, session, driver) {
  clearNativePreviewTimer();
  if (!token || !session) return;
  nativePreviewTimer = setTimeout(() => {
    nativePreviewTimer = null;
    // A Preview timer only owns its original helper transaction. A real hold
    // that began after this preview closes is never sent a stale K command.
    if (nativeDriver === driver && driver.alive && open && nativeSession === session && activeNativePreview === token) {
      driver.cancel(session);
    }
  }, 2000);
  if (nativePreviewTimer.unref) nativePreviewTimer.unref();
}
function startNativeDaggerHelper() { 
  if (process.platform !== 'win32') return false;
  if (nativeDriver && nativeDriver.alive && !nativeDriver.stopped) {
    nativeDriver.configure(settings.enabled, driverBindings());
    return true;
  }
  nativeDriver = null;
  nativeStatus.driver = null;
  nativeStatus.warp = null;
  nativeStatus.hide = null;
  nativeStatus.confine = null;
  nativeStatus.clickGuard = null;
  nativeStatus.error = null;
  const driver = startNativeDagger({
    app: ctx.app,
    onEvent: (evt) => {
      if (nativeDriver !== driver) return;
      if (evt.type === 'ready') {
        nativeStatus.driver = !!evt.ok;
        nativeStatus.clickGuard = !!evt.ok;
        hookOk = !!evt.ok;
        if (!evt.ok) nativeStatus.error = `native hook: Win32 error ${evt.errorCode || 0}`;
        // The command may have been buffered before the helper's message pump came up; send it
        // again once it has positively declared itself ready.
        if (evt.ok) driver.configure(settings.enabled, driverBindings());
        broadcastDaggerSettings();
      } else if (evt.type === 'status') {
        if (['warp', 'hide', 'confine', 'clickGuard'].includes(evt.part)) {
          nativeStatus[evt.part] = !!evt.ok;
          if (!evt.ok) nativeError(evt.part, evt.errorCode);
          else broadcastDaggerSettings();
        }
      } else if (evt.type === 'open') {
        // The native helper has already completed the v29-style cursor transaction before this
        // notification. Map its final physical hub to DIPs for the transparent wheel; do not move
        // it again from Node, which avoids a second warp/ClipCursor race on mixed-DPI desktops.
        const centre = wheelCentreForNativePhysical(evt.x, evt.y);
        const previewToken = pendingNativePreview && pendingNativePreview.driver === driver && pendingNativePreview.wheel === evt.wheel ? pendingNativePreview.token : 0;
        if (previewToken) clearPendingNativePreview();
        const opened = openWheel(centre.x, centre.y, evt.wheel, { nativeDriven: true, centre, session: evt.session, nativePreviewToken: previewToken });
        if (opened && previewToken) armNativePreviewCancel(previewToken, Number(evt.session) || 0, driver);
      } else if (evt.type === 'move') {
        const p = physicalToDip(evt.x, evt.y);
        track(p.x, p.y, evt.session);
      } else if (evt.type === 'close') {
        closeWheel(!!evt.commit, { nativeDriven: true, session: evt.session });
      }
    },
    onStderr: (line) => console.warn(`[dagger native] ${line}`),
    onExit: (err, info) => {
      if (nativeDriver !== driver) return;
      if (pendingNativePreview && pendingNativePreview.driver === driver) clearPendingNativePreview();
      clearNativePreviewTimer();
      // A pipe/process failure may happen while the wheel is visible. Close the
      // renderer-side session and clear its input guard immediately; otherwise a
      // dead helper could leave the next session blocked behind stale `open` state.
      if (open) closeWheel(false, { nativeDriven: false, session: nativeSession });
      nativeDriver = null;
      hook = null;
      hookOk = false;
      nativeStatus.driver = false;
      nativeStatus.clickGuard = false;
      if (err && !(info && info.stopped)) nativeStatus.error = err.message;
      broadcastDaggerSettings();
    }
  });
  if (!driver) {
    hookOk = false;
    nativeStatus.driver = false;
    nativeStatus.clickGuard = false;
    nativeStatus.error = 'The bundled Dagger native helper could not be found';
    broadcastDaggerSettings();
    return false;
  }
  nativeDriver = driver;
  hook = { native: true };
  // Write immediately as well as after ready. stdin is inherited before the helper installs its
  // hook, so the desired bindings are ready before the user can make the first gesture.
  driver.configure(settings.enabled, driverBindings());
  return true;
}
function stopNativeDaggerHelper() {
  const driver = nativeDriver;
  clearNativePreviewTimer();
  if (pendingNativePreview && (!driver || pendingNativePreview.driver === driver)) clearPendingNativePreview();
  if (!driver) return;
  if (driver.alive && !driver.stopped) driver.stop();
}

/* A destroyed/non-composited radial must not retain a native input transaction.
   K is session-scoped, and the short visual fallback also clears Azy's guard if
   a wedged helper cannot send its usual X event. */
function cancelOpenWheelSession() {
  if (!open) return;
  const session = nativeSession;
  const driver = nativeDriver;
  const sent = !!(driver && driver.alive && !driver.stopped && driver.cancel(session));
  if (sent) {
    setTimeout(() => {
      if (open && nativeSession === session) closeWheel(false, { nativeDriven: false, session });
    }, 120).unref?.();
  } else {
    closeWheel(false, { nativeDriven: false, session });
  }
}

// ---------- window ----------
function keepWheelRenderer() { clearTimeout(wheelIdleTimer); wheelIdleTimer = null; }
function releaseWheelRendererWhenIdle() {
  keepWheelRenderer();
  wheelIdleTimer = setTimeout(() => {
    if (open || !win || win.isDestroyed()) return;
    try { win.destroy(); } catch { /* closing */ }
    win = null;
  }, WHEEL_IDLE_WINDOW_MS);
  if (wheelIdleTimer.unref) wheelIdleTimer.unref();
}
function ensureWindow() {
  keepWheelRenderer();
  if (win && !win.isDestroyed()) return win;
  const { BrowserWindow } = ctx;
  // Windows quirks this layout avoids (all seen in the wild as "the wheel opens but nothing shows"):
  //  • transparent + focusable:false at construction → Chromium sometimes never composites the
  //    first frame; we create it focusable and switch to setFocusable(false) after the first paint.
  //  • transparent windows must not be resizable/maximizable and must have no thickFrame.
  //  • the window is created at startup and only shown/hidden afterwards, so the first open never
  //    races the page load (the renderer also asks 'azy:dagger:state' on boot).
  win = new BrowserWindow({
    width: WHEEL_SIZE, height: WHEEL_SIZE,
    show: false, frame: false, transparent: true, hasShadow: false, thickFrame: false, roundedCorners: false,
    backgroundColor: '#00000000',
    resizable: false, movable: false, minimizable: false, maximizable: false, fullscreenable: false,
    alwaysOnTop: true, skipTaskbar: true,
    title: 'Azy Dagger', icon: ctx.appIcon,
    webPreferences: { defaultFontFamily: { standard: 'Segoe UI', sansSerif: 'Segoe UI', serif: 'Segoe UI', monospace: 'Consolas' }, preload: path.join(__dirname, '..', 'preload.js'), contextIsolation: true, nodeIntegration: false, backgroundThrottling: false }
  });
  win.setMenuBarVisibility(false);
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true); // the hook drives it; the window itself never eats clicks
  win.webContents.once('did-finish-load', () => { try { win.setFocusable(false); } catch { /* older electron */ } });
  win.webContents.on('render-process-gone', (e, d) => {
    console.warn('[dagger] wheel renderer gone', d && d.reason);
    cancelOpenWheelSession();
    try { win.destroy(); } catch { /* ignore */ }
    win = null;
  });
  win.loadFile(path.join(__dirname, 'dagger.html'));
  win.on('closed', () => {
    // Normal close happens only after closeWheel() has reset `open`; an unexpected
    // close instead actively cancels native input so a later Dagger session is clean.
    if (open) cancelOpenWheelSession();
    win = null;
  });
  return win;
}
function send(ch, payload) {
  if (!win || win.isDestroyed()) return;
  const wc = win.webContents;
  if (wc.isLoading()) wc.once('did-finish-load', () => { try { wc.send(ch, payload); } catch { /* closing */ } });
  else { try { wc.send(ch, payload); } catch { /* closing */ } }
}

// ---------- open / track / close ----------
function openWheel(px, py, wheelId, opts = {}) {
  if (open) return false;
  wheelId = WHEELS[wheelId] ? wheelId : 'main';
  // Each open starts with a fresh hover/items transaction. Native traffic carries
  // the helper session number so a delayed move/close from the last gesture can
  // never choose or close this one.
  nativeSession = opts.nativeDriven ? (Number(opts.session) || 0) : 0;
  activeNativePreview = opts.nativePreviewToken || 0;
  items = itemsFor(wheelId);
  const { screen } = ctx;
  const disp = screen.getDisplayNearestPoint({ x: px, y: py });
  // The wheel always opens in the centre of the screen the mouse is on (like the game wheel it is
  // modelled on) and the cursor is warped there, so the first move is always from the hub.
  const half = WHEEL_SIZE / 2;
  const b = disp.bounds;
  // `opts.centre` is resolved above from Electron's own display bounds, not copied from raw
  // Win32 pixels. That keeps the SVG window in the same DIP space as BrowserWindow.setBounds.
  const cx = opts.centre && Number.isFinite(opts.centre.x) ? Math.round(opts.centre.x) : Math.round(b.x + b.width / 2);
  const cy = opts.centre && Number.isFinite(opts.centre.y) ? Math.round(opts.centre.y) : Math.round(b.y + b.height / 2);
  centre = { x: cx, y: cy };
  const w = ensureWindow();
  w.setBounds({ x: Math.round(cx - half), y: Math.round(cy - half), width: WHEEL_SIZE, height: WHEEL_SIZE });
  hover = null;
  open = wheelId;
  w.showInactive();
  // Stay click-through for the entire gesture. The companion owns both the blank system cursor
  // and the synchronous low-level suppression, so the radial never needs to receive a mouse
  // event itself — and cannot accidentally become a target for the opening right-click.
  try { w.setIgnoreMouseEvents(true); } catch { /* ignore */ }
  // Belt and braces for Windows: re-assert topmost after show (Premiere's own topmost panels and
  // the CEP host can out-rank a window that was shown while another app had a topmost child).
  try { w.setAlwaysOnTop(true, 'screen-saver'); w.moveTop(); } catch { /* ignore */ }
  send('azy:dagger:evt:open', { wheel: { ...WHEELS[wheelId], mode: bindOf(wheelId).mode }, sections: items, hover: null });
  // Azy's own windows also receive the button that opened the wheel (the OS delivers it before the
  // hook sees it). Tell them a wheel is up so they swallow that press, its release and the
  // context-menu it would raise — otherwise a Files card toggles a pin / a Flow tile opens its editor.
  for (const wc of ctx.getWindows()) { try { wc.send('azy:dagger:evt:guard', { open: true, button: bindOf(wheelId).button }); } catch { /* closing */ } }
  return true;
}
function track(px, py, session = 0) {
  // The helper's pipe is ordered, but stale callbacks can still be queued while
  // a previous wheel is closing. Ignore a numbered event that does not own the
  // current visual session rather than letting it light a wrong sector.
  // A numbered helper event can never drive a visual-only/manual session (0).
  // This also blocks an old helper's queued move after a fallback Preview open.
  if (!open || (session && Number(session) !== nativeSession)) return;
  const dx = px - centre.x, dy = py - centre.y;
  const dist = Math.hypot(dx, dy);
  const r = dist / (WHEEL_SIZE / 2);
  let next = null;
  const n = items.length;
  if (r >= (hover ? DEAD_ZONE - DEAD_HYST : DEAD_ZONE) && n) {
    // 0° at 12 o'clock, clockwise; n equal sectors. Toolkit layout: sector 0 STARTS at 12 o'clock
    // (so four items sit in the four quadrants), its label in the middle of the slice.
    const step = 360 / n;
    const ang = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    let idx = Math.floor(ang / step) % n;
    const cur = hover ? items.findIndex((it) => it.id === hover) : -1;
    if (cur >= 0 && cur !== idx) {
      let off = Math.abs(ang - (cur + 0.5) * step);
      if (off > 180) off = 360 - off;
      if (off < step / 2 + EDGE_HYST_DEG) idx = cur; // still within the stickiness band of the lit slice
    }
    next = items[idx].id;
  }
  if (next !== hover) { hover = next; send('azy:dagger:evt:hover', { hover, dx, dy }); }
  else send('azy:dagger:evt:pointer', { dx, dy });
}
function closeWheel(commit, opts = {}) {
  if (!open) return;
  const closingSession = nativeSession;
  // A numbered native event belongs to one exact helper transaction. Do not let
  // an old close (or an old fallback) collapse a newer wheel that happens to be up.
  // Session 0 is the only backwards-compatible/visual-only form. Any numbered
  // helper close must own the currently visible native session exactly; otherwise
  // a delayed X from an old helper gesture could close a fallback Preview wheel.
  if (opts.session && Number(opts.session) !== closingSession) return;
  const wheelId = open;
  const sessionItems = items;
  if (activeNativePreview) clearNativePreviewTimer();
  activeNativePreview = 0;
  // Letting go over the hub — the Azy mark in the middle — does nothing. On any wheel. The hub is
  // where the cursor starts and where it ends up when you decide against the gesture, so an action
  // parked there is an accident waiting to happen; DEAD_ZONE around it already yields hover = null,
  // and a null hover is no action. Opening Azy stays a deliberate click on a sector, or Shift+Alt+A.
  const pick = commit ? hover : null;
  // Reset *all* renderer session state before emitting guard/close. The picked
  // item is retained in a local snapshot so activation never reads a later wheel.
  open = false;
  nativeSession = 0;
  hover = null;
  items = [];
  centre = { x: 0, y: 0 };
  // The companion has already released ClipCursor on the physical button/key release, but keeps
  // its blank system cursor through the close visual. Restore after the 260 ms fade so the arrow
  // never flashes on top of the radial wheel. The helper rejects an old session id after reopen.
  if (opts.nativeDriven && nativeDriver && nativeDriver.alive) {
    const driver = nativeDriver;
    setTimeout(() => {
      if (nativeDriver === driver && driver.alive) driver.restore(closingSession);
    }, 270).unref?.();
  }
  try { if (win && !win.isDestroyed()) win.setIgnoreMouseEvents(true); } catch { /* ignore */ }
  for (const wc of ctx.getWindows()) { try { wc.send('azy:dagger:evt:guard', { open: false }); } catch { /* closing */ } }
  send('azy:dagger:evt:close', { pick });
  const w = win;
  setTimeout(() => {
    if (w && !w.isDestroyed() && !open) {
      w.hide(); // let the close animation finish before hiding the transparent surface
      releaseWheelRendererWhenIdle();
    }
  }, 260);
  if (pick) activate(pick, wheelId, sessionItems).catch((err) => notify('error', cleanErr(err)));
}
function notify(kind, text) {
  for (const wc of ctx.getWindows()) { try { wc.send('azy:dagger:evt:toast', { kind, text }); } catch { /* closing */ } }
}
async function activate(id, wheelId, sessionItems = items) {
  const it = sessionItems.find((x) => x.id === id);
  if (wheelId === 'sfx' || wheelId === 'presets' || wheelId === 'flow') {
    if (!it || !actionPopups) return;
    const applied = (text) => { notify('done', text); return text; };
    if (wheelId === 'sfx') {
      // v1.18: a wheel release is a normal apply — insert at the remembered level, no level card.
      // Ready when the level is 0 dB or this sound was already rendered at it; only a first-time
      // non-zero level still needs the card (the encoder lives in a renderer).
      try {
        const st = ctx.getSettings ? ctx.getSettings() : {};
        const db = Number.isFinite(st.audioGainDb) ? st.audioGainDb : 0;
        const ready = await ctx.invokeStrict('azy:presets:soundGainCopy', it.path, db);
        if (ready && ready.file && !ready.need) {
          const res = await ctx.invokeStrict('azy:presets:placeAudio', ready.file, it.label);
          if (!res || res.state !== 'SUCCESS') throw new Error(`Couldn't place ${it.label}`);
          applied(`${it.label} → A${res.trackIndex + 1}${res.trackCreated ? ' (new track)' : ''} at the playhead${db ? ` · ${db > 0 ? '+' : ''}${db} dB` : ''}`);
          return;
        }
      } catch (err) { notify('error', cleanErr(err)); return; }
      await actionPopups.sound(it, async (choice) => {
        const res = await ctx.invokeStrict('azy:presets:placeAudio', choice.path, it.label);
        if (!res || res.state !== 'SUCCESS') throw new Error(`Couldn't place ${it.label}`);
        return applied(`${it.label} → A${res.trackIndex + 1}${res.trackCreated ? ' (new track)' : ''} at the playhead · ${choice.db > 0 ? '+' : ''}${choice.db} dB`);
      });
      return;
    }
    // Both operation ids live in this scope on purpose: the 4th argument below picks
    // one of them *outside* the work callback, so declaring flowOp inside the callback
    // made every flow release throw "flowOp is not defined".
    const presetOp = 'op_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const flowOp = 'op_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await actionPopups.run(wheelId, it.label, async () => {
      const st = await ctx.invokeStrict('azy:presets:premiereState');
      if (st && st.selectionCount === 0) throw new Error('Select the clip(s) in Premiere first, then use the wheel again.');
      if (wheelId === 'presets') {
        let res;
        try { res = await ctx.invokeStrict('azy:presets:applyPreset', it.presetId, { mode: 'selection' }, { speed: 1, operationId: presetOp, ...(it.presetName ? { expectName: it.presetName, expectBin: it.presetBin } : {}) }); }
        catch (err) {
          // The pinned file was deleted (or its folder unpinned): say which pin is stale instead of "Unknown preset".
          if (/Unknown preset|no longer exists/i.test(String(err && err.message))) throw new Error(`\u201c${it.label}\u201d is no longer in your preset library \u2014 nothing was applied. Unpin it from the Presets wheel (or re-add its folder).`);
          throw err;
        }
        const n = res && res.targets ? res.targets.length : 0;
        if (!res || !['SUCCESS', 'PARTIAL'].includes(res.state)) throw new Error(`Couldn't apply ${it.label}: ${(res && res.warnings || []).join('; ') || 'Premiere did not complete the apply'}`);
        const text = applied(`${res.state === 'PARTIAL' ? 'Partially applied' : 'Applied'} ${it.label} to ${n} clip${n === 1 ? '' : 's'}${res.state === 'PARTIAL' ? ' · ' + (res.warnings || []).join('; ') : ''}`);
        return { text, chime: res.state === 'SUCCESS' }; // success chime: clean completions only
      }
      // Flow from the Dagger always starts from the keys highlighted in Premiere Effect
      // Controls: the native Selected probe runs first (Delete/Ctrl+Z detection), so the
      // wheel eases exactly what the editor highlighted — never the whole clip.
      const r = await ctx.invokeStrict('azy:presets:flow:apply', it.flowId, { range: 'selected' }, 1, undefined, flowOp);
      const kf = (r && (r.keyframesChanged || 0) + (r.keyframesAdded || 0)) || 0;
      if (!r || r.state !== 'SUCCESS') throw new Error(`${it.label}: ${r && r.state === 'CANCELLED' ? 'Cancelled' : (r && r.warnings || []).join('; ') || 'Could not apply easing'}`);
      const text = applied(kf ? `${it.label}: ${kf.toLocaleString()} keyframes eased` : `${it.label}: ${(r.warnings && r.warnings[0]) || 'keyframes already had this easing'}`);
      return { text, chime: kf > 0 };
    }, wheelId === 'flow' ? flowOp : presetOp);
    return;
  }
  activateSection(id);
}
// Only the fields the preview needs — never the whole preset.
function easingOf(p) {
  const e = p && p.easing && typeof p.easing === 'object' ? p.easing : null;
  if (!e) return null;
  const out = { first: e.first, middle: e.middle, last: e.last };
  if (e.curve && typeof e.curve.x1 === 'number') out.curve = { x1: +e.curve.x1, y1: +e.curve.y1, x2: +e.curve.x2, y2: +e.curve.y2 };
  return out;
}
function cleanErr(err) { return String(err && err.message ? err.message : err).replace(/^Error invoking remote method '[^']+': (Error: )?/, ''); }
function activateSection(id) {
  const main = ctx.getMainWindow && ctx.getMainWindow();
  const showMain = () => {
    if (!main || main.isDestroyed()) return;
    if (main.isMinimized()) main.restore();
    if (!main.isVisible()) main.show();
    main.focus();
  };
  switch (id) {
    case 'all': case 'files': case 'sfx': case 'presets': case 'flow': case 'settings': {
      // Each section is its own window ('all' = the all-in-one) — main brings it forward at the
      // spot of the one that is up now. SFX is not a window of its own: it is the Sounds library
      // inside the Files window, so it opens Files and then flips that window to its Sounds view
      // (Files itself flips back to Media, so the two wheel sections never land on the same view).
      const ws = id === 'settings' ? 'snap' : id === 'sfx' ? 'files' : id;
      const view = id === 'sfx' ? 'sounds' : id === 'files' ? 'media' : null;
      const showView = () => { if (view) for (const wc of ctx.getWindows()) { try { wc.send('azy:dagger:evt:files-view', view); } catch { /* closing */ } } };
      if (ctx.openWorkspace) Promise.resolve(ctx.openWorkspace(ws)).then(showView, showView);
      else { showMain(); for (const wc of ctx.getWindows()) { try { wc.send('azy:dagger:evt:section', ws); } catch { /* closing */ } } showView(); }
      break;
    }
    case 'snap':
      ctx.invoke('azy:presets:snapToggle', { force: true });
      break;
    case 'speed':
      ctx.invoke('azy:presets:speedToggle', { force: true });
      break;
    default: break;
  }
}

// ---------- native input hook ----------
function startHook() {
  if (hook || !settings.enabled) return;
  if (process.platform !== 'win32') {
    hookOk = false;
    nativeStatus.error = 'Dagger is available in the Windows desktop app';
    broadcastDaggerSettings();
    return;
  }
  startNativeDaggerHelper();
}
function stopHook() {
  if (!hook && !nativeDriver) return;
  // Q restores immediately, so do not leave a delayed restore callback from a
  // retiring helper that could overlap a very fast enable/reopen.
  if (open) closeWheel(false, { nativeDriven: false });
  hook = null;
  stopNativeDaggerHelper(); // Q releases ClipCursor and restores the cursor before exiting.
}

// ---------- module entry ----------
// Preset identity (v1.19): preset ids are derived from the file path, so a rename (in Azy) or a
// move/rename on disk mints a new id. The library re-links ★/recent metadata to the new id and
// announces it; the Presets wheel pin follows the same way (id + display name), so the panel, the
// ◎ badges and the wheel never disagree about which preset a pin means.
function relinkPresetPin(evt) {
  if (!evt || typeof evt.from !== 'string' || typeof evt.to !== 'string' || evt.from === evt.to) return false;
  const list = settings.pins.presets;
  const i = list.findIndex((p) => p.id === evt.from);
  if (i < 0) return false;
  if (list.some((p) => p.id === evt.to)) list.splice(i, 1); // already pinned under the new id — drop the stale twin
  else list[i] = { ...list[i], id: evt.to, name: String(evt.name || list[i].name || evt.to) };
  if (ctx) saveSettings();
  if (ctx) for (const wc of ctx.getWindows()) { try { wc.send('azy:dagger:evt:settings', view()); } catch { /* closing */ } }
  return true;
}
let relinkListener = null;

function init(c) {
  ctx = c;
  if (!relinkListener) { relinkListener = (e) => { try { relinkPresetPin(e); } catch { /* never break a rename */ } }; process.on('azy:preset-relink', relinkListener); }
  actionPopups = require('./dagger-action-main').createActions(ctx);
  const { ipcMain } = ctx;
  loadSettings();
  ipcMain.handle('azy:dagger:getSettings', () => view());
  // Files / SFX → Apply (v1.17): the same compact audio-level card the SFX wheel uses (centred on
  // the cursor's display, level remembered, Enter applies, Esc cancels), then the normal placeAudio.
  // Resolves { state: 'SUCCESS'|'CANCELLED'|'FAILED'|'BUSY', ... } so the card can give feedback.
  ipcMain.handle('azy:presets:placeAudioLevel', async (event, filePath, name) => {
    if (typeof filePath !== 'string' || !filePath) throw new Error('No sound to place');
    const label = String(name || path.basename(filePath));
    if (!actionPopups) {
      const r = await ctx.invokeStrict('azy:presets:placeAudio', filePath, label);
      return { ...r, db: 0 };
    }
    let out = null, failed = null;
    const shown = await actionPopups.sound({ path: filePath, label }, async (choice) => {
      try {
        const res = await ctx.invokeStrict('azy:presets:placeAudio', choice.path, label);
        if (!res || res.state !== 'SUCCESS') throw new Error(`Couldn't place ${label}`);
        out = { ...res, db: choice.db };
        return `${label} → A${res.trackIndex + 1}${res.trackCreated ? ' (new track)' : ''} at the playhead · ${choice.db > 0 ? '+' : ''}${choice.db} dB`;
      } catch (err) { failed = String(err && err.message || err); throw err; }
    });
    if (out) return out;
    if (failed) return { state: 'FAILED', error: failed };
    return { state: shown === 'busy' ? 'BUSY' : 'CANCELLED' };
  });
  /* Fast sound apply (v1.18): normal Apply inserts at the remembered level with no popup.
     0 dB → the original file, untouched. Other levels → a durable gain copy named from the source's
     identity (path + size + mtime) and the level, so the second apply of the same sound at the same
     level is instant (no decode, no encode). Copies live in userData/Dagger Audio like the popup's
     and are never auto-deleted (Premiere references them). The source file is never modified. */
  const GAIN_MAX_BYTES = 64 * 1024 * 1024;
  const gainDb = (db) => { const n = Number(db); if (!Number.isInteger(n) || n < -24 || n > 12) throw new Error('Invalid audio gain'); return n; };
  const gainCopyPath = (src, st, db) => {
    const base = path.basename(src, path.extname(src)).replace(/[^a-zA-Z0-9 _-]/g, '_').slice(0, 60);
    const id = crypto.createHash('sha256').update(`${path.resolve(src)}|${st.size}|${Math.round(st.mtimeMs)}|${db}`).digest('hex').slice(0, 16);
    return path.join(ctx.app.getPath('userData'), 'Dagger Audio', `Azy ${base} ${db}dB src-${id}.wav`);
  };
  ipcMain.handle('azy:presets:soundGainCopy', async (event, filePath, db) => {
    if (typeof filePath !== 'string' || !filePath) throw new Error('No sound to place');
    db = gainDb(db);
    let st;
    try { st = await fs.promises.stat(filePath); } catch { throw new Error('This sound file is missing or was moved'); }
    if (db === 0) return { file: filePath, db };
    const copy = gainCopyPath(filePath, st, db);
    try { const c = await fs.promises.stat(copy); if (c.size > 44) return { file: copy, db, cached: true }; } catch { /* not rendered yet */ }
    if (st.size > GAIN_MAX_BYTES) throw new Error('This sound is too large to adjust. Set the level to 0 dB to insert the original.');
    return { need: true, db, bytes: await fs.promises.readFile(filePath) };
  });
  ipcMain.handle('azy:presets:soundGainStore', async (event, filePath, db, wav) => {
    if (typeof filePath !== 'string' || !filePath) throw new Error('No sound to place');
    db = gainDb(db);
    const buf = Buffer.from(wav || []);
    if (!require('./dagger-action-main').validWav(buf)) throw new Error('The adjusted audio could not be encoded. No sound was inserted.');
    const st = await fs.promises.stat(filePath);
    const copy = gainCopyPath(filePath, st, db);
    await fs.promises.mkdir(path.dirname(copy), { recursive: true });
    const tmp = copy + '.' + process.pid + '.tmp';
    await fs.promises.writeFile(tmp, buf);
    await fs.promises.rename(tmp, copy); // atomic: Premiere never sees a half-written file
    return { file: copy, db };
  });
  ipcMain.handle('azy:dagger:setSettings', (event, patch) => {
    patch = patch && typeof patch === 'object' ? patch : {};
    if (typeof patch.enabled === 'boolean') settings.enabled = patch.enabled;
    if (patch.binds && typeof patch.binds === 'object') {
      const merged = { ...settings.binds };
      for (const id of Object.keys(WHEELS)) {
        if (!(id in patch.binds)) continue;
        const b = patch.binds[id];
        if (b === null) { delete merged[id]; continue; } // reset to default
        const cur = bindOf(id);
        const hasKey = b && validKey(b.key), hasBtn = b && BUTTON_NAMES[b.button];
        const mode = b && b.mode ? normMode(b.mode) : cur.mode;
        let modifier, button = 0, key = 0;
        if (hasKey) { modifier = normMods(b.modifier); key = Number(b.key); }
        else if (hasBtn) { modifier = normMods(b.modifier); button = Number(b.button); }
        else if (b && b.mode) { modifier = cur.modifier; button = cur.button; key = cur.key || 0; } // mode switch only
        else return { ...view(), error: 'Press a mouse button or a key' };
        if (!key && button === 1 && !modifier) return { ...view(), error: 'A bare left click can\'t be a wheel gesture — it would block every click. Add Ctrl / Alt / Shift, or use another button or key.' };
        const sig = bindSig({ modifier, button, key });
        const clash = Object.keys(WHEELS).find((o) => o !== id && bindSig(merged[o] ? { modifier: normMods(merged[o].modifier), button: merged[o].button || 0, key: merged[o].key || 0 } : { modifier: WHEELS[o].modifier, button: WHEELS[o].button, key: 0 }) === sig);
        if (clash) return { ...view(), error: `${bindLabel({ modifier, button, key })} already opens the ${WHEELS[clash].title} wheel` };
        merged[id] = key ? { modifier, key, button: 0, mode } : { modifier, button, mode };
      }
      settings.binds = sanitizeBinds(merged);
    }
    if (patch.reorder && typeof patch.reorder === 'object') reorderWheel(patch.reorder.wheel, patch.reorder.from, patch.reorder.to);
    if (patch.order && typeof patch.order === 'object') settings.order = sanitizeOrder(patch.order);
    if (patch.pins && typeof patch.pins === 'object') {
      const clean = sanitizePins(patch.pins);
      for (const w of ['sfx', 'presets', 'flow']) if (Array.isArray(patch.pins[w])) settings.pins[w] = clean[w].slice(0, WHEELS[w].max);
    }
    saveSettings();
    if (settings.enabled) {
      if (hook && hook.native && nativeDriver && nativeDriver.alive) nativeDriver.configure(true, driverBindings());
      else startHook();
    } else stopHook();
    broadcastDaggerSettings();
    return view();
  });
  // Pin / unpin one item on the sfx or presets wheel. Returns the new view. Toggles when `on` is omitted.
  ipcMain.handle('azy:dagger:pin', (event, wheel, item, on) => {
    if (wheel === 'sfx' && item && typeof item.path === 'string') {
      const has = settings.pins.sfx.some((p) => p.path === item.path);
      const want = typeof on === 'boolean' ? on : !has;
      if (want && !has) {
        if (settings.pins.sfx.length >= WHEELS.sfx.max) return { ...view(), error: `The SFX wheel holds ${WHEELS.sfx.max} sounds — unpin one first` };
        settings.pins.sfx.push({ path: item.path, name: String(item.name || path.basename(item.path)) });
      } else if (!want && has) settings.pins.sfx = settings.pins.sfx.filter((p) => p.path !== item.path);
    } else if (wheel === 'presets' && item && typeof item.id === 'string') {
      const has = settings.pins.presets.some((p) => p.id === item.id);
      const want = typeof on === 'boolean' ? on : !has;
      if (want && !has) {
        if (settings.pins.presets.length >= WHEELS.presets.max) return { ...view(), error: `The Presets wheel holds ${WHEELS.presets.max} presets — unpin one first` };
        settings.pins.presets.push({ id: item.id, name: String(item.name || item.id), ...(typeof item.bin === 'string' ? { bin: item.bin.slice(0, 400) } : {}) });
      } else if (!want && has) settings.pins.presets = settings.pins.presets.filter((p) => p.id !== item.id);
    } else if (wheel === 'flow' && item && typeof item.id === 'string') {
      const has = settings.pins.flow.some((p) => p.id === item.id);
      const want = typeof on === 'boolean' ? on : !has;
      if (want && !has) {
        if (settings.pins.flow.length >= WHEELS.flow.max) return { ...view(), error: `The Flow wheel holds ${WHEELS.flow.max} presets — unpin one first` };
        settings.pins.flow.push({ id: item.id, name: String(item.name || item.id), easing: easingOf(item) });
      } else if (!want && has) settings.pins.flow = settings.pins.flow.filter((p) => p.id !== item.id);
      else if (want && has) { const p = settings.pins.flow.find((x) => x.id === item.id); if (p && item.easing) p.easing = easingOf(item); } // re-pin = refresh the preview after an edit
    } else return { ...view(), error: 'nothing to pin' };
    saveSettings();
    for (const wc of ctx.getWindows()) { try { wc.send('azy:dagger:evt:settings', view()); } catch { /* closing */ } }
    return view();
  });
  // Export: a portable JSON file (schema + version) of the pinned references and their order.
  ipcMain.handle('azy:dagger:pinsExport', async () => {
    const win = ctx.getMainWindow ? ctx.getMainWindow() : null;
    const r = await ctx.dialog.showSaveDialog(win, { title: 'Export Dagger pins', defaultPath: path.join(ctx.app.getPath('documents'), 'Azy Dagger pins.json'), filters: [{ name: 'Azy pins', extensions: ['json'] }] });
    if (r.canceled || !r.filePath) return null;
    const doc = pinsDocument();
    const tmp = r.filePath + '.tmp';
    try { await fs.promises.writeFile(tmp, JSON.stringify(doc, null, 2)); await fs.promises.rename(tmp, r.filePath); }
    catch (err) { try { await fs.promises.unlink(tmp); } catch { /* none */ } throw new Error('Could not write the pins file: ' + (err && err.message || err)); }
    return { file: r.filePath, counts: { sfx: doc.pins.sfx.length, presets: doc.pins.presets.length, flow: doc.pins.flow.length } };
  });
  // Import step 1: pick + validate + preview. Nothing changes until step 2 confirms a mode.
  ipcMain.handle('azy:dagger:pinsImportPick', async () => {
    const win = ctx.getMainWindow ? ctx.getMainWindow() : null;
    const r = await ctx.dialog.showOpenDialog(win, { title: 'Import Dagger pins', filters: [{ name: 'Azy pins', extensions: ['json'] }], properties: ['openFile'] });
    if (r.canceled || !r.filePaths || !r.filePaths[0]) return null;
    const file = r.filePaths[0];
    const st = await fs.promises.stat(file);
    if (st.size > 1024 * 1024) throw new Error('That file is too large to be a pins export.');
    const parsed = parsePinsDocument(await fs.promises.readFile(file, 'utf8'));
    const token = crypto.randomBytes(8).toString('hex');
    pendingImport = { token, file, ...parsed };
    return { token, file: path.basename(file), version: parsed.version, newer: parsed.newer, merge: planImport(parsed.pins, 'merge').report, replace: planImport(parsed.pins, 'replace').report };
  });
  // Import step 2: apply with an explicit 'merge' | 'replace'. On any failure the current pins stay.
  ipcMain.handle('azy:dagger:pinsImportApply', async (event, token, mode) => {
    if (!pendingImport || pendingImport.token !== token) throw new Error('This import expired — choose the file again.');
    if (mode !== 'merge' && mode !== 'replace') throw new Error('Choose Merge or Replace.');
    const plan = planImport(pendingImport.pins, mode);
    const before = settings.pins;
    settings.pins = plan.pins;
    try { saveSettings(true); }
    catch (err) { settings.pins = before; throw new Error('Could not save the imported pins — your current pins are unchanged. ' + (err && err.message || '')); }
    pendingImport = null;
    broadcastPins();
    return { ...view(), report: plan.report, mode };
  });
  ipcMain.handle('azy:dagger:pinsImportCancel', () => { pendingImport = null; return true; });
  // Preview from Settings: on Windows use the same direct companion as a real hold, so the
  // user sees the actual physical centring/hide path rather than a visual-only imitation.
  ipcMain.handle('azy:dagger:preview', (event, wheel) => {
    if (process.platform === 'win32' && nativeDriver && nativeDriver.ready) {
      const driver = nativeDriver;
      const token = ++nativePreviewToken;
      armPendingNativePreview(token, driver, wheel);
      if (driver.preview(wheel)) return true;
      clearPendingNativePreview();
    }
    const d = ctx.screen.getPrimaryDisplay().workArea;
    openWheel(d.x + d.width / 2, d.y + d.height / 2, wheel);
    setTimeout(() => closeWheel(false), 2000);
    return true;
  });
  // The wheel renderer reports its own hover when the hook can't (tests / no native hook).
  ipcMain.handle('azy:dagger:hover', (event, id) => { hover = items.some((s) => s.id === id) ? id : null; return hover; });
  // The wheel window asks on boot: if a wheel is already open (first show races the page load),
  // it gets the open payload back and paints immediately.
  ipcMain.handle('azy:dagger:state', () => (open ? { wheel: WHEELS[open], sections: items, hover } : null));
  if (!ctx.globalShortcut) return; // headless / tests: no hook
  // Start the tiny native guard before the first workspace window is created. Waiting for a
  // post-paint timer left a brief launch window where Ctrl + right-click could reach Premiere.
  // Only the helper stays resident; the much larger radial Chromium renderer remains lazy.
  startHook();
}
function shutdown() {
  if (relinkListener) { process.removeListener('azy:preset-relink', relinkListener); relinkListener = null; }
  if (actionPopups) actionPopups.shutdown();
  actionPopups = null;
  keepWheelRenderer();
  stopHook();
  // Usually stopped above through hook.native; retain this guard for a partial startup/quit race.
  if (nativeDriver) stopNativeDaggerHelper();
  if (win && !win.isDestroyed()) win.destroy();
  win = null;
}

module.exports = { init, shutdown, SECTIONS, WHEELS, __activateSection: activateSection, __relinkPresetPin: relinkPresetPin, __settings: () => settings };
