const { contextBridge, ipcRenderer } = require('electron');
const channel = 'azy:dagger:action';
contextBridge.exposeInMainWorld('daggerAction', {
  state: () => ipcRenderer.invoke(channel, 'state'),
  read: () => ipcRenderer.invoke(channel, 'read'),
  apply: (db, wav) => ipcRenderer.invoke(channel, 'apply', { db, wav }),
  close: () => ipcRenderer.invoke(channel, 'close'),
  cancel: () => ipcRenderer.invoke(channel, 'cancel'),
  setMini: (mini) => ipcRenderer.invoke(channel, 'minimize', mini),
  gainPref: (db) => ipcRenderer.invoke('azy:presets:audioGainPref', db),
  onSettingsChanged: (cb) => {
    const listener = (_event, settings) => cb(settings);
    ipcRenderer.on('settings-changed', listener);
    return () => ipcRenderer.removeListener('settings-changed', listener);
  },
  onState: (cb) => {
    const listener = (_e, state) => cb(state);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  }
});
