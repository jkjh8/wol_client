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
let powerOffPermissions
let sendNetworkInfo
let nics

const maddr = '230.185.192.109'
const server_port = 56434
const client_port = 52319

async function createWindow() {
  const { valTrayStart, valStartOnBoot } = await getMenuOptions()

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
  createMainMenu(valTrayStart, valStartOnBoot)
  createTrayMenu(valTrayStart, valStartOnBoot)

  //load multicast port
  multicast = await createMulticast(server_port, maddr)
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

// import './ipc'

// ipcMain.on('onRequest', async (e, args) => {
//   try {
//     switch (args.command) {
//       case 'getnics':
//         nics = getNicsAndSend()
//         break

//       case 'signal':
//         sendNetworkInfo = args.value
//         await db.setup.update(
//           { section: 'signal' },
//           { $set: { value: args.value } },
//           { upsert: true }
//         )
//         break

//       case 'block':
//         powerOffPermissions = args.value
//         await db.setup.update(
//           { section: 'block' },
//           { $set: { value: args.value } },
//           { upsert: true }
//         )
//         break

//       case 'poweroff':
//         // only windows
//         shutdown.shutdown({ force: true })
//         break

//       case 'getsetup':
//         getNicsAndSend()
//         const r = await db.setup.find({})
//         mainWindow.webContents.send('onResponse', {
//           command: 'setup',
//           value: r
//         })
//         break

//       case 'selectedNetworkInterface':
//         await db.setup.update(
//           { section: 'network' },
//           { $set: { value: JSON.parse(args.value) } },
//           { upsert: true }
//         )
//         break

//       default:
//         console.log(args)
//         break
//     }
//   } catch (e) {
//     console.error(e)
//   }
// })

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

// const client = dgram.createSocket('udp4')
// const MCAST_ADDR = '230.185.192.109'
// const server_port = 56434
// const client_port = 52319

// async function startServer() {
//   const multicast = await createMulticast(server_port, MCAST_ADDR)
//   console.log(multicast)
// }

// startServer()

// async function sendNetworkInterfaceInfo() {
//   try {
//     const info = await db.setup.findOne({
//       section: 'networkInterface'
//     })
//     info['block'] = powerOffPermissions
//     const message = JSON.stringify(info)
//     client.send(message, server_port, MCAST_ADDR)
//   } catch (e) {
//     console.error(e)
//   }
// }

// client.on('listening', function () {
//   const address = client.address()
//   console.log(
//     'udp listening on: ' + address.address + ':' + address.port
//   )
//   client.setBroadcast(true)
//   client.setMulticastTTL(128)
//   client.addMembership(MCAST_ADDR)
// })

// client.on('message', async function (message, remote) {
//   try {
//     const command = JSON.parse(message)
//     switch (command.section) {
//       case 'sync':
//         mainWindow.webContents.send('setup', [{ section: 'sync' }])
//         break
//       case 'power':
//         console.log(command)
//         const r = await db.setup.findOne({
//           section: 'networkInterface'
//         })
//         if (!powerOffPermissions) {
//           command.args.forEach((mac) => {
//             console.log(mac, r.mac)
//             if (mac === r.mac) {
//               shutdown.shutdown({ force: true })
//             }
//           })
//         }
//     }
//   } catch (error) {
//     console.error(error)
//   }
// })

// client.bind(client_port, '0.0.0.0')
