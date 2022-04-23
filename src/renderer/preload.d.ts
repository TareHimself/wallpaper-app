declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        myPing(): void;
        uploadFiles(lastUploadPath: string): Promise<any>;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
    };
  }
}

export {};
