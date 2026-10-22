// ---------- Presets: main-process side ----------
// Premiere Pro presets inside Azy. Two sources feed one grid:
//   1. .prfpset files in folders the user pins (indexed + watched by the engine)
//   2. presets that already live inside Premiere (its profile's "Effect Presets and
//      Custom Items.prfpset") — of which only the ones the user has starred are shown.
//
// Everything Premiere-specific (the loopback bridge, pairing, applying) lives in the
// engine bundle; this file only plugs it into Azy's existing conventions: JSON state
// under userData, ipcMain.handle channels, and one BrowserWindow to push events to.
//
// The runtime is started lazily, on the renderer's first `azy:presets:boot` call, so
// nothing here runs (no port is opened, no folder is scanned) until the panel is
// actually on screen. It also means the test harness, which never boots a renderer,
// never starts a server.

const path = require('path');
const fs = require('fs');

let engine = null; // require()d on first boot — it is half a megabyte
let runtime = null;
let booting = null;
let unregister = null;
let panelHost = null;

function loadEngine() {
  if (!engine) engine = require('./engine.js');
  return engine;
}

// Favorites are keyed by preset id. For presets that live inside Premiere the id is
// "<source>#<index>", and Premiere is free to reorder that file when the user adds or
// deletes a preset in the Effects panel. So alongside the flag we remember the name and
// bin the star was put on, and after every reload we move any star whose slot now holds
// a different preset back to the one it was meant for. Nothing else about the preset is
// copied — the file stays the single source of truth.
function relinkPremiereFavorites(rt) {
  const { PremierePresetsSource } = loadEngine();
  const meta = rt.library.meta;
  for (const id of meta.favorites()) {
    if (!PremierePresetsSource.isPremiereId(id)) continue;
    const want = meta.get(id) && meta.get(id).fp;
    if (!want || !want.name) continue;
    const now = rt.premierePresets.get(id);
    const wantBin = want.bin || '';
    if (now && now.name === want.name && now.binPath.join('/') === wantBin) continue;
    const sourceId = id.slice(0, id.indexOf('#'));
    const match = rt.premierePresets
      .search(want.name, sourceId, 5000)
      .find((p) => p.name === want.name && p.binPath.join('/') === wantBin);
    if (match && match.id !== id) {
      meta.setFavorite(id, false);
      meta.setFavorite(match.id, true, { name: match.name, bin: wantBin });
    } else if (!match && !now) {
      // The preset is gone from Premiere. Keep the star — it comes back if the user
      // re-creates the preset under the same name, and it costs one line of JSON.
    }
  }
}

