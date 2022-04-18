interface IWallpaperData {
  id: string;

  name: string;

  uri: string;

  downloads: number;

  uploaded_at: string;

  tags: string[];
}

interface IApiResult {
  id: string;

  name: string;

  uri: string;

  downloads: number;

  uploaded_at: string;

  tags: string;
}

interface SetWallpaperFunction {
  (data: IWallpaperData | undefined): void;
}

interface IGlobalContext {
  setCurrentWallpaper: SetWallpaperFunction;
}

export { IWallpaperData, IGlobalContext, IApiResult };
