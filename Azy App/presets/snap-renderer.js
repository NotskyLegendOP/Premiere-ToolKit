// ---------- Snap Action: renderer ----------
// Keyboard-first quick-apply for Premiere's own effects and presets. Everything is
// already in Azy's main process (the engine's SnapAction catalogue); this file only
// searches it, paints rows, and sends "apply this id to the selected clips".
//
// Flow the user sees: Shift+Space → type → ↑/↓ → Enter. The window hides after a
// successful apply unless pinned, so it gets out of the way of the timeline.

(() => {
  const P = window.presets;
  const $ = (id) => document.getElementById(id);

  const input = $('snapInput');
  const list = $('snapList');
  const countEl = $('snapCount');
  const connEl = $('snapConn');
  const connTextEl = $('snapConnectionText');
  const selEl = $('snapSel');
  const toastWrap = $('toastWrap');
  const mediaSeg = $('snapMedia');
  const pinBtn = $('snapPinBtn');
  const syncBtn = $('snapSyncBtn');
  const placeDlg = $('snapPlaceDialog');

  let items = [];
  /* Recent (v1.17): the 2 effects/presets most recently applied *successfully* (SUCCESS or PARTIAL —
     something really landed). Failed, refused or cancelled applies are never recorded. Browsing
     only (a search keeps the engine's relevance order); filters still apply. Ids only. */
  const RECENT_KEY = 'azy.snap.recent';
  const RECENT_MAX = 2;
  let recentCount = 0;
  function loadRecent() {
    try {
      const v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      return Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.length && x.length < 400).slice(0, RECENT_MAX) : [];
    } catch { return []; }
  }
  function recordRecent(id) {
    if (typeof id !== 'string' || !id) return;
    const next = [id, ...loadRecent().filter((x) => x !== id)].slice(0, RECENT_MAX);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* storage full: skip */ }
  }
  let active = 0;
  let filter = { media: undefined, favoritesOnly: false };
  let query = '';
  let conn = null;
  let status = null;
  let pinned = false;
  let hideAfterApply = true;
  let applying = null;
  // Last chosen transition placement — preselected in the popup next time.
  const EDGE_ORDER = ['start', 'end', 'both', 'cuts'];
  let lastEdges = 'both';
  try { if (EDGE_ORDER.includes(localStorage.getItem('azy.snap.edges'))) lastEdges = localStorage.getItem('azy.snap.edges'); } catch (_) {}
  let placeResolve = null; // pending askPlacement() promise
  let searchTimer = null;
  let searchSeq = 0;
  let snapRevealEpoch = 0;
  let snapRevealTimer = null;
  const snapShell = $('snap');

  // ---------- helpers ----------

  // Snap is opened repeatedly during an edit. A completed animation must not be
  // restarted after the native surface is visible: each hidden→visible route
  // gets a fresh pre-roll/enter pair, and each old route is invalidated by its
  // epoch before it can acknowledge or clear the newer one.
  function startSnapReveal(shown) {
    if (!snapShell) return;
    const token = shown && typeof shown === 'object' ? shown.token : null;
    const epoch = ++snapRevealEpoch;
    clearTimeout(snapRevealTimer);
    snapShell.classList.remove('reveal', 'snap-preroll', 'snap-enter');
    if (!token) {
      // Legacy/non-native hosts retain a quick local entrance without holding a
      // visible window at a zero-opacity first frame.
      void snapShell.offsetWidth;
      snapShell.classList.add('snap-enter');
      snapRevealTimer = setTimeout(() => { if (epoch === snapRevealEpoch) snapShell.classList.remove('snap-enter'); }, 460);
      return;
    }
    snapShell.classList.add('snap-preroll');
    void snapShell.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (epoch !== snapRevealEpoch) return;
      snapShell.classList.remove('snap-preroll');
      snapShell.classList.add('snap-enter');
      // The next rAF follows the browser's chance to composite the start of
      // snap-enter. Main uses this precise acknowledgement before alpha=1.
      requestAnimationFrame(() => {
        if (epoch === snapRevealEpoch && P.snapRevealReady) P.snapRevealReady(token);
      });
    }));
    snapRevealTimer = setTimeout(() => { if (epoch === snapRevealEpoch) snapShell.classList.remove('snap-enter', 'snap-preroll'); }, 460);
  }

  if (snapShell) snapShell.addEventListener('animationend', (event) => {
    if (event.target === snapShell && event.animationName === 'snapCommandEnter') snapShell.classList.remove('snap-enter');
  });


  // Flatten result warnings (top-level + per-clip/per-effect) so a PARTIAL apply says *why*.
  function firstWarning(res) {
    const all = [].concat(res.warnings || []);
    for (const t of res.targets || []) for (const e of t.effects || []) {
      if (e.error && e.error.message) all.push(`${e.displayName}: ${e.error.message}`);
      for (const w of e.warnings || []) if (!/^(param #\d+ "[^"]*": )?(note:|dry run)/.test(w)) all.push(`${e.displayName}: ${w}`);
    }
    const w = all.find((x) => !/^(note:|dry run)/.test(x)) || all[0] || 'see the Azy log';
    return all.length > 1 ? `${w} (+${all.length - 1} more)` : w;
  }
  function toastKind(msg) {
    const m = String(msg);
    if (/failed|couldn't|could not|unable|error|cancel|refus|missing|disconnect|invalid/i.test(m)) return 'toast--error';
    if (/^no |waiting|retry|partial|warn|check /i.test(m)) return 'toast--warn';
    if (/applied|connected|saved|copied|done|success|restored|linked|inserted|updated/i.test(m)) return 'toast--success';
    return '';
  }
  function toast(message, ms = 1800) {
    const el = document.createElement('div');
    el.className = 'toast ' + toastKind(message);
    el.textContent = message;
    const xBtn = document.createElement('button');
    xBtn.type = 'button';
    xBtn.className = 'toast-x';
    xBtn.setAttribute('aria-label', 'Dismiss notification');
    xBtn.addEventListener('click', () => { clearTimeout(el._hide); el.classList.add('out'); setTimeout(() => el.remove(), 240); });
    el.appendChild(xBtn);
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 260);
    }, ms);
  }

  function cleanError(err) {
    const m = (err && err.message) || String(err);
    // Electron prefixes invoke() rejections with "Error invoking remote method '…': Error: "
    return m.replace(/^Error invoking remote method '[^']+': (Error: )?/, '').replace(/^BridgeError: /, '');
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function highlight(name, q) {
    if (!q) return esc(name);
    const i = name.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(name);
    return esc(name.slice(0, i)) + '<mark>' + esc(name.slice(i, i + q.length)) + '</mark>' + esc(name.slice(i + q.length));
  }

  const ICONS = {
    transition: '<svg viewBox="0 0 24 24" width="14" height="14"><rect x="2.5" y="7" width="11" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="10.5" y="7" width="11" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10.5 7 L13.5 17" stroke="currentColor" stroke-width="1.6"/></svg>',
    preset: '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M7 3.5A3.5 3.5 0 1 1 3.5 7H7zm10 0A3.5 3.5 0 1 0 20.5 7H17zM7 20.5A3.5 3.5 0 1 1 3.5 17H7zm10 0a3.5 3.5 0 1 0 3.5-3.5H17zM7 7h10v10H7z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    effect: '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.2 2.2M16.2 16.2l2.2 2.2M5.6 18.4l2.2-2.2M16.2 7.8l2.2-2.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    video: '<svg viewBox="0 0 24 24" width="11" height="11"><rect x="3" y="7" width="13" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m16 11 5-3v8l-5-3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    audio: '<svg viewBox="0 0 24 24" width="11" height="11"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
  };

  // ---------- painting ----------

  function paintStatus() {
    const st = status;
    if (!st) return;
    const n = (v) => (Number.isFinite(+v) ? +v : 0); // an incomplete status never prints NaN / undefined
    const total = n(st.effects) + n(st.transitions) + n(st.presets);
    let txt = `<b>${total}</b> items · ${n(st.favorites)} favorited`;
    if (st.syncing) txt += ' · syncing…';
    else if (st.effectsFromCache && !st.effectsSyncedAt) txt += ' · effects from last session';
    else if (!st.effects) txt += ' · connect Premiere to list its effects';
    countEl.innerHTML = txt;
    syncBtn.classList.toggle('busy', !!st.syncing);
  }

  function paintConn() {
    connEl.classList.remove('on', 'warn');
    let title = "Premiere Pro isn't running";
    let sel = '';
    if (conn) {
      if (conn.phase === 'connected') {
        connEl.classList.add('on');
        title = `Azy is running in Premiere Pro ${conn.host ? conn.host.version : ''}`;
        const n = conn.premiereState ? conn.premiereState.selectionCount : 0;
        if (!conn.premiereState || !conn.premiereState.hasSequence) sel = 'No sequence open in Premiere';
        else sel = n ? `${n} clip${n === 1 ? '' : 's'} selected` : 'Select clips in Premiere';
        selEl.classList.toggle('warn', !n);
      } else if (conn.phase === 'premiere-running-no-connector') {
        connEl.classList.add('warn');
        title = 'Premiere Pro is open — Azy is starting inside it…';
        sel = 'Azy starting in Premiere';
        selEl.classList.add('warn');
      } else if (conn.phase === 'unsupported-version') {
        title = conn.detail || 'Unsupported Premiere version';
        sel = 'Premiere version not supported (needs 25.6+)';
      } else {
        sel = 'Premiere not running';
        selEl.classList.remove('warn');
      }
    }
    connEl.title = title;
    if (connTextEl) connTextEl.textContent = conn && conn.phase === 'connected' ? 'ready' : conn && conn.phase === 'premiere-running-no-connector' ? 'starting' : 'offline';
    selEl.textContent = sel;
  }

  function row(item, idx) {
    const el = document.createElement('div');
    el.className = 'snap-row' + (idx === active ? ' active' : '') + (applying === item.id ? ' applying' : '');
    el.dataset.id = item.id;
    el.dataset.idx = String(idx);
    el.setAttribute('role', 'option');
    el.setAttribute('aria-selected', idx === active ? 'true' : 'false');
    el.style.animationDelay = Math.min(idx, 14) * 12 + 'ms';
    const media = item.mediaType === 'audio' ? 'audio' : 'video';
    const mediaLabel = item.mediaType === 'mixed' ? 'Video + Audio' : media[0].toUpperCase() + media.slice(1);
    const bin = item.type === 'preset' && item.binPath && item.binPath.length ? item.binPath.join(' / ') : '';
    el.innerHTML =
      `<span class="snap-ic">${item.type === 'preset' ? ICONS.preset : item.type === 'transition' ? ICONS.transition : ICONS.effect}</span>` +
      `<span class="snap-name" title="${esc(item.matchName || item.name)}">${highlight(item.name, query)}</span>` +
      `<span class="snap-tag kind">${item.type === 'preset' ? 'Preset' : item.type === 'transition' ? 'Transition' : 'Effect'}</span>` +
      `<span class="snap-tag">${ICONS[media]}${mediaLabel}</span>` +
      (bin ? `<span class="snap-bin" title="${esc(bin)}">${esc(bin)}</span>` : '') +
      `<span class="snap-spacer"></span>` +
      `<button class="snap-star${item.favorite ? ' on' : ''}" title="${item.favorite ? 'Remove from favorites' : 'Add to favorites'} (Ctrl+D)" tabindex="-1">${item.favorite ? '★' : '☆'}</button>` +
      `<button class="snap-apply" tabindex="-1">Apply <kbd>↵</kbd></button>`;
    return el;
  }

  function paintList() {
    list.innerHTML = '';
    if (!items.length) {
      const e = document.createElement('div');
      e.className = 'snap-empty';
      if (status && !status.effects && !status.presets) {
        e.innerHTML = '<b>Nothing to show yet</b>Azy starts with Premiere Pro (Window › Extensions › Azy) and the effects list fills in automatically.<br>Presets you save in Premiere\'s Effects panel appear here too.';
      } else if (filter.favoritesOnly) {
        e.innerHTML = '<b>No favorites yet</b>Star an effect or preset and it shows up here.';
      } else {
        e.innerHTML = `<b>No matches for “${esc(query)}”</b>Try a shorter word, or clear the Video / Audio filter.`;
      }
      list.appendChild(e);
      return;
    }
    const frag = document.createDocumentFragment();
    let lastType = null;
    if (recentCount) {
      const g = document.createElement('div');
      g.className = 'snap-group snap-group-recent';
      g.innerHTML = `${ICONS.effect} Recent <span class="n">${recentCount}</span>`;
      frag.appendChild(g);
    }
    items.forEach((it, i) => {
      if (i >= recentCount && it.type !== lastType) {
        lastType = it.type;
        const n = items.slice(recentCount).filter((x) => x.type === it.type).length;
        const g = document.createElement('div');
        g.className = 'snap-group';
        g.innerHTML = `${it.type === 'preset' ? ICONS.preset : it.type === 'transition' ? ICONS.transition : ICONS.effect} ${it.type === 'preset' ? 'Presets' : it.type === 'transition' ? 'Transitions' : 'Effects'} <span class="n">${n}</span>`;
        frag.appendChild(g);
      }
      frag.appendChild(row(it, i));
    });
    list.appendChild(frag);
    scrollActiveIntoView();
  }

  function setActive(i) {
    if (!items.length) return;
    active = Math.max(0, Math.min(items.length - 1, i));
    list.querySelectorAll('.snap-row').forEach((el) => {
      const on = Number(el.dataset.idx) === active;
      el.classList.toggle('active', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    scrollActiveIntoView();
  }

  // ---------- transition placement popup ----------
  // Applying a transition first asks where it goes: Start / End / Both / Between clips.
  // Resolves with the choice, or null when cancelled (Esc / Cancel / click outside).
  function askPlacement(item) {
    if (!placeDlg) { toast('Placement dialog missing — applying to both edges', 3000); return Promise.resolve('both'); }
    if (placeResolve) placeResolve(null);
    return new Promise((resolve) => {
      placeResolve = resolve;
      $('snapPlaceName').textContent = item.name;
      placeDlg.hidden = false;
      if (window.azyReveal) window.azyReveal(placeDlg);
      markPlace(lastEdges);
      const btn = placeDlg.querySelector(`[data-edges="${lastEdges}"]`);
      if (btn) btn.focus();
    });
  }
  function markPlace(v) {
    placeDlg.querySelectorAll('[data-edges]').forEach((b) => b.classList.toggle('active', b.dataset.edges === v));
  }
  function placeCurrent() {
    const a = placeDlg.querySelector('[data-edges].active');
    return a ? a.dataset.edges : lastEdges;
  }
  function closePlace(choice) {
    if (!placeDlg || placeDlg.hidden) return;
    placeDlg.hidden = true;
    const r = placeResolve; placeResolve = null;
    if (choice) { lastEdges = choice; try { localStorage.setItem('azy.snap.edges', choice); } catch (_) {} }
    input.focus();
    if (r) r(choice || null);
  }
  if (placeDlg) {
    placeDlg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-edges]');
      if (b) return closePlace(b.dataset.edges);
      if (e.target.closest('#snapPlaceCancel') || e.target === placeDlg) closePlace(null);
    });
    placeDlg.addEventListener('mousemove', (e) => { const b = e.target.closest('[data-edges]'); if (b) markPlace(b.dataset.edges); });
  }
  function placeKey(e) {
    if (!placeDlg || placeDlg.hidden) return false;
    e.preventDefault(); e.stopPropagation();
    const i = EDGE_ORDER.indexOf(placeCurrent());
    if (e.key === 'Escape') closePlace(null);
    else if (e.key === 'Enter' || e.key === ' ') closePlace(placeCurrent());
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') markPlace(EDGE_ORDER[(i + 1) % 4]);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') markPlace(EDGE_ORDER[(i + 3) % 4]);
    else if (['1', '2', '3', '4'].includes(e.key)) closePlace(EDGE_ORDER[Number(e.key) - 1]);
    return true;
  }

  function scrollActiveIntoView() {
    const el = list.querySelector('.snap-row.active');
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' });
  }

  // ---------- data ----------

  async function refresh() {
    const seq = ++searchSeq;
    try {
      const res = await P.snapSearch(query, { media: filter.media, favoritesOnly: filter.favoritesOnly }, 300);
      if (seq !== searchSeq) return;
      // Presets first, like the mockup, then effects; the engine has already ranked within kinds.
      const order = { preset: 0, transition: 1, effect: 2 };
      // Browsing: presets first (like the mockup), then effects, A→Z. Searching: the engine's
      // relevance order as-is, so "blur" lists the blur effects before presets that merely
      // contain a blur.
      const prevId = items[active] ? items[active].id : null;
      items = query ? res : res.slice().sort((a, b) => order[a.type] - order[b.type] || a.name.localeCompare(b.name));
      recentCount = 0;
      if (!query) {
        const recent = loadRecent().map((id) => items.find((x) => x.id === id)).filter(Boolean);
        if (recent.length) { items = [...recent, ...items.filter((x) => !recent.includes(x))]; recentCount = recent.length; }
      }
      // A background refresh (star, sync, Premiere file change) keeps the highlighted item;
      // a new query starts from the top.
      const keep = prevId && !refresh.newQuery ? items.findIndex((x) => x.id === prevId) : -1;
      refresh.newQuery = false;
      active = keep >= 0 ? keep : 0;
      paintList();
    } catch (err) {
      items = [];
      recentCount = 0;
      paintList();
      toast(cleanError(err), 3000);
    }
  }

  function scheduleRefresh() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(refresh, 60);
  }

  async function loadStatus() {
    try {
      status = await P.snapStatus();
      paintStatus();
    } catch {
      /* engine not up yet */
    }
  }

  async function loadConn() {
    try {
      conn = await P.getConnection();
      paintConn();
    } catch {
      /* ignore */
    }
  }

  // ---------- actions ----------

  async function toggleFavorite(item) {
    try {
      const updated = await P.snapSetFavorite(item.id, !item.favorite);
      if (updated) {
        const i = items.findIndex((x) => x.id === item.id);
        if (i >= 0) items[i] = updated;
        const el = list.querySelector(`.snap-row[data-idx="${i}"] .snap-star`);
        if (el) {
          el.classList.toggle('on', updated.favorite);
          el.textContent = updated.favorite ? '★' : '☆';
        }
        toast(updated.favorite ? `Starred ${updated.name}` : `Unstarred ${updated.name}`, 1200);
        if (window.azyUndo) window.azyUndo.record({
          label: `${updated.favorite ? 'Starred' : 'Unstarred'} ${updated.name}`,
          undo: () => toggleFavorite(items[i] || item),
          redo: () => toggleFavorite(items[i] || item),
        });
        if (filter.favoritesOnly && !updated.favorite) scheduleRefresh();
      }
      loadStatus();
    } catch (err) {
      toast(cleanError(err), 3000);
    }
  }

  async function apply(item) {
    if (!item || applying) return;
    if (!conn || conn.phase !== 'connected') {
      if (conn && conn.phase === 'premiere-running-no-connector') {
        toast('Azy is starting inside Premiere Pro. If nothing happens, open Window › Extensions › Azy in Premiere.', 4200);
      } else if (conn && conn.phase === 'unsupported-version') {
        toast(conn.detail || 'This Premiere version is not supported (needs 25.6+)', 4000);
      } else {
        toast("Premiere Pro isn't running", 2400);
      }
      return;
    }
    let edges = null;
    if (item.type === 'transition') {
      edges = await askPlacement(item);
      if (!edges) return; // cancelled
      if (applying) return;
    }
    applying = item.id;
    const rowEl = list.querySelector(`.snap-row[data-idx="${items.indexOf(item)}"]`);
    if (rowEl) rowEl.classList.add('applying');
    /* Close the moment the editor commits (v1.16): the apply runs in the main process, so Snap gets
       out of the way before Premiere even starts. It comes back only to explain a partial /
       failed apply. Pinned or "Hide after applying" off keeps the old behaviour. */
    const hideNow = !pinned && hideAfterApply && typeof P.snapHide === 'function';
    const reshow = () => { if (hideNow && typeof P.snapToggle === 'function') return Promise.resolve(P.snapToggle({ force: true })).catch(() => {}); return Promise.resolve(); };
    if (hideNow) Promise.resolve(P.snapHide()).catch(() => {});
    try {
      const res = await P.snapApply(item.id, { mode: 'selection' }, { ...(edges ? { edges } : {}), ...(item.name ? { expectName: item.name } : {}), ...(Array.isArray(item.binPath) ? { expectBin: item.binPath.join('/') } : {}) });
      const ok = res.targets ? res.targets.length : 0;
      const clips = `${ok} clip${ok === 1 ? '' : 's'}`;
      const where = edges ? { start: ' at the start', end: ' at the end', both: '', cuts: ' between clips' }[edges] : '';
      if (res.state === 'SUCCESS' || res.state === 'PARTIAL') { recordRecent(item.id); if (!hideNow) scheduleRefresh(); }
      if (res.state === 'SUCCESS') {
        if (window.azyDoneSfx) window.azyDoneSfx.play('presets');
        toast(`Applied ${item.name}${where} to ${clips}`);
      } else if (res.state === 'PARTIAL') {
        await reshow();
        toast(`Applied ${item.name} to ${clips} — ${firstWarning(res)}`, 5000);
      } else if (res.state === 'CANCELLED') {
        toast('Cancelled');
      } else {
        await reshow();
        toast(`Couldn't apply ${item.name}${res.warnings && res.warnings[0] ? ': ' + res.warnings[0] : ''}`, 4000);
      }
    } catch (err) {
      await reshow();
      toast(cleanError(err), 4000);
    } finally {
      applying = null;
      if (rowEl) rowEl.classList.remove('applying');
      loadStatus();
    }
  }


  async function sync() {
    syncBtn.classList.add('busy');
    try {
      status = await P.snapSync();
      paintStatus();
      toast(`${status.effects} effects from Premiere`, 1500);
      scheduleRefresh();
    } catch (err) {
      toast(cleanError(err), 3000);
    } finally {
      syncBtn.classList.remove('busy');
    }
  }

  function setMedia(btn) {
    mediaSeg.querySelectorAll('.snap-seg-btn').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    if (btn.dataset.fav) {
      filter = { media: undefined, favoritesOnly: true };
    } else {
      filter = { media: btn.dataset.media || undefined, favoritesOnly: false };
    }
    refresh();
  }

  function cycleFilter(dir) {
    const btns = Array.from(mediaSeg.querySelectorAll('.snap-seg-btn'));
    const i = btns.findIndex((b) => b.classList.contains('active'));
    setMedia(btns[(i + dir + btns.length) % btns.length]);
  }

  // ---------- events ----------

  input.addEventListener('input', () => {
    query = input.value.trim();
    refresh.newQuery = true;
    scheduleRefresh();
  });

  document.addEventListener('keydown', (e) => {
    if (placeKey(e)) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      if (query) {
        input.value = '';
        query = '';
        refresh();
      } else {
        P.snapHide();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(active - 1);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      setActive(active + 10);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      setActive(active - 10);
    } else if (e.key === 'Home' && e.ctrlKey) {
      setActive(0);
    } else if (e.key === 'End' && e.ctrlKey) {
      setActive(items.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      apply(items[active]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      cycleFilter(e.shiftKey ? -1 : 1);
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      if (items[active]) toggleFavorite(items[active]);
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      setMedia(mediaSeg.querySelector('[data-fav]'));
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      sync();
    } else if (document.activeElement !== input && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      input.focus();
    }
  });

  list.addEventListener('click', (e) => {
    const rowEl = e.target.closest('.snap-row');
    if (!rowEl) return;
    const item = items[Number(rowEl.dataset.idx)];
    if (!item) return;
    if (e.target.closest('.snap-star')) {
      toggleFavorite(item);
      return;
    }
    setActive(Number(rowEl.dataset.idx));
    if (e.target.closest('.snap-apply')) {
      apply(item);
      return;
    }
    // Plain click on a row = apply. Same "select clips, then click the preset" workflow as the main panel.
    apply(item);
    input.focus();
  });

  list.addEventListener('mousemove', (e) => {
    const rowEl = e.target.closest('.snap-row');
    if (rowEl && Number(rowEl.dataset.idx) !== active) setActive(Number(rowEl.dataset.idx));
  });

  mediaSeg.addEventListener('click', (e) => {
    const b = e.target.closest('.snap-seg-btn');
    if (b) {
      setMedia(b);
      input.focus();
    }
  });

  pinBtn.addEventListener('click', async () => {
    pinned = await P.snapPin(!pinned);
    pinBtn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
    toast(pinned ? 'Snap Action stays open' : 'Snap Action hides when you click away', 1400);
    input.focus();
  });
  $('snapCloseBtn').addEventListener('click', () => P.snapHide());
  $('snapHomeBtn').addEventListener('click', () => P.snapShowMain());
  $('snapPairBtn').addEventListener('click', async () => {
    // Azy manages its Premiere module itself; this just tells the user where things stand and
    // re-runs setup when something is missing.
    try {
      const st = await P.azyStatus();
      const m = (st.modules || []).find((x) => x.host === 'premiere');
      if (m && m.install !== 'installed' && !m.busy) { toast('Setting up Azy in Premiere Pro…', 1800); const r = await P.moduleRepair(); toast(r.summary + (r.next ? ' — ' + r.next : ''), 4200); }
      else if (m) toast(m.summary + (m.next ? ' — ' + m.next : ''), 3600);
    } catch (err) { toast(cleanError(err), 3000); }
  });
  syncBtn.addEventListener('click', sync);

  P.on('snapChange', () => {
    loadStatus();
    scheduleRefresh();
  });
  P.on('pproChange', () => {
    loadStatus();
    scheduleRefresh();
  });
  P.on('connection', (c) => {
    conn = c;
    paintConn();
    loadStatus();
  });
  P.on('snapSettings', (s) => {
    hideAfterApply = s.hideAfterApply !== false;
  });
  P.on('snapShown', (shown) => {
    // Start the renderer's first committed visual frame before main restores
    // native opacity. This replaces the old show-then-restart-.reveal sequence
    // that was stable only on the first opening.
    startSnapReveal(shown);
    input.focus();
    input.select();
    loadConn();
    loadStatus();
    scheduleRefresh();
  });
  window.addEventListener('focus', () => input.focus());

  // ---------- boot ----------

  (async () => {
    try {
      await P.boot();
    } catch (err) {
      countEl.textContent = "Couldn't start the preset engine";
      toast(cleanError(err), 5000);
      return;
    }
    pinned = await P.snapPin();
    try {
      hideAfterApply = (await P.snapGetSettings()).hideAfterApply !== false;
    } catch {
      /* defaults */
    }
    pinBtn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
    await Promise.all([loadStatus(), loadConn()]);
    await refresh();
    input.focus();
  })();
})();