async function boot(ctx) {
  const { app, ipcMain, shell, getWindows } = ctx;
  const { createPresetsRuntime, registerPresetIpc, Logger, PremierePresetsSource } = loadEngine();

  const dataDir = path.join(app.getPath('userData'), 'presets');
  fs.mkdirSync(dataDir, { recursive: true });
  const logger = new Logger({ level: 'info', filePath: path.join(dataDir, 'presets.log') });

  runtime = await createPresetsRuntime({
    dataDir,
    azyVersion: app.getVersion ? app.getVersion() : '1.0.0',
    logger,
    devPairingCode: process.env.AZY_PAIR_CODE || undefined,
    // Azy manages its own Premiere module (the CEP extension = Azy inside Premiere) from the files shipped here.
    moduleBundleDir: __dirname,
    // The Premiere panel announces its reverse-link port here (same folder as panel.json).
    reverseBridgeDir: path.join(app.getPath('userData'), 'bridge'),
    autoInstallModules: process.env.AZY_NO_MODULE_INSTALL ? false : undefined
  });
  // Selected = native highlight detection via the Delete/Ctrl+Z probe (flow-selected.js);
  // every other unsupported scope still fails closed before any host request.
  require('./flow-scope-policy').guardFlowScopes(runtime.flow, {
    probe: () => require('./flow-selected').run({
      server: runtime.server,
      log: (lvl, msg) => logger.log(lvl, 'selected', msg)
    })
  });
  // Move Selected Keyframes → playhead (Start/End anchor). Detection reuses the same probe;
  // the connector computes ONE offset from the fresh playhead read and the host applies the
  // whole group in a single undoable call. Registered here (not in the engine bundle) because
  // the probe needs the OS keystroke sender that lives on this side of the bridge.
  ipcMain.removeHandler('azy:presets:flow:move');
  ipcMain.handle('azy:presets:flow:move', async (_e, mode) => moveFlow(mode));
  if (process.env.AZY_PAIR_CODE) runtime.server.beginPairing();

  // Files pinned as .prfpset folders and stars on Premiere presets go through the
  // engine's own stores (userData/presets/…); the ids are the only thing persisted
  // for Premiere presets, plus the name/bin fingerprint used to re-link them.
  // Azy inside Premiere: the panel WebView is just another window the engine
  // broadcasts to. Installed before the IPC handlers so it captures all of them.
  const { installPanelHost } = require('./panel-host');
  panelHost = installPanelHost(runtime, { dataDir: app.getPath('userData'), log: (lvl, msg) => logger.log(lvl, 'panel', msg) });
  const windowsAndPanel = () => [...getWindows(), ...panelHost.targets()];

  unregister = registerPresetIpc(ipcMain, runtime, windowsAndPanel, {
    revealItemInFolder: (p) => shell.showItemInFolder(p),
    trashItem: (p) => shell.trashItem(p)
  });

  // The engine's setFavorite stores the bare flag; wrap the Premiere case so the
  // fingerprint goes in with it. Same channel, so the renderer never knows.
  const CH = 'azy:presets:ppro:setFavorite';
  ipcMain.removeHandler(CH);
  ipcMain.handle(CH, (event, id, favorite) => {
    const view = runtime.premierePresets.get(id);
    runtime.library.meta.setFavorite(
      id,
      !!favorite,
      view ? { name: view.name, bin: view.binPath.join('/') } : undefined
    );
    return runtime.premierePresets.get(id);
  });

  // Only the starred Premiere presets, resolved live against Premiere's file.
  ipcMain.handle('azy:presets:ppro:favorites', () => {
    const out = [];
    for (const id of runtime.library.meta.favorites()) {
      if (!PremierePresetsSource.isPremiereId(id)) continue;
      const v = runtime.premierePresets.get(id);
      if (v) out.push(v);
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  });

  // v1.20: local copies of favourite + Dagger-pinned presets (used only when the original is gone).
  const daggerPresetPins = () => {
    try { const s = require('./dagger-main').__settings(); return s && s.pins && Array.isArray(s.pins.presets) ? s.pins.presets : []; } catch { return []; }
  };
  let identity = null; // v1.21, created just below (late-bound for the copy check)
  const localPresets = require('./local-presets').attachLocalPresets(runtime, dataDir, () => daggerPresetPins().map((p) => p.id),
    (lvl, msg) => logger.log(lvl, 'local', msg),
    (id, view) => { const e = identity && identity.expectationFor(id); return !e || e.name === view.name; });
  // v1.21: stable preset identity — every apply is checked against the preset the user picked
  // (Premiere preset ids are positions in Premiere's file and shift when that file changes).
  const { createPresetIdentity, guardApplyChannels } = require('./preset-identity');
  identity = createPresetIdentity(runtime, {
    pins: daggerPresetPins,
    relink: (from, to, name) => {
      const m = runtime.library.meta;
      if (m.isFavorite && m.isFavorite(from)) { const fp = (m.get(from) || {}).fp; m.setFavorite(from, false); m.setFavorite(to, true, fp || { name }); }
      process.emit('azy:preset-relink', { from, to, name });
    },
    savedName: (id) => { const c = localPresets.store.get(id); return c ? c.name : null; },
    log: (lvl, msg) => logger.log(lvl, 'identity', msg)
  });
  guardApplyChannels(ipcMain, runtime, identity);
  runtime.premierePresets.on('change', () => { try { identity.relinkPins(); } catch (err) { logger.log('warn', 'identity', `pin relink failed: ${err.message}`); } });
  identity.relinkPins();
  process.removeAllListeners('azy:dagger-pins-changed');
  process.on('azy:dagger-pins-changed', () => localPresets.schedule());
  runtime.premierePresets.on('change', () => localPresets.schedule(800));
  localPresets.schedule(1500);

  runtime.premierePresets.on('change', () => {
    try {
      relinkPremiereFavorites(runtime);
    } catch (err) {
      logger.log('warn', 'presets', `relink failed: ${err.message}`);
    }
  });
  relinkPremiereFavorites(runtime);

  logger.log('info', 'presets', `ready — bridge on port ${runtime.server.port}`);
  return {
    port: runtime.server.port,
    dataDir,
    connectorDir: path.join(__dirname, 'connector')
  };
}

// Wire the feature into main.js. Called once at startup; nothing heavy happens here.
function init(ctx) {
  const { ipcMain, dialog, getWindows } = ctx;
  // Azy inside Premiere: record every handler so the panel host can call the same table over HTTP.
  require('./panel-host').captureHandlers(ipcMain);
  const mainWin = () => (getWindows()[0] ? ctx.getMainWindow() : null);

  ipcMain.handle('azy:presets:uiSettings', () => ctx.getSettings ? ctx.getSettings() : { uiTheme: 'mono', welcomed: true });
  ipcMain.handle('azy:presets:setTheme', (_event, theme) => {
    if (!['noir', 'crimson', 'dark-red', 'deep-purple', 'indigo', 'dark-blue', 'dark-cyan', 'dark-emerald', 'dark-magenta', 'dark-orange', 'graphite', 'midnight', 'obsidian', 'void', 'panels'].includes(theme)) throw new Error('Invalid colour theme');
    return ctx.updatePrefs ? ctx.updatePrefs({ uiTheme: theme }) : { uiTheme: theme, welcomed: true };
  });
  // Theme-engine dials from the hosted Premiere panel (main.js validates every value again).
  ipcMain.handle('azy:presets:setUiPrefs', (_event, patch) => {
    const p = patch && typeof patch === 'object' ? patch : {};
    const safe = {};
    for (const k of ['uiSpeedHold', 'uiCustomThemes', 'uiTheme', 'uiPerf', 'uiMotion', 'uiWebs', 'uiCharacters', 'uiSkin', 'uiGlow', 'uiWebOpacity', 'uiWebDensity', 'uiRadius', 'uiGlass', 'uiAnimSpeed', 'uiScale']) if (p[k] !== undefined) safe[k] = p[k];
    return ctx.updatePrefs ? ctx.updatePrefs(safe) : safe;
  });

  ipcMain.handle('azy:presets:boot', async () => {
    if (runtime) return { port: runtime.server.port };
    if (!booting) {
      booting = boot(ctx).catch((err) => {
        booting = null;
        throw err;
      });
    }
    return booting;
  });

  // Same dialog the file side uses for "Pin folder", so it feels like the same button.
  ipcMain.handle('azy:presets:pickFolder', async () => {
    const result = await dialog.showOpenDialog(mainWin(), {
      title: 'Pin a folder of .prfpset files',
      properties: ['openDirectory']
    });
    return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0];
  });

  ipcMain.handle('azy:presets:pickPremiereFile', async () => {
    const result = await dialog.showOpenDialog(mainWin(), {
      title: 'Locate "Effect Presets and Custom Items.prfpset"',
      defaultPath: path.join(ctx.app.getPath('documents'), 'Adobe', 'Premiere Pro'),
      filters: [{ name: 'Premiere presets', extensions: ['prfpset'] }],
      properties: ['openFile']
    });
    return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0];
  });

  ipcMain.handle('azy:presets:connectorDir', () => path.join(__dirname, 'connector'));

  initSnapAction(ctx);
  initSpeedWindow(ctx);
  initWindowShortcut(ctx);
  initFlowMoveShortcut(ctx);
  // Dagger wheel (Ctrl + right mouse): routes to the sections above; owns nothing else.
  ctx.invoke = (ch, ...args) => require('./panel-host').invokeHandler(ch, ...args).catch((err) => console.warn(`[dagger] ${ch}: ${err.message}`));
  ctx.invokeStrict = (ch, ...args) => require('./panel-host').invokeHandler(ch, ...args);
  require('./dagger-main').init(ctx);

  // Snap Action's hotkey is gated on Premiere's selection, and the engine is the only
  // thing that knows it — so the engine starts shortly after launch instead of waiting
  // for the Presets tab to be opened. Deferred a little so it never competes with the
  // first paint of the main window.
  if (!ctx.globalShortcut) return; // no hotkey (tests / headless) → keep the lazy boot
  setTimeout(() => {
    if (!runtime && !booting) {
      booting = boot(ctx).catch((err) => {
        booting = null;
        console.warn(`[presets] engine boot failed: ${err.message}`);
      });
    }
  }, 1500).unref();
}

