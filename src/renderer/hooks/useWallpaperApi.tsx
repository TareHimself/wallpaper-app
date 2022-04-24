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
      .get('http://localhost:49153/wallpapers', {
        headers: {
          'x-api-key':
            '2865228d39b816a799316c6224070ef0ebc155b6127bba2e87bde0cb347149b1',
        },
      })
      // eslint-disable-next-line promise/always-return
      .then(onRequestCompleted)
      .catch(onRequestFailed);
  }, []);

  return [data, setData];
}
