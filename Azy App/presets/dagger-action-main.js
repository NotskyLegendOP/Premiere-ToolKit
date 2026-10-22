'use strict';
// Short-lived Dagger action window. Waiting never takes focus from Premiere; only the SFX
// confirmation is interactive. It uses a dedicated preload, not the app's full IPC surface.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const MAX_AUDIO_BYTES = 64 * 1024 * 1024;
// Compact, transparent waiting card; the minimized pill reuses the same window.
const WIN_W = 312, WIN_H = 204;
const PILL_W = 208, PILL_H = 52;
// Applying / Applied / failed status: a compact toast in the top-right corner of the screen.
const TOAST_W = 300, TOAST_H = 104, EDGE = 16;
// v1.21: popups close as soon as the work is done — a short exit animation, then the window is
// hidden at once. The renderer stays alive (invisible) a moment longer only so the success chime,
// which plays inside it, isn't cut off. Nothing waits on this: Premiere finished before it starts.
const CLOSE_ANIM_MS = 170, CHIME_TAIL_MS = 700;
const cornerOf = (area, w, h) => ({ x: Math.round(area.x + Math.max(0, area.width - w - EDGE)), y: Math.round(area.y + EDGE), width: w, height: h });

function createActions(ctx) {
  let current = null;
  const channel = 'azy:dagger:action';
  function send(s) {
    if (!s.win.isDestroyed()) s.win.webContents.send(channel, s.state);
  }
  function dispose(s) {
    clearTimeout(s.timer); clearTimeout(s.loadTimer); clearTimeout(s.showTimer);
    if (current === s) current = null;
    if (!s.win.isDestroyed()) s.win.destroy();
    if (s.choose) { s.choose(null); s.choose = null; }
  }
  // Animated close: renderer plays its exit (body.closing), then the window is hidden and later
  // destroyed. A pending SFX choice resolves immediately (cancel never waits for an animation).
  function retire(s, tailMs) {
    if (s.closing || s.win.isDestroyed()) return;
    s.closing = true;
    if (s.choose) { s.choose(null); s.choose = null; }
    clearTimeout(s.timer); clearTimeout(s.showTimer);
    s.state = { ...s.state, closing: true };
    if (!s.shown) { // never shown (fast result): don't flash it at all
      send(s); // a chime (if any) still plays from the hidden renderer
      if (current === s) current = null;
      s.timer = setTimeout(() => dispose(s), tailMs || 0);
      return;
    }
    send(s);
    s.timer = setTimeout(() => {
      if (!s.win.isDestroyed() && s.win.hide) s.win.hide();
      if (current === s) current = null; // hidden = gone for the user; a new action may open
      s.timer = setTimeout(() => dispose(s), tailMs || 0);
    }, CLOSE_ANIM_MS);
  }
  function finish(s, error, text, chime) {
    if (s.win.isDestroyed()) return;
    s.state = { ...s.state, phase: error ? 'error' : 'done', detail: text, chime: !error && !!chime };
    send(s);
    // Errors stay readable and can be dismissed; a success closes right away (v1.21).
    if (!error) retire(s, s.state.chime ? CHIME_TAIL_MS : 0);
  }
  function open(kind, name) {
    if (current) {
      if (current.closing || ['done', 'error'].includes(current.state.phase)) dispose(current);
      else { send(current); return null; }
    }
    const area = ctx.screen && ctx.screen.getDisplayNearestPoint(ctx.screen.getCursorScreenPoint()).workArea;
    const toast = kind !== 'sfx';
    const W = toast ? TOAST_W : WIN_W, H = toast ? TOAST_H : WIN_H;
    const position = !area ? {} : toast ? (({ x, y }) => ({ x, y }))(cornerOf(area, W, H))
      : { x: Math.round(area.x + Math.max(0, (area.width - W) / 2)), y: Math.round(area.y + Math.max(0, (area.height - H) / 2)) };
    const win = new ctx.BrowserWindow({
      ...position,
      width: W, height: H, show: false, frame: false, resizable: false,
      minimizable: false, maximizable: false, fullscreenable: false,
      alwaysOnTop: true, skipTaskbar: true, transparent: true, title: 'Azy — Dagger',
      webPreferences: { defaultFontFamily: { standard: 'Segoe UI', sansSerif: 'Segoe UI', serif: 'Segoe UI', monospace: 'Consolas' }, preload: path.join(__dirname, 'dagger-action-preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
    });
    const s = { win, kind, source: null, choose: null, timer: null, prevBounds: null,
      state: { appearance: (() => { const st = ctx.getSettings ? ctx.getSettings() : {}; return { uiTheme: st.uiTheme, uiSkin: st.uiSkin, uiPerf: st.uiPerf, uiMotion: st.uiMotion, uiWebs: st.uiWebs }; })(), phase: kind === 'sfx' ? 'gain' : 'waiting', kind, name, detail: kind === 'flow' ? 'Applying easing in Premiere…' : 'Applying preset in Premiere…', mini: false, operationId: null,
        // The last audio level the editor chose — the gain card opens where they left it.
        db: (() => { const st = ctx.getSettings ? ctx.getSettings() : {}; return Number.isFinite(st.audioGainDb) ? st.audioGainDb : 0; })() } };
    current = s;
    win.setMenuBarVisibility(false);
    win.setAlwaysOnTop(true, 'screen-saver');
    win.webContents.on('will-navigate', (e) => e.preventDefault());
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    win.on('close', (e) => { if (s.state.phase === 'waiting') e.preventDefault(); });
    win.webContents.on('render-process-gone', () => dispose(s));
    win.on('closed', () => { clearTimeout(s.timer); clearTimeout(s.loadTimer); clearTimeout(s.showTimer); if (current === s) current = null; if (s.choose) { s.choose(null); s.choose = null; } });
    win.once('ready-to-show', () => {
      if (current !== s || win.isDestroyed()) return;
      if (s.closing) { if (!s.state.chime) dispose(s); return; } // finished before first paint: never shown (a chime still plays, hidden)
      clearTimeout(s.timer); clearTimeout(s.loadTimer); clearTimeout(s.showTimer);
      send(s);
      // Let the radial finish its cursor-release transaction before presenting controls.
      s.showTimer = setTimeout(() => {
        if (current !== s || win.isDestroyed() || s.closing) return;
        s.shown = true;
        if (kind === 'sfx') win.show(); else win.showInactive();
      }, 300);
    });
    s.loadTimer = setTimeout(() => dispose(s), 15000); // failed first paint must not strand a prompt
    win.loadFile(path.join(__dirname, 'dagger-action.html')).catch(() => dispose(s));
    return s;
  }
  function setMini(s, mini) {
    if (s.win.isDestroyed() || !!s.state.mini === !!mini) return;
    s.state = { ...s.state, mini: !!mini };
    const area = ctx.screen && ctx.screen.getDisplayNearestPoint(ctx.screen.getCursorScreenPoint()).workArea;
    if (mini) {
      if (s.win.getBounds) s.prevBounds = s.win.getBounds();
      if (s.win.setBounds && area) s.win.setBounds(cornerOf(area, PILL_W, PILL_H));
    } else if (s.win.setBounds) {
      if (s.prevBounds) s.win.setBounds(s.prevBounds);
      else if (area) s.win.setBounds(s.kind !== 'sfx' ? cornerOf(area, TOAST_W, TOAST_H) : { x: Math.round(area.x + Math.max(0, (area.width - WIN_W) / 2)), y: Math.round(area.y + Math.max(0, (area.height - WIN_H) / 2)), width: WIN_W, height: WIN_H });
      s.prevBounds = null;
    }
    send(s);
  }
  ctx.ipcMain.handle(channel, async (event, command, value) => {
    const s = current;
    if (!s || event.sender !== s.win.webContents) throw new Error('Inactive Dagger action');
    if (command === 'state') return s.state;
    if (s.closing) return false; // already on its way out
    if (command === 'close') {
      if (s.state.phase === 'waiting') return false; // dismiss is not cancellation of a host write
      retire(s, 0); return true;
    }
    if (command === 'minimize') {
      setMini(s, !!value);
      return s.state.mini;
    }
    if (command === 'cancel') {
      // Cancel stops the running host operation; whatever was already written stays
      // undoable with one Ctrl+Z in Premiere. Only exists while an operation is live.
      if (s.state.phase !== 'waiting' || !s.state.operationId) return false;
      await ctx.invoke('azy:presets:cancelOperation', s.state.operationId);
      return true;
    }
    if (command === 'read' && s.kind === 'sfx' && s.state.phase === 'gain') {
      const stat = await fs.promises.stat(s.source);
      if (stat.size > MAX_AUDIO_BYTES) throw new Error('This sound is too large to adjust here. Use 0 dB to insert the original.');
      return fs.promises.readFile(s.source);
    }
    if (command === 'apply' && s.kind === 'sfx' && s.state.phase === 'gain') {
      const db = value && value.db;
      if (!Number.isInteger(db) || db < -24 || db > 12) throw new Error('Invalid audio gain');
      // Claim the confirmation before any disk await: double-click/Enter cannot insert twice.
      s.state.phase = 'waiting'; s.state.detail = 'Preparing sound…'; send(s);
      try {
        let file = s.source;
        if (db !== 0) {
          const wav = Buffer.from(value.wav || []);
          if (!validWav(wav)) throw new Error('The adjusted audio could not be encoded. No sound was inserted.');
          // Durable media, not temp: Premiere references this path after Azy exits. Never delete
          // these copies automatically or overwrite the user's original source file.
          const folder = path.join(ctx.app.getPath('userData'), 'Dagger Audio');
          await fs.promises.mkdir(folder, { recursive: true });
          const base = path.basename(s.source, path.extname(s.source)).replace(/[^a-zA-Z0-9 _-]/g, '_').slice(0, 60);
          file = path.join(folder, `Azy ${base} ${db}dB ${crypto.createHash('sha256').update(wav).digest('hex').slice(0, 16)}.wav`);
          await fs.promises.writeFile(file, wav);
        }
        if (current !== s || s.win.isDestroyed()) return false;
        s.state.detail = 'Inserting sound in Premiere…'; send(s);
        if (s.choose) { s.choose({ path: file, db }); s.choose = null; }
        return true;
      } catch (err) {
        if (current === s) { s.state.phase = 'gain'; send(s); }
        throw err;
      }
    }
    throw new Error('Action unavailable');
  });
  return {
    async run(kind, name, work, operationId) {
      const s = open(kind, name);
      if (!s) return false;
      if (operationId) s.state = { ...s.state, operationId };
      // work() returns the status text, or { text, chime } when the apply completed cleanly.
      try { const out = await work(); const o = out && typeof out === 'object' ? out : { text: out }; finish(s, false, o.text || 'Applied', o.chime); }
      catch (err) { finish(s, true, clean(err)); }
      return true;
    },
    async sound(item, work) {
      const s = open('sfx', item.label);
      if (!s) return 'busy'; // another Dagger action is still on screen (it was re-sent to the front)
      s.source = item.path;
      const choice = await new Promise((resolve) => { s.choose = resolve; });
      if (!choice) return false;
      try { const text = await work(choice); finish(s, false, text || 'Sound inserted'); }
      catch (err) { finish(s, true, clean(err)); }
      return true;
    },
    shutdown() { if (current) dispose(current); if (ctx.ipcMain.removeHandler) ctx.ipcMain.removeHandler(channel); }
  };
}
function clean(err) { return String(err && err.message || err).replace(/^Error invoking remote method '[^']+': (Error: )?/, ''); }
function validWav(b) {
  if (b.length < 44 || b.length > MAX_AUDIO_BYTES || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WAVE' || b.toString('ascii', 12, 16) !== 'fmt ' || b.toString('ascii', 36, 40) !== 'data') return false;
  const channels = b.readUInt16LE(22), rate = b.readUInt32LE(24);
  return b.readUInt32LE(4) === b.length - 8 && b.readUInt32LE(16) === 16 && b.readUInt16LE(20) === 1 && channels >= 1 && channels <= 2 && rate >= 8000 && rate <= 192000 && b.readUInt16LE(34) === 16 && b.readUInt16LE(32) === channels * 2 && b.readUInt32LE(28) === rate * channels * 2 && b.readUInt32LE(40) === b.length - 44 && (b.length - 44) % (channels * 2) === 0;
}
module.exports = { createActions, validWav };
