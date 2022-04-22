import { IWallpaperData } from 'renderer/types';
import {
  BsArrowsFullscreen,
  BsDownload,
  BsChevronCompactLeft,
  BsChevronCompactRight,
} from 'react-icons/bs';
import { CgClose } from 'react-icons/cg';
import { IoMdDownload } from 'react-icons/io';
import GlobalAppContext from 'renderer/GlobalAppContext';
import { useContext } from 'react';

export default function WallpaperViewModal({ data }: { data: IWallpaperData }) {
  const { setCurrentWallpaper } = useContext(GlobalAppContext);

  const { wallpapers } = useContext(GlobalAppContext);

  const currentItemIndex: number | undefined = wallpapers?.indexOf(data);

  function gotoNextWallpaper() {
    if (!wallpapers || !setCurrentWallpaper || currentItemIndex === undefined)
      return;

    if (currentItemIndex !== -1 && currentItemIndex < wallpapers.length - 1) {
      setCurrentWallpaper(wallpapers[currentItemIndex + 1]);
    }
  }

  function gotoPreviousWallpaper() {
    if (!wallpapers || !setCurrentWallpaper || currentItemIndex === undefined)
      return;

    if (currentItemIndex !== -1 && currentItemIndex > 0) {
      setCurrentWallpaper(wallpapers[currentItemIndex - 1]);
    }
  }

  return (
    <div className="wallpaper-view">
      <BsChevronCompactLeft
        className={
          currentItemIndex !== undefined && currentItemIndex > 0
            ? 'next-item-left'
            : 'next-item-disabled'
        }
        onClick={() => {
          gotoPreviousWallpaper();
        }}
      />
      <div className="wallpaper-view-container">
        <div className="wallpaper-view-panel">
          <h2>{data.downloads}</h2> <IoMdDownload />
        </div>
        <img src={data.uri} alt="wallpaper" id="wallpaperInView" />
        <div className="wallpaper-view-panel">
          <CgClose
            onClick={() => {
              if (setCurrentWallpaper) {
                setCurrentWallpaper(undefined);
              }
            }}
          />
          <BsDownload />
          <BsArrowsFullscreen />
        </div>
      </div>

      <BsChevronCompactRight
        className={
          currentItemIndex !== undefined &&
          currentItemIndex < (wallpapers ? wallpapers.length - 1 : 0)
            ? 'next-item-right'
            : 'next-item-disabled'
        }
        onClick={() => {
          gotoNextWallpaper();
        }}
      />
    </div>
  );
}
