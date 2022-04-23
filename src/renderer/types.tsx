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

interface IGlobalContext {
  setCurrentWallpaper: SetWallpaperFunction;
  wallpapers: IWallpaperData[];
  setSearchQuery: SetSearchQueryFunction;
}

export { IWallpaperData, IGlobalContext };
