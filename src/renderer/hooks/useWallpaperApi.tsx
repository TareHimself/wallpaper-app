import { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { items } from './sampleWallpapers.json';

export default function useWallpaperApi(): [
  IWallpaperData[],
  React.Dispatch<React.SetStateAction<IWallpaperData[]>>
] {
  const [data, setData] = useState(Array<IWallpaperData>());

  useEffect(() => {
    async function onRequestCompleted(response: AxiosResponse<any, any>) {
      setData(response.data);
    }

    async function onRequestFailed() {
      setData(items);
    }

    axios
      .get('https://wallpaper-app-database.oyintareebelo.repl.co/wallpapers')
      // eslint-disable-next-line promise/always-return
      .then(onRequestCompleted)
      .catch(onRequestFailed);
  }, []);

  return [data, setData];
}
