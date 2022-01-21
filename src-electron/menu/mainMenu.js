import { app, Menu, Tray, nativeImage, BrowserWindow } from 'electron'

const img_show = nativeImage.createFromPath(
  'src-electron/icons/max.png'
)
const img_hide = nativeImage.createFromPath(
  'src-electron/icons/min.png'
)
const img_close = nativeImage.createFromPath(
  'src-electron/icons/close.png'
)

function createMainMenu() {
  const mainMenu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: '열기',
          type: 'nomal',
          icon: img_show.resize({ width: 16, height: 16 }),
          accelerator: 'CommandOrControl+O',
          click: () => {
            BrowserWindow.fromId(1).show()
          }
        },
        {
          label: '숨기기',
          type: 'nomal',
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
          accelerator: 'CommandOrControl+T',
          click: () => {
            //
          }
        },
        {
          label: '부팅시 시작',
          id: 'tray_startonboot',
          type: 'checkbox',
          click: () => {
            //
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
}

export { createMainMenu }
