import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const validChannels = ['ipc-example', 'upload-files'];

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    uploadFiles(lastUploadPath: string) {
      ipcRenderer.send('upload-files', lastUploadPath);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise<ISystemFilesResult>((resolve, _reject) => {
        ipcRenderer.once('upload-files', (_event, response) => {
          resolve(response);
        });
      });
    },
    loadSettings() {
      ipcRenderer.send('load-settings', '');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise<IApplicationSettings>((resolve, _reject) => {
        ipcRenderer.once('load-settings', (_event, response) => {
          resolve(response);
        });
      });
    },
    saveSettings(settings: IApplicationSettings) {
      ipcRenderer.send('save-settings', settings);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise<boolean>((resolve, _reject) => {
        ipcRenderer.once('save-settings', (_event, response) => {
          resolve(response);
        });
      });
    },
    openLogin() {
      ipcRenderer.send('open-login', '');
      return new Promise<ILoginData>((resolve, _reject) => {
        ipcRenderer.once('open-login', (_event, response) => {
          resolve(response);
        });
      });
    },
    getLogin() {
      ipcRenderer.send('get-login', '');
      return new Promise<ILoginData | undefined>((resolve, _reject) => {
        ipcRenderer.once('get-login', (_event, response) => {
          resolve(response);
        });
      });
    },
    updateLogin(data: ILoginData) {
      ipcRenderer.send('update-login', data);
      return new Promise<void>((resolve, _reject) => {
        ipcRenderer.once('update-login', (_event, response) => {
          resolve(response);
        });
      });
    },
    logout() {
      ipcRenderer.send('logout', '');
      return new Promise<void>((resolve, _reject) => {
        ipcRenderer.once('logout', (_event, response) => {
          resolve(response);
        });
      });
    },
    uploadImages(images: IConvertedSystemFiles[], uploader_id: string) {
      ipcRenderer.send('upload-images', images, uploader_id);
      return new Promise<IWallpaperData[]>((resolve, _reject) => {
        ipcRenderer.once('upload-images', (_event, response) => {
          resolve(response);
        });
      });
    },
    downloadImage(image: IImageDownload) {
      ipcRenderer.send('download-image', image);
      return new Promise<boolean>((resolve, _reject) => {
        ipcRenderer.once('download-image', (_event, response) => {
          resolve(response);
        });
      });
    },
    on(channel: string, func: (...args: unknown[]) => void) {
      if (validChannels.includes(channel)) {
        const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
          func(...args);
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, subscription);

        return () => ipcRenderer.removeListener(channel, subscription);
      }

      return undefined;
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (_event, ...args) => func(...args));
      }
    },
  },
});
