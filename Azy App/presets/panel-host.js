// ---------- Azy inside Premiere (panel host) ----------
// Serves the same Azy UI that runs in the Electron window to a WebView docked inside
// Premiere Pro, so Presets / Flow / Snap can be used without leaving Premiere — the
// way command-bar tools embed themselves. The Files tab is app-only (it needs OS
// drag & drop), so the panel build hides it.
//
// Transport: the loopback bridge port the connector already dials. Static files under
// /panel/*, JSON-RPC at POST /panel/rpc, events as Server-Sent Events at /panel/events.
// Every request carries the paired connector token (?t= / X-Azy-Token), so nothing on
// the machine can drive Azy without having paired first. Same engine, same IPC handler
// table (the RPC simply calls the ipcMain handlers), so behaviour cannot drift.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
const APP_ROOT = path.join(__dirname, '..');
// Files the panel may fetch (allow-list; nothing else on disk is reachable).
const STATIC = new Set(['index.html', 'design-tokens.css', 'styles.css', 'presets/azy-artwork.css', 'renderer.js', 'presets/azy-artwork.js', 'presets/azy-foundation.css', 'presets/azy-theme-engine.js', 'presets/azy-web.js', 'presets/azy-ui.js', 'presets/azy-characters.js', 'presets/azy-shell.css', 'presets/azy-skin.css', 'presets/azy-activity.css', 'presets/azy-shell.js', 'presets/presets.css', 'presets/themes.css', 'presets/workspaces.css', 'presets/minimal.css', 'presets/palette.css', 'presets/azy-interactions.js', 'presets/azy-undo.js', 'presets/azy-status.js', 'presets/azy-speed.js', 'presets/azy-wait.js', 'presets/azy-ui-sounds.js', 'presets/azy-scope.js', 'presets/azy-speed-prompt.js', 'presets/azy-pair.js', 'presets/azy-dagger-pins.js', 'presets/presets-renderer.js', 'presets/snap-settings.js', 'presets/flow-renderer.js', 'presets/azy-connection.js', 'presets/azy-welcome.js', 'presets/dagger-audio.js', 'presets/azy-done-sfx.js', 'presets/sounds-view.js', 'presets/panel/panel-shim.js', 'presets/panel/panel.css', 'presets/azy-motion.css', 'presets/azy-custom.css', 'presets/azy-motion.js', 'presets/azy-resize.js']);

const handlers = new Map(); // channel -> fn, mirrored from ipcMain.handle
let captured = null;

/** Wrap ipcMain.handle/removeHandler once so the RPC sees every handler, present or future. */
function captureHandlers(ipcMain) {
  if (captured === ipcMain) return;
  captured = ipcMain;
  const origHandle = ipcMain.handle.bind(ipcMain);
  const origRemove = typeof ipcMain.removeHandler === 'function' ? ipcMain.removeHandler.bind(ipcMain) : () => {};
  ipcMain.handle = (ch, fn) => { handlers.set(ch, fn); return origHandle(ch, fn); };
  ipcMain.removeHandler = (ch) => { handlers.delete(ch); return origRemove(ch); };
}

