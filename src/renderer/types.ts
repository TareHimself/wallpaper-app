declare global {
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
}

export interface IUserAccountData {
  id: string;

  avatar: string;

  nickname: string;

  options: string;
}

export interface IDiscordAuthData {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  refresh_at: string;
}

export interface IDiscordUserData {
  id: string;
  username: string;
  avatar: string;
  avatar_decoration: unknown;
  discriminator: string;
  public_flags: number;
}

export interface IWallpaperData {
  id: string;

  width: number;

  height: number;

  downloads: number;

  uploaded_at: number;

  uploader: string;

  tags: string;
}

export interface IImageDownload {
  id: string;
  data: ArrayBuffer;
}

export interface IApplicationSettings {
  downloadPath: string;
  maxItemsPerPage: number;
  bShouldUseFullscreen: boolean;
  bIsLoggedIn: boolean;
}

export interface ILoginData {
  token: string;
  discordAuthData: IDiscordAuthData;
  discordUserData: IDiscordUserData;
  userAccountData: IUserAccountData;
}

export interface ISystemFilesResult {
  result: boolean;
  files: Array<[string, number, string]>;
}

export interface IConvertedSystemFiles {
  id: number;
  file: string;
  height: number;
  width: number;
  tags: string;
}

export interface INotificationInfo {
  id: number;
  content: string;
}

export interface ICurrentUserState {
  loginData: ILoginData | null;
  settings: IApplicationSettings | null;
}

export interface IWallpapersState {
  data: IWallpaperData[];
  dataPendingUpload: IConvertedSystemFiles[] | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentWallpaper: null | IWallpaperData;
  currentPage: number;
  query: string;
  maxItems: number;
}

export interface IAppState {
  settingsState: 'neutral' | 'open' | 'closed';
}

export {};
