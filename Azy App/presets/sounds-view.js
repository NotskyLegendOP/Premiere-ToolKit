/* Sounds — the audio half of the Files tab, rebuilt media-parallel.
 *
 * Same shell language as the media explorer: the left rail is the explorer rail
 * (All Sounds / Favorites / your pinned sound folders), the toolbar row is the media
 * toolbar (Pin folder pins a sound directory, Unpin drops the current one, refresh
 * rescans, Up returns to All Sounds), and the board holds one card per sound —
 * play button + waveform on top, name, format chip and size, Apply at the playhead.
 * Playback only ever happens through the card's own play button; the compact volume
 * button in the toolbar remembers its level across restarts.
 *
 * The media section is untouched: this module only borrows the shell while open.
 */
/* ---- Shared sound apply (v1.18) — Sounds cards, Files audio cards ----------------------------------
   Normal Apply = the fastest path: insert at the remembered level, no popup, no UI work.
     0 dB → original file straight to Premiere; other levels → a cached durable gain copy (rendered
     once per sound + level with the same encoder/clip guard as the level card).
   Hold-modifier + Apply (Shift by default, Settings › Shortcuts; read from the click event itself,
     so it can never be "stuck") → the compact level card; nothing is inserted until it is confirmed.
   One in-flight apply per sound: a double click or rapid repeat can never insert twice.
   Resolves { state: 'SUCCESS'|'CANCELLED'|'FAILED'|'BUSY', trackIndex, trackCreated, db, error }. */
(function () {
  const inflight = new Map();
  let levelDb = 0;
  const A = window.api;
  const takeLevel = (s) => { if (s && Number.isFinite(s.audioGainDb)) levelDb = Math.max(-24, Math.min(12, Math.round(s.audioGainDb))); };
  try { if (A && A.getSettings) Promise.resolve(A.getSettings()).then(takeLevel).catch(() => {}); if (A && A.onSettingsChanged) A.onSettingsChanged(takeLevel); } catch { /* no bridge */ }
  const clean = (err) => String((err && err.message) || err).replace(/^Error invoking remote method '[^']+': (Error: )?/, '');
  async function encodeAt(bytes, db) {
    if (!window.daggerAudio) throw new Error('The audio encoder is unavailable. Set the level to 0 dB or Shift-apply.');
    const ctx = new AudioContext();
    try {
      const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
      const audio = await ctx.decodeAudioData(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength));
      return window.daggerAudio.encode(audio, db);
    } finally { ctx.close().catch(() => {}); }
  }
  async function direct(path, name) {
    const P = window.presets;
    const db = levelDb;
    let file = path;
    if (db !== 0 && typeof P.soundGainCopy === 'function') {
      let r = await P.soundGainCopy(path, db);
      if (r && r.need) r = await P.soundGainStore(path, db, await encodeAt(r.bytes, db));
      file = r.file;
    } else if (typeof P.soundGainCopy === 'function') {
      await P.soundGainCopy(path, 0); // existence check: a moved/missing file fails clearly, before Premiere
    }
    const res = await P.placeAudio(file, name);
    return res && res.state === 'SUCCESS' ? { ...res, db } : { state: 'FAILED', error: (res && (res.error || (res.warnings || [])[0])) || 'Premiere did not insert the sound' };
  }
  window.azySoundApply = async function (path, name, opts) {
    const P = window.presets;
    if (!P || typeof path !== 'string' || !path) return { state: 'FAILED', error: 'No sound to place' };
    if (inflight.has(path)) return { state: 'BUSY' };
    const withLevel = !!(opts && opts.ev && window.azyHold && window.azyHold.matches(opts.ev)) && typeof P.placeAudioLevel === 'function';
    const job = (async () => {
      try { return withLevel ? await P.placeAudioLevel(path, name) : await direct(path, name); }
      catch (err) { return { state: 'FAILED', error: clean(err) }; }
    })();
    inflight.set(path, job);
    try { return await job; } finally { inflight.delete(path); }
  };
  // Normally defined by renderer.js (loaded first, so Files cards have it on their first paint);
  // this guard keeps the Sounds view self-contained on surfaces that load it alone.
  if (typeof window.azyApplyButton !== 'function') {
    window.azyApplyButton = function (cls, label, title) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'azy-apply ' + (cls || ''); b.draggable = false;
      b.title = title || label; b.setAttribute('aria-label', label);
      b.innerHTML = '<svg class="azy-apply-ic" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M12 4v10m-4.5-4.5L12 14l4.5-4.5M5 19.5h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="azy-apply-tx">Apply</span>';
      return b;
    };
  }
  window.azySoundApply.describe = (res, name) => res && res.state === 'SUCCESS'
    ? `${name} → A${res.trackIndex + 1}${res.trackCreated ? ' (new track)' : ''} at the playhead${res.db ? ` · ${res.db > 0 ? '+' : ''}${res.db} dB` : ''}`
    : res && res.state === 'BUSY' ? 'That sound is already being applied'
    : res && res.state === 'CANCELLED' ? 'Cancelled — nothing was inserted'
    : `Couldn't place ${name}${res && res.error ? ': ' + res.error : ''}`;
})();

