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
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const fs = require('fs').promises;
const fsSync = require('fs');
const macaddress = require('macaddress');

let devicePhysicalAddress = '';
let socket: Socket;

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const loginDataPath = path.join(
  app.getPath('userData'),
  'loginData.wallpaperz'
);

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

ipcMain.on('ipc-example', async (event, args) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(args));
  event.reply('ipc-example', msgTemplate('pong'));
});

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

  socket = io('wss://wallpaperz-server.oyintare.dev', {
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => {
    socket.emit('client-identify', devicePhysicalAddress);
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
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
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

/**
 * Add event listeners...
 */

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

// read selected images from disk
ipcMain.on('upload-files', async (event, args) => {
  dialog
    .showOpenDialog({
      title: 'Select the wallpapers to upload',
      properties: ['openFile', 'multiSelections'],
      defaultPath: args,
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
        const readers: Promise<[Buffer, number]>[] = [];

        // eslint-disable-next-line no-inner-declarations
        async function readFile(
          fileToLoad: string,
          index: number
        ): Promise<[Buffer, number]> {
          return [await fs.readFile(fileToLoad), index];
        }
        result.filePaths.forEach((filePath: string, index: number) => {
          readers.push(readFile(filePath, index));
        });

        const filesLoaded = await Promise.all(readers);

        event.reply('upload-files', { result: true, files: filesLoaded });
      }
    })
    .catch(console.log);
});

async function applySettings(settings: IApplicationSettings) {
  if (mainWindow) {
    mainWindow.setFullScreen(settings.bShouldUseFullscreen);
  }
}

// read selected images from disk
ipcMain.on('save-settings', async (event, args: IApplicationSettings) => {
  applySettings(args);

  fs.writeFile(settingsPath, JSON.stringify(args, null, 3))
    .then(() => {
      event.reply('save-settings', true);
    })
    .catch(console.log);
});

ipcMain.on('load-settings', async (event, _args) => {
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

ipcMain.on('open-login', async (event, _args) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=967602114350174348&redirect_uri=https%3A%2F%2Fwallpaperz-server.oyintare.dev%2Fauth&response_type=code&scope=identify&state=${devicePhysicalAddress}`;

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

ipcMain.on('get-login', async (event, _args) => {
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
  const encryptedData = safeStorage.encryptString(JSON.stringify(newLoginData));
  await fs.writeFile(loginDataPath, encryptedData);
  event.reply('update-login');
});

ipcMain.on('logout', async (event, newLoginData) => {
  if (fsSync.existsSync(loginDataPath)) {
    await fs.unlink(loginDataPath);
  }
  event.reply('logout');
});

ipcMain.on('upload-images', async (event, images, uploader_id) => {
  socket.once('upload-images', (results: IWallpaperData[]) => {
    event.reply('upload-images', results);
  });

  socket.emit('upload-images', images, uploader_id);
});

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