// ---------- Snap Action ----------
// A second, small BrowserWindow (presets/snap.html) that pops up on Shift+Space over
// Premiere: search Premiere's own effects and presets, star them, apply to the selected
// clips with Enter. Same preload as the main window, so it talks to the same engine
// runtime through the same channels — the engine is booted on demand if the main
// panel hasn't done it yet. The window is created once and hidden/shown after that,
// so the shortcut feels instant. It hides itself on blur unless pinned.

const SNAP_DEFAULT_SHORTCUT = 'Shift+Space';
const SNAP_DEFAULTS = { shortcut: SNAP_DEFAULT_SHORTCUT, requireSelection: true, hideAfterApply: true };
let snapWin = null;
let snapPinned = false;
let snapSettings = { ...SNAP_DEFAULTS };
let snapRegistered = null; // accelerator currently held with globalShortcut, or null
let snapCtx = null;
// Native opacity stays at zero until Snap's renderer has committed a pre-roll
// frame and started its compact entrance. Tokens make rapid hide/reopen events
// idempotent: an old acknowledgement can never reveal a newer opening.
let snapRevealSequence = 0;
// Separate from individual acknowledgement tokens: this invalidates an entire
// hidden→visible attempt as soon as Snap hides or a newer attempt begins. Without
// it, a cancelled opening could resume after its timeout/pause and restore alpha
// on a just-created newer opening.
let snapOpeningSequence = 0;
const snapRevealWaiters = new Map();
const SNAP_REVEAL_ACK_TIMEOUT_MS = 1200;
const SNAP_REVEAL_PREROLL_MS = 16;

function snapSettingsFile(ctx) {
  return path.join(ctx.app.getPath('userData'), 'presets', 'snap-settings.json');
}

function loadSnapSettings(ctx) {
  try {
    const raw = JSON.parse(fs.readFileSync(snapSettingsFile(ctx), 'utf8'));
    snapSettings = { ...SNAP_DEFAULTS, ...raw };
  } catch {
    snapSettings = { ...SNAP_DEFAULTS };
  }
  if (typeof snapSettings.shortcut !== 'string' || !snapSettings.shortcut.trim()) snapSettings.shortcut = SNAP_DEFAULT_SHORTCUT;
}

function saveSnapSettings(ctx) {
  try {
    const f = snapSettingsFile(ctx);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify(snapSettings, null, 2));
  } catch (err) {
    console.warn(`[presets] cannot save snap settings: ${err.message}`);
  }
}

function snapSettingsView() {
  return { ...snapSettings, registered: snapRegistered === snapSettings.shortcut };
}

function snapBounds(ctx) {
  const { screen } = ctx;
  const cursor = screen.getCursorScreenPoint();
  const disp = screen.getDisplayNearestPoint(cursor).workArea;
  const width = Math.min(760, disp.width - 40);
  const height = Math.min(560, disp.height - 40);
  return {
    x: Math.round(disp.x + (disp.width - width) / 2),
    y: Math.round(disp.y + disp.height * 0.18),
    width,
    height
  };
}

// A hidden BrowserWindow still costs a whole renderer process (~45 MB). The Snap and Speed
// windows are used in short bursts, so once one has been hidden for a while it is destroyed
// and rebuilt on the next shortcut — the entrance animation covers the ~150 ms load.
// A hidden Chromium popup keeps a full renderer process resident. Snap and Speed are transient
// tools, so retire them after 15 seconds hidden; their small entrance animation covers a cold
// reload the next time while Azy's idle footprint stays within the desktop budget.
const IDLE_WINDOW_MS = 15 * 1000;
const idleTimers = new Map(); // name -> timer
function releaseWhenIdle(name, getWin, clear) {
  clearTimeout(idleTimers.get(name));
  idleTimers.set(name, setTimeout(() => {
    const w = getWin();
    if (w && !w.isDestroyed() && !w.isVisible()) { try { w.destroy(); } catch { /* gone */ } clear(); }
  }, IDLE_WINDOW_MS));
}
function keepAlive(name) { clearTimeout(idleTimers.get(name)); }

function ensureSnapWindow(ctx) {
  const { BrowserWindow } = ctx;
  if (snapWin && !snapWin.isDestroyed()) return snapWin;
  const b = snapBounds(ctx);
  snapWin = new BrowserWindow({
    ...b,
    minWidth: 420,
    minHeight: 260,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    // Glass: the renderer paints a 70% tint (30% see-through). Electron 31 cannot user-resize
    // a transparent frameless window on Windows (fixed upstream only in v40.8.3), so Snap draws
    // its own edge grips and resizes through azy:presets:snapResize below.
    transparent: true,
    backgroundColor: '#00000000',
    roundedCorners: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    autoHideMenuBar: true,
    title: 'Snap Action',
    icon: ctx.appIcon,
    webPreferences: {
      defaultFontFamily: { standard: 'Segoe UI', sansSerif: 'Segoe UI', serif: 'Segoe UI', monospace: 'Consolas' },
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Snap gets real compositor frames while native opacity is zero during
      // the reveal handshake. Without this, Chromium may defer its first
      // animation frame until after the native surface has appeared.
      backgroundThrottling: false
    }
  });
  snapWin.setMenuBarVisibility(false);
  // Float above Premiere's full-screen-ish windows too.
  snapWin.setAlwaysOnTop(true, 'floating');
  snapWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  snapWin.loadFile(path.join(__dirname, 'snap.html'));
  snapWin.on('blur', () => {
    if (!snapPinned && snapWin && !snapWin.isDestroyed()) snapWin.hide();
  });
  snapWin.on('closed', () => {
    snapOpeningSequence++;
    cancelSnapReveal(snapWin);
    snapWin = null;
  });
  snapWin.on('hide', () => {
    // Invalidate the whole opening, not merely its current token. A cancelled
    // promise has a short native hand-off after it resolves; it must never make
    // a newer reopening opaque.
    snapOpeningSequence++;
    cancelSnapReveal(snapWin);
    releaseWhenIdle('snap', () => snapWin, () => { snapWin = null; });
  });
  snapWin.on('show', () => keepAlive('snap'));
  return snapWin;
}