(function () {
  const api = window.api;
  const shell = document.getElementById('soundsShell');
  const side = document.getElementById('soundsSide');
  const grid = document.getElementById('soundsGrid');
  const mediaShell = document.getElementById('filesExplorerShell');
  const mediaBtn = document.getElementById('sectionMediaBtn');
  const soundsBtn = document.getElementById('sectionSoundsBtn');
  if (!api || !api.soundsGet || !shell || !side || !grid || !mediaShell || !mediaBtn || !soundsBtn) return;

  const searchInput = document.getElementById('soundsSearchInput');
  const countPill = document.getElementById('soundsCountPill');
  const volumeWrap = document.getElementById('soundsVolumeWrap');
  const volumeBtn = document.getElementById('soundsVolumeBtn');
  const volumePop = document.getElementById('volumePop');
  const volumeRange = document.getElementById('volumeRange');
  const volumeOut = document.getElementById('volumeOut');
  const heroTitle = document.getElementById('filesHeroTitle');
  const addPinBtn = document.getElementById('addPinBtn');
  const unpinBtn = document.getElementById('pinCurrentBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const upBtn = document.getElementById('upBtn');
  const previewBtn = document.getElementById('previewToggleBtn');
  const toast = window.toast || (() => {});

  const clamp01 = (v) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.8);
  const store = {
    section: (() => { try { return localStorage.getItem('azy.files.section') === 'sounds' ? 'sounds' : 'media'; } catch { return 'media'; } })(),
    scope: (() => { try { return localStorage.getItem('azy.sounds.scope') || 'all'; } catch { return 'all'; } })(),
    query: '',
    volume: (() => { try { const raw = localStorage.getItem('azy.sounds.volume'); return raw === null ? 0.8 : clamp01(Number(raw)); } catch { return 0.8; } })(),
    wavesOff: (() => { try { return localStorage.getItem('azy.sounds.waves') === 'off'; } catch { return false; } })()
  };
  let data = { folders: [], favorites: [] };
  let loaded = false;
  let audio = null;
  let playingPath = null;

  /* ---------------------------------------------------------------- playback */
  // Same URL rules as the media player: backslashes to slashes, a drive letter keeps
  // its colon, and every segment is component-encoded so '#', '?' and '&' in names
  // cannot silently turn the rest of the path into a fragment or query.
  function fileUrl(fullPath) {
    const normalized = String(fullPath).replace(/\\/g, '/');
    const prefix = normalized.startsWith('/') ? 'file://' : 'file:///';
    return prefix + normalized
      .split('/')
      .map((seg, i) => (i === 0 && /^[A-Za-z]:$/.test(seg) ? seg : encodeURIComponent(seg)))
      .join('/');
  }
  function ensureAudio() {
    if (audio) return audio;
    audio = document.createElement('audio');
    audio.volume = store.volume;
    // 'auto' so the decoder has real data before play() — starting on an empty
    // buffer is what made previews crackle and start late on big WAVs.
    audio.preload = 'auto';
    audio.addEventListener('ended', () => {
      playingPath = null;
      // Release the decoder and the file handle straight after playback finishes.
      audio.removeAttribute('src');
      try { audio.load(); } catch { /* nothing loaded */ }
      syncPlayState();
    });
    audio.addEventListener('pause', () => { if (!switching) playingPath = null; syncPlayState(); });
    audio.addEventListener('play', () => { syncPlayState(); announcePreview(); });
    audio.addEventListener('loadedmetadata', () => {
      // A waveform click on a card that was not playing yet: seek once the duration is known.
      if (pendingSeek !== null && isFinite(audio.duration) && audio.duration > 0) {
        try { audio.currentTime = pendingSeek * audio.duration; } catch { /* not seekable */ }
      }
      pendingSeek = null;
    });
    audio.addEventListener('error', () => {
      // Missing, corrupt or undecodable audio fails calmly: honest card state,
      // one toast, and Apply keeps working because it never touches this element.
      if (!audio.getAttribute('src')) return; // the deliberate release after 'ended'
      playingPath = null;
      toast('This sound could not be played here — Apply still inserts it in Premiere.');
      syncPlayState();
    });
    return audio;
  }
  // Click-free level moves: every start/stop/switch rides a short volume ramp,
  // because hard play()/pause() on a file:// stream is exactly the click people
  // hear as "bad quality". One timer at a time, always cleared.
  let fadeTimer = null;
  let switching = false;     // a switch's own pause must not clear the new playing path
  let pendingSeek = null;    // 0..1, applied on loadedmetadata (waveform click before playback)
  let progressRaf = 0;
  const cardEls = new Map(); // path → card element of the current grid (targeted updates)
  function ramp(to, ms, done) {
    const a = audio;
    if (!a) { if (done) done(); return; }
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
    const from = a.volume;
    const t0 = performance.now();
    // Time-based (not step-counted), so a busy frame never stretches the fade or jumps it.
    fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / Math.max(1, ms));
      try { a.volume = Math.min(1, Math.max(0, from + (to - from) * k)); } catch { /* detached */ }
      if (k >= 1) {
        clearInterval(fadeTimer); fadeTimer = null;
        try { a.volume = Math.min(1, Math.max(0, to)); } catch { /* detached */ }
        if (done) done();
      }
    }, 12);
  }
  /* One preview at a time across Files + Sounds: whoever starts announces it, the others stop. */
  function announcePreview() {
    try { document.dispatchEvent(new CustomEvent('azy:preview-play', { detail: { source: 'sounds' } })); } catch { /* old engine */ }
  }
  document.addEventListener('azy:preview-play', (e) => {
    if (e.detail && e.detail.source === 'sounds') return;
    if (audio && !audio.paused) { playingPath = null; syncPlayState(); stopPreview(); }
  });
  const PLAY_SVG = '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  const PAUSE_SVG = '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  function paintCardState(el, path) {
    const on = playingPath === path; // a refused play() clears playingPath, so this stays honest
    if (el.classList.contains('playing') === on && el._painted) return;
    el._painted = true;
    el.classList.toggle('playing', on);
    const b = el.querySelector('.sound-play');
    if (b) {
      b.innerHTML = on ? PAUSE_SVG : PLAY_SVG;
      b.title = on ? 'Pause' : 'Play';
      const nm = el.querySelector('.sound-name');
      b.setAttribute('aria-label', (on ? 'Pause ' : 'Play ') + (nm ? nm.textContent : ''));
    }
    const wv = el.querySelector('.sound-wave');
    if (wv && !on) drawWave(wv, path, 0);
  }
  /** Playback state → only the cards that changed (no grid rebuild), plus the live progress loop. */
  function syncPlayState() {
    for (const [path, el] of cardEls) { if (el.isConnected) paintCardState(el, path); else cardEls.delete(path); }
    const live = !!(audio && playingPath);
    if (live && !progressRaf) progressRaf = requestAnimationFrame(tickProgress);
  }
  function tickProgress() {
    progressRaf = 0;
    if (!audio || !playingPath) return;
    if (audio.paused && audio.readyState >= 2) { progressRaf = requestAnimationFrame(tickProgress); return; } // buffering / switching
    if (!document.hidden) {
      const el = cardEls.get(playingPath);
      const wv = el && el.querySelector('.sound-wave');
      if (wv) drawWave(wv, playingPath, audio.currentTime / Math.max(0.001, audio.duration || 1));
    }
    progressRaf = requestAnimationFrame(tickProgress);
  }
  /** Waveform click → move the PREVIEW playhead only (local audio; Premiere is never told). */
  function seekPreview(path, ratio) {
    ratio = Math.min(1, Math.max(0, ratio));
    const a = ensureAudio();
    if (playingPath === path && !a.paused) {
      if (isFinite(a.duration) && a.duration > 0) { try { a.currentTime = ratio * a.duration; } catch { /* not seekable */ } }
      const el = cardEls.get(path); const wv = el && el.querySelector('.sound-wave');
      if (wv) drawWave(wv, path, ratio);
      return;
    }
    pendingSeek = ratio;
    togglePlay(path);
  }
  function stopPreview(done) {
    const a = audio;
    if (!a || a.paused) { if (done) done(); return; }
    ramp(0, 70, () => { a.pause(); if (done) done(); });
  }
  function begin(path, start) {
    const a = ensureAudio();
    a.src = fileUrl(path);
    a.currentTime = 0;
    // preload='auto' lets the browser buffer ahead; play() straight away keeps
    // the card honest and lets the shell smooth the buffer-in itself.
    start();
  }
  function togglePlay(path) {
    const a = ensureAudio();
    if (playingPath === path && !a.paused) {
      // The card flips to stopped immediately; only the audio tail fades out.
      playingPath = null;
      syncPlayState();
      stopPreview();
      return;
    }
    const start = () => {
      playingPath = path;
      try { a.volume = 0; } catch { /* detached */ }
      // Some shells (jsdom, locked-down codecs) cannot start playback: the card
      // state stays honest instead of pretending to play.
      try {
        const pr = a.play();
        if (pr && pr.catch) pr.catch(() => { playingPath = null; syncPlayState(); });
      } catch { playingPath = null; }
      ramp(store.volume, 60);
      syncPlayState();
    };
    // One element, one stream: switching fades the previous preview out first.
    if (!a.paused && playingPath && playingPath !== path) {
      const prev = playingPath;
      playingPath = path; // the new card lights up at once; the old one goes quiet
      ramp(0, 40, () => { switching = true; a.pause(); switching = false; if (playingPath === path) begin(path, start); else if (prev) syncPlayState(); });
      syncPlayState();
      return;
    }
    begin(path, start);
  }
  function setVolume(v) {
    store.volume = clamp01(v);
    // A manual level change wins over any fade in flight (no snap-back to the old level).
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
    if (audio) audio.volume = store.volume;
    try { localStorage.setItem('azy.sounds.volume', String(store.volume)); } catch { /* private mode */ }
    volumeRange.value = String(Math.round(store.volume * 100));
    volumeOut.textContent = String(Math.round(store.volume * 100));
    volumeBtn.classList.toggle('muted', store.volume === 0);
  }

  /* ------------------------------------------------------------------- data */
  async function load() {
    try { data = await api.soundsGet(); loaded = true; }
    catch (err) { toast(String(err.message || err).replace(/^Error invoking remote method '[^']+': (Error: )?/, '')); data = { folders: [], favorites: [] }; }
    if (store.scope !== 'all' && store.scope !== 'fav' && !data.folders.some((f) => f.id === store.scope)) store.scope = 'all';
    paintSide();
    paintGrid();
    syncToolbar();
  }
  const itemsFor = (scope) => {
    if (scope === 'fav') {
      const seen = new Set(); const out = [];
      for (const f of data.folders) for (const p of f.paths) if (data.favorites.includes(p.path) && !seen.has(p.path)) { seen.add(p.path); out.push(p); }
      return out;
    }
    if (scope === 'all') {
      const seen = new Set(); const out = [];
      for (const f of data.folders) for (const p of f.paths) if (!seen.has(p.path)) { seen.add(p.path); out.push(p); }
      return out;
    }
    const folder = data.folders.find((f) => f.id === scope);
    return folder ? folder.paths : [];
  };
  const setScope = (scope) => {
    store.scope = scope;
    try { localStorage.setItem('azy.sounds.scope', scope); } catch { /* ignore */ }
    paintSide(); paintGrid(); syncToolbar();
  };

  /* ------------------------------------------------------- explorer-rail side */
  function navItem(label, count, active, onPick, title, icon) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'files-sidebar-nav-item' + (active ? ' active' : '');
    b.title = title || label;
    b.innerHTML = `<span class="sounds-rail-icon">${icon}</span><span class="sounds-rail-name"></span><span class="sounds-rail-count">${count}</span>`;
    b.querySelector('.sounds-rail-name').textContent = label;
    b.addEventListener('click', onPick);
    return b;
  }
  const speakerIcon = () => '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M4 9.5v5h3.4L12 18.6V5.4L7.4 9.5H4z" fill="currentColor"/><path d="M15 9.2a4 4 0 0 1 0 5.6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
  const starIcon = (on) => `<svg viewBox="0 0 24 24" width="12" height="12"><path d="M12 3.6l2.2 5.6 6 .5-4.6 3.9 1.4 5.9L12 16.4l-5 3.1 1.4-5.9-4.6-3.9 6-.5z" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
  const folderIcon = () => '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';

  function paintSide() {
    side.textContent = '';
    const head = document.createElement('div');
    head.className = 'files-sidebar-head';
    head.innerHTML = '<span>Explorer</span>';
    side.appendChild(head);

    const lib = document.createElement('div');
    lib.className = 'files-sidebar-section';
    lib.innerHTML = '<span class="files-sidebar-label">Library</span>';
    const libNav = document.createElement('div');
    libNav.className = 'files-sidebar-nav';
    libNav.setAttribute('aria-label', 'Sound library scopes');
    libNav.appendChild(navItem('All Sounds', itemsFor('all').length, store.scope === 'all', () => setScope('all'), 'Every sound in every pinned folder', speakerIcon()));
    libNav.appendChild(navItem('Favorites', data.favorites.length, store.scope === 'fav', () => setScope('fav'), 'Sounds you starred', starIcon(true)));
    lib.appendChild(libNav);
    side.appendChild(lib);

    const fol = document.createElement('div');
    fol.className = 'files-sidebar-section';
    fol.innerHTML = '<span class="files-sidebar-label">Sound folders</span>';
    const folNav = document.createElement('div');
    folNav.className = 'files-sidebar-nav';
    folNav.setAttribute('aria-label', 'Pinned sound folders');
    if (!data.folders.length) {
      folNav.innerHTML = '<span class="files-sidebar-empty">Pin a folder of sounds to get started</span>';
    } else {
      for (const f of data.folders) {
        const item = navItem(f.name, f.paths.length, store.scope === f.id, () => setScope(f.id), f.path, folderIcon());
        makeFolderReorderable(item, f);
        folNav.appendChild(item);
      }
    }
    fol.appendChild(folNav);
    side.appendChild(fol);
  }

  /* ------------------------------------------- v1.22: arrange the sound folders
     Drag a folder in the rail onto another (drop marker shows before/after), or Alt+Up / Alt+Down on
     a focused folder. Same rules and look as the Files pins: the rail repaints at once, main stores
     only a re-arrangement (sounds.json, atomic), the order survives a restart, Ctrl+Z restores the
     previous order. Opening, pinning and unpinning a folder are unchanged; no folder is rescanned. */
  const FOLDER_DRAG_TYPE = 'application/x-azy-sound-folder';
  let folderDragId = null;
  function applyFolderOrder(ids) {
    const byId = new Map(data.folders.map((f) => [f.id, f]));
    const next = ids.map((id) => byId.get(id)).filter(Boolean);
    for (const f of data.folders) if (!next.includes(f)) next.push(f); // never drop a folder locally either
    data.folders = next;
    const fa = document.activeElement, focusId = fa && fa.dataset ? fa.dataset.folderId : null;
    paintSide();
    if (focusId) { const el = Array.from(side.querySelectorAll('[data-folder-id]')).find((e) => e.dataset.folderId === focusId); if (el) el.focus(); }
  }
  function commitFolderOrder(ids) {
    const prev = data.folders.map((f) => f.id);
    if (ids.length !== prev.length || ids.every((id, i) => id === prev[i])) return;
    applyFolderOrder(ids); // instant; the save runs behind it
    const save = (order) => Promise.resolve(api.soundsReorderFolders ? api.soundsReorderFolders(order) : null)
      .then((stored) => { if (Array.isArray(stored)) applyFolderOrder(stored); })
      .catch(() => { toast('Couldn\u2019t save the folder order \u2014 it will be back to the previous order after a restart.'); });
    save(ids);
    if (window.azyUndo) window.azyUndo.record({ label: 'Sound folder order', undo: () => { applyFolderOrder(prev); return save(prev); }, redo: () => { applyFolderOrder(ids); return save(ids); } });
  }
  function moveFolder(id, toIndex) {
    const order = data.folders.map((f) => f.id);
    const from = order.indexOf(id);
    if (from < 0) return;
    order.splice(from, 1);
    order.splice(Math.max(0, Math.min(order.length, toIndex)), 0, id);
    commitFolderOrder(order);
  }
  function makeFolderReorderable(el, folder) {
    el.draggable = true;
    el.dataset.folderId = folder.id;
    el.setAttribute('aria-roledescription', 'Reorderable sound folder');
    el.title = `${folder.path}\nDrag (or Alt+Up / Alt+Down) to reorder`;
    const clearMarks = () => el.classList.remove('pin-drop-before', 'pin-drop-after');
    const after = (e) => { const r = el.getBoundingClientRect(); return e.clientY > r.top + r.height / 2; };
    el.addEventListener('dragstart', (e) => {
      folderDragId = folder.id;
      e.stopPropagation();
      if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData(FOLDER_DRAG_TYPE, folder.id); } catch (_) { /* harness */ } }
      el.classList.add('pin-dragging');
    });
    el.addEventListener('dragend', () => { folderDragId = null; el.classList.remove('pin-dragging'); clearMarks(); });
    el.addEventListener('dragover', (e) => {
      if (!folderDragId || folderDragId === folder.id) return;
      e.preventDefault(); e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      const a = after(e);
      el.classList.toggle('pin-drop-after', a); el.classList.toggle('pin-drop-before', !a);
    });
    el.addEventListener('dragleave', clearMarks);
    el.addEventListener('drop', (e) => {
      if (!folderDragId || folderDragId === folder.id) return;
      e.preventDefault(); e.stopPropagation();
      const moving = folderDragId, a = after(e);
      folderDragId = null; clearMarks();
      const order = data.folders.map((f) => f.id).filter((id) => id !== moving);
      const at = order.indexOf(folder.id);
      if (at < 0) return;
      order.splice(a ? at + 1 : at, 0, moving);
      commitFolderOrder(order);
    });
    el.addEventListener('keydown', (e) => {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const back = e.key === 'ArrowUp' || e.key === 'ArrowLeft', fwd = e.key === 'ArrowDown' || e.key === 'ArrowRight';
      if (!back && !fwd) return;
      e.preventDefault(); e.stopPropagation();
      const i = data.folders.findIndex((f) => f.id === folder.id);
      moveFolder(folder.id, i + (fwd ? 1 : -1));
    });
  }

  /* ------------------------------------------------------------ card board */
  function paintGrid() {
    grid.textContent = '';
    const q = store.query.trim().toLowerCase();
    const visible = itemsFor(store.scope).filter((it) => !q || it.name.toLowerCase().includes(q));
    if (countPill) countPill.textContent = q || store.scope !== 'all' ? `${visible.length} / ${itemsFor('all').length}` : `${visible.length}`;

    if (visible.length === 0 && !(data.folders.length === 0 && store.scope === 'all')) {
      const empty2 = document.createElement('div');
      empty2.className = 'empty-state';
      // Empty SFX: the cinematic desk (waveform panel + web corners) behind the orb.
      empty2.innerHTML = (window.azyArt ? window.azyArt.markup('art-creator', 'empty-art empty-art--fade') : '') + '<div class="empty-orb">' +
        '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 9.5v5h3.4L12 18.6V5.4L7.4 9.5H4z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M15 9.2a4 4 0 0 1 0 5.6M17.4 7a7 7 0 0 1 0 10" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>' +
        '</div><div>' + (q ? 'No sounds match this search' : 'No sounds in this folder yet') + '</div>' +
        '<div class="empty-hint">' + (q ? 'Try another spelling, or clear the search box.' : 'Drop .wav / .mp3 files into the folder, or pin another one.') + '</div>';
      grid.appendChild(empty2);
    }
    if (!data.folders.length && store.scope === 'all') {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = (window.azyArt ? window.azyArt.markup('art-creator', 'empty-art empty-art--fade') : '') + '<div class="empty-orb">' +
        '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 9.5v5h3.4L12 18.6V5.4L7.4 9.5H4z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M15 9.2a4 4 0 0 1 0 5.6M17.4 7a7 7 0 0 1 0 10" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>' +
        '</div><div>Pin a folder of sounds to get started</div>';
      const pin = document.createElement('button');
      pin.className = 'hero-action';
      pin.type = 'button';
      pin.innerHTML = '<span>Pin sound folder</span>';
      pin.addEventListener('click', pinFolder);
      empty.appendChild(pin);
      grid.appendChild(empty);
      return;
    }
    cardEls.clear();
    for (const item of visible) { const el = card(item); cardEls.set(item.path, el); grid.appendChild(el); }
    if (!visible.length && q) {
      const empty = document.createElement('div');
      empty.className = 'sounds-empty';
      empty.textContent = `No sounds match “${store.query.trim()}”`;
      grid.appendChild(empty);
    }
  }

  function card(item) {
    const el = document.createElement('article');
    el.className = 'sound-card' + (playingPath === item.path ? ' playing' : '');
    el.dataset.path = item.path;

    const top = document.createElement('div');
    top.className = 'sound-top';
    const play = document.createElement('button');
    play.className = 'sound-play';
    play.type = 'button';
    play.title = playingPath === item.path ? 'Pause' : 'Play';
    play.setAttribute('aria-label', (playingPath === item.path ? 'Pause ' : 'Play ') + item.name);
    play.innerHTML = playingPath === item.path
      ? '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>'
      : '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
    play.addEventListener('click', () => togglePlay(item.path));
    const wave = document.createElement('canvas');
    wave.className = 'sound-wave';
    wave.width = 120; wave.height = 34;
    drawWave(wave, item.path, playingPath === item.path && audio ? audio.currentTime / Math.max(0.001, audio.duration || 1) : 0);
    wave.title = 'Click to play from here';
    wave.addEventListener('click', (e) => {
      e.stopPropagation();
      const r = wave.getBoundingClientRect();
      seekPreview(item.path, r.width ? (e.clientX - r.left) / r.width : 0);
    });
    wave.addEventListener('dblclick', (e) => e.stopPropagation());
    top.appendChild(play); top.appendChild(wave);

    const name = document.createElement('div');
    name.className = 'sound-name';
    name.textContent = item.name;
    name.title = item.name;

    const sub = document.createElement('div');
    sub.className = 'sound-sub';
    const chip = document.createElement('span');
    chip.className = 'sound-chip';
    chip.textContent = (item.ext || '?').replace('.', '').toUpperCase();
    const size = document.createElement('span');
    size.textContent = item.missing ? 'missing' : humanSize(item.size || 0);
    sub.appendChild(chip); sub.appendChild(size);

    const fav = document.createElement('button');
    const isFav = data.favorites.includes(item.path);
    fav.className = 'sound-fav' + (isFav ? ' on' : '');
    fav.type = 'button';
    fav.title = isFav ? 'Remove from Favorites' : 'Add to Favorites';
    fav.setAttribute('aria-label', fav.title + ': ' + item.name);
    fav.innerHTML = starIcon(isFav);
    fav.dataset.sfx = 'own';
    fav.addEventListener('click', async () => {
      data = await api.soundsSetFavorite(item.path, !isFav).catch(() => data);
      // confirmation only when the favourite really changed (a failed write keeps the old data)
      if (window.azyUiSounds && data.favorites.includes(item.path) !== isFav) window.azyUiSounds.play(isFav ? 'unpin' : 'pin');
      paintSide(); paintGrid();
    });

    const apply = window.azyApplyButton('sound-apply', `Apply ${item.name}`, `Insert ${item.name} at the playhead${window.azyHold && window.azyHold.label ? ` — hold ${window.azyHold.label} to set the level first` : ''}`);
    apply.addEventListener('click', async (ev) => {
      if (apply.disabled) return;
      apply.disabled = true;
      apply.classList.add('busy');
      try {
        const res = await window.azySoundApply(item.path, item.name, { ev });
        toast(window.azySoundApply.describe(res, item.name));
      } finally {
        apply.disabled = false;
        apply.classList.remove('busy');
      }
    });

    // Pin to Dagger (v1.18): same pin state, undo and Settings list as the ◎ on Files cards —
    // azyDaggerPins keeps every badge in sync. Sits left of the star; a missing file can't be
    // newly pinned (an existing pin can still be removed).
    if (window.azyDaggerPins) {
      const pin = window.azyDaggerPins.badge(el, 'sfx', { path: item.path, name: item.name });
      pin.classList.add('sound-pin');
      pin.type = 'button';
      if (item.missing && !pin.classList.contains('on')) { pin.disabled = true; pin.title = 'This file is missing — it can\u2019t be pinned'; }
    }
    el.appendChild(fav); el.appendChild(top); el.appendChild(name); el.appendChild(sub); el.appendChild(apply);
    el.addEventListener('dblclick', () => togglePlay(item.path));
    return el;
  }

  function drawWave(canvas, seedPath, progress) {
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return; // headless / shimmed canvas: the card still works without art
    const bars = 40;
    const cs = getComputedStyle(document.documentElement);
    // The style can recolour the resting bars (Spider glow: accent bars; Clean: neutral).
    const accent = (cs.getPropertyValue('--azy-wave-on') || cs.getPropertyValue('--hue')).trim() || '#d6283f'; // Dark red fallback (v1.19: was legacy cyan)
    const rest = cs.getPropertyValue('--azy-wave-rest').trim() || 'rgba(160,160,168,0.38)'; // neutral, not bluish
    let h = 2166136261;
    for (let i = 0; i < seedPath.length; i++) { h ^= seedPath.charCodeAt(i); h = Math.imul(h, 16777619); }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < bars; i++) {
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      const r = ((h >>> 16) & 0xffff) / 0xffff;
      const bh = 4 + r * 26;
      const x = i * (canvas.width / bars);
      const on = i / bars <= progress;
      ctx.fillStyle = on ? accent : rest;
      ctx.fillRect(x, (canvas.height - bh) / 2, 2.1, bh);
    }
  }
  const humanSize = (n) => n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`;

  /* ------------------------------------------------- shared toolbar, Sounds side */
  async function pinFolder() {
    const res = await api.soundsPinFolder().catch((err) => { toast(String(err.message || err).replace(/^Error invoking remote method '[^']+': (Error: )?/, '')); return null; });
    if (!res) return;
    data = res;
    loaded = true;
    if (res.pinnedId) store.scope = res.pinnedId;
    try { localStorage.setItem('azy.sounds.scope', store.scope); } catch { /* ignore */ }
    paintSide(); paintGrid(); syncToolbar();
  }
  async function unpinCurrent() {
    if (store.scope === 'all' || store.scope === 'fav') return;
    const id = store.scope;
    data = await api.soundsRemoveFolder(id).catch(() => data);
    setScope('all');
  }
  function syncToolbar() {
    if (store.section !== 'sounds') return;
    const inFolder = store.scope !== 'all' && store.scope !== 'fav';
    if (unpinBtn) {
      unpinBtn.disabled = !inFolder;
      unpinBtn.title = inFolder ? 'Remove this sound folder from the library (files stay on disk)' : 'Pin a sound folder first';
    }
    if (upBtn) {
      upBtn.disabled = store.scope === 'all';
      upBtn.title = 'Back to All Sounds';
    }
    if (previewBtn) {
      previewBtn.setAttribute('aria-pressed', String(!store.wavesOff));
      previewBtn.title = store.wavesOff ? 'Waveforms: off' : 'Waveforms: on';
    }
  }
  if (addPinBtn) addPinBtn.addEventListener('click', () => { if (store.section === 'sounds') pinFolder(); });
  if (unpinBtn) unpinBtn.addEventListener('click', () => { if (store.section === 'sounds') unpinCurrent(); });
  if (refreshBtn) refreshBtn.addEventListener('click', () => { if (store.section === 'sounds') load(); });
  if (upBtn) upBtn.addEventListener('click', () => { if (store.section === 'sounds') setScope('all'); });
  if (previewBtn) previewBtn.addEventListener('click', () => {
    if (store.section !== 'sounds') return;
    store.wavesOff = !store.wavesOff;
    try { localStorage.setItem('azy.sounds.waves', store.wavesOff ? 'off' : 'on'); } catch { /* ignore */ }
    document.body.classList.toggle('sounds-waves-off', store.wavesOff);
    syncToolbar();
  });

  // A new accent / style repaints the (canvas) waveforms once; nothing else is rebuilt.
  document.addEventListener('azy:themechange', () => { if (loaded && store.section === 'sounds') paintGrid(); });

  /* ---------------------------------------------------------------- section */
  function applySection() {
    const sounds = store.section === 'sounds';
    shell.hidden = !sounds;
    mediaShell.hidden = sounds;
    document.body.classList.toggle('sounds-section', sounds);
    document.body.classList.toggle('sounds-waves-off', sounds && store.wavesOff);
    mediaBtn.classList.toggle('active', !sounds);
    mediaBtn.setAttribute('aria-pressed', String(!sounds));
    soundsBtn.classList.toggle('active', sounds);
    soundsBtn.setAttribute('aria-pressed', String(sounds));
    volumeWrap.hidden = !sounds;
    if (heroTitle) heroTitle.textContent = sounds ? 'Sounds library' : 'Media library';
    if (sounds && !loaded) load(); else syncToolbar();
    if (!sounds && audio && !audio.paused) audio.pause();
  }
  mediaBtn.addEventListener('click', () => { store.section = 'media'; try { localStorage.setItem('azy.files.section', 'media'); } catch { /* ignore */ } applySection(); });
  soundsBtn.addEventListener('click', () => { store.section = 'sounds'; try { localStorage.setItem('azy.files.section', 'sounds'); } catch { /* ignore */ } applySection(); });

  if (searchInput) searchInput.addEventListener('input', () => { store.query = searchInput.value; paintGrid(); });

  volumeBtn.addEventListener('click', () => {
    const open = volumePop.hidden;
    volumePop.hidden = !open;
    volumeBtn.setAttribute('aria-pressed', String(open));
  });
  volumeRange.addEventListener('input', () => setVolume(Number(volumeRange.value) / 100));
  document.addEventListener('pointerdown', (ev) => {
    if (!volumePop.hidden && !volumePop.contains(ev.target) && ev.target !== volumeBtn && !volumeBtn.contains(ev.target)) {
      volumePop.hidden = true;
      volumeBtn.setAttribute('aria-pressed', 'false');
    }
  });

  setVolume(store.volume);
  applySection();
  // The Azy wheel's SFX section opens this window on its Sounds library (and Files on Media), so the
  // two wheel sections always land on the view they are named after.
  try {
    if (window.presets && window.presets.onDagger) {
      window.presets.onDagger('files-view', (view) => {
        const next = view === 'sounds' ? 'sounds' : view === 'media' ? 'media' : null;
        if (!next || next === store.section) return;
        store.section = next;
        try { localStorage.setItem('azy.files.section', next); } catch { /* ignore */ }
        applySection();
      });
    }
  } catch { /* old bridge */ }
  window.azySounds = { get section() { return store.section; }, get volume() { return store.volume; }, get scope() { return store.scope; }, get playing() { return playingPath; }, get audioEl() { return audio; }, stopPreview, load, togglePlay, setVolume, pinFolder };
})();
