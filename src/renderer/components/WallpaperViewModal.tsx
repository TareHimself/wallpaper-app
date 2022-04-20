import { IWallpaperData } from 'renderer/types';
import {
  BsArrowsFullscreen,
  BsDownload,
  BsChevronCompactLeft,
  BsChevronCompactRight,
} from 'react-icons/bs';
import { CgClose } from 'react-icons/cg';
import GlobalAppContext from 'renderer/GlobalAppContext';
import { useContext } from 'react';

export default function WallpaperViewModal({ data }: { data: IWallpaperData }) {
  const { setCurrentWallpaper } = useContext(GlobalAppContext);

  return (
    <div className="wallpaper-view">
      <BsChevronCompactLeft className="next-item-right" />
      <div className="wallpaper-view-container">
        <div className="wallpaper-view-panel">
          <CgClose
            onClick={() => {
              if (setCurrentWallpaper) {
                setCurrentWallpaper(undefined);
              }
            }}
          />
          <BsArrowsFullscreen />
        </div>
        <img src={data.uri} alt="wallpaper" id="wallpaperInView" />
        <div className="wallpaper-view-panel">
          <BsDownload />
        </div>
      </div>
      <BsChevronCompactRight className="next-item-left" />
    </div>
  );
}
