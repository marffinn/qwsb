const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let win = null

function createWindow () {
    win = new BrowserWindow({
    width: 520,
    minWidth:520,
    height: 400,
    minHeight: 305,
    maxHeight: 645,
    frame: false,
    icon: path.join(`${ process.resourcesPath }/qwsb.ico`),
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, 'data/scripts/preload.js')
    }
  })
  win.loadFile('index.html')
  win.webContents.openDevTools()
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

ipcMain.on('close-me', (evt, arg) => {
  app.quit()
})

ipcMain.on('minimize-me', (evt, arg) => {
  win.minimize()
})


// electron-packager qwsb --platform=win32 --arch=x64 --asar=true --prune --overwrite --extra-resource=./qwsb/data/qstat.exe --extra-resource=./qwsb/data/scripts/servers.json --extra-resource=./qwsb/data/scripts/settings.json --extra-resource=./qwsb/data/icons/qwsb.ico --icon=./qwsb/data/qwsb.ico