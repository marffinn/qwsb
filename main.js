const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 470,
    minWidth: 470,
    maxWidth: 470,
    height: 600,
    center: true,
    icon: path.join(__dirname, 'data/icons/Quake-icon.png '),
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        devTools: true,
        preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})