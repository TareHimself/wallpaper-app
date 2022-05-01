declare global {
  interface IUserAccountData {
    id: string;

    avatar: string;

    nickname: string;

    security_level: string;

    downloads: string;

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

    uri: string;

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
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    setUploadedFiles: React.Dispatch<
      React.SetStateAction<IConvertedSystemFiles[]>
    >;
    setWallpapers: React.Dispatch<React.SetStateAction<IWallpaperData[]>>;
    settings: IApplicationSettings | undefined;
    setSettings: (settings: IApplicationSettings) => void;
    loginData: ILoginData | undefined;
    setLoginData: React.Dispatch<React.SetStateAction<ILoginData | undefined>>;
    setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
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
        uploadFiles(lastUploadPath: string): Promise<ISystemFilesResult>;
        loadSettings(): Promise<IApplicationSettings>;
        saveSettings(settings: IApplicationSettings): Promise<boolean>;
        openLogin(): Promise<ILoginData>;
        getLogin(): Promise<ILoginData | undefined>;
        updateLogin(data: ILoginData): Promise<void>;
        logout(): Promise<void>;
        uploadImages(
          images: IConvertedSystemFiles[],
          uploader_id: string
        ): Promise<IWallpaperData[]>;

        downloadImage(image: IImageDownload): Promise<boolean>;
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
    files: Array<[Uint8Array | Buffer, number]>;
  }

  interface IConvertedSystemFiles {
    id: number;
    uri: string;
    file: Uint8Array;
    height: number;
    width: number;
    tags: string;
  }
}

export {};
