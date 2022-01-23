import { app, Menu, Tray, nativeImage, BrowserWindow } from 'electron'

import db from '../db'
import { getNicsAndSend } from '../nics'
import { getSetup } from '../functions'

const img_show = nativeImage.createFromPath(
  'src-electron/icons/max.png'
)
const img_hide = nativeImage.createFromPath(
  'src-electron/icons/min.png'
)
const img_close = nativeImage.createFromPath(
  'src-electron/icons/close.png'
)

const img_reset = nativeImage.createFromPath(
  'src-electron/icons/reset.png'
)

const img_info = nativeImage.createFromPath(
  'src-electron/icons/info.png'
)

let mainMenu
let trayMenu
let tray

let valTrayStart = false
let valStartOnBoot = false
let valCheckPowerOff = false

function createMainMenu(trayicon, bootonstart, checkpower) {
  valTrayStart = trayicon
  valStartOnBoot = bootonstart
  valCheckPowerOff = checkpower
  console.log(valTrayStart, valStartOnBoot, valCheckPowerOff)

  mainMenu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: '열기',
          type: 'normal',
          icon: img_show.resize({ width: 16, height: 16 }),
          accelerator: 'CommandOrControl+O',
          click: () => {
            BrowserWindow.fromId(1).show()
          }
        },
        {
          label: '숨기기',
          type: 'normal',
          icon: img_hide.resize({ width: 16, height: 16 }),
          accelerator: 'CommandOrControl+H',
          click: () => {
            BrowserWindow.fromId(1).hide()
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
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: '트레이아이콘 시작',
          id: 'menu_traystart',
          type: 'checkbox',
          checked: valTrayStart,
          accelerator: 'CommandOrControl+T',
          click: () => {
            clickTrayStart()
          }
        },
        {
          label: '부팅시 시작',
          id: 'menu_startonboot',
          type: 'checkbox',
          checked: valStartOnBoot,
          click: () => {
            clickBootOnStart()
          }
        },
        {
          label: '전원차단 확인',
          id: 'menu_power_check',
          type: 'checkbox',
          checked: valCheckPowerOff,
          click: () => {
            clickCheckPowerOff()
          }
        },
        { type: 'separator' },
        {
          label: 'Reload',
          type: 'normal',
          icon: img_reset.resize({ width: 16, height: 16 }),
          accelerator: 'CommandOrControl+R',
          click: async () => {
            getNicsAndSend()
            getSetup()
          }
        },
        {
          label: 'Reset NIC',
          type: 'normal',
          click: async () => {
            getNicsAndSend()
            await db.setup.update(
              { section: 'network' },
              { $set: { value: null } }
            )
            getSetup()
          }
        },
        { type: 'separator' },
        {
          label: 'Factory Reset',
          type: 'normal',
          click: () => {
            BrowserWindow.fromId(1).webContents.send('onResponse', {
              command: 'factory_reset'
            })
          }
        }
      ]
    },
    {
      label: 'Helf',
      submenu: [
        {
          label: 'About',
          type: 'normal',
          icon: img_info.resize({ width: 16, height: 16 }),
          accelerator: 'F1',
          click: () => {
            BrowserWindow.fromId(1).webContents.send('onResponse', {
              command: 'info'
            })
          }
        }
      ]
    }
  ])
  Menu.setApplicationMenu(mainMenu)

  return mainMenu
}

function createTrayMenu(trayicon, bootonstart, checkpower) {
  valTrayStart = trayicon
  valStartOnBoot = bootonstart
  valCheckPowerOff = checkpower

  trayMenu = Menu.buildFromTemplate([
    {
      label: '열기',
      type: 'normal',
      icon: img_show.resize({ width: 16, height: 16 }),
      accelerator: 'CommandOrControl+O',
      click: () => {
        BrowserWindow.fromId(1).show()
      }
    },
    {
      label: '숨기기',
      type: 'normal',
      icon: img_hide.resize({ width: 16, height: 16 }),
      accelerator: 'CommandOrControl+H',
      click: () => {
        BrowserWindow.fromId(1).hide()
      }
    },
    { type: 'separator' },
    {
      label: '트레이아이콘 시작',
      id: 'tray_traystart',
      type: 'checkbox',
      checked: valTrayStart,
      accelerator: 'CommandOrControl+T',
      click: () => {
        clickTrayStart()
      }
    },
    {
      label: '부팅시 시작',
      id: 'tray_startonboot',
      type: 'checkbox',
      checked: valStartOnBoot,
      click: () => {
        clickBootOnStart()
      }
    },
    {
      label: '전원차단 확인',
      id: 'tray_power_check',
      type: 'checkbox',
      checked: valCheckPowerOff,
      click: () => {
        clickCheckPowerOff()
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
  tray = new Tray(img_close.resize({ width: 16, height: 16 }))
  tray.setToolTip('Wol Client for AMX')
  tray.setContextMenu(trayMenu)

  tray.on('click', function () {
    if (BrowserWindow.fromId(1).isVisible()) {
      BrowserWindow.fromId(1).hide()
    } else {
      BrowserWindow.fromId(1).show()
    }
  })
  return trayMenu
}

async function clickTrayStart() {
  valTrayStart = !valTrayStart
  mainMenu.getMenuItemById('menu_traystart').checked = valTrayStart
  trayMenu.getMenuItemById('tray_traystart').checked = valTrayStart
  await db.setup.update(
    { section: 'trayIconStart' },
    { $set: { value: valTrayStart } },
    { upsert: true }
  )
}

async function clickBootOnStart() {
  valStartOnBoot = !valStartOnBoot
  mainMenu.getMenuItemById('menu_startonboot').checked =
    valStartOnBoot
  trayMenu.getMenuItemById('tray_startonboot').checked =
    valStartOnBoot
  await db.setup.update(
    { section: 'startOnBoot' },
    { $set: { value: valStartOnBoot } },
    { upsert: true }
  )
}

async function clickCheckPowerOff() {
  valCheckPowerOff = !valCheckPowerOff
  mainMenu.getMenuItemById('menu_power_check').checked =
    valCheckPowerOff
  trayMenu.getMenuItemById('tray_power_check').checked =
    valCheckPowerOff
  await db.setup.update(
    { section: 'checkPowerOff' },
    { $set: { value: valCheckPowerOff } },
    { upsert: true }
  )
}

async function getMenuOptions() {
  const rt = await db.setup.findOne({ section: 'trayIconStart' })
  if (rt && rt.value) {
    valTrayStart = rt.value
  }

  const rb = await db.setup.findOne({ section: 'startOnBoot' })
  if (rb && rb.value) {
    valStartOnBoot = rb.value
  }
  const rck = await db.setup.findOne({ section: 'checkPowerOff' })
  if (rck && rck.value) {
    valCheckPowerOff = rck.value
  }

  return { valTrayStart, valStartOnBoot, valCheckPowerOff }
}

export { createMainMenu, createTrayMenu, getMenuOptions }
