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
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const fs = require('fs').promises;
const fsSync = require('fs');
const express = require('express');
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

  socket = io('ws://localhost:3001/', {
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => {
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
        const readers: Promise<Buffer>[] = [];

        result.filePaths.forEach((filePath) => {
          readers.push(fs.readFile(filePath));
        });

        const filesLoaded = await Promise.all(readers);

        event.reply('upload-files', { result: true, files: filesLoaded });
      }
    })
    .catch(console.log);
});

// read selected images from disk
ipcMain.on('save-settings', async (event, args) => {
  fs.writeFile(
    path.join(app.getAppPath(), 'settings.json'),
    JSON.stringify(args, null, 3)
  )
    .then(() => {
      event.reply('save-settings', true);
    })
    .catch(console.log);
});

ipcMain.on('load-settings', async (event, _args) => {
  if (fsSync.existsSync(path.join(app.getAppPath(), 'settings.json'))) {
    fs.readFile(path.join(app.getAppPath(), 'settings.json'))
      .then((file: string) => {
        const settingsAsJson = JSON.parse(file);

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

    fs.writeFile(
      path.join(app.getAppPath(), 'settings.json'),
      JSON.stringify(defaultSettings, null, 3)
    )
      .then(() => {
        event.reply('load-settings', defaultSettings);
      })
      .catch(console.log);
  }
});

ipcMain.on('open-login', async (event, _args) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=967602114350174348&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth&response_type=code&scope=identify&state=${devicePhysicalAddress}`;

  socket.on('open-login', (response: ILoginResponse) => {
    event.reply('open-login', response);
  });

  require('electron').shell.openExternal(url);

  /* let authServerHandle: any;
  authServer.get('/auth', async (request: any, response: any) => {
    response.send('You may now close this window');
    if (authServerHandle) {
      await authServerHandle.close();
      authServerHandle = undefined;
      const encryptedData = safeStorage.encryptString(
        JSON.stringify(discordAuthData)
      );

      fs.writeFile(
        path.join(app.getAppPath(), 'DoNotShare.wallpaper'),
        encryptedData
      )
        .then(() => {
          event.reply('open-login', discordAuthData);
        })
        .catch(console.log);
    }
  });

  authServerHandle = authServer.listen(49153); */
});
