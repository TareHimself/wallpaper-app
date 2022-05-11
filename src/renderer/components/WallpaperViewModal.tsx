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
import { addNotification, SqlIntegerToTime } from 'renderer/utils';
import { MdOutlineArrowBackIos } from 'react-icons/md';
import GlobalAppContext from '../GlobalAppContext';

const clickOutClassnames = ['wp-view', 'wp-view-container'];

export default function WallpaperViewModal({ data }: { data: IWallpaperData }) {
  const { wallpapers, setStartPointForView, loginData } =
    useContext(GlobalAppContext);

  const [currentIndex, setCurrentIndex] = useState<number>(
    wallpapers?.indexOf(data) || 0
  );

  const currentWallpaper = wallpapers ? wallpapers[currentIndex] : data;

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [isShowingInformation, setShouldShowInformation] =
    useState<boolean>(false);

  const bisLoggedIn = loginData !== undefined;

  const bisOwnerOfWallpaper: boolean =
    bisLoggedIn && loginData.userAccountData.id === currentWallpaper.uploader;

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

  const deleteOrReportWallpaper = useCallback(() => {
    addNotification('This does not work yet, Tare is lazy');
  }, []);

  const editWallpaper = useCallback(() => {
    addNotification('This does not work yet, Tare is lazy');
  }, []);

  const downloadWallpaper = useCallback(() => {
    if (wallpapers && currentIndex !== undefined && wallpapers[currentIndex]) {
      const wallpaperToDownload = document.getElementById(
        'wp-in-view'
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
    <div role="none" className="wp-view" onClick={onAttemptClickOut}>
      <BsChevronCompactLeft
        className={
          currentIndex !== undefined && currentIndex > 0
            ? 'next-item-left'
            : 'next-item-disabled'
        }
        onClick={gotoPreviousWallpaper}
      />
      <div className="wp-view-container">
        <div className="wp-view-panel-top">
          <VscInfo
            onClick={() => {
              setShouldShowInformation(true);
            }}
          />
          <span>
            <h2>{`${currentWallpaper.width}x${currentWallpaper.height}`}</h2>
            <IoResizeOutline />
          </span>
        </div>
        <img
          src={currentWallpaper.uri}
          alt="wallpaper"
          id="wp-in-view"
          draggable="false"
        />
        <div className="wp-view-panel-bottom">
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
        <div className="wp-view-fullscreen">
          <img
            src={currentWallpaper.uri}
            alt="wallpaper"
            id="wp-in-view-fullscreen"
            draggable="false"
            onDoubleClick={() => {
              setIsFullscreen(false);
            }}
          />
        </div>
      )}
      {isShowingInformation && (
        <div
          className="wp-view-info"
          onClick={(event) => {
            if ((event.target as HTMLElement).className === 'wp-view-info') {
              setShouldShowInformation(false);
            }
          }}
          role="none"
        >
          <div className="wp-view-info-content">
            <MdOutlineArrowBackIos
              onClick={() => {
                setShouldShowInformation(false);
              }}
            />
            <span className="wp-view-info-content-data">
              <h2>Upload Date</h2>
              <h3>
                {SqlIntegerToTime(
                  currentWallpaper.uploaded_at
                ).toLocaleDateString()}
              </h3>
              <h2>Tags</h2>
              <h3>{currentWallpaper.tags}</h3>
            </span>

            <span className="wp-view-info-content-btns">
              {bisLoggedIn && (
                <button onClick={deleteOrReportWallpaper} type="button">
                  {bisOwnerOfWallpaper ? 'Delete' : 'Report'}
                </button>
              )}
              {bisOwnerOfWallpaper && (
                <button onClick={editWallpaper} type="button">
                  Edit
                </button>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
