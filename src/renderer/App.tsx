import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import Home from './routes/Home';
import './css/Main.css';
import Dashboard from './components/Dashboard';
import GlobalAppContext from './GlobalAppContext';
import WallpaperViewModal from './components/WallpaperViewModal';
import useWallpaperApi from './hooks/useWallpaperApi';
import WallpaperUploadModal from './components/WallpaperUploadModal';
import useSettings from './hooks/useSettings';
import Settings from './components/Settings';
import useLogin from './hooks/useLogin';
import { addNotification } from './utils';

export default function App() {
  const [startPointForView, setStartPointForView] = useState<
    IWallpaperData | undefined
  >(undefined);

  const bHasVerifiedUserLogin = useRef(false);

  const [wantsToDragUpload, setWantsToDragUpload] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);

  const [query, setQuery] = useState('');

  const [uploadedFiles, setUploadedFiles] = useState(
    Array<IConvertedSystemFiles>()
  );

  const [settings, setSettings] = useSettings();

  const [wallpapers, setWallpapers, refreshWallpapers, hasNextPage] =
    useWallpaperApi(
      currentPage,
      12, // settings?.maxItemsPerPage || 0,
      query.toLowerCase()
    );

  const [settingsState, setSettingsState] = useState('neutral');

  const [loginData, setLoginData] = useLogin();

  const gotoNextPage = useCallback(() => {
    const subRoot = document.getElementById('sub-root');
    if (subRoot) subRoot.scrollTo({ top: 0, behavior: 'smooth' });

    setCurrentPage(currentPage + 1);
  }, [currentPage]);

  const gotoPreviousPage = useCallback(() => {
    const subRoot = document.getElementById('sub-root');
    if (subRoot) subRoot.scrollTo({ top: 0, behavior: 'smooth' });

    setCurrentPage(currentPage - 1);
  }, [currentPage]);

  const setSearchQuery = useCallback((search: string) => {
    setQuery(search);
    setCurrentPage(0);
  }, []);

  const hasPreviousPage = currentPage > 0;

  useEffect(() => {
    if (loginData?.discordAuthData && !bHasVerifiedUserLogin.current) {
      bHasVerifiedUserLogin.current = true;

      if (new Date(loginData.discordAuthData.refresh_at) < new Date()) {
        // refresh auth2 here
        addNotification('Discord login expired so no pfp updates');
        addNotification('In the future the login will auto refresh');
        return;
      }
      axios
        .get('https://discordapp.com/api/oauth2/@me', {
          headers: {
            Authorization: `${loginData.discordAuthData.token_type} ${loginData.discordAuthData.access_token}`,
          },
        })
        .then((response) => {
          // eslint-disable-next-line promise/always-return
          if (response?.data?.user) {
            loginData.discordUserData = response.data.user;
            loginData.userAccountData.avatar = `https://cdn.discordapp.com/avatars/${loginData.discordUserData.id}/${loginData.discordUserData.avatar}.webp?size=1024`;
            setLoginData(loginData);
            // update backend here
          }
        })
        .catch((error) => addNotification(error.message));
    }

    document.body.classList.add('theme-dark');
  }, [loginData, loginData?.discordAuthData, setLoginData]);

  useEffect(() => {
    function onDragEnter(event: DragEvent) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'all';
      }

      setWantsToDragUpload(true);
    }

    function onDrop(event: DragEvent) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.dataTransfer) {
        const paths = Array.from(event.dataTransfer.files)
          .filter(
            (file: File) =>
              file.type === 'image/jpeg' || file.type === 'image/png'
          )
          .map<string>((file: File) => file.path);

        if (paths.length) {
          // eslint-disable-next-line promise/catch-or-return
          window.electron.ipcRenderer
            .uploadFiles(settings?.defaultDownloadPath || '', paths)
            // eslint-disable-next-line promise/always-return
            .then((result: ISystemFilesResult) => {
              setUploadedFiles(
                result.files.map(
                  ([image, index, tags]: [string, number, string]) => {
                    return {
                      id: index,
                      file: image,
                      width: 0,
                      height: 0,
                      tags,
                    };
                  }
                )
              );

              setWantsToDragUpload(false);
              const currentDragArea = document.getElementById('drag-area');
              // eslint-disable-next-line promise/always-return
              if (currentDragArea) {
                currentDragArea.remove();
              }
            });
        } else {
          setWantsToDragUpload(false);
          const currentDragArea = document.getElementById('drag-area');
          if (currentDragArea) {
            currentDragArea.remove();
          }
        }
      }
    }

    function onDragOver(event: DragEvent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function onDragLeave(event: DragEvent) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setWantsToDragUpload(false);
      if (event.target) {
        (event.target as HTMLElement).remove();
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function onInitialDrag(_event: DragEvent) {
      const root = document.getElementById('root');
      const currentDragArea = document.getElementById('drag-area');
      if (root && !currentDragArea && !document.getElementById('wp-upload')) {
        const dragArea = document.createElement('div');
        dragArea.id = 'drag-area';
        dragArea.addEventListener('dragenter', onDragEnter);
        dragArea.addEventListener('drop', onDrop);
        dragArea.addEventListener('dragover', onDragOver);
        dragArea.addEventListener('dragleave', onDragLeave);
        if (!document.getElementById('drag-area')) root.appendChild(dragArea);
      }
    }

    document.addEventListener('dragenter', onInitialDrag);

    return () => {
      const dragArea = document.getElementById('drag-area');
      if (dragArea) {
        dragArea.removeEventListener('dragenter', onDragEnter);
        dragArea.removeEventListener('drop', onDrop);
        dragArea.removeEventListener('dragover', onDragOver);
        dragArea.removeEventListener('dragleave', onDragLeave);
        dragArea.remove();
        document.removeEventListener('dragenter', onDragEnter);
      } else {
        document.removeEventListener('dragenter', onDragEnter);
      }
    };
  }, [settings?.defaultDownloadPath, uploadedFiles.length, setUploadedFiles]);

  if (window.electron) {
    return (
      <GlobalAppContext.Provider
        value={{
          setStartPointForView,
          wallpapers,
          setSearchQuery,
          setUploadedFiles,
          setWallpapers,
          settings,
          setSettings,
          loginData,
          setLoginData,
          setSettingsState,
          refreshWallpapers,
        }}
      >
        <div id="sub-root">
          <Home />
          {(hasNextPage || hasPreviousPage) && (
            <div className="wp-page-select">
              {hasPreviousPage && (
                <button type="button" onClick={gotoPreviousPage}>
                  <GrFormPrevious />
                </button>
              )}
              {hasNextPage && (
                <button type="button" onClick={gotoNextPage}>
                  <GrFormNext />
                </button>
              )}
            </div>
          )}
        </div>
        <Dashboard />
        <Settings activeClass={`wp-settings-${settingsState}`} />
        {startPointForView !== undefined && (
          <WallpaperViewModal data={startPointForView} />
        )}
        {uploadedFiles.length > 0 && (
          <WallpaperUploadModal uploads={uploadedFiles} />
        )}

        {wantsToDragUpload && (
          <div id="wp-drag-upload">
            <AiOutlineCloudUpload />
          </div>
        )}
      </GlobalAppContext.Provider>
    );
  }

  return <div />;
}
