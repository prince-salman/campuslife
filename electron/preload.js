const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  sendNotification: (payload) => ipcRenderer.invoke('send-notification', payload),
});
