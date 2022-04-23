import GlobalAppContext from 'renderer/GlobalAppContext';
import {
  SyntheticEvent,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import WallpaperUploadItem from './WallpaperUploadItem';

const clickOutClassnames = ['wallpaper-view', 'wallpaper-view-container'];

export default function WallpaperUploadModal({
  uploads,
}: {
  uploads: IConvertedSystemFiles[];
}) {
  const { setCurrentWallpaper } = useContext(GlobalAppContext);

  const [files, setFiles] = useState(uploads);

  function updateIndex(index: number, update: IConvertedSystemFiles) {
    files[index] = update;
    setFiles([...files]);
  }

  const updateIndexCallback = useCallback(updateIndex, [files]);

  const elements = files.map(
    (upload: IConvertedSystemFiles, uploadIndex: number) => {
      const element = (
        <WallpaperUploadItem
          key={uploads.indexOf(upload)}
          data={upload}
          index={uploadIndex}
          updateFunc={updateIndexCallback}
        />
      );
      return element;
    }
  );

  function onAttemptClickOut(event: SyntheticEvent<HTMLElement, Event>) {
    const element = event.target as HTMLElement;
    if (clickOutClassnames.includes(element.className) && setCurrentWallpaper) {
      setCurrentWallpaper(undefined);
    }
  }

  return (
    <div role="none" className="wallpaper-upload" onClick={onAttemptClickOut}>
      <div className="wallpaper-uploads-container">{elements}</div>
    </div>
  );
}
