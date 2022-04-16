interface IApiResult {
  id: string;

  uri: string;

  name: string;

  tags: Array<string>;
}

interface SetWallpaperFunction {
  (data: IApiResult | undefined): void;
}

interface IGlobalContext {
  setCurrentWallpaper: SetWallpaperFunction;
}

export { IApiResult, IGlobalContext };
