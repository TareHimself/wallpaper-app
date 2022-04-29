import GlobalAppContext from 'renderer/GlobalAppContext';
import { SyntheticEvent, useCallback, useContext, useState } from 'react';
import WallpaperUploadItem from './WallpaperUploadItem';

const clickOutClassnames = ['wallpaper-view', 'wallpaper-view-container'];

export default function WallpaperUploadModal({
  uploads,
}: {
  uploads: IConvertedSystemFiles[];
}) {
  const {
    setCurrentWallpaper,
    wallpapers,
    setWallpapers,
    setUploadedFiles,
    loginData,
  } = useContext(GlobalAppContext);

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
    const element = event.target as HTMLElement;
    if (clickOutClassnames.includes(element.className) && setCurrentWallpaper) {
      setCurrentWallpaper(undefined);
    }
  }

  const uploadWallpapers = useCallback(async () => {
    const wallpapersForApi: IWallpaperData[] = Array<IWallpaperData>();

    if (loginData?.userAccountData?.id) {
      window.electron.ipcRenderer.uploadImages(
        files,
        loginData?.userAccountData?.id
      );
    }

    files.forEach((file: IConvertedSystemFiles) => {
      wallpapersForApi.push({
        id: file.uri,
        uri: file.uri,
        width: file.width,
        height: file.height,
        downloads: 0,
        uploaded_at: 20220422060000,
        uploader: 'Tare',
        tags: file.tags,
      });
    });
    if (wallpapers && setWallpapers) {
      setWallpapers([...wallpapers, ...wallpapersForApi]);
    }

    setFiles(Array<IConvertedSystemFiles>());

    if (setUploadedFiles) {
      setUploadedFiles(Array<IConvertedSystemFiles>());
    }
  }, [
    files,
    loginData?.userAccountData?.id,
    setUploadedFiles,
    setWallpapers,
    wallpapers,
  ]);

  const cancelUpload = useCallback(async () => {
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
