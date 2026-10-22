// Azy platform status, shared by every pane (Presets, Flow, Snap) and both surfaces (desktop
// window + the panel inside Premiere). One object from the module manager → one wording.
// Panes call window.azyStatus.line(...) instead of inventing their own connector/pairing text.
(function () {
  const P = window.presets;
  let status = null;            // AzyStatus from the engine
  const listeners = new Set();

  function premiereModule() { return status && (status.modules || []).find((m) => m.host === 'premiere'); }
  function premiereHost() { return status && (status.hosts || []).find((h) => h.id === 'premiere'); }

  /**
   * Text for the footer / target line. `conn` is the live connection status (with selection
   * count) a pane already has; module status supplies the install/lifecycle wording.
   */
  function line(conn, opts = {}) {
    const m = premiereModule();
    const host = premiereHost();
    const what = opts.what || 'a preset';
    if (m && m.busy) return { text: m.summary, cls: 'is-warn' };
    if (host && host.installed === false) return { text: 'Premiere Pro not found on this computer', cls: 'is-off' };
    if (host && host.supported === false) return { text: m ? m.summary : 'This Premiere Pro version is not supported', cls: 'is-warn' };
    if (m && (m.install === 'error' || m.install === 'manual-required')) return { text: m.summary + (m.next ? ' — ' + m.next : ''), cls: 'is-warn', action: 'repair' };
    if (!conn || conn.phase === 'premiere-not-running') return { text: `Open Premiere Pro — Azy is ready there. Select clips, then click ${what}`, cls: 'is-off' };
    if (conn.phase === 'premiere-running-no-connector') {
      if (m && m.connection === 'restart-host') return { text: m.summary, cls: 'is-warn' };
      return { text: 'Premiere Pro is open — Azy is linking… click for a link code', cls: 'is-warn', action: 'help' };
    }
    if (conn.phase !== 'connected') return { text: conn.detail || conn.label || 'Premiere version not supported', cls: 'is-warn' };
    const caps = conn.capabilities || {};
    const lacking = ['uxpDom', 'readSelection', 'addVideoEffects', 'setParams'].filter((k) => !caps[k]);
    if (lacking.length && !opts.ignoreCaps) return { text: `Azy is in Premiere but this version can't apply effects (${lacking.join(', ')})`, cls: 'is-warn' };
    const st = conn.premiereState || {};
    const n = st.selectionCount || 0;
    if (!st.hasSequence) return { text: 'Azy is in Premiere — open a sequence', cls: 'is-warn' };
    if (!n) return { text: `Azy is in Premiere — select clip(s) in the timeline, then click ${what}`, cls: 'is-warn' };
    return { text: `${n} clip${n === 1 ? '' : 's'} selected — click ${what} to apply`, cls: 'is-ok' };
  }

  /** What to tell the user when they click while Premiere isn't ready (no code typing anymore). */
  function explain(conn) {
    const m = premiereModule();
    if (m && m.next && (m.install !== 'installed' || m.connection === 'restart-host')) return `${m.summary}. ${m.next}`;
    if (!conn || conn.phase === 'premiere-not-running') return 'Premiere Pro is not running. Open Premiere Pro — Azy is already set up there.';
    if (conn.phase === 'premiere-running-no-connector') return 'Azy is linking with Premiere Pro. Azy starts with Premiere and links automatically; if it doesn\'t, open Window › Extensions › Azy in Premiere or enter the link code shown in Azy.';
    return conn.detail || 'This Premiere Pro version is not supported.';
  }

  function set(s) { status = s; for (const cb of listeners) { try { cb(s); } catch { /* pane error */ } } }
  function get() { return status; }
  function onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); }
  async function refresh() { try { set(await P.azyStatus()); } catch { /* engine not booted yet */ } return status; }
  async function repair() { try { const m = await P.moduleRepair(); await refresh(); return m; } catch (e) { return null; } }

  if (P && P.on) P.on('azyStatus', set);
  window.azyStatus = { line, explain, get, set, onChange, refresh, repair, premiereModule, premiereHost };
})();
