import {
  SyntheticEvent,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import GlobalAppContext from '../GlobalAppContext';
import WallpaperUploadItem from './WallpaperUploadItem';

const clickOutClassnames = ['wallpaper-view', 'wallpaper-view-container'];

export default function WallpaperUploadModal({
  uploads,
}: {
  uploads: IConvertedSystemFiles[];
}) {
  const uploadingStatus = useRef(false);
  const { wallpapers, refreshWallpapers, setUploadedFiles, loginData } =
    useContext(GlobalAppContext);

  const [files, setFiles] = useState(uploads);

  function updateIndex(index: number, update: IConvertedSystemFiles) {
    if (uploadingStatus.current) return;
    files[index] = update;
    setFiles([...files]);
  }

  const updateIndexCallback = useCallback(updateIndex, [files]);

  const elements = files.map(
    (upload: IConvertedSystemFiles, uploadIndex: number) => {
      const element = (
        <WallpaperUploadItem
          key={upload.id}
          data={upload}
          index={uploadIndex}
          updateFunc={updateIndexCallback}
        />
      );
      return element;
    }
  );

  function onAttemptClickOut(event: SyntheticEvent<HTMLElement, Event>) {
    if (uploadingStatus.current) return;
    const element = event.target as HTMLElement;
    // eslint-disable-next-line no-empty
    if (clickOutClassnames.includes(element.className)) {
    }
  }

  const uploadWallpapers = useCallback(async () => {
    if (uploadingStatus.current) return;
    uploadingStatus.current = true;
    if (loginData?.userAccountData?.id && wallpapers && refreshWallpapers) {
      await window.electron.ipcRenderer.uploadImages(
        files,
        loginData?.userAccountData?.id
      );

      refreshWallpapers();
    }

    uploadingStatus.current = false;

    files.forEach((file: IConvertedSystemFiles) => {
      URL.revokeObjectURL(file.uri);
    });

    setFiles(Array<IConvertedSystemFiles>());

    if (setUploadedFiles) {
      setUploadedFiles(Array<IConvertedSystemFiles>());
    }
  }, [
    files,
    loginData?.userAccountData?.id,
    setUploadedFiles,
    refreshWallpapers,
    wallpapers,
  ]);

  const cancelUpload = useCallback(async () => {
    if (uploadingStatus.current) return;
    setFiles(Array<IConvertedSystemFiles>());
    if (setUploadedFiles) {
      setUploadedFiles(Array<IConvertedSystemFiles>());
    }
  }, [setUploadedFiles]);

  return (
    <div role="none" className="wallpaper-upload" onClick={onAttemptClickOut}>
      <div className="wallpaper-uploads-container">{elements}</div>
      <div className="wallpaper-upload-buttons">
        <button type="button" onClick={cancelUpload}>
          <h2>Cancel</h2>
        </button>
        <button type="button" onClick={uploadWallpapers}>
          <h2>Upload</h2>
        </button>
      </div>
    </div>
  );
}
