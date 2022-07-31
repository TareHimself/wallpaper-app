/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  safeStorage,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const gotTheLock = app.requestSingleInstanceLock();

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

if (!gotTheLock) {
  app.quit();
} else {
  const fs = require('fs').promises;
  const fsSync = require('fs');
  const macaddress = require('macaddress');

  let mainWindow: BrowserWindow | null = null;

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  const loginDataPath = path.join(
    app.getPath('userData'),
    'loginData.wallpaperz'
  );

  const thumnailCachePath = path.join(
    app.getPath('userData'),
    'thumbnails.wallpaperz'
  );

  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  let devicePhysicalAddress = '';
  // let currentToken = '';
  let socket: Socket;

  if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  const isDevelopment =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

  if (isDevelopment) {
    require('electron-debug')();
  }

  const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
      .default(
        extensions.map((name) => installer[name]),
        forceDownload
      )
      .catch(console.log);
  };

  const createWindow = async () => {
    devicePhysicalAddress = await macaddress.one();
    if (isDevelopment) {
      await installExtensions();
    }

    socket = io(
      isDevelopment
        ? 'ws://localhost:3001'
        : 'wss://wallpaperz-server.oyintare.dev',
      {
        reconnectionDelayMax: 10000,
      }
    );

    // handle when we connect to the server
    socket.on('connect', () => {
      socket.emit('client-identify', devicePhysicalAddress);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      socket.once('auth', (_token: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // currentToken = token;
      });

      socket.emit('auth', devicePhysicalAddress);
    });

    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
      return path.join(RESOURCES_PATH, ...paths);
    };

    mainWindow = new BrowserWindow({
      show: false,
      width: 1024,
      height: 728,
      icon: getAssetPath('icon.png'),
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
      autoHideMenuBar: true,
      frame: false,
      titleBarStyle: 'hidden',
    });

    mainWindow.loadURL(resolveHtmlPath('index.html'));

    mainWindow.on('ready-to-show', () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      /* if (process.env.START_MINIMIZED) {
        mainWindow.minimize();
      } */
      mainWindow.show();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    if (process.env.NODE_ENV === 'development') {
      const menuBuilder = new MenuBuilder(mainWindow);
      menuBuilder.buildMenu();
    } else {
      mainWindow.removeMenu();
    }

    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
  new AppUpdater();
  };

  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app
    .whenReady()
    .then(() => {
      createWindow();
      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) createWindow();
      });
    })
    .catch(console.log);

  const applySettings = async (settings: IApplicationSettings) => {
    if (mainWindow) {
      mainWindow.setFullScreen(settings.bShouldUseFullscreen);
    }
  };

  // read selected images from disk
  ipcMain.on(
    'upload-files',
    async (event, defaultUploadPath: string, pathsToUpload: string[]) => {
      if (pathsToUpload.length) {
        const readers: Promise<[string, number, string]>[] = [];

        // eslint-disable-next-line no-inner-declarations
        async function readFile(
          fileToLoad: string,
          index: number
        ): Promise<[string, number, string]> {
          return [
            (await fs.readFile(fileToLoad)).toString('base64'),
            index,
            path.parse(fileToLoad).name,
          ];
        }

        pathsToUpload.forEach((filePath: string, index: number) => {
          readers.push(readFile(filePath, index));
        });

        const filesLoaded = await Promise.all(readers);

        event.reply('upload-files', { result: true, files: filesLoaded });
      } else {
        dialog
          .showOpenDialog({
            title: 'Select the wallpapers to upload',
            properties: ['openFile', 'multiSelections'],
            defaultPath: defaultUploadPath,
            buttonLabel: 'Upload',
            filters: [
              {
                name: 'wallpapers',
                extensions: ['jpeg', 'png', 'jpg'],
              },
            ],
          })
          .then(async (result) => {
            if (result.canceled) {
              event.reply('upload-files', { result: false, files: [] });
            } else if (result.filePaths.length === 0) {
              event.reply('upload-files', { result: false, files: [] });
            } else {
              const readers: Promise<[string, number, string]>[] = [];

              // eslint-disable-next-line no-inner-declarations
              async function readFile(
                fileToLoad: string,
                index: number
              ): Promise<[string, number, string]> {
                return [
                  (await fs.readFile(fileToLoad)).toString('base64'),
                  index,
                  path.parse(fileToLoad).name,
                ];
              }
              result.filePaths.forEach((filePath: string, index: number) => {
                readers.push(readFile(filePath, index));
              });

              const filesLoaded = await Promise.all(readers);

              event.reply('upload-files', { result: true, files: filesLoaded });
            }
          })
          .catch(console.log);
      }
    }
  );

  // read selected images from disk
  ipcMain.on('save-settings', async (event, args: IApplicationSettings) => {
    applySettings(args);

    fs.writeFile(settingsPath, JSON.stringify(args, null, 3))
      .then(() => {
        event.reply('save-settings', true);
      })
      .catch(console.log);
  });

  ipcMain.on('load-settings', async (event) => {
    if (fsSync.existsSync(settingsPath)) {
      fs.readFile(settingsPath)
        .then((file: string) => {
          const settingsAsJson = JSON.parse(file);

          applySettings(settingsAsJson);
          event.reply('load-settings', settingsAsJson);
        })
        .catch(console.log);
    } else {
      const defaultSettings: IApplicationSettings = {
        defaultDownloadPath: '',
        maxItemsPerPage: 12,
        bShouldUseFullscreen: true,
        bIsLoggedIn: false,
      };

      applySettings(defaultSettings);

      fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 3))
        .then(() => {
          event.reply('load-settings', defaultSettings);
        })
        .catch(console.log);
    }
  });

  ipcMain.on('open-login', async (event) => {
    const params = new URLSearchParams({
      client_id: '967602114350174348',
      redirect_uri: `${
        isDevelopment
          ? 'http://localhost:3001'
          : 'https://wallpaperz-server.oyintare.dev'
      }/auth`,
      response_type: 'code',
      scope: 'identify',
      state: `${devicePhysicalAddress}`,
    }).toString();

    const url = `https://discord.com/api/oauth2/authorize?${params}`;

    socket.on('open-login', async (response: ILoginData) => {
      const encryptedData = safeStorage.encryptString(JSON.stringify(response));

      fs.writeFile(loginDataPath, encryptedData)
        .then(() => {
          event.reply('open-login', response);
        })
        .catch(console.log);
    });

    require('electron').shell.openExternal(url);
  });

  ipcMain.on('get-login', async (event) => {
    if (fsSync.existsSync(loginDataPath)) {
      const encryptedLoginData = await fs.readFile(loginDataPath);
      const decryptedLoginData = safeStorage.decryptString(encryptedLoginData);

      const loginData = JSON.parse(decryptedLoginData);

      event.reply('get-login', loginData);
    } else {
      event.reply('get-login', undefined);
    }
  });

  ipcMain.on('update-login', async (event, newLoginData) => {
    if (newLoginData === undefined) {
      if (fsSync.existsSync(loginDataPath)) {
        await fs.unlink(loginDataPath);
      }
      event.reply('update-login');
      return;
    }
    const encryptedData = safeStorage.encryptString(
      JSON.stringify(newLoginData)
    );
    await fs.writeFile(loginDataPath, encryptedData);
    event.reply('update-login');
  });

  ipcMain.on('logout', async (event) => {
    if (fsSync.existsSync(loginDataPath)) {
      await fs.unlink(loginDataPath);
    }
    event.reply('logout');
  });

  ipcMain.on(
    'upload-images',
    async (event, images: IConvertedSystemFiles[], uploader_id) => {
      const params = new URLSearchParams({
        user: devicePhysicalAddress,
        uploader: uploader_id,
      });

      const serverUrl = isDevelopment
        ? 'http://localhost:3001'
        : 'https://wallpaperz-server.oyintare.dev';

      console.log(`${serverUrl}/wallpapers?${params.toString()}`);

      const response = await axios
        .put(`${serverUrl}/wallpapers?${params.toString()}`, images, {
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        })
        .catch((error) => console.log(error.message));

      if (response?.data) {
        event.reply('upload-images', response?.data);
      } else {
        event.reply('upload-images', []);
      }
    }
  );

  ipcMain.on('download-image', async (event, image: IImageDownload) => {
    const downloadPath = path.join(app.getPath('pictures'), `${image.id}.jpg`);

    fs.writeFile(downloadPath, Buffer.from(image.data))
      .then(() => {
        event.reply('download-image', true);
      })
      .catch((error: Error) => {
        event.reply('download-image', false);
        console.log(error);
      });
  });

  ipcMain.on('clear-cache', async (event) => {
    if (fsSync.existsSync(thumnailCachePath)) {
      await fs.unlink(thumnailCachePath);
    }
    event.reply('clear-cache');
  });

  ipcMain.on('save-thumbnails', async (event, newCache) => {
    fs.writeFile(thumnailCachePath, JSON.stringify(newCache))
      .then(() => {
        event.reply('save-thumbnails', true);
      })
      .catch((error: Error) => {
        event.reply('save-thumbnails', false);
        console.log(error);
      });
  });

  ipcMain.on('load-thumbnails', async (event) => {
    try {
      if (fsSync.existsSync(thumnailCachePath)) {
        const stringResult = await fs.readFile(thumnailCachePath);
        event.reply('load-thumbnails', JSON.parse(stringResult));
      } else {
        event.reply('load-thumbnails', {});
      }
    } catch (error) {
      event.reply('load-thumbnails', {});
    }
  });

  ipcMain.on('quit-app', async () => {
    try {
      app.quit();
    } catch (error) {
      console.log(error);
    }
  });

  ipcMain.on('is-dev', (event) => {
    event.reply('is-dev', isDevelopment);
  });

  ipcMain.on('get-token', (event) => {
    event.reply('get-token', 'test');
  });

  ipcMain.on('window-max', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('window-min', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('window-close', () => {
    mainWindow?.close();
  });
}
