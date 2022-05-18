import { SyntheticEvent, useCallback, useContext, useState } from 'react';
import { addNotification } from 'renderer/utils';
import GlobalAppContext from '../GlobalAppContext';
import WallpaperUploadItem from './WallpaperUploadItem';

const clickOutClassnames = ['wp-view', 'wp-view-container'];

export default function WallpaperUploadModal({
  uploads,
}: {
  uploads: IConvertedSystemFiles[];
}) {
  const [uploadingStatus, setUploadingStatus] = useState(false);
  const { wallpapers, refreshWallpapers, setUploadedFiles, loginData } =
    useContext(GlobalAppContext);

  const [files, setFiles] = useState(uploads);

  function updateIndex(index: number, update: IConvertedSystemFiles) {
    if (uploadingStatus) return;
    files[index] = update;
    setFiles([...files]);
  }

  const updateIndexCallback = useCallback(updateIndex, [
    files,
    uploadingStatus,
  ]);

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
    if (uploadingStatus) return;
    const element = event.target as HTMLElement;
    // eslint-disable-next-line no-empty
    if (clickOutClassnames.includes(element.className)) {
    }
  }

  const uploadWallpapers = useCallback(async () => {
    if (uploadingStatus) return;

    if (files.filter((file) => file.tags.split(',').length < 3).length !== 0) {
      addNotification('All wallpapers must have atleast 3 tags');
      return;
    }

    setUploadingStatus(true);
    if (loginData?.userAccountData?.id && wallpapers && refreshWallpapers) {
      addNotification('Uploading Wallpapers');
      await window.electron.ipcRenderer.uploadImages(
        files,
        loginData?.userAccountData?.id
      );

      addNotification('Upload Complete');

      refreshWallpapers();
    }

    setUploadingStatus(false);

    setFiles(Array<IConvertedSystemFiles>());

    if (setUploadedFiles) {
      setUploadedFiles(Array<IConvertedSystemFiles>());
    }
  }, [
    uploadingStatus,
    loginData?.userAccountData?.id,
    wallpapers,
    refreshWallpapers,
    files,
    setUploadedFiles,
  ]);

  const cancelUpload = useCallback(async () => {
    if (uploadingStatus) return;
    setFiles(Array<IConvertedSystemFiles>());
    if (setUploadedFiles) {
      setUploadedFiles(Array<IConvertedSystemFiles>());
    }
  }, [setUploadedFiles, uploadingStatus]);

  return (
    <div role="none" id="wp-upload" onClick={onAttemptClickOut}>
      <div className="wp-uploads-container">{elements}</div>
      {!uploadingStatus && (
        <div className="wp-upload-buttons">
          <button type="button" onClick={cancelUpload}>
            <h2>Cancel</h2>
          </button>
          <button type="button" onClick={uploadWallpapers}>
            <h2>Upload</h2>
          </button>
        </div>
      )}
    </div>
  );
}
