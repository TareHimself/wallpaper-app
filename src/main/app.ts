/* eslint-disable no-console */
/* eslint-disable global-require */
import {
  IApplicationSettings,
  IImageDownload,
  ILoginData,
  ServerResponse,
} from "../types";
import path from "path";
import { app, BrowserWindow, shell, dialog, safeStorage } from "electron";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import macaddress from "macaddress";
import { platform } from "os";
import { ipcMain } from "../ipc";
import { getDatabaseUrl, getServerUrl, isDev } from "./util";
import axios from "axios";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;

function getCodeFromWindow(authUri: string) {
  return new Promise<string>((res) => {
    const newWindow = new BrowserWindow({
      width: 1024,
      height: 728,
      icon: "./assets/icon",
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        nodeIntegration: true,
      },
      autoHideMenuBar: true,
    });

    newWindow.on("ready-to-show", () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      newWindow.show();
      newWindow.focus();
    });

    ipcMain.original.once("onCodeReceived", (_ev, code) => {
      newWindow.close();
      res(code as string);
    });

    newWindow.loadURL(authUri);
  });
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("wallpaperz", process.execPath, [
      path.resolve(process.argv[1] || ""),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("wallpaperz");
}

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

const loginDataPath = path.join(app.getPath("userData"), "session.dat");

const settingsPath = path.join(app.getPath("userData"), "settings.json");
let devicePhysicalAddress = "";

async function createWindow() {
  devicePhysicalAddress = await macaddress.one();

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: "./assets/icon",
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      webSecurity: false,
    },
    autoHideMenuBar: true,
    frame: platform() !== "win32",
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on("ready-to-show", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    /* if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } */
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: "deny" };
  });

  if (isDev()) {
    // Open the DevTools.
    console.log("Opening dev tools");
    mainWindow.webContents.openDevTools();
  }
}

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on("activate", () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

async function applySettings(settings: IApplicationSettings) {
  if (mainWindow) {
    mainWindow.setFullScreen(settings.bShouldUseFullscreen);
  }
}

// read selected images from disk
ipcMain.onFromRenderer(
  "loadFilesFromDisk",
  async (event, defaultUploadPath, pathsToUpload) => {
    if (pathsToUpload.length) {
      const readers: Promise<[string, number, string]>[] = [];

      // eslint-disable-next-line no-inner-declarations
      async function readFile(
        fileToLoad: string,
        index: number
      ): Promise<[string, number, string]> {
        return [
          (await fs.readFile(fileToLoad)).toString("base64"),
          index,
          path.parse(fileToLoad).name,
        ];
      }

      pathsToUpload.forEach((filePath: string, index: number) => {
        readers.push(readFile(filePath, index));
      });

      const filesLoaded = await Promise.all(readers);

      event.reply({ result: true, files: filesLoaded });
    } else {
      dialog
        .showOpenDialog({
          title: "Select the wallpapers to upload",
          properties: ["openFile", "multiSelections"],
          defaultPath: defaultUploadPath,
          buttonLabel: "Upload",
          filters: [
            {
              name: "wallpapers",
              extensions: ["jpeg", "png", "jpg"],
            },
          ],
        })
        .then(async (result) => {
          if (result.canceled) {
            event.reply({ result: false, files: [] });
          } else if (result.filePaths.length === 0) {
            event.reply({ result: false, files: [] });
          } else {
            const readers: Promise<[string, number, string]>[] = [];

            // eslint-disable-next-line no-inner-declarations
            async function readFile(
              fileToLoad: string,
              index: number
            ): Promise<[string, number, string]> {
              return [
                (await fs.readFile(fileToLoad)).toString("base64"),
                index,
                path.parse(fileToLoad).name,
              ];
            }
            result.filePaths.forEach((filePath: string, index: number) => {
              readers.push(readFile(filePath, index));
            });

            const filesLoaded = await Promise.all(readers);

            event.reply({ result: true, files: filesLoaded });
          }
        })
        .catch(console.log);
    }
  }
);

// read selected images from disk
ipcMain.onFromRenderer("saveSettings", async (event, args) => {
  applySettings(args);

  fs.writeFile(settingsPath, JSON.stringify(args, null, 3))
    .then(() => {
      event.reply(true);
    })
    .catch((e) => {
      console.error(e);
      event.reply(false);
    });
});

ipcMain.onFromRenderer("loadSettings", async (event) => {
  if (fsSync.existsSync(settingsPath)) {
    fs.readFile(settingsPath, "utf8")
      .then((file: string) => {
        const settingsAsJson = JSON.parse(file) as IApplicationSettings;

        if (
          !settingsAsJson.downloadPath ||
          !fsSync.existsSync(settingsAsJson.downloadPath)
        )
          settingsAsJson.downloadPath = app.getPath("downloads");

        applySettings(settingsAsJson);
        event.reply(settingsAsJson);
      })
      .catch(console.log);
  } else {
    const defaultSettings: IApplicationSettings = {
      downloadPath: "",
      maxItemsPerPage: 12,
      bShouldUseFullscreen: true,
      bIsLoggedIn: false,
    };

    applySettings(defaultSettings);

    fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 3))
      .then(() => {
        event.reply(defaultSettings);
      })
      .catch(console.log);
  }
});

