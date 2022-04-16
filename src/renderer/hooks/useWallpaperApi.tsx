import { useEffect, useState } from 'react';
import { IApiResult } from 'renderer/types';
import sampleWallpapers from './sampleWallpapers.json';

export default function useWallpaperApi(): IApiResult[] {
  const [data, setData] = useState(Array<IApiResult>());

  useEffect(() => {
    setData(sampleWallpapers.items);
  }, []);

  return data;
}