// Premiere's last pushed state, as the engine knows it. Used to gate the hotkey.
function premiereSelectionCount() {
  const st = runtime && runtime.connector && runtime.connector.status;
  return st && st.phase === 'connected' && st.premiereState ? st.premiereState.selectionCount || 0 : 0;
}

// Send an event to a window that may still be loading (just rebuilt after idle
// release). Resolving this promise lets the native reveal coordinator wait for
// delivery without assuming a newly-created WebContents has already run its UI.
function sendWhenReady(win, ch, payload) {
  return new Promise((resolve) => {
    const wc = win && win.webContents;
    const send = () => {
      try {
        if (wc && (typeof wc.isDestroyed !== 'function' || !wc.isDestroyed())) wc.send(ch, payload);
      } catch {
        /* a window can disappear between readiness and send */
      }
      resolve();
    };
    try {
      if (wc && typeof wc.isLoading === 'function' && wc.isLoading() && typeof wc.once === 'function') wc.once('did-finish-load', send);
      else send();
    } catch {
      send();
    }
  });
}

function finishSnapReveal(token) {
  const waiting = snapRevealWaiters.get(String(token || ''));
  if (!waiting) return;
  snapRevealWaiters.delete(waiting.token);
  clearTimeout(waiting.timer);
  waiting.resolve();
}

function cancelSnapReveal(win) {
  for (const waiting of Array.from(snapRevealWaiters.values())) {
    if (!win || waiting.win === win) finishSnapReveal(waiting.token);
  }
}

function requestSnapReveal(win) {
  // The tests and older lightweight BrowserWindow hosts don't implement native
  // opacity. They still receive snapShown, but there is no native surface to
  // coordinate and waiting for an acknowledgement would only delay their UI.
  if (!win || typeof win.setOpacity !== 'function') {
    return sendWhenReady(win, 'azy:presets:evt:snapShown', { legacy: true });
  }
  cancelSnapReveal(win);
  const token = `snap_${++snapRevealSequence}_${Date.now().toString(36)}`;
  return new Promise((resolve) => {
    const timer = setTimeout(() => finishSnapReveal(token), SNAP_REVEAL_ACK_TIMEOUT_MS);
    if (timer.unref) timer.unref();
    snapRevealWaiters.set(token, { token, win, timer, resolve });
    // snap-renderer removes any completed/partial class, commits snap-preroll,
    // starts snap-enter, and acknowledges only after the start has painted.
    void sendWhenReady(win, 'azy:presets:evt:snapShown', { token, phase: 'preroll' });
  });
}

function showSnapInactive(win) {
  try {
    if (typeof win.showInactive === 'function') win.showInactive();
    else win.show();
  } catch {
    try { win.show(); } catch { /* window closing */ }
  }
}

async function showSnap(ctx) {
  const win = ensureSnapWindow(ctx);
  // A request while Snap is already open should bring it forward but never
  // restart its entry class halfway through. This is the other half of stable
  // rapid reopening: visibility is idempotent, hidden→visible is animated once.
  if (win.isVisible()) {
    try { win.focus(); } catch { /* closing */ }
    return { shown: true, animated: false };
  }
  const opening = ++snapOpeningSequence;
  try { win.setBounds(snapBounds(ctx)); } catch { /* host may reject bounds while loading */ }
  const nativeReveal = typeof win.setOpacity === 'function';
  if (nativeReveal) {
    try { win.setOpacity(0); } catch { /* CSS still guards non-Windows hosts */ }
  }
  // Show the native surface while it remains fully transparent. Background
  // throttling is disabled on this small window, so the renderer can commit its
  // pre-roll frame before the user has any visible pixels to judge.
  showSnapInactive(win);
  // Take keyboard focus while the native surface is still transparent. Snap is
  // deliberately keyboard-first, so the first query keystroke must not race the
  // final alpha hand-off; opacity keeps this focus transfer invisible.
  try { win.focus(); } catch { /* closing */ }
  await requestSnapReveal(win);
  if (opening !== snapOpeningSequence) return { shown: false, canceled: true };
  await new Promise((resolve) => setTimeout(resolve, SNAP_REVEAL_PREROLL_MS));
  if (opening !== snapOpeningSequence || win.isDestroyed() || !win.isVisible()) return { shown: false, canceled: true };
  if (nativeReveal) {
    try { win.setOpacity(1); } catch { /* CSS keeps the frame coherent */ }
  }
  try { win.focus(); } catch { /* closing */ }
  return { shown: true, animated: nativeReveal };
}

// opts.force: opened from the Snap tab's button — skip the selection gate.
// The hotkey itself is a globalShortcut, so it fires no matter which app has focus or
// whether Azy is minimized; requireSelection is the only thing that can swallow it.
async function toggleSnap(ctx, opts) {
  const force = !!(opts && opts.force);
  const existing = snapWin && !snapWin.isDestroyed() ? snapWin : null;
  if (existing && existing.isVisible() && existing.isFocused()) {
    existing.hide();
    return { shown: false };
  }
  if (!force && snapSettings.requireSelection) {
    if (!runtime) {
      // Do not allocate a hidden BrowserWindow merely because the first shortcut was pressed
      // before the engine knew Premiere's selection. Boot, then let the next press open it.
      boot(ctx).catch(() => {});
      return { shown: false, reason: 'booting' };
    }
    if (premiereSelectionCount() === 0) return { shown: false, reason: 'no-selection' };
  }
  return showSnap(ctx);
}

function registerSnapShortcut(ctx, accel) {
  const { globalShortcut } = ctx;
  if (snapRegistered) {
    try {
      globalShortcut.unregister(snapRegistered);
    } catch {
      /* ignore */
    }
    snapRegistered = null;
  }
  let ok = false;
  try {
    ok = globalShortcut.register(accel, () => { void toggleSnap(ctx).catch(() => {}); });
  } catch (err) {
    console.warn(`[presets] invalid accelerator "${accel}": ${err.message}`);
  }
  if (ok) snapRegistered = accel;
  else console.warn(`[presets] could not register ${accel} for Snap Action`);
  return ok;
}

