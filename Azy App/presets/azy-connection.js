// Status-bar connection indicator — one place that turns the engine's live state into the
// five words a user needs: Connecting… · Connected · Reconnecting… · Premiere not running ·
// Something went wrong. Only "Connected" is shown after the engine's handshake (hello →
// token check → identity → ping) has succeeded; a dead socket drops out within a heartbeat.
(function () {
  const P = window.presets;
  const box = document.getElementById('statusConn');
  const dot = document.getElementById('statusConnDot');
  const text = document.getElementById('statusConnText');
  if (!P || !box) return;

  let conn = null;          // ConnectionStatus from the engine
  let sawConnected = false; // distinguishes "Connecting…" (first time) from "Reconnecting…"
  let lastKey = '';
  let pendingSince = 0;     // when a running-but-not-linked state began
  let staleTimer = 0;

  function derive() {
    const m = window.azyStatus && window.azyStatus.premiereModule();
    const host = window.azyStatus && window.azyStatus.premiereHost();
    if (!conn) return { key: 'boot', cls: 'is-off', label: 'Starting…' };
    if (m && m.busy) return { key: 'busy', cls: 'is-warn', label: 'Setting up Premiere…' };
    if (host && host.installed === false) return { key: 'noapp', cls: 'is-off', label: 'Premiere Pro not detected · Link', action: 'link' };
    if (conn.phase === 'connected') { sawConnected = true; return { key: 'ok', cls: 'is-ok', label: 'Connected' }; }
    if (conn.phase === 'unsupported-version') return { key: 'unsup', cls: 'is-err', label: 'Premiere version unsupported', action: 'help' };
    if (conn.phase === 'premiere-running-no-connector') {
      if (m && (m.install === 'error' || m.install === 'manual-required')) return { key: 'err', cls: 'is-err', label: 'Premiere module needs attention', action: 'repair' };
      if (m && m.install === 'outdated') return { key: 'upd', cls: 'is-warn', label: 'Premiere module update required', action: 'repair' };
      if (m && m.connection === 'restart-host') return { key: 'restart', cls: 'is-warn', label: 'Restart Premiere to finish', action: 'help' };
      // Waiting for the panel: linking takes a few seconds after Premiere starts. After a long
      // wait, say so honestly rather than sitting on "Connecting…" forever.
      if (!pendingSince) pendingSince = Date.now();
      const long = Date.now() - pendingSince > 45_000;
      if (long) return { key: 'stuck', cls: 'is-warn', label: 'Not linked yet — open Azy in Premiere', action: 'help' };
      return { key: 'wait', cls: 'is-warn', label: sawConnected ? 'Reconnecting…' : 'Connecting…', action: 'link' };
    }
    pendingSince = 0;
    if (conn.phase === 'premiere-not-running') {
      if (sawConnected) return { key: 'gone', cls: 'is-off', label: 'Premiere unavailable', action: 'link' };
      return { key: 'idle', cls: 'is-off', label: 'Waiting for Premiere · Link', action: 'link' };
    }
    return { key: 'unk', cls: 'is-warn', label: conn.label || 'Connecting…' };
  }

  let action = null;
  function paint() {
    const d = derive();
    action = d.action || null;
    box.title = (conn && conn.detail) || d.label;
    if (d.key === lastKey) return;
    lastKey = d.key;
    box.classList.remove('is-ok', 'is-warn', 'is-err', 'is-off');
    box.classList.add(d.cls);
    dot.className = 'status-dot ' + (d.cls === 'is-ok' ? 'is-ok' : d.cls === 'is-warn' || d.cls === 'is-err' ? 'is-warn' : 'is-off');
    text.textContent = d.label;
    box.classList.remove('swap'); void box.offsetWidth; box.classList.add('swap');
    // The "stuck" wording is time-based: re-evaluate once when the threshold passes.
    clearTimeout(staleTimer);
    if (d.key === 'wait') staleTimer = setTimeout(paint, 46_000);
  }

  box.addEventListener('click', async () => {
    if (action === 'repair' && window.azyStatus) {
      box.classList.add('is-loading');
      try { await window.azyStatus.repair(); } finally { box.classList.remove('is-loading'); }
    } else if (action === 'help' || action === 'link') {
      // Manual link is always one click away: the code dialog (with the port) — Premiere may
      // be running even when Azy couldn't see it (tasklist blocked, sandboxed launcher, …).
      // First: try to reconnect right now (reverse link + process re-check). Only if that doesn't
      // land within ~2 s show the code dialog.
      box.classList.add('is-loading');
      try { await P.azyCommand({ capability: 'link', action: 'reconnect', surface: 'status' }); } catch (_) { /* engine not up */ }
      await new Promise((r) => setTimeout(r, 1800));
      box.classList.remove('is-loading');
      if (conn && conn.phase === 'connected') { if (typeof toast === 'function') toast('Connected to Premiere Pro', 1800); return; }
      if (window.azyPair) { window.azyPair.show(); return; }
      const m = window.azyStatus && window.azyStatus.premiereModule();
      const msg = window.azyStatus ? window.azyStatus.explain(conn) : '';
      if (typeof toast === 'function') toast((m && m.next) ? `${m.summary}. ${m.next}` : msg, 5000);
    } else if (conn && conn.phase === 'connected' && typeof toast === 'function') {
      toast(`Azy is running in ${conn.label || 'Premiere Pro'}${conn.detail ? ' — ' + conn.detail : ''}`, 2600);
    }
  });

  P.on('connection', (c) => { conn = c; paint(); });
  if (window.azyStatus) window.azyStatus.onChange(paint);
  // `getConnection` is registered by the lazy engine itself. Boot first, then ask, rather
  // than deliberately invoking a channel that does not exist during the first renderer frame.
  const prime = async () => { try { conn = await P.getConnection(); } catch { /* engine failed to boot */ } paint(); };
  P.boot().then(prime).catch(() => paint());
  paint();
})();
