import '../css/Main.css';
import type { ReactElement } from 'react';
import WallpaperPreview from 'renderer/components/WallpaperPreview';
import useWallpaperApi from 'renderer/hooks/useWallpaperApi';

export default function Home() {
  let wallpaperElements: Array<ReactElement> = [];

  const wallpapersFromApi = useWallpaperApi();

  if (wallpapersFromApi.length) {
    wallpaperElements = wallpapersFromApi.map((apiData) => (
      <WallpaperPreview key={apiData.id} data={apiData} />
    ));
  }
  return (
    <div className="page">
      <div className="item-grid">{wallpaperElements}</div>
    </div>
  );
}
