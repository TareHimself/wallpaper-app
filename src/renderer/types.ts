declare global {
  interface IUserAccountData {
    id: string;

    avatar: string;

    nickname: string;

    options: string;
  }

  interface IDiscordAuthData {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
    refresh_at: string;
  }

  interface IDiscordUserData {
    id: string;
    username: string;
    avatar: string;
    avatar_decoration: unknown;
    discriminator: string;
    public_flags: number;
  }

  interface IWallpaperData {
    id: string;

    width: number;

    height: number;

    downloads: number;

    uploaded_at: number;

    uploader: string;

    tags: string;
  }

  interface IImageDownload {
    id: string;
    data: ArrayBuffer;
  }

  interface IApplicationSettings {
    defaultDownloadPath: string;
    maxItemsPerPage: number;
    bShouldUseFullscreen: boolean;
    bIsLoggedIn: boolean;
  }

  interface IGlobalContext {
    setStartPointForView: React.Dispatch<
      React.SetStateAction<IWallpaperData | undefined>
    >;
    wallpapers: IWallpaperData[];
    setSearchQuery: (search: string) => void;
    setUploadedFiles: React.Dispatch<
      React.SetStateAction<IConvertedSystemFiles[]>
    >;
    setWallpapers: React.Dispatch<React.SetStateAction<IWallpaperData[]>>;
    settings: IApplicationSettings | undefined;
    setSettings: (settings: IApplicationSettings) => void;
    loginData: ILoginData | undefined;
    setLoginData: (newLogin: ILoginData | undefined) => void;
    setSettingsState: React.Dispatch<React.SetStateAction<string>>;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    refreshWallpapers: () => void;
  }

  interface ILoginData {
    token: string;
    discordAuthData: IDiscordAuthData;
    discordUserData: IDiscordUserData;
    userAccountData: IUserAccountData;
  }

  interface Window {
    electron: {
      ipcRenderer: {
        myPing(): void;
        uploadFiles(
          lastUploadPath: string,
          paths: string[]
        ): Promise<ISystemFilesResult>;
        loadSettings(): Promise<IApplicationSettings>;
        saveSettings(settings: IApplicationSettings): Promise<boolean>;
        openLogin(): Promise<ILoginData>;
        getLogin(): Promise<ILoginData | undefined>;
        updateLogin(data: ILoginData | undefined): Promise<void>;
        logout(): Promise<void>;
        uploadImages(
          images: IConvertedSystemFiles[],
          uploader_id: string
        ): Promise<IWallpaperData[]>;
        downloadImage(image: IImageDownload): Promise<boolean>;
        clearCache(): Promise<void>;
        clearThumbnailCache(): void;
        clearWallpaperCache(): Promise<void>;
        thumbnailCache: Map<string, string>;
        loadThumnailCache(): Promise<[string, string][]>;
        updateThumnailCache(cache: Map<string, string>): Promise<boolean>;
        quitApp(): void;
        isDev(): Promise<boolean>;
        getToken(): Promise<string>;
        windowMinimize(): void;
        windowMaximize(): void;
        windowClose(): void;
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
    files: Array<[string, number, string]>;
  }

  interface IConvertedSystemFiles {
    id: number;
    file: string;
    height: number;
    width: number;
    tags: string;
  }

  interface INotificationInfo {
    id: number;
    content: string;
  }
}

export {};
