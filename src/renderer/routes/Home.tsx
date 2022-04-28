import '../css/Main.css';
import { ReactElement, useContext } from 'react';
import WallpaperPreview from 'renderer/components/WallpaperPreview';
import GlobalAppContext from 'renderer/GlobalAppContext';

export default function Home() {
  let wallpaperElements: Array<ReactElement> = [];

  const { wallpapers, setCurrentWallpaper } = useContext(GlobalAppContext);

  if (wallpapers?.length) {
    wallpaperElements = wallpapers.map((apiData) => (
      <WallpaperPreview
        key={apiData.id}
        data={apiData}
        setCurrentWallpaper={setCurrentWallpaper}
      />
    ));
  }
  return (
    <div className="page">
      <div className="item-grid">{wallpaperElements}</div>
    </div>
  );
}
