declare global {
  interface IWallpaperData {
    id: string;

    uri: string;

    width: number;

    height: number;

    downloads: number;

    uploaded_at: number;

    uploader: string;

    tags: string;
  }

  interface SetWallpaperFunction {
    (data: IWallpaperData | undefined): void;
  }

  interface SetSearchQueryFunction {
    (queryString: string): void;
  }

  interface SetUploadedFilesFunction {
    (files: IConvertedSystemFiles[]): void;
  }

  interface IGlobalContext {
    setCurrentWallpaper: SetWallpaperFunction;
    wallpapers: IWallpaperData[];
    setSearchQuery: SetSearchQueryFunction;
    setUploadedFiles: SetUploadedFilesFunction;
  }

  interface Window {
    electron: {
      ipcRenderer: {
        myPing(): void;
        uploadFiles(lastUploadPath: string): Promise<ISystemFilesResult>;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
    };
  }

  interface ISystemFilesResult {
    result: boolean;
    files: Uint8Array[] | Buffer[];
  }

  interface IConvertedSystemFiles {
    uri: string;
    file: Uint8Array;
    height: number;
    width: number;
    tags: string;
  }
}

export {};