function installPanelHost(runtime, opts = {}) {
  const log = opts.log || (() => {});
  // Per-run local token, published in <userData>/bridge/panel.json (user-only file permissions) for
  // local tooling/tests. The Azy panel inside Premiere (CEP extension iframe) uses the paired runtime token.
  // Either is accepted below.
  const panelToken = crypto.randomBytes(24).toString('base64url');
  let infoPath = null;
  if (opts.dataDir) {
    try {
      const dir = path.join(opts.dataDir, 'bridge');
      fs.mkdirSync(dir, { recursive: true });
      infoPath = path.join(dir, 'panel.json');
      fs.writeFileSync(infoPath, JSON.stringify({ port: runtime.server.port, token: panelToken, pid: process.pid, startedAt: new Date().toISOString() }), { mode: 0o600 });
    } catch (e) { log('warn', 'could not write panel.json: ' + e.message); infoPath = null; }
  }
  const authed = (t) => (t && t === panelToken) || runtime.server.hasToken(t);
  // While Azy's own panel is open inside Premiere (a live event stream authenticated with the
  // per-run panel token), the Premiere extension may pair without a typed code.
  const localStreams = new Set();
  runtime.server.autoPairAllowed = () => localStreams.size > 0;
  // The Premiere extension runs as the same OS user and reads panel.json (user-only file) itself:
  // presenting that per-run secret links it without a typed code — whichever app started first.
  runtime.server.localPairSecretValid = (code) => {
    try { const a = Buffer.from(String(code)), b = Buffer.from(panelToken); return a.length === b.length && crypto.timingSafeEqual(a, b); } catch { return false; }
  };

  const clients = new Set(); // SSE responses
  const panelTargets = () => [...clients].map((res) => ({ send: (ch, payload) => sse(res, ch, payload), isDestroyed: () => res.destroyed }));

  function sse(res, ch, payload) {
    try { res.write(`event: ipc\ndata: ${JSON.stringify({ ch, payload })}\n\n`); } catch { /* gone */ }
  }
  function tokenOf(req, url) {
    // Header (shim RPC) → query (first load / SSE) → cookie (the browser's own requests for
    // stylesheets, scripts and fonts, which we can't decorate). Cookie is set on the index response.
    const fromHeader = req.headers['x-azy-token'];
    if (fromHeader) return String(fromHeader);
    const q = url.searchParams.get('t');
    if (q) return q;
    const m = /(?:^|;\s*)azy_panel=([^;]+)/.exec(req.headers.cookie || '');
    return m ? decodeURIComponent(m[1]) : '';
  }
  function html(res, code, body, type = 'text/plain; charset=utf-8') {
    res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
    res.end(body);
  }

  runtime.server.httpHandler = async (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    if (!url.pathname.startsWith('/panel')) return false;
    // The extension's iframe loads us from a file:// / extension origin; everything is token-gated, so answering cross-origin is safe.
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-headers', 'content-type, x-azy-token');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return true; }
    if (!authed(tokenOf(req, url))) { html(res, 401, 'Azy: pair the Premiere panel first'); return true; }

    if (url.pathname === '/panel/events') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
      res.write('retry: 1500\n\n');
      clients.add(res);
      if (tokenOf(req, url) === panelToken) localStreams.add(res);
      const ping = setInterval(() => { try { res.write(': ping\n\n'); } catch { /* ignore */ } }, 15000);
      req.on('close', () => { clearInterval(ping); clients.delete(res); localStreams.delete(res); });
      return true;
    }
    if (url.pathname === '/panel/rpc' && req.method === 'POST') {
      let body = '';
      req.on('data', (c) => { body += c; if (body.length > 4e6) req.destroy(); });
      req.on('end', async () => {
        let msg;
        try { msg = JSON.parse(body || '{}'); } catch { return html(res, 400, 'bad json'); }
        const fn = handlers.get(msg.ch);
        if (!fn || typeof msg.ch !== 'string' || !(msg.ch.startsWith('azy:presets:') || PANEL_APP_CHANNELS.has(msg.ch))) return html(res, 404, JSON.stringify({ error: 'unknown channel ' + msg.ch }), 'application/json');
        try {
          const result = await fn({ sender: { id: 'panel' } }, ...(Array.isArray(msg.args) ? msg.args : []));
          html(res, 200, JSON.stringify({ result: result === undefined ? null : result }), 'application/json');
        } catch (err) {
          html(res, 200, JSON.stringify({ error: { message: err && err.message ? err.message : String(err), code: err && err.code } }), 'application/json');
        }
      });
      return true;
    }
    // static
    let rel = url.pathname.replace(/^\/panel\/?/, '') || 'index.html';
    if (rel === 'index.html' || rel === '') rel = 'index.html';
    if (!STATIC.has(rel)) { html(res, 404, 'not found'); return true; }
    let file;
    try { file = fs.readFileSync(path.join(APP_ROOT, rel)); } catch { html(res, 404, 'not found'); return true; }
    const headers = { 'content-type': MIME[path.extname(rel)] || 'application/octet-stream', 'cache-control': 'no-store' };
    if (rel === 'index.html') {
      const t = tokenOf(req, url);
      file = Buffer.from(panelIndex(file.toString('utf8'), t));
      headers['set-cookie'] = `azy_panel=${encodeURIComponent(t)}; Path=/panel; SameSite=Lax`;
    }
    res.writeHead(200, headers);
    res.end(file);
    return true;
  };

  log('info', 'panel host ready at /panel');
  return {
    targets: panelTargets,
    dispose() {
      runtime.server.httpHandler = undefined;
      for (const c of clients) { try { c.end(); } catch { /* ignore */ } }
      clients.clear();
      if (infoPath) { try { fs.unlinkSync(infoPath); } catch { /* gone */ } }
    }
  };
}

// The few main.js channels the shared renderer.js calls at startup (settings, pins). The
// panel gets harmless answers for the file-explorer ones; everything under azy:presets:* is live.
const PANEL_APP_CHANNELS = new Set(['get-settings', 'get-pins', 'toggle-always-on-top', 'dock-height', 'get-file-stats']);

/** index.html for the panel: same markup, plus the shim that maps window.api / window.presets to HTTP.
 *  Every asset URL gets `?t=<token>` — the browser fetches stylesheets/scripts on its own and we
 *  can't add headers to those requests (and cookies are unreliable inside a CEP/WebView iframe). */
function panelIndex(src, token) {
  const q = '?t=' + encodeURIComponent(token);
  return src
    .replace('</head>', '<link rel="stylesheet" href="presets/panel/panel.css" />\n</head>')
    .replace('<script src="renderer.js"></script>', `<script>window.__AZY_PANEL__ = { token: ${JSON.stringify(token)} };</script>\n  <script src="presets/panel/panel-shim.js"></script>\n  <script src="renderer.js"></script>`)
    .replace(/<body([^>]*)>/, (_, attrs) => {
      if (/class="/.test(attrs)) return '<body' + attrs.replace(/class="([^"]*)"/, (_, classes) => `class="${classes} in-premiere"`) + '>';
      return `<body${attrs} class="in-premiere">`;
    })
    .replace(/(<(?:link|script)\b[^>]*\b(?:href|src)=")([^"?:]+)(")/g, (m, a, u, b) => a + u + q + b);
}

/** Call a registered ipcMain.handle() handler from the main process itself (Dagger wheel). */
function invokeHandler(ch, ...args) {
  const fn = handlers.get(ch);
  if (!fn) return Promise.reject(new Error('unknown channel ' + ch));
  try { return Promise.resolve(fn({ sender: { id: 'main' } }, ...args)); } catch (err) { return Promise.reject(err); }
}
module.exports = { installPanelHost, captureHandlers, panelIndex, PANEL_APP_CHANNELS, invokeHandler };
