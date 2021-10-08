import { app, BrowserWindow, nativeTheme, Menu, Tray } from "electron";
import path from "path";

try {
  if (
    process.platform === "win32" &&
    nativeTheme.shouldUseDarkColors === true
  ) {
    require("fs").unlinkSync(
      require("path").join(app.getPath("userData"), "DevTools Extensions")
    );
  }
} catch (_) {}

let mainWindow;
let tray;

function initTray() {
  tray = new Tray("src-electron/icons/power-on.png");
  const trayMenu = Menu.buildFromTemplate([
    {
      label: "열기",
      type: "normal",
      click: () => {
        console.log("click open");
        mainWindow.show();
      },
    },
    {
      label: "숨기기",
      type: "normal",
      click: () => {
        console.log("click open");
        mainWindow.hide();
      },
    },
    {
      label: "종료",
      type: "normal",
      click: () => {
        console.log("click close");
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Wol Client");
  tray.setContextMenu(trayMenu);
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
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.webContents.closeDevTools();
    });
  }
  initTray();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("close", (e) => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      e.preventDefault();
    }
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
