const { app, BrowserWindow, ipcMain, Notification: ElectronNotification } = require('electron');
const path = require('path');

// Set Application User Model ID for Windows Notification Center / Action Center
if (process.platform === 'win32') {
  app.setAppUserModelId('com.campuslife.app');
}
if (process.platform === 'darwin') {
  app.name = 'Campus Life';
}

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 900,
    minWidth: 380,
    minHeight: 600,
    title: 'Campus Life',
    backgroundColor: '#080D1A',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:8081');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// IPC handler for native notifications on Windows Action Center & macOS Notification Center
ipcMain.handle('send-notification', (event, { title, body }) => {
  try {
    if (ElectronNotification.isSupported()) {
      const notif = new ElectronNotification({
        title: title || 'Campus Life',
        body: body || '',
      });
      notif.show();
      return true;
    }
  } catch (err) {
    console.error('Error triggering Electron notification:', err);
  }
  return false;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});