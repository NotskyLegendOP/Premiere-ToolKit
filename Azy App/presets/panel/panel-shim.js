// Runs only inside the Premiere WebView (injected by panel-host.js before renderer.js).
// Recreates the two preload bridges — window.api (file explorer) and window.presets
// (engine) — on top of HTTP so the unchanged renderer scripts work as-is.
(function panelShim() {
  // The azy-wait mirror loaded alongside this shim owns processing overlays inside
  // Premiere; tell the connector shell so its legacy busy veil never doubles them.
  try { if (window.parent && window.parent !== window) window.parent.__azyPanelMirror = true; } catch { /* sandboxed */ }
  const token = (window.__AZY_PANEL__ && window.__AZY_PANEL__.token) || '';
  const base = location.origin + '/panel';
  const listeners = new Map(); // channel -> Set<cb>

  async function rpc(ch, ...args) {
    const r = await fetch(base + '/rpc', { method: 'POST', headers: { 'content-type': 'application/json', 'x-azy-token': token }, body: JSON.stringify({ ch, args }) });
    if (!r.ok) throw new Error(`Azy panel: ${r.status} ${await r.text()}`);
    const j = await r.json();
    if (j.error) { const e = new Error(j.error.message); if (j.error.code) e.code = j.error.code; throw e; }
    return j.result;
  }
  function on(ch, cb) {
    if (!listeners.has(ch)) listeners.set(ch, new Set());
    listeners.get(ch).add(cb);
    return () => listeners.get(ch).delete(cb);
  }
  // Events: SSE with auto-reconnect (the browser does it for us).
  let es = null;
  function connectEvents() {
    try { es = new EventSource(base + '/events?t=' + encodeURIComponent(token)); } catch { return; }
    es.addEventListener('ipc', (ev) => {
      try {
        const { ch, payload } = JSON.parse(ev.data);
        for (const cb of listeners.get(ch) || []) { try { cb(payload); } catch { /* listener error */ } }
      } catch { /* bad frame */ }
    });
    es.onerror = () => { document.body && document.body.classList.add('azy-offline'); };
    es.onopen = () => { document.body && document.body.classList.remove('azy-offline'); };
  }
  connectEvents();

  // ---- window.api: the file explorer is app-only; give inert answers so renderer.js boots ----
  window.api = {
    getPins: async () => [],
    addPin: async () => null,
    pinFolder: async () => null,
    removePin: async () => null,
    reorderPins: async () => null,
    listDirectory: async () => ({ items: [] }),
    getParent: async () => null,
    startDrag: () => {},
    getPathForFile: () => null,
    importDroppedItems: async () => ({ imported: [], failed: [] }),
    toggleAlwaysOnTop: async () => false,
    getFileStats: async () => null,
    // The panel never shows Files, but the shared boot path still asks for the library.
    soundsGet: async () => ({ folders: [], favorites: [] }),
    soundsPinFolder: async () => ({ folders: [], favorites: [] }),
    soundsRemoveFolder: async () => ({ folders: [], favorites: [] }),
    soundsSetFavorite: async () => ({ folders: [], favorites: [] }),
    imageThumb: async () => null,
    openVideoPlayer: () => {},
    setDockHeight: async (h) => h,
    getSettings: () => rpc('azy:presets:uiSettings'),
    setPrefs: (patch) => patch && ['uiSpeedHold', 'uiCustomThemes', 'uiTheme', 'uiPerf', 'uiMotion', 'uiWebs', 'uiCharacters', 'uiSkin', 'uiGlow', 'uiWebOpacity', 'uiWebDensity', 'uiRadius', 'uiGlass', 'uiAnimSpeed', 'uiScale'].some((k) => patch[k] !== undefined) ? rpc('azy:presets:setUiPrefs', patch) : rpc('azy:presets:uiSettings'),
    onSettingsChanged: (cb) => on('settings-changed', cb),
    setVolume: () => {},
    onVolumeChanged: () => {},
    onDragFailed: () => {},
    closeApp: () => {}
  };

  // ---- window.presets: same table as preload.js, over rpc() ----
  const PREFIX = 'azy:presets:';
  const INVOKE = ['pinFolder', 'unpinFolder', 'updateFolder', 'getFolders', 'rescan', 'browse', 'search', 'favorites', 'recent', 'get', 'setFavorite', 'getPlan', 'renameFile', 'removeFromIndex', 'deleteFile', 'revealInFolder', 'getConnection', 'beginPairing', 'forgetTokens', 'premiereState', 'premiereSelection', 'applyPreset', 'dragBegin', 'dragConfirm', 'dragCancel', 'dragState', 'getLog', 'setDebug', 'boot', 'pickFolder', 'pickPremiereFile', 'connectorDir', 'azyStatus', 'azyCommand', 'moduleRepair', 'moduleRefresh', 'cancelOperation', 'placeAudio', 'placeMedia'];
  const PPRO = ['sources', 'discover', 'addFile', 'setPinned', 'browse', 'search', 'get', 'setFavorite', 'favorites'];
  const SNAP = ['status', 'sync', 'search', 'get', 'setFavorite', 'apply'];
  const FLOW = ['status', 'list', 'get', 'setFavorite', 'create', 'update', 'delete', 'duplicate', 'keyframes', 'apply', 'move'];
  const SNAP_WIN = ['snapHide', 'snapPin', 'snapShowMain', 'snapToggle', 'snapGetSettings', 'snapSetSettings', 'speedHide', 'speedToggle', 'speedGetSettings', 'speedSetSettings', 'flowMoveToggle', 'flowMoveGetSettings', 'flowMoveSetSettings'];
  const EVENTS = ['indexChange', 'scan', 'connection', 'drag', 'pairing', 'pproChange', 'snapChange', 'snapShown', 'snapSettings', 'flowChange', 'flowApplied', 'flowMoved', 'flowMoveSettings', 'operationProgress', 'operationState', 'azyStatus', 'speedShown', 'speedSettings'];
  const up = (k) => k[0].toUpperCase() + k.slice(1);
  const presets = {};
  for (const k of INVOKE) presets[k] = (...a) => rpc(PREFIX + k, ...a);
  for (const k of PPRO) presets['ppro' + up(k)] = (...a) => rpc(PREFIX + 'ppro:' + k, ...a);
  for (const k of SNAP) presets['snap' + up(k)] = (...a) => rpc(PREFIX + 'snap:' + k, ...a);
  for (const k of FLOW) presets['flow' + up(k)] = (...a) => rpc(PREFIX + 'flow:' + k, ...a);
  for (const k of SNAP_WIN) presets[k] = (...a) => rpc(PREFIX + k, ...a);
  presets.on = (event, cb) => (EVENTS.includes(event) ? on(PREFIX + 'evt:' + event, cb) : () => {});
  // Dagger lives on the desktop (needs a system-wide mouse hook); inside Premiere it is absent.
  presets.daggerGetSettings = async () => ({ enabled: false, available: false, confine: false, sections: [] });
  presets.daggerSetSettings = async () => ({ enabled: false, available: false, confine: false, sections: [] });
  presets.daggerPreview = async () => false;
  presets.daggerHover = async () => null;
  presets.daggerState = async () => null;
  presets.daggerPin = async () => ({ enabled: false, available: false, confine: false, sections: [], error: 'Dagger is a desktop feature' });
  presets.onDagger = () => () => {};
  // Inside Premiere there is one panel: workspaces are panes, never windows.
  presets.workspace = 'files';
  presets.openWorkspace = async () => 'files';
  presets.onWorkspaceShown = () => () => {};
  presets.onWorkspaceLeaving = () => () => {};
  presets.workspaceEntered = () => {};
  window.presets = presets;

  // Native folder pickers can't open from inside Premiere's WebView; say so instead of hanging.
  const nope = (what) => async () => { throw new Error(`${what} from the Azy app window (the Premiere panel can't open OS dialogs)`); };
  presets.pickFolder = nope('Pin folders');
  presets.pickPremiereFile = nope('Locate the Premiere presets file');

  // Start on the Presets tab: Files is app-only in the panel.
  window.addEventListener('DOMContentLoaded', () => {
    const t = document.getElementById('presetsTab');
    if (t) setTimeout(() => t.click(), 0);
  });
})();
