interface IWallpaperData {
  id: string;

  uri: string;

  downloads: number;

  uploaded_at: number;

  uploader: string;

  tags: string[];
}

interface IApiResult {
  id: string;

  uri: string;

  downloads: number;

  uploaded_at: number;

  uploader: string;

  tags: string;
}

interface SetWallpaperFunction {
  (data: IWallpaperData | undefined): void;
}

interface IGlobalContext {
  setCurrentWallpaper: SetWallpaperFunction;
  wallpapers: IWallpaperData[];
}

export { IWallpaperData, IGlobalContext, IApiResult };
