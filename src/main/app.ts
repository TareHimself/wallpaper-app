/* eslint-disable no-console */
/* eslint-disable global-require */
import { io } from "socket.io-client";
import axios from "axios";
import {
  IApplicationSettings,
  ILoginData,
  IConvertedSystemFiles,
  IImageDownload,
} from "../types";
import path from "path";
import { app, BrowserWindow, shell, dialog, safeStorage } from "electron";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import macaddress from "macaddress";
import { platform } from "os";
import { ipcMain } from "../ipc";
import { getDatabaseUrl, getServerUrl, getWsUrl, isDev } from "./util";
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

const loginDataPath = path.join(
  app.getPath("userData"),
  "loginData.wallpaperz"
);

const settingsPath = path.join(app.getPath("userData"), "settings.json");
let devicePhysicalAddress = "";

let bHasIdentified = false;

const socket = io(getWsUrl(), {
  reconnectionDelayMax: 10000,
});

const pendingIdenfifyCallbacks: (() => void)[] = [];

function onIdentify(callback: () => void) {
  if (bHasIdentified) {
    callback();
  } else {
    pendingIdenfifyCallbacks.push(callback);
  }
}

function identify() {
  return new Promise<void>((resolve) => {
    socket.once("client-id", () => {
      bHasIdentified = true;
      pendingIdenfifyCallbacks.forEach((c) => c());
      resolve();
    });
    socket.emit("client-id", devicePhysicalAddress);
  });
}

socket.on("connect", () => {
  identify();
});
socket.on("disconnect", () => {
  bHasIdentified = false;
});

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
  "uploadFiles",
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

ipcMain.onFromRenderer("openLogin", async (event) => {
  const params = new URLSearchParams({
    client_id: "967602114350174348",
    redirect_uri: `${getServerUrl()}/auth`,
    response_type: "code",
    scope: "identify",
    state: `${devicePhysicalAddress}`,
  }).toString();

  const url = `https://discord.com/api/oauth2/authorize?${params}`;

  socket.on("open-login", async (response: ILoginData) => {
    const encryptedData = safeStorage.encryptString(JSON.stringify(response));

    fs.writeFile(loginDataPath, encryptedData)
      .then(() => {
        event.reply(response);
      })
      .catch(console.log);
  });

  shell.openExternal(url);
});

ipcMain.onFromRenderer("getLogin", async (event) => {
  if (fsSync.existsSync(loginDataPath)) {
    const encryptedLoginData = await fs.readFile(loginDataPath);
    const decryptedLoginData = safeStorage.decryptString(encryptedLoginData);

    const loginData = JSON.parse(decryptedLoginData) as ILoginData;
    onIdentify(async () => {
      const loginFromServer = await Promise.race<
        [Promise<ILoginData | undefined>, Promise<undefined>]
      >([
        new Promise((resolve) => {
          socket.once("verify-discord", async (payload: ILoginData | null) => {
            if (payload === null) {
              if (fsSync.existsSync(loginDataPath)) {
                await fs.unlink(loginDataPath);
              }
              resolve(undefined);
            } else {
              resolve(payload);
            }
          });
          socket.emit("verify-discord", loginData.discord);
        }),
        new Promise((resolve) => {
          setTimeout(resolve, 8000, undefined);
        }),
      ]);

      event.reply(loginFromServer);
    });
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

ipcMain.onFromRenderer(
  "uploadImages",
  async (event, images: IConvertedSystemFiles[], uploader_id) => {
    const params = new URLSearchParams({
      user: devicePhysicalAddress,
      uploader: uploader_id,
    });

    const response = await axios
      .put(`${getServerUrl()}/wallpapers?${params.toString()}`, images, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })
      .catch((error) => console.log(error.message));

    event.reply(response?.data || []);
  }
);

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