ipcMain.onFromRenderer("startLogin", async (event) => {
  const params = new URLSearchParams({
    client_id: "967602114350174348",
    redirect_uri: `${getServerUrl()}/temp`,
    response_type: "code",
    scope: "identify",
    state: `${devicePhysicalAddress}`,
  }).toString();

  const url = `https://discord.com/api/oauth2/authorize?${params}`;

  const codeReceived = await getCodeFromWindow(url);

  console.log("Got code", codeReceived);
  const serverResponse = (
    await axios.post<ServerResponse<ILoginData>>(
      `${getServerUrl()}/login?code=${codeReceived}`
    )
  ).data;

  if (serverResponse.error) {
    event.reply(undefined);
    return;
  }

  const encryptedData = safeStorage.encryptString(
    JSON.stringify(serverResponse.data)
  );

  await fs.writeFile(loginDataPath, encryptedData);

  event.reply(serverResponse.data);
});

ipcMain.onFromRenderer("getLogin", async (event) => {
  if (fsSync.existsSync(loginDataPath)) {
    const encryptedLoginData = await fs.readFile(loginDataPath);
    const decryptedLoginData = safeStorage.decryptString(encryptedLoginData);

    const loginData = JSON.parse(decryptedLoginData) as ILoginData;

    event.reply(loginData);
  } else {
    event.reply(undefined);
  }
});

ipcMain.onFromRenderer("updateLogin", async (event, newLoginData) => {
  if (newLoginData === undefined) {
    if (fsSync.existsSync(loginDataPath)) {
      await fs.unlink(loginDataPath);
    }
    event.reply();
    return;
  }
  const encryptedData = safeStorage.encryptString(JSON.stringify(newLoginData));
  await fs.writeFile(loginDataPath, encryptedData);
  event.reply();
});

ipcMain.onFromRenderer("logout", async (event) => {
  if (fsSync.existsSync(loginDataPath)) {
    await fs.unlink(loginDataPath);
  }
  event.reply();
});

ipcMain.onFromRenderer("setDownloadPath", async (event, currentPath) => {
  const data = await dialog.showOpenDialog({
    defaultPath: currentPath,
    properties: ["openDirectory"],
  });

  if (data.canceled) {
    event.reply(currentPath);
    return;
  }

  event.reply(data.filePaths[0] || "");
});

ipcMain.onFromRenderer(
  "downloadImage",
  async (event, image: IImageDownload) => {
    const downloadPath = path.join(
      image.dir || app.getPath("downloads"),
      `${image.id}.jpg`
    );

    fs.writeFile(downloadPath, Buffer.from(image.data))
      .then(() => {
        event.reply(true);
      })
      .catch((error: Error) => {
        event.reply(false);
        console.log(error);
      });
  }
);

ipcMain.onFromRenderer("quitApp", async () => {
  try {
    app.quit();
  } catch (error) {
    console.log(error);
  }
});

ipcMain.onFromRenderer("isDev", (event) => {
  event.reply(isDev());
});

ipcMain.onFromRenderer("getToken", (event) => {
  event.reply("test");
});

ipcMain.onFromRenderer("windowMaximize", (event) => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
  event.reply();
});

ipcMain.onFromRenderer("windowMinimize", (e) => {
  mainWindow?.minimize();
  e.reply();
});

ipcMain.onFromRenderer("windowClose", (e) => {
  mainWindow?.close();
  e.reply();
});

ipcMain.onFromRenderer("getDatabaseUrl", (e) => {
  e.reply(getDatabaseUrl());
});

ipcMain.onFromRenderer("getServerUrl", (e) => {
  e.reply(getServerUrl());
});

ipcMain.onFromRenderer("getPreloadPath", (e) => {
  e.replySync(MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY);
});

ipcMain.onFromRenderer("getPlatform", (e) => {
  e.replySync(platform());
});
