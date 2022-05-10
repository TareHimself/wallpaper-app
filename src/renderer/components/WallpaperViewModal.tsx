/* eslint-disable react/jsx-no-bind */
import {
  BsArrowsFullscreen,
  BsDownload,
  BsChevronCompactLeft,
  BsChevronCompactRight,
} from 'react-icons/bs';
import { CgClose } from 'react-icons/cg';
import { VscInfo } from 'react-icons/vsc';
import { IoResizeOutline } from 'react-icons/io5';
import { SyntheticEvent, useCallback, useContext, useState } from 'react';
import { addNotification } from 'renderer/utils';
import GlobalAppContext from '../GlobalAppContext';

const clickOutClassnames = ['wallpaper-view', 'wallpaper-view-container'];

export default function WallpaperViewModal({ data }: { data: IWallpaperData }) {
  const { wallpapers, setStartPointForView } = useContext(GlobalAppContext);

  const [currentIndex, setCurrentIndex] = useState<number>(
    wallpapers?.indexOf(data) || 0
  );

  const currentWallpaper = wallpapers ? wallpapers[currentIndex] : data;

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  function gotoNextWallpaper() {
    if (!wallpapers) return;

    if (currentIndex < wallpapers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function gotoPreviousWallpaper() {
    if (!wallpapers) return;

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      gotoPreviousWallpaper();
    } else if (event.key === 'ArrowRight') {
      gotoNextWallpaper();
    }
  }

  function onAttemptClickOut(event: SyntheticEvent<HTMLElement, Event>) {
    const element = event.target as HTMLElement;
    if (
      clickOutClassnames.includes(element.className) &&
      setStartPointForView
    ) {
      document.removeEventListener('keypress', handleKeyPress);
      setStartPointForView(undefined);
    }
  }

  const downloadWallpaper = useCallback(() => {
    if (wallpapers && currentIndex !== undefined && wallpapers[currentIndex]) {
      const wallpaperToDownload = document.getElementById(
        'wallpaper-in-view'
      ) as HTMLImageElement;

      const xhr = new XMLHttpRequest();
      xhr.open('get', wallpaperToDownload.src);

      xhr.responseType = 'blob';

      xhr.onload = async () => {
        await window.electron.ipcRenderer.downloadImage({
          id: `${wallpapers[currentIndex].tags} ${wallpapers[currentIndex].id}`,
          data: await (xhr.response as Blob).arrayBuffer(),
        });

        addNotification('Wallpaper Downloaded!');
      };

      xhr.onerror = alert;

      xhr.send();
    }
  }, [currentIndex, wallpapers]);

  /* useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);* */

  return (
    <div role="none" className="wallpaper-view" onClick={onAttemptClickOut}>
      <BsChevronCompactLeft
        className={
          currentIndex !== undefined && currentIndex > 0
            ? 'next-item-left'
            : 'next-item-disabled'
        }
        onClick={gotoPreviousWallpaper}
      />
      <div className="wallpaper-view-container">
        <div className="wallpaper-view-panel-top">
          <VscInfo />
          <span>
            <h2>{`${currentWallpaper.width}x${currentWallpaper.height}`}</h2>
            <IoResizeOutline />
          </span>
        </div>
        <img
          src={currentWallpaper.uri}
          alt="wallpaper"
          id="wallpaper-in-view"
          draggable="false"
        />
        <div className="wallpaper-view-panel-bottom">
          <CgClose
            onClick={() => {
              if (setStartPointForView) {
                document.removeEventListener('keypress', handleKeyPress);
                setStartPointForView(undefined);
              }
            }}
          />
          <BsDownload onClick={downloadWallpaper} />
          <BsArrowsFullscreen
            onClick={() => {
              setIsFullscreen(true);
              addNotification('Double Click To Exit');
            }}
          />
        </div>
      </div>

      <BsChevronCompactRight
        className={
          currentIndex !== undefined &&
          currentIndex < (wallpapers ? wallpapers.length - 1 : 0)
            ? 'next-item-right'
            : 'next-item-disabled'
        }
        onClick={gotoNextWallpaper}
      />
      {isFullscreen && (
        <div className="wallpaper-view-fullscreen">
          <img
            src={currentWallpaper.uri}
            alt="wallpaper"
            id="wallpaper-in-view-fullscreen"
            draggable="false"
            onDoubleClick={() => {
              setIsFullscreen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
