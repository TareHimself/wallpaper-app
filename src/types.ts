/* eslint-disable @typescript-eslint/no-explicit-any */
export type Awaitable<T> = T | Promise<T>;

export type ServerResponse<T = any> =
  | {
      error: false;
      data: T;
    }
  | {
      error: true;
      data: string;
    };
export type RendererToMainEvents = {
  getPreloadPath: () => string;
  getPlatform: () => NodeJS.Platform;
  loadFilesFromDisk(
    lastUploadPath: string,
    paths: string[]
  ): Promise<ISystemFilesResult>;
  loadSettings(): Promise<IApplicationSettings>;
  saveSettings(settings: IApplicationSettings): Promise<boolean>;
  startLogin(): Promise<ILoginData | undefined>;
  getLogin(): Promise<ILoginData | undefined>;
  updateLogin(data: ILoginData | undefined): Promise<void>;
  logout(): Promise<void>;
  downloadImage(image: IImageDownload): Promise<boolean>;
  quitApp(): void;
  isDev(): Promise<boolean>;
  getToken(): Promise<string>;
  windowMinimize(): void;
  windowMaximize(): void;
  windowClose(): void;
  setDownloadPath(currentPath: string): Promise<string>;
  getServerUrl(): string;
  getDatabaseUrl(): string;
  getCdnUrl(): string;
};

export type MainToRendererEvents = Record<string, never>;

export interface IAccountData {
  id: string;

  avatar: string;

  nickname: string;

  options: string;
}

export interface IDiscordData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  refresh_at: string;
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
  dir: string;
}

export interface IApplicationSettings {
  downloadPath: string;
  maxItemsPerPage: number;
  bShouldUseFullscreen: boolean;
  bIsLoggedIn: boolean;
}

export interface ILoginData {
  session: string;
  account: IAccountData;
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
  settingsState: "neutral" | "open" | "closed";
}

export type IMainToRendererEvents = {
  onImport: (ids: string) => void;
};

export type IEventBase = {
  [key: string]: (...args: any[]) => Awaitable<any>;
};

export type EventReturnType<E extends IEventBase, T extends keyof E> = Awaited<
  ReturnType<E[T]>
>;

export type EventParams<E extends IEventBase, T extends keyof E> = Parameters<
  E[T]
>;

export {};

declare global {
  interface Window {
    bridge: RendererToMainEvents;
  }
}
