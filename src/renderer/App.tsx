import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';
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

export default function App() {
  const [startPointForView, setStartPointForView] = useState<
    IWallpaperData | undefined
  >(undefined);

  const bHasVerifiedUserLogin = useRef(false);

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
        alert('Expired Access token');
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
        .catch(alert);
    }

    document.body.classList.add('theme-dark');
  }, [loginData, loginData?.discordAuthData, setLoginData]);

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
            <div className="wallpaper-page-select">
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
        <Settings activeClass={`wallpaper-settings-${settingsState}`} />
        {startPointForView !== undefined && (
          <WallpaperViewModal data={startPointForView} />
        )}
        {uploadedFiles.length > 0 && (
          <WallpaperUploadModal uploads={uploadedFiles} />
        )}
      </GlobalAppContext.Provider>
    );
  }

  return <div />;
}
