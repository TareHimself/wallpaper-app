import { SyntheticEvent, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'renderer/redux/hooks';
import {
  refreshWallpapers,
  setWallpapersPendingUpload,
} from 'renderer/redux/wallpapersSlice';
import { IConvertedSystemFiles } from 'renderer/types';
import { addNotification } from '../utils';
import WallpaperUploadItem from './WallpaperUploadItem';

const clickOutClassnames = ['wp-view', 'wp-view-container'];

export default function WallpaperUploadModal({
  uploads,
}: {
  uploads: IConvertedSystemFiles[];
}) {
  const dispatch = useAppDispatch();

  const userData = useAppSelector((s) => s.currentUser);
  const wallpaperData = useAppSelector((s) => s.wallpapers);

  const [uploadingStatus, setUploadingStatus] = useState(false);

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
    if (userData.loginData?.userAccountData.id && wallpaperData.data) {
      addNotification('Uploading Wallpapers');
      await window.electron.ipcRenderer?.uploadImages(
        files,
        userData.loginData?.userAccountData.id
      );

      addNotification('Upload Complete');

      dispatch(refreshWallpapers({ bShouldReset: false }));
    }

    setUploadingStatus(false);

    setFiles(Array<IConvertedSystemFiles>());

    dispatch(setWallpapersPendingUpload(null));
  }, [
    uploadingStatus,
    files,
    userData.loginData?.userAccountData.id,
    wallpaperData.data,
    dispatch,
  ]);

  const cancelUpload = useCallback(async () => {
    if (uploadingStatus) return;
    setFiles(Array<IConvertedSystemFiles>());
    dispatch(setWallpapersPendingUpload(null));
  }, [dispatch, uploadingStatus]);

  return (
    <div role="none" id="wp-upload" onClick={onAttemptClickOut}>
      <div className="wp-uploads-container">{elements}</div>
      {!uploadingStatus && (
        <div className="wp-upload-buttons">
          <button type="button" onClick={cancelUpload}>
            <h2 style={{ fontSize: '160%' }}>Cancel</h2>
          </button>
          <button type="button" onClick={uploadWallpapers}>
            <h2 style={{ fontSize: '160%' }}>Upload</h2>
          </button>
        </div>
      )}
    </div>
  );
}
