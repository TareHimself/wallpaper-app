import {
  BsArrowsFullscreen,
  BsDownload,
  BsChevronCompactLeft,
  BsChevronCompactRight,
} from 'react-icons/bs';
import { CgClose } from 'react-icons/cg';
import { IoMdDownload } from 'react-icons/io';
import { IoResizeOutline } from 'react-icons/io5';
import GlobalAppContext from 'renderer/GlobalAppContext';
import { SyntheticEvent, useCallback, useContext, useState } from 'react';

const clickOutClassnames = ['wallpaper-view', 'wallpaper-view-container'];

export default function WallpaperViewModal({ data }: { data: IWallpaperData }) {
  const { setCurrentWallpaper } = useContext(GlobalAppContext);

  const { wallpapers } = useContext(GlobalAppContext);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const currentItemIndex: number | undefined = wallpapers?.indexOf(data);

  const gotoNextWallpaper = useCallback(() => {
    if (!wallpapers || !setCurrentWallpaper || currentItemIndex === undefined)
      return;

    if (currentItemIndex !== -1 && currentItemIndex < wallpapers.length - 1) {
      setCurrentWallpaper(wallpapers[currentItemIndex + 1]);
    }
  }, [currentItemIndex, setCurrentWallpaper, wallpapers]);

  const gotoPreviousWallpaper = useCallback(() => {
    if (!wallpapers || !setCurrentWallpaper || currentItemIndex === undefined)
      return;

    if (currentItemIndex !== -1 && currentItemIndex > 0) {
      setCurrentWallpaper(wallpapers[currentItemIndex - 1]);
    }
  }, [currentItemIndex, setCurrentWallpaper, wallpapers]);

  function onAttemptClickOut(event: SyntheticEvent<HTMLElement, Event>) {
    const element = event.target as HTMLElement;
    if (clickOutClassnames.includes(element.className) && setCurrentWallpaper) {
      setCurrentWallpaper(undefined);
    }
  }

  const downloadWallpaper = useCallback(() => {
    if (
      wallpapers &&
      currentItemIndex !== undefined &&
      wallpapers[currentItemIndex]
    ) {
      const wallpaperToDownload = document.getElementById(
        'wallpaper-in-view'
      ) as HTMLImageElement;

      const xhr = new XMLHttpRequest();
      xhr.open('get', wallpaperToDownload.src);
      xhr.responseType = 'blob';
      xhr.onload = async function () {
        window.electron.ipcRenderer.downloadImage({
          id: wallpapers[currentItemIndex].id,
          data: await (xhr.response as Blob).arrayBuffer(),
        });
      };

      xhr.send();
    }
  }, [currentItemIndex, wallpapers]);

  return (
    <div role="none" className="wallpaper-view" onClick={onAttemptClickOut}>
      <BsChevronCompactLeft
        className={
          currentItemIndex !== undefined && currentItemIndex > 0
            ? 'next-item-left'
            : 'next-item-disabled'
        }
        onClick={gotoPreviousWallpaper}
      />
      <div className="wallpaper-view-container">
        <div className="wallpaper-view-panel-top">
          <span>
            <h2>{data.downloads}</h2> <IoMdDownload />
          </span>
          <span>
            <h2>{`${data.width}x${data.height}`}</h2> <IoResizeOutline />
          </span>
        </div>
        <img
          src={data.uri}
          alt="wallpaper"
          id="wallpaper-in-view"
          draggable="false"
        />
        <div className="wallpaper-view-panel-bottom">
          <CgClose
            onClick={() => {
              if (setCurrentWallpaper) {
                setCurrentWallpaper(undefined);
              }
            }}
          />
          <BsDownload onClick={downloadWallpaper} />
          <BsArrowsFullscreen
            onClick={() => {
              setIsFullscreen(true);
            }}
          />
        </div>
      </div>

      <BsChevronCompactRight
        className={
          currentItemIndex !== undefined &&
          currentItemIndex < (wallpapers ? wallpapers.length - 1 : 0)
            ? 'next-item-right'
            : 'next-item-disabled'
        }
        onClick={gotoNextWallpaper}
      />
      {isFullscreen && (
        <div className="wallpaper-view-fullscreen">
          <img
            src={data.uri}
            alt="wallpaper"
            id="wallpaper-in-view-fullscreen"
            draggable="false"
            onDoubleClick={() => {
              setIsFullscreen(false);
            }}
          />
          <h2>Double Click on the image to exit full-screen</h2>
        </div>
      )}
    </div>
  );
}
