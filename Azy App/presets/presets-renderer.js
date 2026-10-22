// ---------- Presets ----------
// The second tab of the panel. Same strip of chips, same toolbar, same search row
// and the same card grid as the file browser — only what the cards *are* changes:
//
//   • a chip per pinned folder of .prfpset files (indexed and watched by the engine
//     in the main process; subfolders open like folders do on the Files tab)
//   • one "Premiere" chip for the presets that already live inside Premiere Pro. It
//     shows only the ones the user has starred. "Browse Premiere" in the toolbar
//     opens the whole library, bin by bin, with a star on every card.
//
// Applying: select the clip(s) in Premiere's timeline, then click a card. The
// connector (Azy's extension inside Premiere) builds the effects on the selection.
// The footer shows whether Premiere is connected and how many clips are selected.
//
// This file is loaded after renderer.js and leans on its globals on purpose —
// toast(), ICONS and native drag dismissal —
// so the two tabs cannot drift apart in look or feel.

(function presetsTab() {
  const P = window.presets;
  if (!P) return; // preload without the presets bridge (older build) — tab stays hidden

  // ---------- Elements ----------

  const modeRow = document.getElementById('modeRow');
  const filesTab = document.getElementById('filesTab');
  const presetsTab = document.getElementById('presetsTab');
  const filesPane = document.getElementById('filesPane');
  const presetsPane = document.getElementById('presetsPane');
  const snapTab = document.getElementById('snapTab');
  const snapPane = document.getElementById('snapPane');
  const flowTab = document.getElementById('flowTab');
  const flowPane = document.getElementById('flowPane');

  const stripEl = document.getElementById('presetPinsStrip');
  const addFolderBtn = document.getElementById('addPresetFolderBtn');
  const upBtn = document.getElementById('presetUpBtn');
  const breadcrumbEl = document.getElementById('presetBreadcrumb');
  const browseBtn = document.getElementById('presetBrowseBtn');
  P.on('operationProgress', (ev) => { if (activeWait) activeWait.fromEvent(ev); });
  const searchInput = document.getElementById('presetSearchInput');
  const countPill = document.getElementById('presetCountPill');
  const gridEl = document.getElementById('presetGrid');
  const statusHint = document.querySelector('.status-hint');
  const presetHeroTitle = document.getElementById('presetHeroTitle');
  const presetHeroDetail = document.getElementById('presetHeroDetail');
  const presetHeroCount = document.getElementById('presetHeroCount');
  const presetStateLabel = document.getElementById('presetStateLabel');
  const presetConnectionPill = document.getElementById('presetConnectionPill');
  const presetSourceCount = document.getElementById('presetSourceCount');
  const presetBoardTitle = document.getElementById('presetBoardTitle');

  const PRESET_ICON =
    '<svg viewBox="0 0 24 24" width="30" height="30"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8" fill="none"/><text x="12" y="15.6" text-anchor="middle" font-family="Inter, Segoe UI, sans-serif" font-size="8.5" font-weight="700" font-style="italic" fill="currentColor">fx</text></svg>';
  const PPRO_ICON =
    '<svg viewBox="0 0 24 24" width="13" height="13"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M8 16.5 V7.5 H11.4 A2.6 2.6 0 0 1 11.4 12.7 H8" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M14 16.5 V11 M14 13 A2.2 2.2 0 0 1 16.5 11" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round"/></svg>';
  const STAR_OFF =
    '<svg viewBox="0 0 24 24" width="11" height="11"><path d="M12 2.6 L14.1 8.3 L20.2 8.8 L15.5 12.8 L16.9 18.8 L12 15.6 L7.1 18.8 L8.5 12.8 L3.8 8.8 L9.9 8.3 Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/></svg>';
  const STAR_ON =
    '<svg viewBox="0 0 24 24" width="11" height="11"><path d="M12 2.6 L14.1 8.3 L20.2 8.8 L15.5 12.8 L16.9 18.8 L12 15.6 L7.1 18.8 L8.5 12.8 L3.8 8.8 L9.9 8.3 Z" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

  // ---------- State ----------

  let mode = 'files';
  let booted = false;
  let folders = []; // pinned .prfpset folders, from the engine
  let pproSources = []; // Premiere profiles that have a presets file
  // What the grid is showing:
  //   { kind: 'folder', folderId, relDir }      one pinned folder (or a subfolder)
  //   { kind: 'ppro' }                          starred Premiere presets
  //   { kind: 'ppro-browse', sourceId, binPath } the whole Premiere library
  let view = null;
  let items = []; // cards currently on screen (subfolders/bins first, then presets)
  let query = '';
  let conn = null; // last ConnectionStatus from the engine
  let applying = new Set();
  let filesHint = statusHint ? statusHint.textContent : '';
  let paneEntranceEpoch = 0;

  function paintWorkspaceChrome(next) {
    const copies = {
      files: { eyebrow: 'MEDIA WORKSPACE', title: 'Files', detail: 'Browse, preview, and send media' },
      presets: { eyebrow: 'PRESET DECK', title: 'Presets', detail: 'Find a look and apply it to Premiere' },
      flow: { eyebrow: 'MOTION STUDIO', title: 'Flow', detail: 'Shape selected keyframes with intent' },
      snap: { eyebrow: 'CONTROL ROOM', title: 'Settings', detail: 'Shortcuts, helpers, and connection health' }
    };
    const copy = copies[next] || copies.files;
    if (window.azyWorkspaceHeader && window.azyWorkspaceHeader.set) { window.azyWorkspaceHeader.set(next, copy); return; }
    // No header module in this document: write the three spans directly, so the chrome can never
    // be one workspace behind the pane underneath it (a dedicated window labels itself instead).
    const root = document.documentElement;
    const own = root.dataset.workspace && root.dataset.workspace !== 'all' ? root.dataset.workspace : next;
    const text = copies[own] || copy;
    const set = (sel, value) => { const el = document.querySelector(sel); if (el) el.textContent = value; };
    set('.workspace-eyebrow', text.eyebrow);
    set('.workspace-title', text.title);
    set('.workspace-detail', text.detail);
    if (document.title !== `Azy — ${text.title}`) document.title = `Azy — ${text.title}`;
  }

  function playPaneEntrance(next, animate) {
    const active = next === 'files' ? filesPane : next === 'presets' ? presetsPane : next === 'flow' ? flowPane : snapPane;
    [filesPane, presetsPane, flowPane, snapPane].filter(Boolean).forEach((pane) => pane.classList.remove('section-enter'));
    if (!animate || !active) return;
    const epoch = ++paneEntranceEpoch;
    // Force the opacity/transform start state before adding the restartable class.
    void active.offsetWidth;
    active.classList.add('section-enter');
    setTimeout(() => { if (epoch === paneEntranceEpoch) active.classList.remove('section-enter'); }, 320);
  }

  function paintPresetDeck() {
    if (!presetHeroTitle || !presetHeroDetail) return;
    const isFolder = view && view.kind === 'folder';
    const browse = view && view.kind === 'ppro-browse';
    const folder = isFolder ? folders.find((f) => f.id === view.folderId) : null;
    const label = isFolder ? (folder ? folder.label : 'Preset library') : browse ? 'Browse Premiere presets' : 'Your starred presets';
    const detail = isFolder
      ? 'A local .prfpset library. Open folders to inspect, click a preset to apply, and drag files when you need to share them.'
      : browse
        ? 'Star the looks you use most, then return to a fast personal deck.'
        : 'Your favorites stay light and focused. Use Browse when you need the full Premiere library.';
    presetHeroTitle.textContent = label;
    presetHeroDetail.textContent = detail;
    if (presetHeroCount) presetHeroCount.textContent = `${items.length} card${items.length === 1 ? '' : 's'} in view`;
    if (presetBoardTitle) presetBoardTitle.textContent = browse ? 'Premiere library' : isFolder ? (folder ? folder.label : 'Preset library') : 'Favorites & libraries';
  }

  // ---------- Mode switch ----------

  // Two kinds of window share this script:
  //   • the all-in-one ('all'): every section, switched with the tab row / dagger (panes swap in place)
  //   • a dedicated window ('files' | 'presets' | 'flow' | 'snap'): ONE section, no tab row — the
  //     dagger is the switcher, and main brings the right window forward at this window's spot.
  // Inside Premiere (panel shim) it always behaves like the all-in-one.
  const ORDER = ['files', 'presets', 'flow', 'snap'];
  const inPanel = document.body.classList.contains('in-premiere') || !P.openWorkspace;
  const dedicated = !inPanel && ORDER.includes(P.workspace) ? P.workspace : null;
  const scrollMemo = {};
  const scrollerOf = (m) => document.getElementById(m === 'files' ? 'fileGrid' : m === 'presets' ? 'presetGrid' : m === 'flow' ? 'flowGrid' : 'settingsBody');
  const modePill = document.getElementById('modePill');
  function paintPill(tab) {
    if (!modePill || !tab) return;
    const row = tab.parentElement.getBoundingClientRect(), r = tab.getBoundingClientRect();
    modePill.style.transform = `translateX(${Math.round(r.left - row.left)}px)`;
    modePill.style.width = `${Math.round(r.width)}px`;
    modePill.classList.add('ready');
  }
  window.addEventListener('resize', () => paintPill(document.querySelector('.mode-tab.active')));
  // renderer.js loads before this controller. Keep its thumbnail lifecycle in the one shared
  // Files pipeline: a real pane/workspace departure releases media, while Grid/List presentation
  // changes never call this and therefore keep their live card sources untouched.
  function setFilesThumbnailSector(active) {
    const lifecycle = window.azyFilesThumbnails;
    if (!lifecycle || typeof lifecycle.setSectorActive !== 'function') return;
    try { lifecycle.setSectorActive(active === true); } catch { /* a retiring renderer is harmless */ }
  }
  function showPane(next, animate) {
    mode = next;
    document.documentElement.dataset.section = mode; // per-panel colour theme follows the section
    if (!animate) document.documentElement.dataset.nav = 'none';
    const presetsOn = mode === 'presets';
    const snapOn = mode === 'snap';
    const flowOn = mode === 'flow';
    filesPane.hidden = presetsOn || snapOn || flowOn;
    presetsPane.hidden = !presetsOn;
    if (snapPane) snapPane.hidden = !snapOn;
    if (flowPane) flowPane.hidden = !flowOn;
    // Do this after `hidden` changes so a returning Files observer sees a live pane. This is the
    // only all-in-one sector boundary; Grid/List stays presentation-only and retains its sources.
    setFilesThumbnailSector(mode === 'files');
    if (mode !== 'files' && typeof hidePreview === 'function') hidePreview();
    playPaneEntrance(next, animate);
    paintWorkspaceChrome(next);
    for (const [tab, on] of [[filesTab, mode === 'files'], [presetsTab, presetsOn], [snapTab, snapOn], [flowTab, flowOn]]) {
      if (!tab) continue;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-selected', String(on));
      if (on) {
        // Set the geometry synchronously as well as on the next layout frame.
        // Incoming dedicated windows are intentionally native-transparent; an
        // rAF in an occluded renderer can be deferred, which otherwise left the
        // shared navigation indicator one workspace behind at first reveal.
        paintPill(tab);
        requestAnimationFrame(() => paintPill(tab));
      }
    }
    if (presetsOn || snapOn || flowOn) {
      boot();
      paintStatus();
      if (snapOn && window.azySnapSettings) window.azySnapSettings.show();
      if (flowOn && window.azyFlow) window.azyFlow.show();
    } else if (statusHint) {
      statusHint.textContent = filesHint;
      statusHint.classList.remove('is-ok', 'is-warn');
    }
  }
  function setMode(next) {
    if (!ORDER.includes(next) || next === mode) return;
    if (dedicated) { // a dedicated window never swaps panes: ask main for the other window
      if (P.openWorkspace) P.openWorkspace(next).catch(() => {});
      return;
    }
    const prevScroller = scrollerOf(mode); if (prevScroller) scrollMemo[mode] = prevScroller.scrollTop;
    document.documentElement.dataset.nav = ORDER.indexOf(next) > ORDER.indexOf(mode) ? 'fwd' : 'back';
    if (typeof hidePreview === 'function') hidePreview();
    showPane(next, true);
    const s2 = scrollerOf(next); if (s2 && scrollMemo[next]) s2.scrollTop = scrollMemo[next];
  }
  if (dedicated) {
    document.documentElement.dataset.workspace = dedicated;
    document.body.classList.add('is-dedicated');
    if (modeRow) modeRow.hidden = true;
    // Flip panes synchronously (no flash of the Files pane); module hooks run once their scripts,
    // which load after this one, are in.
    filesPane.hidden = dedicated !== 'files'; presetsPane.hidden = dedicated !== 'presets';
    if (snapPane) snapPane.hidden = dedicated !== 'snap';
    if (flowPane) flowPane.hidden = dedicated !== 'flow';
    mode = null;
    setTimeout(() => showPane(dedicated, false), 0);
  } else {
    document.documentElement.dataset.workspace = 'all';
    paintWorkspaceChrome('files');
    paintPill(filesTab);
    requestAnimationFrame(() => paintPill(filesTab));
  }
  // Window switch choreography (see main.js openWorkspace): the renderer has a
  // distinct zero-pixel `ws-preroll` frame before it starts `ws-enter`. Main only
  // restores native opacity after the third compositor opportunity acknowledges
  // that running animation, so the first visible native pixels are already moving.
  const shell = document.body;
  let workspaceRevealEpoch = 0;
  if (P.onWorkspaceLeaving) P.onWorkspaceLeaving(() => {
    // Dedicated Files windows are retired by main during a workspace switch. Release before the
    // window is hidden/destroyed rather than relying on an eventual GC cycle.
    setFilesThumbnailSector(false);
    workspaceRevealEpoch++;
    shell.classList.remove('ws-preroll', 'ws-enter');
    shell.classList.add('ws-leave');
  });
  if (P.onWorkspaceShown) P.onWorkspaceShown((shown) => {
    const token = shown && typeof shown === 'object' ? shown.token : null;
    const epoch = ++workspaceRevealEpoch;
    shell.classList.remove('ws-leave', 'ws-enter', 'ws-preroll');
    shell.classList.add('ws-preroll');
    // Read after adding the class. It synchronously installs the 0-opacity,
    // offset first state before the next rAF becomes eligible to paint.
    void shell.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (epoch !== workspaceRevealEpoch) return;
      shell.classList.remove('ws-preroll');
      shell.classList.add('ws-enter');
      // One more rAF comes after the browser has had a chance to composite the
      // start of ws-enter. This is the exact hand-off main waits for.
      requestAnimationFrame(() => {
        if (epoch === workspaceRevealEpoch && token && P.workspaceEntered) P.workspaceEntered(token);
      });
    }));
    setTimeout(() => { if (epoch === workspaceRevealEpoch) shell.classList.remove('ws-enter', 'ws-preroll'); }, 520);
  });
  if (P.onWorkspaceShown) P.onWorkspaceShown(() => { paintStatus(); if (mode === 'flow' && window.azyFlow) window.azyFlow.show(); requestAnimationFrame(() => paintPill(document.querySelector('.mode-tab.active'))); });

  // Dagger wheel → section (main only tells the window it just brought forward).
  if (P.onDagger) P.onDagger('section', (id) => { if (ORDER.includes(id)) setMode(id); });
  filesTab.addEventListener('click', () => setMode('files'));
  presetsTab.addEventListener('click', () => setMode('presets'));
  if (snapTab) snapTab.addEventListener('click', () => setMode('snap'));
  if (flowTab) flowTab.addEventListener('click', () => setMode('flow'));

  // ---------- Boot (once, when the tab is first opened) ----------

  async function boot() {
    if (booted) return;
    booted = true;
    try {
      await P.boot();
    } catch (err) {
      booted = false;
      renderEmpty(PRESET_ICON, "Couldn't start the preset engine", cleanError(err));
      return;
    }
    P.on('indexChange', () => {
      refreshChips();
      if (view && view.kind === 'folder') openView(view, true);
    });
    P.on('pproChange', () => {
      refreshChips();
      if (view && view.kind !== 'folder') openView(view, true);
    });
    P.on('connection', (c) => {
      conn = c;
      paintStatus();
    });
    if (window.azyStatus) { window.azyStatus.onChange(() => paintStatus()); window.azyStatus.refresh(); }
    try {
      conn = await P.getConnection();
    } catch {
      conn = null;
    }
    paintStatus();
    await refreshChips();
    if (!view) {
      if (folders.length) openView({ kind: 'folder', folderId: folders[0].id, relDir: '' });
      else openView({ kind: 'ppro' });
    }
  }

  // ---------- Chips ----------

  async function refreshChips() {
    try {
      folders = await P.getFolders();
    } catch {
      folders = [];
    }
    try {
      pproSources = await P.pproSources();
    } catch {
      pproSources = [];
    }
    if (presetSourceCount) presetSourceCount.textContent = String(folders.length + 1);
    Array.from(stripEl.querySelectorAll('.chip--pin')).forEach((el) => el.remove());

    // Premiere first: it is the one chip that is always there.
    const ppro = document.createElement('button');
    const pproActive = view && view.kind !== 'folder';
    ppro.className = 'chip chip--pin' + (pproActive ? ' active' : '');
    ppro.title = pproSources.length
      ? `Starred presets from Premiere (${pproSources.map((s) => s.label).join(', ')})`
      : 'Presets that live inside Premiere Pro';
    ppro.innerHTML = PPRO_ICON + '<span>Premiere</span>';
    ppro.addEventListener('click', () => openView({ kind: 'ppro' }));
    stripEl.appendChild(ppro);

    folders.forEach((f, i) => {
      const chip = document.createElement('button');
      const active = view && view.kind === 'folder' && view.folderId === f.id;
      chip.className = 'chip chip--pin' + (active ? ' active' : '');
      chip.title = `${f.path}${f.count ? ` — ${f.count} preset${f.count === 1 ? '' : 's'}` : ''}`;
      chip.style.animationDelay = `${Math.min(i + 1, 8) * 30}ms`;
      const label = document.createElement('span');
      label.textContent = f.label;
      chip.appendChild(label);
      chip.addEventListener('click', () => openView({ kind: 'folder', folderId: f.id, relDir: '' }));
      stripEl.appendChild(chip);
    });

    renderToolbar();
    if (view) paintPresetDeck();
  }

  addFolderBtn.addEventListener('click', async () => {
    const dir = await P.pickFolder();
    if (!dir) return;
    try {
      const f = await P.pinFolder(dir);
      await refreshChips();
      openView({ kind: 'folder', folderId: f.id, relDir: '' });
      toast(`Pinned ${f.label}`);
    } catch (err) {
      toast(cleanError(err));
    }
  });

  // Same wheel-glide as the Files strip: reuse its handler by dispatching to the
  // same logic would couple the two, so the strip simply scrolls with the wheel.
  stripEl.addEventListener(
    'wheel',
    (e) => {
      const max = stripEl.scrollWidth - stripEl.clientWidth;
      if (max <= 0) return;
      const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (!raw) return;
      e.preventDefault();
      stripEl.scrollLeft = Math.max(0, Math.min(max, stripEl.scrollLeft + raw * 0.9));
    },
    { passive: false }
  );

  // ---------- Toolbar ----------

  // The right-hand toolbar button mirrors the Files tab's Pin/Unpin: on a pinned
  // folder it unpins; on the Premiere chip it flips between "starred only" and the
  // full library.
  function renderToolbar() {
    if (!view) {
      browseBtn.disabled = true;
      upBtn.disabled = true;
      return;
    }
    browseBtn.disabled = false;
    if (view.kind === 'folder') {
      upBtn.disabled = !view.relDir;
      browseBtn.classList.add('pinned');
      browseBtn.setAttribute('aria-pressed', 'true');
      browseBtn.title = 'Unpin this folder';
      browseBtn.innerHTML = ICONS.pinOn + '<span>Unpin</span>';
    } else if (view.kind === 'ppro') {
      upBtn.disabled = true;
      browseBtn.classList.remove('pinned');
      browseBtn.setAttribute('aria-pressed', 'false');
      browseBtn.title = 'Browse every preset in Premiere and star the ones you want here';
      browseBtn.innerHTML = STAR_OFF + '<span>Browse</span>';
    } else {
      upBtn.disabled = !(view.binPath && view.binPath.length) && !view.sourceId;
      browseBtn.classList.add('pinned');
      browseBtn.setAttribute('aria-pressed', 'true');
      browseBtn.title = 'Back to your starred presets';
      browseBtn.innerHTML = STAR_ON + '<span>Starred</span>';
    }
  }

  browseBtn.addEventListener('click', async () => {
    if (!view || browseBtn.disabled) return;
    if (view.kind === 'folder') {
      const f = folders.find((x) => x.id === view.folderId);
      await P.unpinFolder(view.folderId);
      view = null;
      await refreshChips();
      toast(`Unpinned ${f ? f.label : 'folder'}`);
      if (folders.length) openView({ kind: 'folder', folderId: folders[0].id, relDir: '' });
      else openView({ kind: 'ppro' });
    } else if (view.kind === 'ppro') {
      if (!pproSources.length) {
        try {
          pproSources = await P.pproDiscover();
        } catch {
          pproSources = [];
        }
      }
      if (!pproSources.length) {
        const file = await P.pickPremiereFile();
        if (!file) return;
        try {
          await P.pproAddFile(file);
          pproSources = await P.pproSources();
        } catch (err) {
          toast(cleanError(err));
          return;
        }
      }
      openView({ kind: 'ppro-browse', sourceId: pproSources.length === 1 ? pproSources[0].id : null, binPath: [] });
    } else {
      openView({ kind: 'ppro' });
    }
  });

  upBtn.addEventListener('click', () => {
    if (!view || upBtn.disabled) return;
    if (view.kind === 'folder') {
      const parts = view.relDir.split('/').filter(Boolean);
      parts.pop();
      openView({ kind: 'folder', folderId: view.folderId, relDir: parts.join('/') });
    } else if (view.kind === 'ppro-browse') {
      if (view.binPath.length) openView({ ...view, binPath: view.binPath.slice(0, -1) });
      else openView({ kind: 'ppro-browse', sourceId: null, binPath: [] });
    }
  });

  // ---------- Breadcrumb ----------

  function crumb(label, onClick, isLast) {
    const el = document.createElement('span');
    el.className = 'crumb' + (isLast ? ' current' : '');
    el.textContent = label;
    if (!isLast && onClick) el.addEventListener('click', onClick);
    return el;
  }

  function sep() {
    const s = document.createElement('span');
    s.className = 'crumb-sep';
    s.textContent = '/';
    return s;
  }

  function renderBreadcrumb() {
    breadcrumbEl.innerHTML = '';
    if (!view) {
      breadcrumbEl.innerHTML = '<span class="breadcrumb-empty">No presets yet</span>';
      return;
    }
    const crumbs = [];
    if (view.kind === 'folder') {
      const f = folders.find((x) => x.id === view.folderId);
      crumbs.push({ label: f ? f.label : 'Folder', go: () => openView({ kind: 'folder', folderId: view.folderId, relDir: '' }) });
      const parts = view.relDir.split('/').filter(Boolean);
      parts.forEach((part, i) => {
        const rel = parts.slice(0, i + 1).join('/');
        crumbs.push({ label: part, go: () => openView({ kind: 'folder', folderId: view.folderId, relDir: rel }) });
      });
    } else if (view.kind === 'ppro') {
      crumbs.push({ label: 'Premiere' });
      crumbs.push({ label: 'Starred' });
    } else {
      crumbs.push({ label: 'Premiere', go: () => openView({ kind: 'ppro' }) });
      crumbs.push({ label: 'All presets', go: () => openView({ kind: 'ppro-browse', sourceId: null, binPath: [] }) });
      if (view.sourceId) {
        const s = pproSources.find((x) => x.id === view.sourceId);
        if (pproSources.length > 1 && s) crumbs.push({ label: s.label, go: () => openView({ ...view, binPath: [] }) });
        view.binPath.forEach((bin, i) => {
          crumbs.push({ label: bin, go: () => openView({ ...view, binPath: view.binPath.slice(0, i + 1) }) });
        });
      }
    }
    crumbs.forEach((c, i) => {
      const last = i === crumbs.length - 1;
      breadcrumbEl.appendChild(crumb(c.label, c.go, last));
      if (!last) breadcrumbEl.appendChild(sep());
    });
    breadcrumbEl.scrollLeft = breadcrumbEl.scrollWidth;
  }

  // ---------- Views ----------

  async function openView(next, keepQuery) {
    view = next;
    if (!keepQuery) {
      query = '';
      searchInput.value = '';
    }
    searchInput.disabled = false;
    if (typeof hidePreview === 'function' && !keepQuery) hidePreview();
    applying.clear();

    try {
      if (view.kind === 'folder') {
        const b = await P.browse(view.folderId, view.relDir);
        if (!b) {
          items = [];
        } else {
          items = b.subfolders
            .map((s) => ({ type: 'dir', name: s.name, count: s.count, relDir: s.relDir }))
            .concat(b.presets.map((p) => ({ type: 'preset', preset: p })));
        }
      } else if (view.kind === 'ppro') {
        const favs = await P.pproFavorites();
        items = favs.map((p) => ({ type: 'preset', preset: p, ppro: true }));
      } else if (!view.sourceId) {
        if (!pproSources.length) pproSources = await P.pproSources();
        if (pproSources.length === 1) return openView({ ...view, sourceId: pproSources[0].id }, keepQuery);
        items = pproSources.map((s) => ({ type: 'source', name: s.label, count: s.count, sourceId: s.id, error: s.error }));
      } else {
        const b = await P.pproBrowse(view.sourceId, view.binPath);
        items = b
          ? b.bins
              .map((bin) => ({ type: 'bin', name: bin.name, count: bin.count, binPath: view.binPath.concat(bin.name) }))
              .concat(b.presets.map((p) => ({ type: 'preset', preset: p, ppro: true })))
          : [];
      }
    } catch (err) {
      items = [];
      toast(cleanError(err));
    }
    renderBreadcrumb();
    renderToolbar();
    refreshChipsActive();
    paintPresetDeck();
    renderGrid();
  }

  function refreshChipsActive() {
    const chips = Array.from(stripEl.querySelectorAll('.chip--pin'));
    chips.forEach((chip, i) => {
      const isPpro = i === 0;
      const active = isPpro
        ? !!view && view.kind !== 'folder'
        : !!view && view.kind === 'folder' && folders[i - 1] && folders[i - 1].id === view.folderId;
      chip.classList.toggle('active', !!active);
    });
  }

  // ---------- Grid ----------

  function renderEmpty(icon, title, sub) {
    // Empty Presets gets the quietest piece of the art universe (Void Azy): the emblem
    // and a few strands fading out. Decorative, behind the orb, never interactive.
    const art = window.azyArt ? window.azyArt.markup('art-void', 'empty-art empty-art--fade') : '';
    gridEl.innerHTML =
      `<div class="empty-state">${art}<div class="empty-orb">${icon}</div><div>${escapeHtml(title)}</div>` +
      (sub ? `<div style="font-size:10.5px">${escapeHtml(sub)}</div>` : '') +
      '</div>';
  }

  async function renderGrid() {
    gridEl.innerHTML = '';
    let list = items;

    if (query) {
      // A search on a pinned folder covers the whole folder tree; on Premiere it
      // covers the whole library (or just the starred ones on that view).
      try {
        if (view.kind === 'folder') {
          const hits = await P.search(query, { folderId: view.folderId }, 400);
          list = hits.map((p) => ({ type: 'preset', preset: p }));
        } else if (view.kind === 'ppro-browse' && view.sourceId) {
          const hits = await P.pproSearch(query, view.sourceId, 400);
          list = hits.map((p) => ({ type: 'preset', preset: p, ppro: true }));
        } else {
          list = items.filter((it) => (it.preset ? it.preset.name : it.name).toLowerCase().includes(query));
        }
      } catch {
        list = [];
      }
    }

    countPill.textContent = list.length ? `${list.length} item${list.length === 1 ? '' : 's'}` : '';
    countPill.classList.toggle('show', list.length > 0);
    if (presetHeroCount) presetHeroCount.textContent = query ? `${list.length} match${list.length === 1 ? '' : 'es'} found` : `${list.length} card${list.length === 1 ? '' : 's'} in view`;

    if (list.length === 0) {
      if (query) renderEmpty(PRESET_ICON, 'No presets match your search');
      else if (!view) renderEmpty(PRESET_ICON, 'Pin a folder of .prfpset files to get started');
      else if (view.kind === 'ppro')
        renderEmpty(
          STAR_ON.replace('width="11" height="11"', 'width="30" height="30"'),
          'No starred Premiere presets yet',
          pproSources.length
            ? 'Press Browse to open everything in Premiere and star what you use'
            : "Press Browse to locate Premiere's presets file"
        );
      else if (view.kind === 'ppro-browse') renderEmpty(PRESET_ICON, 'Nothing in this bin');
      else renderEmpty(PRESET_ICON, 'No .prfpset files here');
      return;
    }

    list.forEach((it, i) => gridEl.appendChild(buildCard(it, i)));
  }

  function buildCard(it, i) {
    const isPreset = it.type === 'preset';
    const card = document.createElement('div');
    card.className = 'file-card preset-card' + (isPreset ? ' preset-card--apply' : ' preset-card--folder');
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    if (i < 30) { card.classList.add('rise'); card.style.animationDelay = `${Math.min(i, 24) * 14}ms`; }
    const thumb = document.createElement('div');
    thumb.className = 'thumb ' + (isPreset ? 'thumb--preset' : 'thumb--folder');
    thumb.innerHTML = `<span class="thumb-fallback">${isPreset ? PRESET_ICON : ICONS.folder}</span>`;

    if (isPreset && it.ppro) {
      // Star lives on the tile like the play badge does on a video.
      const star = document.createElement('button');
      const on = !!it.preset.favorite;
      star.className = 'fav-badge' + (on ? ' on' : '');
      star.dataset.sfx = 'own';
      star.innerHTML = on ? STAR_ON : STAR_OFF;
      star.title = on ? 'Remove from your starred presets' : 'Star — show this preset in Azy';
      // One write, one repaint — so a Ctrl+Z goes through exactly the same path as the click and the
      // card cannot end up disagreeing with the library.
      async function setStar(next) {
        const updated = await P.pproSetFavorite(it.preset.id, next);
        it.preset.favorite = updated ? updated.favorite : next;
        if (window.azyUiSounds) window.azyUiSounds.play(it.preset.favorite ? 'pin' : 'unpin'); // after the write succeeded
        toast(it.preset.favorite ? `Starred ${it.preset.name}` : `Unstarred ${it.preset.name}`);
        if (view.kind === 'ppro') openView(view, true);
        else {
          star.classList.toggle('on', it.preset.favorite);
          star.innerHTML = it.preset.favorite ? STAR_ON : STAR_OFF;
        }
      }
      star.addEventListener('click', async (e) => {
        e.stopPropagation();
        const was = !!it.preset.favorite;
        try {
          await setStar(!was);
          if (window.azyUndo && was !== !!it.preset.favorite) window.azyUndo.record({
            label: `${it.preset.favorite ? 'Starred' : 'Unstarred'} ${it.preset.name}`,
            id: `ppro-fav:${it.preset.id}`,
            undo: () => setStar(was),
            redo: () => setStar(!was),
          });
        } catch (err) {
          toast(cleanError(err));
        }
      });
      thumb.appendChild(star);
    }
    if (isPreset && window.azyDaggerPins) window.azyDaggerPins.badge(thumb, 'presets', { id: it.preset.id, name: it.preset.name, ...(Array.isArray(it.preset.binPath) ? { bin: it.preset.binPath.join('/') } : {}) });
    if (!isPreset && it.count) {
      const n = document.createElement('div');
      n.className = 'count-badge';
      n.textContent = String(it.count);
      thumb.appendChild(n);
    }
    card.appendChild(thumb);

    const name = document.createElement('div');
    name.className = 'file-name';
    name.textContent = isPreset ? it.preset.name : it.name;
    name.title = isPreset ? presetTitle(it.preset) : it.name;
    card.appendChild(name);

    // Name only. The effect count and the "Apply →" footer were competing with the artwork for the
    // same 30 pixels; the title tooltip carries the same information on hover, without the noise.

    if (!isPreset) {
      card.draggable = false;
      const go = () => {
        if (it.type === 'dir') openView({ kind: 'folder', folderId: view.folderId, relDir: it.relDir });
        else if (it.type === 'bin') openView({ ...view, binPath: it.binPath });
        else openView({ kind: 'ppro-browse', sourceId: it.sourceId, binPath: [] });
      };
      card.addEventListener('dblclick', go);
      card.addEventListener('click', go);
      card.addEventListener('keydown', (ev) => {
        if (ev.target !== card) return; // nested star/pin buttons own their keyboard gestures
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); }
      });
      return card;
    }

    card.dataset.presetId = it.preset.id;
    // Select the clip(s) in Premiere, then click: the preset goes onto the selection.
    card.addEventListener('click', (ev) => applyPreset(it.preset, card, (window.azyHold ? window.azyHold.matches(ev) : ev.shiftKey)));
    card.addEventListener('keydown', (ev) => {
        if (ev.target !== card) return; // nested star/pin buttons own their keyboard gestures
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); applyPreset(it.preset, card, (window.azyHold ? window.azyHold.matches(ev) : ev.shiftKey)); }
    });

    // A .prfpset is a real file, so it drags out of Azy exactly like anything on
    // the Files tab (into Explorer, a chat, another folder). Premiere itself does
    // not accept a dropped .prfpset — its Effects panel only imports them through
    // its own menu — which is why clicking is how a preset is applied.
    card.draggable = !!it.preset.path;
    if (it.preset.path) {
      card.addEventListener('dragstart', (e) => {
        e.preventDefault();
        if (window.azyDismissPreviewForOutgoingDrag) window.azyDismissPreviewForOutgoingDrag();
        window.api.startDrag([it.preset.path]);
      });
    }

    return card;
  }

  function presetTitle(p) {
    const parts = [p.name];
    const effects = p.effectNames || (p.parsed && p.parsed.effectNames) || [];
    if (effects.length) parts.push(effects.join(', '));
    if (p.binPath && p.binPath.length) parts.push(p.binPath.join(' / '));
    if (p.displayPath) parts.push(p.displayPath);
    return parts.join('\n');
  }

  // ---------- Applying ----------

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

  // Sum of "N keyframes baked" notes across the result (the runtime reports per parameter).
  function countBaked(res) {
    let n = 0;
    const scan = (w) => { const m = /note: (\d+) keyframes baked/.exec(String(w)); if (m) n += Number(m[1]); };
    (res.warnings || []).forEach(scan);
    for (const t of res.targets || []) for (const e of t.effects || []) (e.warnings || []).forEach(scan);
    return n;
  }
  let activeWait = null;

  async function applyPreset(p, card, withSpeed) {
    if (applying.has(p.id)) return;
    if (!conn || conn.phase !== 'connected') {
      if (conn && conn.phase === 'premiere-running-no-connector' && window.azyPair) window.azyPair.show();
      else toast(window.azyStatus ? window.azyStatus.explain(conn) : "Premiere Pro isn't running", 3600);
      return;
    }
    const n = conn.premiereState ? conn.premiereState.selectionCount : 0;
    if (!n) {
      toast("Select the clip(s) in Premiere's timeline first, then click the preset", 3200);
      return;
    }
    // Plain click applies at 100% straight away. Hold-modifier+click (Shift by default, Settings ›
    // Shortcuts; window.azyHold) asks for a speed first (always from 100%).
    let speed = 1;
    if (withSpeed && window.azySpeedPrompt) {
      card.classList.add('asking');
      const v = await window.azySpeedPrompt.ask(document.body, { title: 'Apply with speed', name: p.name });
      card.classList.remove('asking');
      if (v === null) return;
      speed = v;
    }
    if (applying.has(p.id)) return;
    applying.add(p.id);
    card.classList.add('applying');
    card.classList.remove('done', 'failed');
    const pane = card.closest('.pane') || document.body;
    const operationId = 'op_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const w = window.azyWait ? window.azyWait.show(document.body, { title: 'Applying preset', name: p.name, operationId, onCancel: () => P.cancelOperation(operationId) }) : null;
    activeWait = w;
    let outcome = 'failed';
    let summary = '';
    try {
      const res = await P.applyPreset(p.id, { mode: 'selection' }, { speed, operationId, expectName: p.name, ...(Array.isArray(p.binPath) ? { expectBin: p.binPath.join('/') } : {}) });
      const ok = res.targets ? res.targets.length : 0;
      const spd = speed !== 1 ? ` at ${Math.round(speed * 100)}%` : '';
      const baked = countBaked(res);
      summary = `${baked ? baked.toLocaleString() + ' keyframes' : 'Applied'}${spd}`;
      if (res.state === 'SUCCESS') { outcome = 'done'; if (window.azyDoneSfx) window.azyDoneSfx.play('presets'); toast(`Applied ${p.name}${spd} to ${ok} clip${ok === 1 ? '' : 's'}${baked ? ` · ${baked.toLocaleString()} keyframes` : ''}`); }
      else if (res.state === 'PARTIAL') { outcome = 'done'; toast(`Applied ${p.name}${spd} to ${ok} clip${ok === 1 ? '' : 's'} — ${firstWarning(res)}`, 5000); }
      else if (res.state === 'CANCELLED') {
        // Honest cancel (v1.17): the connector reports how many changes were already committed.
        // Zero → truly cancelled; otherwise it STOPPED and the written part is still there.
        const c = Number.isFinite(res.committed) ? res.committed : null;
        if (c === 0) { summary = 'Cancelled · nothing was changed'; toast(`${p.name} cancelled — nothing was changed in Premiere`, 2400); }
        else if (c > 0) { summary = `Stopped · ${c} change${c === 1 ? '' : 's'} already applied (Ctrl+Z undoes)`; toast(`${p.name} stopped — ${c} change${c === 1 ? ' was' : 's were'} already applied; Ctrl+Z in Premiere undoes ${c === 1 ? 'it' : 'them'}`, 4200); }
        else { summary = 'Stopped · anything already written stays undoable (Ctrl+Z)'; toast(`${p.name} stopped — anything already written stays undoable with Ctrl+Z in Premiere`, 3600); }
      }
      else { summary = (res.warnings && res.warnings[0]) || "Couldn't apply"; toast(`Couldn't apply ${p.name}${res.warnings && res.warnings[0] ? ': ' + res.warnings[0] : ''}`, 4000); }
    } catch (err) {
      summary = cleanError(err);
      toast(summary, 4000);
    } finally {
      if (w) { if (outcome === 'done') w.done(summary); else w.fail(summary); }
      activeWait = null;
      applying.delete(p.id);
      card.classList.remove('applying');
      card.classList.add(outcome);
      setTimeout(() => card.classList.remove('done', 'failed'), 700);
    }
  }

  // Azy manages its Premiere module itself; a click on a warning status re-runs setup.
  async function repair() {
    toast('Checking Azy in Premiere Pro…', 1800);
    const m = window.azyStatus ? await window.azyStatus.repair() : null;
    if (m) toast(m.summary + (m.next ? ' — ' + m.next : ''), 4200);
  }

  // ---------- Footer status ----------

  let statusAction = null;
  function paintStatus() {
    const l = window.azyStatus ? window.azyStatus.line(conn, { what: 'a preset' }) : { text: '', cls: 'is-off' };
    if (statusHint && (mode === 'presets' || mode === 'snap')) {
      statusHint.classList.remove('is-ok', 'is-warn');
      statusHint.textContent = l.text;
      if (l.cls !== 'is-off') statusHint.classList.add(l.cls);
    }
    // The Preset Deck makes connection readiness part of the task header, not
    // a cryptic footer condition. It remains the same one connector state.
    if (presetStateLabel && mode === 'presets') presetStateLabel.textContent = l.text || 'Select clips in Premiere to apply';
    if (presetConnectionPill) {
      presetConnectionPill.classList.remove('is-ok', 'is-warn', 'is-off');
      presetConnectionPill.classList.add(l.cls || 'is-off');
      const label = presetConnectionPill.querySelector('em');
      if (label) label.textContent = l.cls === 'is-ok' ? 'ready' : l.cls === 'is-warn' ? 'needs attention' : 'offline';
    }
    statusAction = l.action || null;
  }

  if (statusHint) {
    statusHint.addEventListener('click', () => {
      if (mode !== 'presets') return;
      if (statusAction === 'repair') repair();
      else if (statusAction === 'help') { if (window.azyPair) window.azyPair.show(); else toast(window.azyStatus.explain(conn), 4200); }
      else if (conn && conn.phase === 'connected') toast(`Azy is running in ${conn.label || 'Premiere Pro'}${conn.detail ? ' — ' + conn.detail : ''}`, 2600);
    });
  }

  // ---------- Search ----------

  let searchDebounce = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      query = searchInput.value.trim().toLowerCase();
      renderGrid();
    }, 80);
  });

  // ---------- Keyboard ----------
  // Runs in the capture phase, ahead of renderer.js's handler, and only while this
  // tab is showing: Esc clears the preset search first (renderer.js would otherwise
  // see an idle panel and close the app), Ctrl+F focuses this tab's search box.

  window.addEventListener(
    'keydown',
    (e) => {
      if (mode !== 'presets') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        e.stopImmediatePropagation();
        searchInput.focus();
        return;
      }
      if (e.key === 'Escape' && searchInput.value) {
        e.stopImmediatePropagation();
        searchInput.value = '';
        query = '';
        renderGrid();
      }
    },
    true
  );

  // ---------- Helpers ----------

  function cleanError(err) {
    const msg = err && err.message ? err.message : String(err);
    // Electron prefixes remote errors with the channel name; keep only the reason.
    return msg.replace(/^Error invoking remote method '[^']+': (Error: )?/, '');
  }
})();
