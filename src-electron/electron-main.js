import { app, BrowserWindow, nativeTheme, ipcMain } from 'electron'

import * as shutdown from 'electron-shutdown-command'
import path from 'path'
import os from 'os'
import dgram from 'dgram'
import db from './db'

import { getNicsAndSend } from './nics'
import {
  createMainMenu,
  createTrayMenu,
  getMenuOptions
} from './menu'

import { createMulticast } from './multicast'
import './ipc'

const isMac = os.platform === 'darwin'

try {
  if (
    process.platform === 'win32' &&
    nativeTheme.shouldUseDarkColors === true
  ) {
    require('fs').unlinkSync(
      require('path').join(
        app.getPath('userData'),
        'DevTools Extensions'
      )
    )
  }
} catch (_) {}

let mainWindow
let multicast

async function createWindow() {
  const { valTrayStart, valStartOnBoot, valCheckPowerOff } =
    await getMenuOptions()

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 500,
    useContentSize: true,
    show: !valTrayStart,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        __dirname,
        process.env.QUASAR_ELECTRON_PRELOAD
      )
    }
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

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('close', (e) => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
      e.preventDefault()
    }
  })

  // create menu, trayicon
  createMainMenu(valTrayStart, valStartOnBoot, valCheckPowerOff)
  createTrayMenu(valTrayStart, valStartOnBoot, valCheckPowerOff)

  //load multicast port
  multicast = await createMulticast()
}

app.on('ready', () => {
  createWindow()
})

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
