declare global {
  interface IUserAccountData {
    id: string;

    avatar: string;

    nickname: string;

    security_level: string;

    downloads: string;

    options: string;
  }

  interface IDiscordLoginInfo {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
    refresh_at: string;
  }

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

  interface IApplicationSettings {
    defaultDownloadPath: string;
    maxItemsPerPage: number;
    bShouldUseFullscreen: boolean;
    bIsLoggedIn: boolean;
  }

  interface IGlobalContext {
    setCurrentWallpaper: React.Dispatch<
      React.SetStateAction<IWallpaperData | undefined>
    >;
    wallpapers: IWallpaperData[];
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    setUploadedFiles: React.Dispatch<
      React.SetStateAction<IConvertedSystemFiles[]>
    >;
    setWallpapers: React.Dispatch<React.SetStateAction<IWallpaperData[]>>;
    settings: IApplicationSettings | undefined;
    setSettings: (settings: IApplicationSettings) => void;
  }

  interface Window {
    electron: {
      ipcRenderer: {
        myPing(): void;
        uploadFiles(lastUploadPath: string): Promise<ISystemFilesResult>;
        loadSettings(): Promise<IApplicationSettings>;
        saveSettings(settings: IApplicationSettings): Promise<boolean>;
        openLogin(): Promise<IDiscordLoginInfo>;
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
