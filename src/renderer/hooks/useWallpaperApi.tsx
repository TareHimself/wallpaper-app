import { useEffect, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { items } from './sampleWallpapers.json';

export default function useWallpaperApi(
  page: number,
  maxItems: number,
  query: string
): [
  IWallpaperData[],
  React.Dispatch<React.SetStateAction<IWallpaperData[]>>,
  () => void
] {
  const [data, setData] = useState(Array<IWallpaperData>());

  async function onRequestCompleted(
    response: AxiosResponse<IWallpaperData[], AxiosError>
  ) {
    setData(response.data);
  }

  async function onRequestFailed() {
    setData(items);
  }

  function refreshWallpapers() {
    if (maxItems > 0) {
      axios
        .get(
          `https://wallpaper-app-database.oyintareebelo.repl.co/wallpapers?o=${
            page * maxItems
          }&l=${maxItems}&q=${query}`
        )
        // eslint-disable-next-line promise/always-return
        .then(onRequestCompleted)
        .catch(onRequestFailed);
    }
  }

  useEffect(() => {
    if (maxItems > 0) {
      axios
        .get(
          `https://wallpaper-app-database.oyintareebelo.repl.co/wallpapers?o=${
            page * maxItems
          }&l=${maxItems}&q=${query}`
        )
        // eslint-disable-next-line promise/always-return
        .then(onRequestCompleted)
        .catch(onRequestFailed);
    }
  }, [maxItems, page, query]);

  return [data, setData, refreshWallpapers];
}
