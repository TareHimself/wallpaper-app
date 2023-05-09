import { RendererToMainEvents } from "../types";

import { ipcRenderer } from "../ipc";

const events: RendererToMainEvents = {
  getPreloadPath: () => ipcRenderer.sendToMainSync("getPreloadPath"),
  loadFilesFromDisk: (...args) => {
    return ipcRenderer.sendToMainAsync("loadFilesFromDisk", ...args);
  },
  loadSettings: (...args) => {
    return ipcRenderer.sendToMainAsync("loadSettings", ...args);
  },
  saveSettings: (...args) => {
    return ipcRenderer.sendToMainAsync("saveSettings", ...args);
  },
  startLogin: (...args) => {
    return ipcRenderer.sendToMainAsync("startLogin", ...args);
  },
  getLogin: (...args) => {
    return ipcRenderer.sendToMainAsync("getLogin", ...args);
  },
  updateLogin: (...args) => {
    return ipcRenderer.sendToMainAsync("updateLogin", ...args);
  },
  logout: (...args) => {
    return ipcRenderer.sendToMainAsync("logout", ...args);
  },
  downloadImage: (...args) => {
    return ipcRenderer.sendToMainAsync("downloadImage", ...args);
  },
  quitApp: (...args) => {
    return ipcRenderer.sendToMainAsync("quitApp", ...args);
  },
  isDev: (...args) => {
    return ipcRenderer.sendToMainAsync("isDev", ...args);
  },
  getToken: (...args) => {
    return ipcRenderer.sendToMainAsync("getToken", ...args);
  },
  windowMinimize: (...args) => {
    return ipcRenderer.sendToMainAsync("windowMinimize", ...args);
  },
  windowMaximize: (...args) => {
    return ipcRenderer.sendToMainAsync("windowMaximize", ...args);
  },
  windowClose: (...args) => {
    return ipcRenderer.sendToMainAsync("windowClose", ...args);
  },
  setDownloadPath: (...args) => {
    return ipcRenderer.sendToMainAsync("setDownloadPath", ...args);
  },
  getServerUrl: (...args) => {
    return ipcRenderer.sendToMainSync("getServerUrl", ...args);
  },
  getDatabaseUrl: (...args) => {
    return ipcRenderer.sendToMainSync("getDatabaseUrl", ...args);
  },
  getCdnUrl: (...args) => {
    return ipcRenderer.sendToMainSync("getCdnUrl", ...args);
  },
  getPlatform: (...args) => {
    return ipcRenderer.sendToMainSync("getPlatform", ...args);
  },
};

ipcRenderer.exposeApi("auth", {
  onCodeReceived: (code: string) => {
    ipcRenderer.original.send("onCodeReceived", code);
  },
});

ipcRenderer.exposeApi("bridge", events);
