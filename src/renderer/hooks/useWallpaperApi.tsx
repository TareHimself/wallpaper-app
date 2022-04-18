import { useEffect, useState } from 'react';
import { IApiResult, IWallpaperData } from 'renderer/types';
import axios from 'axios';

export default function useWallpaperApi(): IWallpaperData[] {
  const [data, setData] = useState(Array<IWallpaperData>());

  useEffect(() => {
    axios
      .get('http://localhost:49153/wallpapers', {
        headers: {
          'x-api-key':
            '2865228d39b816a799316c6224070ef0ebc155b6127bba2e87bde0cb347149b1',
        },
      })
      // eslint-disable-next-line promise/always-return
      .then((response) => {
        const result: IWallpaperData[] = [];

        response.data.forEach((responseData: IApiResult) => {
          result.push({
            id: responseData.id,

            name: responseData.name,

            uri: responseData.uri,

            downloads: responseData.downloads,

            uploaded_at: responseData.uploaded_at,

            tags: responseData.tags.split('.'),
          });
        });
      })
      .catch(() => {
        // eslint-disable-next-line no-console
        console.error('YOUR API IS FUCKED');
      });
  }, []);

  return data;
}
