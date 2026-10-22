(() => {
  const api = window.daggerAction;
  const $ = (id) => document.getElementById(id);
  let db = 0, state = null, preparing = false, gainSeeded = false;
  // Appearance (accent, style, performance, motion) comes from the shared theme engine, so
  // this window always matches the app instead of keeping its own palette list. Live
  // settings win over the snapshot the operation state carried; unknown names are ignored.
  const LEGACY = { mono: 'midnight', 'mono-cyan': 'dark-cyan', cyan: 'dark-cyan', violet: 'obsidian', rose: 'dark-magenta', mint: 'dark-emerald', amber: 'dark-orange' };
  let live = false;
  const theme = (settings) => {
    const T = window.azyTheme;
    if (!settings || !T) return false;
    const patch = { ...settings };
    if (patch.uiTheme !== undefined) {
      const id = LEGACY[patch.uiTheme] || patch.uiTheme;
      if (!(T.ACCENTS || []).some((a) => (a.id || a) === id)) delete patch.uiTheme;
    }
    try { T.apply(patch, { silent: true }); return true; } catch (e) { return false; }
  };
  if (api.onSettingsChanged) api.onSettingsChanged((settings) => { if (theme(settings)) live = true; });
  function paint(s) {
    // Open the gain card where the editor left it last time (settings-backed).
    if (s && s.phase === 'gain' && !gainSeeded) {
      gainSeeded = true;
      if (Number.isFinite(s.db)) {
        db = Math.max(-24, Math.min(12, s.db));
        showDb(false);
      }
    }
    // Success chime: once per completed Flow / Preset apply (the main side sets chime only for
    // a clean SUCCESS — never for partial, failed or cancelled work).
    if (s.phase === 'waiting' && s.kind !== 'sfx' && window.azyDoneSfx) { const d = window.azyDoneSfx.settings(); if (d.master && d.on) window.azyDoneSfx.prewarm(); } // ready before the result
    if (s.phase === 'done' && s.chime && !(state && state.phase === 'done') && window.azyDoneSfx) window.azyDoneSfx.play(s.kind);
    state = s;
    document.documentElement.dataset.section = s.kind === 'presets' ? 'presets' : s.kind === 'flow' ? 'flow' : 'files';
    if (!live) theme(s.appearance || (s.uiTheme ? { uiTheme: s.uiTheme } : null));
    document.body.classList.toggle('mini', !!s.mini);
    document.body.classList.toggle('closing', !!s.closing); // v1.21: exit animation; main hides the window right after
    // Status (applying / applied / failed) is a corner toast; only the SFX card is a dialog.
    document.body.classList.toggle('toast', s.kind !== 'sfx');
    document.body.classList.toggle('is-done', s.phase === 'done');
    document.body.classList.toggle('is-error', s.phase === 'error');
    const gain = s.phase === 'gain';
    const waiting = s.phase === 'waiting';
    $('gain').hidden = !gain;
    $('waitbox').hidden = gain;
    $('spinner').hidden = !waiting;
    $('close').disabled = waiting || preparing;
    // Cancel only exists while a cancellable host operation is running.
    const canCancel = waiting && !!s.operationId;
    $('cancelWait').hidden = !canCancel;
    $('miniWait').hidden = !waiting;
    $('title').textContent = gain ? 'Sound volume' : s.phase === 'done' ? 'Applied' : s.phase === 'error' ? 'Could not apply' : s.kind === 'flow' ? 'Applying Flow' : s.kind === 'sfx' ? 'Applying sound' : 'Applying preset';
    $('name').textContent = s.name;
    $('name').title = s.name;
    const gn = document.getElementById('gainName');
    if (gn) { gn.textContent = s.name || ''; gn.title = s.name || ''; }
    $('detail').textContent = gain ? '' : s.detail;
  }
  // Value + slider (v1.22): the fill grows from the 0 dB tick toward the level, so "quieter /
  // louder / how much" reads at a glance; dragging or clicking the track sets the level.
  function showDb(bump) {
    const out = document.getElementById('db');
    if (out) {
      out.textContent = `${db > 0 ? '+' : ''}${db} dB`;
      out.dataset.sign = db > 0 ? 'up' : db < 0 ? 'down' : 'zero';
      if (bump) { out.classList.remove('bump'); void out.offsetWidth; out.classList.add('bump'); }
    }
    const r = document.getElementById('gainRange');
    if (r) {
      const pos = (db + 24) / 36, zero = 24 / 36;
      if (String(r.value) !== String(db)) r.value = String(db);
      r.style.setProperty('--lo', String(Math.min(pos, zero)));
      r.style.setProperty('--hi', String(Math.max(pos, zero)));
      r.setAttribute('aria-valuetext', `${db > 0 ? '+' : ''}${db} decibels`);
    }
    if (!preparing) { $('minus').disabled = db <= -24; $('plus').disabled = db >= 12; }
  }
  function change(delta) {
    if (preparing) return;
    db = Math.max(-24, Math.min(12, db + delta));
    showDb(true);
    $('error').textContent = '';
  }
  // ±5 dB is the fast, deliberate step; the arrow keys keep a 1 dB nudge for trimming.
  $('minus').onclick = () => change(-5);
  $('plus').onclick = () => change(5);
  const range = $('gainRange');
  if (range) range.addEventListener('input', () => { const v = Math.round(Number(range.value)); if (Number.isFinite(v)) change(v - db); });
  const close = () => { if (!preparing) api.close().catch(() => {}); };
  $('close').onclick = close; $('cancel').onclick = close;
  // Minimize collapses the whole window into a small corner pill (main resizes us).
  const setMini = (mini) => { if (api.setMini) api.setMini(mini).catch(() => {}); };
  $('mini').onclick = () => setMini(!(state && state.mini));
  $('miniWait').onclick = () => setMini(true);
  // Cancel asks the host operation to stop; what was already written stays undoable.
  $('cancelWait').onclick = () => { if (api.cancel) api.cancel().catch(() => {}); };
  $('apply').onclick = async () => {
    if (preparing || !state || state.phase !== 'gain') return;
    preparing = true;
    for (const id of ['apply', 'cancel', 'close', 'minus', 'plus', 'gainRange']) $(id).disabled = true;
    $('error').textContent = '';
    $('apply').textContent = 'Preparing…';
    let audioContext;
    try {
      let wav;
      if (db !== 0) {
        const encoded = new Uint8Array(await api.read());
        audioContext = new AudioContext();
        const audio = await audioContext.decodeAudioData(encoded.buffer);
        wav = window.daggerAudio.encode(audio, db);
      }
      await api.apply(db, wav);
      if (api.gainPref) api.gainPref(db).catch(() => {}); // remembered for future normal applies — only once confirmed
    } catch (err) {
      $('error').textContent = String(err.message || err).replace(/^Error invoking remote method '[^']+': (Error: )?/, '');
    } finally {
      if (audioContext) await audioContext.close().catch(() => {});
      preparing = false;
      for (const id of ['apply', 'cancel', 'close', 'minus', 'plus', 'gainRange']) $(id).disabled = false;
      showDb(false);
      $('apply').textContent = 'Apply sound';
      if (state) paint(state);
    }
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (state && state.phase === 'gain' && !preparing) {
      if (e.key === '+' || e.key === '=') { e.preventDefault(); change(5); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); change(1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); change(-1); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); change(-5); } // mirrors '+' and the −5 button
      if (e.key === 'Enter') { e.preventDefault(); $('apply').click(); }
    }
  });
  api.onState(paint);
  api.state().then(paint).catch((err) => { $('error').textContent = String(err.message || err); });
})();
