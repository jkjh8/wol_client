import { app, BrowserWindow, nativeTheme } from 'electron'
import { Menu, Tray, ipcMain, nativeImage } from 'electron'

import * as shutdown from 'electron-shutdown-command'
import path from 'path'
import os from 'os'
import dgram from 'dgram'
import db from './db'

import { getNics, getNicsAndSend } from './nics'

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
let tray
let interval
let powerOffPermissions
let trayMenu
let trayVal = false
let bootOnStartVal = false
let startTrayTraymenu
let startTrayMenu
let startOnBootMenu

let syncTimer = null

const img_show = nativeImage.createFromPath(
  'src-electron/icons/max.png'
)
const img_hide = nativeImage.createFromPath(
  'src-electron/icons/min.png'
)
const img_close = nativeImage.createFromPath(
  'src-electron/icons/close.png'
)

async function getStartTrayIcon() {
  const r = await db.setup.findOne({ section: 'startTrayIcon' })
  // trayMenu.items[2].checked = r.value
  if (r && r.value) {
    trayVal = r.value
  }
  const rt = await db.setup.findOne({ section: 'startOnBoot' })
  if (rt && rt.value) {
    bootOnStartVal = rt.value
  }
  console.log(trayVal, bootOnStartVal)
}

function initTray() {
  tray = new Tray(img_close.resize({ width: 16, height: 16 }))
  trayMenu = Menu.buildFromTemplate([
    ...(isMac
      ? [
          {
            label: 'app.name',
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ]
      : []),
    {
      label: '열기',
      type: 'normal',
      icon: img_show.resize({ width: 16, height: 16 }),
      accelerator: 'CommandOrControl+O',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: '숨기기',
      type: 'normal',
      icon: img_hide.resize({ width: 16, height: 16 }),
      accelerator: 'CommandOrControl+H',
      click: () => {
        mainWindow.hide()
      }
    },
    { type: 'separator' },
    {
      label: '트레이아이콘 시작',
      id: 'traystart',
      type: 'checkbox',
      checked: false,
      accelerator: 'CommandOrControl+T',
      click: () => {
        setStartTrayIcon()
      }
    },
    { type: 'separator' },
    {
      label: '종료',
      type: 'normal',
      icon: img_close.resize({ width: 16, height: 16 }),
      accelerator: 'alt+F4',
      click: () => {
        app.exit(0)
      }
    }
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

const mainMenu = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      {
        label: '열기',
        type: 'normal',
        icon: img_show.resize({ width: 16, height: 16 }),
        accelerator: 'CommandOrControl+O',
        click: () => {
          mainWindow.show()
        }
      },
      {
        label: '숨기기',
        type: 'normal',
        icon: img_hide.resize({ width: 16, height: 16 }),
        accelerator: 'CommandOrControl+H',
        click: () => {
          console.log('click hide')
          mainWindow.hide()
        }
      },
      { type: 'separator' },
      {
        label: '트레이아이콘 시작',
        id: 'traystart',
        type: 'checkbox',
        checked: trayVal,
        accelerator: 'CommandOrControl+T',
        click: () => {
          console.log('click tray')
          setStartTrayIcon()
        }
      },
      {
        label: '부팅시 시작',
        id: 'startonboot',
        type: 'checkbox',
        checked: bootOnStartVal,
        click: () => {
          console.log('click auto start')
          setStartOnBoot()
        }
      },
      { type: 'separator' },
      {
        label: '종료',
        type: 'normal',
        icon: img_close.resize({ width: 16, height: 16 }),
        accelerator: 'alt+F4',
        click: () => {
          app.exit(0)
        }
      }
    ]
  }
])