function broadcastSnapSettings(ctx) {
  for (const wc of ctx.getWindows()) {
    try {
      wc.send('azy:presets:evt:snapSettings', snapSettingsView());
    } catch {
      /* closing */
    }
  }
}

function initSnapAction(ctx) {
  const { app, ipcMain, globalShortcut } = ctx;
  if (!globalShortcut) return;
  snapCtx = ctx;
  // Only the active Snap WebContents can acknowledge this private visual
  // handshake. A random all-in-one renderer must never be able to reveal it.
  if (typeof ipcMain.on === 'function') {
    ipcMain.on('azy:presets:snapRevealReady', (event, token) => {
      const waiting = snapRevealWaiters.get(String(token || ''));
      if (!waiting || !event || event.sender !== waiting.win.webContents) return;
      finishSnapReveal(waiting.token);
    });
  }
  loadSnapSettings(ctx);

  ipcMain.handle('azy:presets:snapHide', () => {
    if (snapWin && !snapWin.isDestroyed()) snapWin.hide();
  });
  // Edge-grip resizing for the transparent Snap window. 'start' snapshots the bounds; every
  // 'move' is applied relative to that snapshot, so lost/merged pointer events never drift.
  let snapResizeFrom = null;
  const SNAP_MIN_W = 420, SNAP_MIN_H = 260;
  ipcMain.handle('azy:presets:snapResize', (event, msg) => {
    if (!snapWin || snapWin.isDestroyed() || !msg || event.sender !== snapWin.webContents) return null;
    if (msg.phase === 'start') { snapResizeFrom = snapWin.getBounds(); return snapResizeFrom; }
    if (msg.phase === 'end') { snapResizeFrom = null; return snapWin.getBounds(); }
    const from = snapResizeFrom;
    const edge = String(msg.edge || '');
    const dx = Math.round(Number(msg.dx) || 0), dy = Math.round(Number(msg.dy) || 0);
    if (!from || !/^(n|s|e|w|ne|nw|se|sw)$/.test(edge)) return null;
    let { x, y, width, height } = from;
    if (edge.includes('e')) width = Math.max(SNAP_MIN_W, from.width + dx);
    if (edge.includes('s')) height = Math.max(SNAP_MIN_H, from.height + dy);
    if (edge.includes('w')) { width = Math.max(SNAP_MIN_W, from.width - dx); x = from.x + from.width - width; }
    if (edge.includes('n')) { height = Math.max(SNAP_MIN_H, from.height - dy); y = from.y + from.height - height; }
    snapWin.setBounds({ x, y, width, height });
    return { x, y, width, height };
  });
  ipcMain.handle('azy:presets:snapPin', (event, pinned) => {
    if (typeof pinned === 'boolean') snapPinned = pinned;
    return snapPinned;
  });
  ipcMain.handle('azy:presets:snapShowMain', () => {
    const main = ctx.getMainWindow();
    if (main) {
      if (main.isMinimized()) main.restore();
      main.show();
      main.focus();
    }
  });
  ipcMain.handle('azy:presets:snapToggle', (event, opts) => toggleSnap(ctx, opts));
  ipcMain.handle('azy:presets:snapGetSettings', () => snapSettingsView());
  ipcMain.handle('azy:presets:snapSetSettings', (event, patch) => {
    patch = patch && typeof patch === 'object' ? patch : {};
    if (typeof patch.requireSelection === 'boolean') snapSettings.requireSelection = patch.requireSelection;
    if (typeof patch.hideAfterApply === 'boolean') snapSettings.hideAfterApply = patch.hideAfterApply;
    if (typeof patch.shortcut === 'string' && patch.shortcut.trim()) {
      const next = patch.shortcut.trim();
      if (next !== snapSettings.shortcut) {
        const prev = snapSettings.shortcut;
        snapSettings.shortcut = next;
        if (!registerSnapShortcut(ctx, next)) {
          // Keep the old one working rather than leaving the user with no hotkey.
          registerSnapShortcut(ctx, prev);
          snapSettings.shortcut = next; // remember the wish; view reports registered:false
        }
      }
    }
    saveSnapSettings(ctx);
    broadcastSnapSettings(ctx);
    return snapSettingsView();
  });

  registerSnapShortcut(ctx, snapSettings.shortcut);
  app.on('will-quit', () => globalShortcut.unregisterAll());

  // Events the engine broadcasts go to every window the main process knows about;
  // make sure the Snap window is one of them.
  const prevGetWindows = ctx.getWindows;
  ctx.getWindows = () => {
    const list = prevGetWindows();
    if (snapWin && !snapWin.isDestroyed()) list.push(snapWin.webContents);
    if (panelHost) list.push(...panelHost.targets());
    return list;
  };
}

// ── Azy Speed window ──────────────────────────────────────────────────────────
// A small always-on-top BrowserWindow (presets/speed.html) that opens on Shift+Alt+S
// over Premiere when clips are selected. It reads the keyframes of the selected clips
// (In/Out-aware), takes the FIRST and LAST as the animation's boundaries and asks the Azy
// Speed Engine (Flow, dozens-of-keyframes) to regenerate everything between them at the
// chosen speed. Same preload/engine/channels as the rest of Azy.

const SPEED_DEFAULT_SHORTCUT = 'Shift+Alt+S';
const SPEED_DEFAULTS = { shortcut: SPEED_DEFAULT_SHORTCUT, requireSelection: true };
let speedWin = null;
let speedSettings = { ...SPEED_DEFAULTS };
let speedRegistered = null;

