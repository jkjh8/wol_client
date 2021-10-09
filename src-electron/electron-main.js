import { app, BrowserWindow, nativeTheme } from 'electron'
import { Menu, Tray, ipcMain, nativeImage } from 'electron'

import * as shutdown from 'electron-shutdown-command'

import path from 'path'
import os from 'os'

try {
  if (
    process.platform === 'win32' &&
    nativeTheme.shouldUseDarkColors === true
  ) {
    require('fs').unlinkSync(
      require('path').join(app.getPath('userData'), 'DevTools Extensions')
    )
  }
} catch (_) {}

let mainWindow
let tray

const img_show = nativeImage.createFromPath('src-electron/icons/max.png')
const img_hide = nativeImage.createFromPath('src-electron/icons/min.png')
const img_close = nativeImage.createFromPath('src-electron/icons/close.png')

function initTray() {
  tray = new Tray('src-electron/icons/close.png')
  const trayMenu = Menu.buildFromTemplate([
    {
      label: '열기',
      type: 'normal',
      icon: img_show.resize({ width: 16, height: 16 }),
      click: () => {
        console.log('click open')
        mainWindow.show()
      },
    },
    {
      label: '숨기기',
      type: 'normal',
      icon: img_hide.resize({ width: 16, height: 16 }),
      click: () => {
        console.log('click open')
        mainWindow.hide()
      },
    },
    {
      label: '종료',
      type: 'normal',
      icon: img_close.resize({ width: 16, height: 16 }),
      click: () => {
        console.log('click close')
        app.quit()
      },
    },
  ])
  tray.setToolTip('Wol Client')
  tray.setContextMenu(trayMenu)

  tray.on('click', function (e) {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  })

  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }
  initTray()

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('close', (e) => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
      e.preventDefault()
    }
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

function getNetworkAddress() {
  const rt = []
  const nics = os.networkInterfaces()
  for (const [key, value] of Object.entries(nics)) {
    value.forEach((nic) => {
      if (!nic.internal && nic.family === 'IPv4') {
        rt.push({
          name: key,
          address: nic.address,
          mac: nic.mac,
        })
      }
    })
  }
  return rt
}

ipcMain.on('getNetworkAddress', (evt) => {
  const nics = getNetworkAddress()
  mainWindow.webContents.send('networkInterfaces', nics)
})

ipcMain.on('powerOff', (evt) => {
  // only windows
  shutdown.shutdown({
    force: true,
  })
})

ipcMain.on('setNetworkInterface', (evt, item) => {
  console.log(item)
})

ipcMain.on('functionSet', (event, args) => {
  console.log(args)
})
