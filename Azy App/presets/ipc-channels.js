// Channel names shared by preload.js and presets-main.js. Mirrors the engine's IPC
// contract (azy-presets/packages/core/src/electron/ipc-contract.ts) so the preload can
// stay tiny instead of loading the whole engine bundle just to learn some strings.
const P = 'azy:presets:';
const INVOKE = [
  'pinFolder', 'unpinFolder', 'updateFolder', 'getFolders', 'rescan',
  'browse', 'search', 'favorites', 'recent', 'get', 'setFavorite', 'getPlan',
  'renameFile', 'removeFromIndex', 'deleteFile', 'revealInFolder',
  'getConnection', 'beginPairing', 'forgetTokens', 'premiereState', 'premiereSelection', 'applyPreset',
  'dragBegin', 'dragConfirm', 'dragCancel', 'dragState',
  'getLog', 'setDebug'
];
const SNAP = ['status', 'sync', 'search', 'get', 'setFavorite', 'apply'];
const FLOW = ['status', 'list', 'get', 'setFavorite', 'create', 'update', 'delete', 'duplicate', 'keyframes', 'apply', 'move'];
const PPRO = ['sources', 'discover', 'addFile', 'setPinned', 'browse', 'search', 'get', 'setFavorite', 'favorites'];
const EVENTS = { indexChange: 'indexChange', scan: 'scan', connection: 'connection', drag: 'drag', pairing: 'pairing', pproChange: 'pproChange', snapChange: 'snapChange', snapShown: 'snapShown', snapSettings: 'snapSettings', flowChange: 'flowChange', flowApplied: 'flowApplied', flowMoved: 'flowMoved', flowMoveSettings: 'flowMoveSettings', operationProgress: 'operationProgress', operationState: 'operationState', azyStatus: 'azyStatus', speedShown: 'speedShown', speedSettings: 'speedSettings', windowSettings: 'windowSettings' };

const channels = {};
for (const k of INVOKE) channels[k] = P + k;
for (const k of PPRO) channels['ppro' + k[0].toUpperCase() + k.slice(1)] = P + 'ppro:' + k;
for (const k of FLOW) channels['flow' + k[0].toUpperCase() + k.slice(1)] = P + 'flow:' + k;
for (const k of SNAP) channels['snap' + k[0].toUpperCase() + k.slice(1)] = P + 'snap:' + k;
// Azy-side helpers (dialogs, lazy start) that are not part of the engine contract.
channels.boot = P + 'boot';
channels.pickFolder = P + 'pickFolder';
channels.pickPremiereFile = P + 'pickPremiereFile';
channels.connectorDir = P + 'connectorDir';
channels.azyStatus = P + 'azyStatus';
channels.azyCommand = P + 'azyCommand';
channels.moduleRepair = P + 'moduleRepair';
channels.moduleRefresh = P + 'moduleRefresh';
channels.cancelOperation = P + 'cancelOperation';
channels.snapHide = P + 'snapHide';
channels.snapPin = P + 'snapPin';
channels.snapShowMain = P + 'snapShowMain';
channels.snapToggle = P + 'snapToggle';
channels.snapGetSettings = P + 'snapGetSettings';
channels.snapSetSettings = P + 'snapSetSettings';
channels.speedHide = P + 'speedHide';
channels.speedToggle = P + 'speedToggle';
channels.speedGetSettings = P + 'speedGetSettings';
channels.speedSetSettings = P + 'speedSetSettings';
channels.windowToggle = P + 'windowToggle';
channels.windowGetSettings = P + 'windowGetSettings';
channels.windowSetSettings = P + 'windowSetSettings';
channels.flowMoveToggle = P + 'flowMoveToggle';
channels.flowMoveGetSettings = P + 'flowMoveGetSettings';
channels.flowMoveSetSettings = P + 'flowMoveSetSettings';
// Dagger wheel (presets/dagger-main.js) — its own prefix, same registry.
channels.daggerGetSettings = 'azy:dagger:getSettings';
channels.daggerSetSettings = 'azy:dagger:setSettings';
channels.daggerPreview = 'azy:dagger:preview';
channels.daggerHover = 'azy:dagger:hover';
channels.daggerPin = 'azy:dagger:pin';
channels.daggerState = 'azy:dagger:state';
channels.daggerPinsExport = 'azy:dagger:pinsExport';
channels.daggerPinsImportPick = 'azy:dagger:pinsImportPick';
channels.daggerPinsImportApply = 'azy:dagger:pinsImportApply';
channels.daggerPinsImportCancel = 'azy:dagger:pinsImportCancel';
channels.placeAudio = P + 'placeAudio';
channels.placeMedia = P + 'placeMedia';
channels.placeAudioLevel = P + 'placeAudioLevel';
channels.soundGainCopy = P + 'soundGainCopy';
channels.soundGainStore = P + 'soundGainStore';

const events = {};
for (const k of Object.keys(EVENTS)) events[k] = P + 'evt:' + EVENTS[k];

module.exports = { channels, events };