function speedSettingsFile(ctx) {
  return path.join(ctx.app.getPath('userData'), 'presets', 'speed-settings.json');
}
function loadSpeedSettings(ctx) {
  try {
    speedSettings = { ...SPEED_DEFAULTS, ...JSON.parse(fs.readFileSync(speedSettingsFile(ctx), 'utf8')) };
  } catch {
    speedSettings = { ...SPEED_DEFAULTS };
  }
  if (typeof speedSettings.shortcut !== 'string' || !speedSettings.shortcut.trim()) speedSettings.shortcut = SPEED_DEFAULT_SHORTCUT;
}
function saveSpeedSettings(ctx) {
  try {
    const f = speedSettingsFile(ctx);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify(speedSettings, null, 2));
  } catch (err) {
    console.warn(`[presets] cannot save speed settings: ${err.message}`);
  }
}
function speedSettingsView() {
  return { ...speedSettings, registered: speedRegistered === speedSettings.shortcut };
}
let speedCompactSaved = null; // full-card bounds while the window is shrunk to its pill
function speedBounds(ctx) {
  const { screen } = ctx;
  const cursor = screen.getCursorScreenPoint();
  const disp = screen.getDisplayNearestPoint(cursor).workArea;
  const width = 486, height = 432;
  return {
    x: Math.round(disp.x + (disp.width - width) / 2),
    y: Math.round(disp.y + disp.height * 0.3),
    width,
    height
  };
}
function ensureSpeedWindow(ctx) {
  const { BrowserWindow } = ctx;
  if (speedWin && !speedWin.isDestroyed()) return speedWin;
  speedWin = new BrowserWindow({
    ...speedBounds(ctx),
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    transparent: true,
    roundedCorners: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    autoHideMenuBar: true,
    title: 'Azy Speed',
    icon: ctx.appIcon,
    webPreferences: {
      defaultFontFamily: { standard: 'Segoe UI', sansSerif: 'Segoe UI', serif: 'Segoe UI', monospace: 'Consolas' },
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  speedWin.setMenuBarVisibility(false);
  speedWin.setAlwaysOnTop(true, 'floating');
  speedWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  speedWin.loadFile(path.join(__dirname, 'speed.html'));
  speedWin.on('closed', () => {
    speedWin = null;
  });
  speedWin.on('hide', () => { speedCompactSaved = null; releaseWhenIdle('speed', () => speedWin, () => { speedWin = null; }); });
  speedWin.on('show', () => keepAlive('speed'));
  return speedWin;
}
function toggleSpeed(ctx, opts) {
  const force = !!(opts && opts.force);
  let win = speedWin && !speedWin.isDestroyed() ? speedWin : null;
  if (win && win.isVisible() && win.isFocused() && !force) {
    win.hide();
    return { shown: false };
  }
  if (!force && speedSettings.requireSelection) {
    if (!runtime) {
      boot(ctx).catch(() => {});
      return { shown: false, reason: 'booting' };
    }
    if (premiereSelectionCount() === 0) return { shown: false, reason: 'no-selection' };
  }
  if (!win) win = ensureSpeedWindow(ctx);
  // A hidden window always reopens at the full card size. setBounds on a non-resizable window can
  // be ignored on Windows (the card then stayed pill-sized and the calculation looked invisible),
  // so resize through the same guarded path as compact mode.
  if (!win.isVisible()) {
    speedCompactSaved = null;
    try { win.setResizable(true); win.setBounds(speedBounds(ctx)); } finally { win.setResizable(false); }
  }
  win.show();
  win.focus();
  sendWhenReady(win, 'azy:presets:evt:speedShown', { selectionCount: premiereSelectionCount() });
  return { shown: true };
}
function registerSpeedShortcut(ctx, accel) {
  const { globalShortcut } = ctx;
  if (speedRegistered) {
    try { globalShortcut.unregister(speedRegistered); } catch { /* ignore */ }
    speedRegistered = null;
  }
  let ok = false;
  try {
    ok = globalShortcut.register(accel, () => toggleSpeed(ctx));
  } catch (err) {
    console.warn(`[presets] invalid accelerator "${accel}": ${err.message}`);
  }
  if (ok) speedRegistered = accel;
  else console.warn(`[presets] could not register ${accel} for Azy Speed`);
  return ok;
}
function broadcastSpeedSettings(ctx) {
  for (const wc of ctx.getWindows()) {
    try { wc.send('azy:presets:evt:speedSettings', speedSettingsView()); } catch { /* closing */ }
  }
}
// ---------------------------------------------------------------------------
// Azy window shortcut — a global hotkey that minimises Azy, and brings it back
// (restores + focuses) when it is minimised, hidden or behind Premiere. Works
// while any app has focus, so Azy can be tucked away and recalled mid-edit.
// ---------------------------------------------------------------------------
const WINDOW_DEFAULT_SHORTCUT = 'Shift+Alt+A';
let windowSettings = { shortcut: WINDOW_DEFAULT_SHORTCUT };
let windowRegistered = null;

function windowSettingsFile(ctx) {
  return path.join(ctx.app.getPath('userData'), 'presets', 'window-settings.json');
}
function loadWindowSettings(ctx) {
  try {
    windowSettings = { shortcut: WINDOW_DEFAULT_SHORTCUT, ...JSON.parse(fs.readFileSync(windowSettingsFile(ctx), 'utf8')) };
  } catch {
    windowSettings = { shortcut: WINDOW_DEFAULT_SHORTCUT };
  }
  if (typeof windowSettings.shortcut !== 'string' || !windowSettings.shortcut.trim()) windowSettings.shortcut = WINDOW_DEFAULT_SHORTCUT;
}
function saveWindowSettings(ctx) {
  try {
    const f = windowSettingsFile(ctx);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify(windowSettings, null, 2));
  } catch (err) {
    console.warn(`[presets] cannot save window settings: ${err.message}`);
  }
}
function windowSettingsView() {
  return { ...windowSettings, registered: windowRegistered === windowSettings.shortcut };
}
/** Minimise Azy if it is up front; otherwise bring it back. Returns what happened. */
function toggleMainWindow(ctx) {
  const win = ctx.getMainWindow && ctx.getMainWindow();
  if (!win || win.isDestroyed()) return { state: 'none' };
  const away = win.isMinimized() || !win.isVisible() || !win.isFocused();
  if (away) {
    if (win.isMinimized()) win.restore();
    if (!win.isVisible()) win.show();
    win.focus();
    return { state: 'restored' };
  }
  win.minimize();
  return { state: 'minimized' };
}
function registerWindowShortcut(ctx, accel) {
  const { globalShortcut } = ctx;
  if (windowRegistered) {
    try { globalShortcut.unregister(windowRegistered); } catch { /* ignore */ }
    windowRegistered = null;
  }
  let ok = false;
  try {
    ok = globalShortcut.register(accel, () => toggleMainWindow(ctx));
  } catch (err) {
    console.warn(`[presets] invalid accelerator "${accel}": ${err.message}`);
  }
  if (ok) windowRegistered = accel;
  else console.warn(`[presets] could not register ${accel} for the Azy window`);
  return ok;
}
function broadcastWindowSettings(ctx) {
  for (const wc of ctx.getWindows()) {
    try { wc.send('azy:presets:evt:windowSettings', windowSettingsView()); } catch { /* closing */ }
  }
}
function initWindowShortcut(ctx) {
  const { ipcMain, globalShortcut } = ctx;
  if (!globalShortcut) return;
  loadWindowSettings(ctx);
  ipcMain.handle('azy:presets:windowToggle', () => toggleMainWindow(ctx));
  ipcMain.handle('azy:presets:windowGetSettings', () => windowSettingsView());
  ipcMain.handle('azy:presets:windowSetSettings', (event, patch) => {
    patch = patch && typeof patch === 'object' ? patch : {};
    if (typeof patch.shortcut === 'string' && patch.shortcut.trim()) {
      const next = patch.shortcut.trim();
      if (next !== windowSettings.shortcut) {
        const prev = windowSettings.shortcut;
        windowSettings.shortcut = next;
        if (!registerWindowShortcut(ctx, next)) {
          registerWindowShortcut(ctx, prev);
          windowSettings.shortcut = next; // keep the wish so the UI can flag it as taken
        }
      }
    }
    saveWindowSettings(ctx);
    broadcastWindowSettings(ctx);
    return windowSettingsView();
  });
  registerWindowShortcut(ctx, windowSettings.shortcut);
}

function initSpeedWindow(ctx) {
  const { ipcMain, globalShortcut } = ctx;
  if (!globalShortcut) return;
  loadSpeedSettings(ctx);
  ipcMain.handle('azy:presets:speedHide', () => {
    if (speedWin && !speedWin.isDestroyed()) speedWin.hide();
  });
  ipcMain.handle('azy:presets:speedToggle', (event, opts) => toggleSpeed(ctx, opts));
  /* Regenerate → the Speed window shrinks to just its "Adjusting speed" pill in the top-right
     corner of its display while Premiere works, so the timeline is free again at once. The window
     is sized tight around the pill (never a big invisible pane over Premiere's own buttons).
     off → back to where it was (errors are shown on the full card). A hide forgets the saved
     bounds; toggleSpeed() re-centres the window on the next open anyway. */
  ipcMain.handle('azy:presets:speedCompact', (event, on, height) => {
    const win = speedWin && !speedWin.isDestroyed() ? speedWin : null;
    if (!win || event.sender !== win.webContents) return false;
    const setB = (b) => { try { win.setResizable(true); win.setBounds(b); } finally { win.setResizable(false); } };
    if (on) {
      if (!speedCompactSaved) speedCompactSaved = win.getBounds();
      const wa = ctx.screen.getDisplayMatching(speedCompactSaved).workArea;
      const w = 300, h = Math.max(56, Math.min(220, Math.round(Number(height) || 96)));
      setB({ x: wa.x + wa.width - w - 12, y: wa.y + 12, width: w, height: h });
    } else if (speedCompactSaved) {
      const b = speedCompactSaved; speedCompactSaved = null;
      if (win.isVisible()) setB(b);
    }
    return true;
  });
  // The Dagger audio level lives in the shared settings file, so it survives restarts.
  ipcMain.handle('azy:presets:audioGainPref', (event, db) => {
    if (Number.isFinite(Number(db)) && String(db).trim() !== '') ctx.updatePrefs({ audioGainDb: Number(db) });
    const s = ctx.getSettings ? ctx.getSettings() : {};
    return Number.isFinite(s.audioGainDb) ? s.audioGainDb : 0;
  });
  ipcMain.handle('azy:presets:speedGetSettings', () => speedSettingsView());
  ipcMain.handle('azy:presets:speedSetSettings', (event, patch) => {
    patch = patch && typeof patch === 'object' ? patch : {};
    if (typeof patch.requireSelection === 'boolean') speedSettings.requireSelection = patch.requireSelection;
    if (typeof patch.shortcut === 'string' && patch.shortcut.trim()) {
      const next = patch.shortcut.trim();
      if (next !== speedSettings.shortcut) {
        const prev = speedSettings.shortcut;
        speedSettings.shortcut = next;
        if (!registerSpeedShortcut(ctx, next)) {
          registerSpeedShortcut(ctx, prev);
          speedSettings.shortcut = next;
        }
      }
    }
    saveSpeedSettings(ctx);
    broadcastSpeedSettings(ctx);
    return speedSettingsView();
  });
  registerSpeedShortcut(ctx, speedSettings.shortcut);
  const prevGetWindows = ctx.getWindows;
  ctx.getWindows = () => {
    const list = prevGetWindows();
    if (speedWin && !speedWin.isDestroyed()) list.push(speedWin.webContents);
    return list;
  };
}

// ── Flow: Move Selected Keyframes → Playhead ──────────────────────────────────
// SELECT keyframes → park the playhead → one shortcut. The selected group is translated
// in time so its earliest key (Start) or latest key (End) lands exactly on the playhead;
// values, interpolation types and the internal spacing are untouched. Detection runs the
// same Delete/Ctrl+Z probe as Selected easing, then the connector computes a single offset
// and the host moves every key in one undoable call. The hotkey is a globalShortcut, so it
// works with the Flow panel closed (or Azy minimised), as long as Premiere is in front.

const MOVE_DEFAULT_SHORTCUT = 'Ctrl+Alt+P';
const MOVE_DEFAULTS = { shortcut: MOVE_DEFAULT_SHORTCUT, mode: 'start' };
let moveSettings = { ...MOVE_DEFAULTS };
let moveRegistered = null; // accelerator currently held, or null

function moveSettingsFile(ctx) {
  return path.join(ctx.app.getPath('userData'), 'presets', 'flow-move-settings.json');
}
function loadMoveSettings(ctx) {
  try {
    moveSettings = { ...MOVE_DEFAULTS, ...JSON.parse(fs.readFileSync(moveSettingsFile(ctx), 'utf8')) };
  } catch {
    moveSettings = { ...MOVE_DEFAULTS };
  }
  if (typeof moveSettings.shortcut !== 'string' || !moveSettings.shortcut.trim()) moveSettings.shortcut = MOVE_DEFAULT_SHORTCUT;
  if (moveSettings.mode !== 'start' && moveSettings.mode !== 'end') moveSettings.mode = 'start';
}
function saveMoveSettings(ctx) {
  try {
    const f = moveSettingsFile(ctx);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify(moveSettings, null, 2));
  } catch (err) {
    console.warn(`[presets] cannot save flow-move settings: ${err.message}`);
  }
}
function moveSettingsView() {
  return { ...moveSettings, registered: moveRegistered === moveSettings.shortcut };
}

/** Run the move for the given mode. Boots the engine on demand; the probe explains itself
 *  when nothing is highlighted or Premiere is not ready. Returns the connector result. */
async function moveFlow(mode) {
  const flow = runtime && runtime.flow;
  if (!flow || typeof flow.gate !== 'function') throw new Error('Flow is not ready yet — try again in a moment.');
  flow.gate();
  const detected = await require('./flow-selected').run({
    server: runtime.server,
    log: (lvl, msg) => runtime.logger.log(lvl, 'move', msg)
  });
  const keys = detected && detected.keys;
  if (!Array.isArray(keys) || !keys.length) {
    const e = new Error('No keyframes selected — highlight the keyframes you want to move in Effect Controls, then try again.');
    e.code = 'NO_KEYFRAMES_SELECTED';
    throw e;
  }
  const res = await runtime.server.request('moveKeys', { mode: mode === 'end' ? 'end' : 'start', keys }, 12e4);
  if (detected.warnings && detected.warnings.length) {
    if (!res || !Array.isArray(res.warnings)) res.warnings = [];
    res.warnings = [...detected.warnings, ...res.warnings];
  }
  return res;
}

/** Shortcut entry point: gate on Premiere, run the move, and push the outcome to the UI. */
async function triggerFlowMove(ctx, mode) {
  if (!runtime) {
    // First press may arrive before the engine knew Premiere — boot, and let the next press run.
    try { await boot(ctx); } catch { /* reported on the next press */ }
    if (!runtime) return { done: false, reason: 'booting' };
  }
  try {
    const res = await moveFlow(mode);
    broadcastFlowMove(ctx, { ok: true, mode, moved: res.moved || 0, result: res });
    return { done: true, result: res };
  } catch (err) {
    const message = String((err && err.message) || err).replace(/^Error invoking remote method '[^']+': (Error: )?/, '').replace(/^BridgeError: /, '');
    broadcastFlowMove(ctx, { ok: false, mode, message });
    return { done: false, reason: 'failed', message };
  }
}

function broadcastFlowMove(ctx, payload) {
  for (const wc of ctx.getWindows()) {
    try { wc.send('azy:presets:evt:flowMoved', payload); } catch { /* closing */ }
  }
}

function registerMoveShortcut(ctx, accel) {
  const { globalShortcut } = ctx;
  if (moveRegistered) {
    try { globalShortcut.unregister(moveRegistered); } catch { /* ignore */ }
    moveRegistered = null;
  }
  let ok = false;
  try {
    ok = globalShortcut.register(accel, () => { void triggerFlowMove(ctx, moveSettings.mode); });
  } catch (err) {
    console.warn(`[presets] invalid accelerator "${accel}": ${err.message}`);
  }
  if (ok) moveRegistered = accel;
  else console.warn(`[presets] could not register ${accel} for Flow Move`);
  return ok;
}

function broadcastMoveSettings(ctx) {
  for (const wc of ctx.getWindows()) {
    try { wc.send('azy:presets:evt:flowMoveSettings', moveSettingsView()); } catch { /* closing */ }
  }
}

function initFlowMoveShortcut(ctx) {
  const { app, ipcMain, globalShortcut } = ctx;
  if (!globalShortcut) return;
  loadMoveSettings(ctx);
  ipcMain.handle('azy:presets:flowMoveToggle', (_e, mode) => triggerFlowMove(ctx, mode === 'end' ? 'end' : moveSettings.mode));
  ipcMain.handle('azy:presets:flowMoveGetSettings', () => moveSettingsView());
  ipcMain.handle('azy:presets:flowMoveSetSettings', (_e, patch) => {
    patch = patch && typeof patch === 'object' ? patch : {};
    if (patch.mode === 'start' || patch.mode === 'end') moveSettings.mode = patch.mode;
    if (typeof patch.shortcut === 'string' && patch.shortcut.trim()) {
      const next = patch.shortcut.trim();
      if (next !== moveSettings.shortcut) {
        const prev = moveSettings.shortcut;
        moveSettings.shortcut = next;
        if (!registerMoveShortcut(ctx, next)) {
          registerMoveShortcut(ctx, prev); // keep the old one working rather than leaving none
          moveSettings.shortcut = next; // remember the wish; view reports registered:false
        }
      }
    }
    saveMoveSettings(ctx);
    broadcastMoveSettings(ctx);
    return moveSettingsView();
  });
  registerMoveShortcut(ctx, moveSettings.shortcut);
  app.on('will-quit', () => globalShortcut.unregisterAll());
}

async function shutdown() {
  try { require('./dagger-main').shutdown(); } catch { /* never loaded */ }
  snapOpeningSequence++;
  cancelSnapReveal();
  if (speedWin && !speedWin.isDestroyed()) speedWin.destroy();
  speedWin = null;
  if (snapWin && !snapWin.isDestroyed()) snapWin.destroy();
  snapWin = null;
  if (unregister) unregister();
  unregister = null;
  if (panelHost) panelHost.dispose();
  panelHost = null;
  if (runtime) {
    const rt = runtime;
    runtime = null;
    try {
      await rt.shutdown();
    } catch {
      /* quitting anyway */
    }
  }
}

function broadcastSettings(settings) {
  if (!panelHost) return;
  for (const target of panelHost.targets()) {
    try { target.send('settings-changed', settings); } catch { /* disconnected panel */ }
  }
}

module.exports = { init, shutdown, broadcastSettings };
