import { useCallback, useEffect, useRef, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { addNotification, getDatabaseUrl } from '../utils';

export default function useWallpaperApi(
  page: number,
  maxItems: number,
  query: string
): [
  IWallpaperData[],
  React.Dispatch<React.SetStateAction<IWallpaperData[]>>,
  () => void,
  boolean
] {
  const [data, setData] = useState(Array<IWallpaperData>());

  const hasNextPage = useRef(false);

  const refreshWallpapers = useCallback(async () => {
    async function onRequestCompleted(
      response: AxiosResponse<IWallpaperData[], AxiosError>
    ) {
      const wallpapersFromApi: IWallpaperData[] = response.data;

      if (wallpapersFromApi.length - maxItems > 0) {
        wallpapersFromApi.pop();
        hasNextPage.current = true;
      } else {
        hasNextPage.current = false;
      }

      setData(wallpapersFromApi);
    }

    async function onRequestFailed() {
      addNotification('Failed to fetch wallpapers');
    }

    if (maxItems > 0) {
      axios
        .get(
          `${await getDatabaseUrl()}/wallpapers?o=${page * maxItems}&l=${
            maxItems + 1
          }&q=${query}`
        )
        // eslint-disable-next-line promise/always-return
        .then(onRequestCompleted)
        .catch(onRequestFailed);
    }
  }, [maxItems, page, query]);

  useEffect(() => {
    refreshWallpapers();
  }, [maxItems, page, query, refreshWallpapers]);

  return [data, setData, refreshWallpapers, hasNextPage.current];
}
