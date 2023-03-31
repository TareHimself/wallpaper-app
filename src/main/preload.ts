import { RendererToMainEvents } from "../types";

import { ipcRenderer } from "../ipc";

const events: RendererToMainEvents = {
  getPreloadPath: () => ipcRenderer.sendToMainSync("getPreloadPath"),
  uploadFiles: (...args) => {
    return ipcRenderer.sendToMainAsync("uploadFiles", ...args);
  },
  loadSettings: (...args) => {
    return ipcRenderer.sendToMainAsync("loadSettings", ...args);
  },
  saveSettings: (...args) => {
    return ipcRenderer.sendToMainAsync("saveSettings", ...args);
  },
  openLogin: (...args) => {
    return ipcRenderer.sendToMainAsync("openLogin", ...args);
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
  uploadImages: (...args) => {
    return ipcRenderer.sendToMainAsync("uploadImages", ...args);
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
    return ipcRenderer.sendToMainAsync("getServerUrl", ...args);
  },
  getDatabaseUrl: (...args) => {
    return ipcRenderer.sendToMainAsync("getDatabaseUrl", ...args);
  },
};

ipcRenderer.exposeApi("bridge", events);
