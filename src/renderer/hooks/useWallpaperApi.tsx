import { useEffect, useState } from 'react';
import { IApiResult, IWallpaperData } from 'renderer/types';
import axios, { AxiosResponse } from 'axios';
import { items } from './sampleWallpapers.json';

export default function useWallpaperApi(): IWallpaperData[] {
  const [data, setData] = useState(Array<IWallpaperData>());

  useEffect(() => {
    async function onRequestCompleted(response: AxiosResponse<any, any>) {
      const result: IWallpaperData[] = [];
      response.data.forEach((responseData: IApiResult) => {
        result.push({
          id: responseData.id,

          uri: responseData.uri,

          downloads: responseData.downloads,

          uploaded_at: responseData.uploaded_at,

          uploader: responseData.uploader,

          tags: responseData.tags.split('.'),
        });
      });

      setData(result);
    }

    async function onRequestFailed() {
      console.error('YOUR API IS FUCKED, USING SAMPLE DATA');

      const result: IWallpaperData[] = [];
      items.forEach((responseData: IApiResult) => {
        result.push({
          id: responseData.id,

          uri: responseData.uri,

          downloads: responseData.downloads,

          uploaded_at: responseData.uploaded_at,

          uploader: responseData.uploader,

          tags: responseData.tags.split('.'),
        });
      });

      setData(result);
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

  return data;
}
