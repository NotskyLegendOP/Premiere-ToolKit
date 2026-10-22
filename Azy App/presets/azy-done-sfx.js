/* AZY completion chime (v1.18) — one short, soft two-note tone when a Flow, Speed or Preset
 * apply has COMPLETED successfully. Callers invoke it only from their verified-success branch,
 * so failures, cancels and partial applies never chime.
 *
 *  • Settings (shared by every Azy window through localStorage, same file:// origin):
 *      azy.ui.sounds          master UI-sounds switch ('0' = off) — off silences the chime too
 *      azy.done.sfx           chime on/off ('0' = off, default on)
 *      azy.done.sfx.volume    0..1 (default 0.4)
 *  • Never overlaps: a new chime stops the previous one, and a chime from another window within
 *    350 ms is skipped (Speed window + main window reporting the same apply).
 *  • Never delays applying: it is called after the result is known, synthesises in WebAudio with
 *    no assets, and its own AudioContext is created ahead of time (prewarm) or on the first
 *    gesture — media / SFX previews use separate <audio> elements and are never touched.
 */
(function azyDoneSfx() {
  if (window.azyDoneSfx) return;
  const LS_MASTER = 'azy.ui.sounds', LS_ON = 'azy.done.sfx', LS_VOL = 'azy.done.sfx.volume', LS_LAST = 'azy.done.sfx.last';
  const GAP_MS = 350;
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, live = null, lastAt = 0;

  function settings() {
    let master = true, on = true, volume = 0.4;
    try {
      master = localStorage.getItem(LS_MASTER) !== '0';
      on = localStorage.getItem(LS_ON) !== '0';
      const v = parseFloat(localStorage.getItem(LS_VOL));
      if (!Number.isNaN(v)) volume = Math.min(1, Math.max(0, v));
    } catch { /* private mode: defaults */ }
    return { master, on, volume };
  }
  function ensure() {
    if (!AC) return null;
    if (!ctx) { try { ctx = new AC({ latencyHint: 'interactive' }); } catch { ctx = null; return null; } }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  function stopLive() {
    if (!live || !ctx) { live = null; return; }
    const t = ctx.currentTime;
    try { live.g.gain.cancelScheduledValues(t); live.g.gain.setTargetAtTime(0.0001, t, 0.008); } catch { /* gone */ }
    for (const o of live.oscs) { try { o.stop(t + 0.04); } catch { /* already stopped */ } }
    live = null;
  }
  function play(kind) {
    const s = settings();
    if (!s.master || !s.on || s.volume <= 0) return false;
    const now = Date.now();
    if (now - lastAt < GAP_MS) return false;
    try {
      const other = Number(localStorage.getItem(LS_LAST)) || 0;
      if (now - other >= 0 && now - other < GAP_MS) return false; // another window just chimed
      localStorage.setItem(LS_LAST, String(now));
    } catch { /* storage unavailable: per-window guard only */ }
    lastAt = now;
    const c = ensure();
    if (!c) return false;
    stopLive();
    try {
      const t0 = c.currentTime + 0.004;
      const g = c.createGain();
      const peak = 0.16 * s.volume;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.34);
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
      lp.connect(g); g.connect(c.destination);
      // Speed rises a fifth, Flow a fourth, Presets a major sixth — same family, subtly distinct.
      const pair = kind === 'speed' ? [659.25, 987.77] : kind === 'flow' ? [698.46, 932.33] : [783.99, 1318.51];
      const oscs = pair.map((f, i) => {
        const o = c.createOscillator(); o.type = 'sine';
        const og = c.createGain(); og.gain.value = i ? 0.75 : 1;
        o.frequency.setValueAtTime(f, t0);
        o.connect(og); og.connect(lp);
        o.start(t0 + i * 0.065); o.stop(t0 + 0.36);
        return o;
      });
      const mine = { g, oscs };
      live = mine;
      oscs[oscs.length - 1].onended = () => { if (live === mine) live = null; try { g.disconnect(); } catch { /* gone */ } };
    } catch { return false; } // audio is never worth an exception
    return true;
  }
  function set(next) {
    try {
      if ('on' in next) localStorage.setItem(LS_ON, next.on ? '1' : '0');
      if ('volume' in next) localStorage.setItem(LS_VOL, String(Math.min(1, Math.max(0, Number(next.volume) || 0))));
    } catch { /* private mode */ }
  }
  function arm() { ensure(); window.removeEventListener('pointerdown', arm, true); window.removeEventListener('keydown', arm, true); }
  window.addEventListener('pointerdown', arm, true);
  window.addEventListener('keydown', arm, true);

  window.azyDoneSfx = {
    play,
    settings,
    set,
    prewarm: ensure,
    /** true right after a chime — the generic toast blip stays quiet so the two never overlap */
    recent: (ms = 600) => Date.now() - lastAt < ms
  };
})();
