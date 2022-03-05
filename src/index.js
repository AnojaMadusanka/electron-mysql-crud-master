const { createWindow } = require("./main");
const { app, BrowserWindow } = require("electron");
require('./database');

const path = require('path')
const env = process.env.NODE_ENV || 'development';
  
// If development environment
if (env === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

let win;

app.allowRendererProcessReuse = true;
app.disableHardwareAcceleration();

app.whenReady().then(() => {
    win = createWindow();
  
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) win = createWindow();
    });

    // require('@electron/remote/main').enable(win.webContents);
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});