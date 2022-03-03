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

app.allowRendererProcessReuse = true;

app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});