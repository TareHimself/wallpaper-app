import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
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
import Notifications from './components/NotificationContainer';

export default function App() {
  const [startPointForView, setStartPointForView] = useState<
    IWallpaperData | undefined
  >(undefined);

  const bHasVerifiedUserLogin = useRef(false);

  const [query, setQuery] = useState('');

  const [uploadedFiles, setUploadedFiles] = useState(
    Array<IConvertedSystemFiles>()
  );

  const [settings, setSettings] = useSettings();

  const [wallpapers, setWallpapers, refreshWallpapers] = useWallpaperApi(
    0,
    12, // settings?.maxItemsPerPage || 0,
    query.toLowerCase()
  );

  const [shouldShowSettings, setShowSettings] = useState(false);

  const [loginData, setLoginData] = useLogin();

  // eslint-disable-next-line no-empty
  if (settings) {
  }

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
          setQuery,
          setUploadedFiles,
          setWallpapers,
          settings,
          setSettings,
          loginData,
          setLoginData,
          setShowSettings,
          refreshWallpapers,
        }}
      >
        <div id="sub-root">
          <Home />
        </div>
        <Dashboard />
        <Settings
          activeClass={
            shouldShowSettings
              ? 'wallpaper-settings-open'
              : 'wallpaper-settings-closed'
          }
        />
        {startPointForView !== undefined && (
          <WallpaperViewModal data={startPointForView} />
        )}
        {uploadedFiles.length > 0 && (
          <WallpaperUploadModal uploads={uploadedFiles} />
        )}
        <Notifications />
      </GlobalAppContext.Provider>
    );
  }

  return <div />;
}
