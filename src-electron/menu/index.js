import { app, Menu, Tray, nativeImage, BrowserWindow } from 'electron'
import db from '../db'

const img_show = nativeImage.createFromPath(
  'src-electron/icons/max.png'
)
const img_hide = nativeImage.createFromPath(
  'src-electron/icons/min.png'
)
const img_close = nativeImage.createFromPath(
  'src-electron/icons/close.png'
)

let mainMenu
let trayMenu
let tray

let valTrayStart = false
let valStartOnBoot = false

function createMainMenu(trayicon, bootonstart) {
  valTrayStart = trayicon
  valStartOnBoot = bootonstart

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
  Menu.setApplicationMenu(mainMenu)

  return mainMenu
}

function createTrayMenu(valTrayStart, valStartOnBoot) {
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

async function getMenuOptions() {
  let valTrayStart = false
  let valStartOnBoot = false

  const rt = await db.setup.findOne({ section: 'trayIconStart' })
  if (rt && rt.value) {
    valTrayStart = rt.value
  }

  const rb = await db.setup.findOne({ section: 'startOnBoot' })
  if (rb && rb.value) {
    valStartOnBoot = rb.value
  }

  return { valTrayStart, valStartOnBoot }
}

export { createMainMenu, createTrayMenu, getMenuOptions }
