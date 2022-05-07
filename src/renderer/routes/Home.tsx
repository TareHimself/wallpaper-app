import '../css/Main.css';
import { ReactElement, useContext } from 'react';
import WallpaperPreview from '../components/WallpaperPreview';
import GlobalAppContext from '../GlobalAppContext';

export default function Home() {
  let wallpaperElements: Array<ReactElement> = [];

  const { wallpapers, setStartPointForView } = useContext(GlobalAppContext);

  if (wallpapers?.length) {
    wallpaperElements = wallpapers.map((apiData) => (
      <WallpaperPreview
        key={apiData.id}
        data={apiData}
        setStartPointForView={setStartPointForView}
      />
    ));
  }

  return (
    <div className="page">
      <div className="item-grid">{wallpaperElements}</div>
    </div>
  );
}