async function createWindow() {
  /**
   * Initial window options
   */
  // load tray icon value
  await getStartTrayIcon()
  initTray()
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 500,
    useContentSize: true,
    show: !trayVal,
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

  Menu.setApplicationMenu(mainMenu)

  // refresh trayicon start value
  console.log('tray menu', trayMenu.items[2].checked)
  startTrayMenu = mainMenu.getMenuItemById('traystart')
  startOnBootMenu = mainMenu.getMenuItemById('startonboot')
  startTrayTraymenu = trayMenu.getMenuItemById('traystart')
  startTrayMenu.checked = trayVal
  startTrayTraymenu.checked = trayVal
  startOnBootMenu.checked = bootOnStartVal
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

ipcMain.on('onRequest', (e, args) => {
  try {
    switch (args.command) {
      case 'getnics':
        const rt = getNics()
        console.log(rt)
        mainWindow.webContents.send('onResponse', {
          command: 'nics',
          value: rt
        })
        break
    }
  } catch (e) {
    console.error(e)
  }
})

// ipcMain.on('getNetworkAddresses', async (evt) => {
//   return mainWindow.webContents.send(
//     'networkInterfaces',
//     getNetworkAddress()
//   )
// })

// ipcMain.on('powerOff', (evt) => {
//   // only windows
//   shutdown.shutdown({
//     force: true
//   })
// })

// ipcMain.on('setNetworkInterface', async (evt, item) => {
//   const hostname = os.hostname()
//   const r = await db.setup.update(
//     { section: 'networkInterface' },
//     {
//       $set: {
//         ...item,
//         hostname: hostname
//       }
//     },
//     { upsert: true }
//   )
//   console.log(r)
// })

// ipcMain.on('functionSet', async (event, args) => {
//   switch (args.key) {
//     case 'signal':
//       if (args.value) {
//         await sendNetworkInterfaceInfo()
//         syncTimer = setInterval(async () => {
//           await sendNetworkInterfaceInfo()
//         }, 5000)
//       } else {
//         clearInterval(syncTimer)
//       }
//       break
//     case 'block':
//       powerOffPermissions = args.value
//   }
//   await db.setup.update(
//     { section: args.key },
//     { $set: { value: args.value } },
//     { upsert: true }
//   )
// })

// ipcMain.on('functionGet', async (event, args) => {
//   const r = await db.setup.find()
//   mainWindow.webContents.send('setup', r)
// })

const client = dgram.createSocket('udp4')
const MCAST_ADDR = '230.185.192.109'
const server_port = 56434
const client_port = 52319

async function sendNetworkInterfaceInfo() {
  try {
    const info = await db.setup.findOne({
      section: 'networkInterface'
    })
    info['block'] = powerOffPermissions
    const message = JSON.stringify(info)
    client.send(message, server_port, MCAST_ADDR)
  } catch (e) {
    console.error(e)
  }
}

client.on('listening', function () {
  const address = client.address()
  console.log(
    'udp listening on: ' + address.address + ':' + address.port
  )
  client.setBroadcast(true)
  client.setMulticastTTL(128)
  client.addMembership(MCAST_ADDR)
})

client.on('message', async function (message, remote) {
  try {
    const command = JSON.parse(message)
    switch (command.section) {
      case 'sync':
        mainWindow.webContents.send('setup', [{ section: 'sync' }])
        break
      case 'power':
        console.log(command)
        const r = await db.setup.findOne({
          section: 'networkInterface'
        })
        if (!powerOffPermissions) {
          command.args.forEach((mac) => {
            console.log(mac, r.mac)
            if (mac === r.mac) {
              shutdown.shutdown({ force: true })
            }
          })
        }
    }
  } catch (error) {
    console.error(error)
  }
})

client.bind(client_port, '0.0.0.0')

async function setStartTrayIcon() {
  trayVal = !trayVal
  await db.setup.update(
    { section: 'startTrayIcon' },
    { $set: { value: trayVal } },
    { upsert: true }
  )
  startTrayMenu.checked = trayVal
  startTrayTraymenu.checked = trayVal
  startOnBootMenu.checked = bootOnStartVal
}

async function setStartOnBoot() {
  bootOnStartVal = !bootOnStartVal
  await db.setup.update(
    { section: 'startOnBoot' },
    { $set: { value: bootOnStartVal } },
    { upsert: true }
  )
  startTrayMenu.checked = trayVal
  startTrayTraymenu.checked = trayVal
  startOnBootMenu.checked = bootOnStartVal

  app.setLoginItemSettings({
    openAtLogin: bootOnStartVal,
    path: app.getPath('exe')
  })
}
