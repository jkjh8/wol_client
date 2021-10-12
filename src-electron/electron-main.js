import { app, BrowserWindow, nativeTheme } from 'electron'
import { Menu, Tray, ipcMain, nativeImage } from 'electron'

import * as shutdown from 'electron-shutdown-command'
import path from 'path'
import os from 'os'
import dgram from 'dgram'
import db from './db'

const isMac = os.platform === 'darwin'

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
let interval
let powerOffPermissions
let trayMenu
let trayVal

const img_show = nativeImage.createFromPath('src-electron/icons/max.png')
const img_hide = nativeImage.createFromPath('src-electron/icons/min.png')
const img_close = nativeImage.createFromPath('src-electron/icons/close.png')

async function getStartTrayIcon() {
  const r = await db.setup.findOne({ section: 'startTrayIcon' })
  // trayMenu.items[2].checked = r.value
  trayVal = r.value
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
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: '열기',
      type: 'normal',
      icon: img_show.resize({ width: 16, height: 16 }),
      accelerator: 'CommandOrControl+O',
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
    { type: 'separator' },
    {
      label: '트레이아이콘 시작',
      type: 'checkbox',
      checked: false,
      click: () => {
        console.log('click tray')
        setStartTrayIcon()
      },
    },
    { type: 'separator' },
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

const mainMenu = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
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
          console.log('click hide')
          mainWindow.hide()
        },
      },
      { type: 'separator' },
      {
        label: '트레이아이콘 시작',
        type: 'checkbox',
        checked: false,
        click: () => {
          console.log('click tray')
          setStartTrayIcon()
        },
      },
      { type: 'separator' },
      {
        label: '종료',
        type: 'normal',
        icon: img_close.resize({ width: 16, height: 16 }),
        click: () => {
          console.log('click close')
          app.quit()
        },
      },
    ],
  },
])

async function createWindow() {
  /**
   * Initial window options
   */
  // load tray icon value
  await getStartTrayIcon()
  initTray()
  mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    useContentSize: true,
    show: !trayVal,
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
  trayMenu.items[2].checked = trayVal
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

ipcMain.on('getNetworkAddresses', async (evt) => {
  return mainWindow.webContents.send('networkInterfaces', getNetworkAddress())
})

ipcMain.on('powerOff', (evt) => {
  // only windows
  shutdown.shutdown({
    force: true,
  })
})

ipcMain.on('setNetworkInterface', async (evt, item) => {
  const hostname = os.hostname()
  const r = await db.setup.update(
    { section: 'networkInterface' },
    {
      $set: {
        ...item,
        hostname: hostname,
      },
    },
    { upsert: true }
  )
  console.log(r)
})

ipcMain.on('functionSet', async (event, args) => {
  switch (args.key) {
    case 'signal':
      console.log(args.value)
      if (args.value) {
        await sendNetworkInterfaceInfo()
        interval = setInterval(async () => {
          await sendNetworkInterfaceInfo()
        }, 5000)
      } else {
        clearInterval(interval)
      }
      break
    case 'block':
      powerOffPermissions = args.value
  }
  await db.setup.update(
    { section: args.key },
    { $set: { value: args.value } },
    { upsert: true }
  )
})

ipcMain.on('functionGet', async (event, args) => {
  const r = await db.setup.find()
  mainWindow.webContents.send('setup', r)
})

const server = dgram.createSocket('udp4')
const client = dgram.createSocket('udp4')
const MCAST_ADDR = '230.185.192.109'
const server_port = 12340
const client_port = 12341

server.bind(41848, function () {
  server.setBroadcast(true)
  server.setMulticastTTL(128)
  server.addMembership(MCAST_ADDR)
})

async function sendNetworkInterfaceInfo() {
  const info = await db.setup.findOne({ section: 'networkInterface' })
  info['block'] = powerOffPermissions
  const message = JSON.stringify(info)
  server.send(message, server_port, MCAST_ADDR)
}

client.on('listening', function () {
  const address = client.address()
  console.log('udp listening on: ' + address.address + ':' + address.port)
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
        const r = await db.setup.findOne({ section: 'networkInterface' })
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
  await db.setup.update(
    { section: 'startTrayIcon' },
    { $set: { value: trayMenu.items[2].checked } },
    { upsert: true }
  )
  console.log(trayMenu.items[2].checked)
}
