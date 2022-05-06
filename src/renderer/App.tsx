import { useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
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

export default function App() {
  const [startPointForView, setStartPointForView] = useState<
    IWallpaperData | undefined
  >(undefined);

  const bHasVerifiedUserLogin = useRef(false);

  const [query, setQuery] = useState('');

  const [uploadedFiles, setUploadedFiles] = useState(
    Array<IConvertedSystemFiles>()
  );
  const [wallpapers, setWallpapers] = useWallpaperApi();

  const [settings, setSettings] = useSettings();

  const [shouldShowSettings, setShowSettings] = useState(false);

  const [loginData, setLoginData] = useLogin();

  const queryToLow = query.toLowerCase();

  const queriedWallpapers = query.length
    ? wallpapers.filter((wallpaper) =>
        wallpaper.tags.toLowerCase().includes(queryToLow)
      )
    : wallpapers;

  // eslint-disable-next-line no-empty
  if (settings) {
  }

  useEffect(() => {
    if (loginData?.discordAuthData && !bHasVerifiedUserLogin.current) {
      bHasVerifiedUserLogin.current = true;

      if (new Date(loginData.discordAuthData.refresh_at) < new Date()) {
        console.log('Expired Access token');
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
      <Router>
        <GlobalAppContext.Provider
          value={{
            setStartPointForView,
            wallpapers: queriedWallpapers,
            setQuery,
            setUploadedFiles,
            setWallpapers,
            settings,
            setSettings,
            loginData,
            setLoginData,
            setShowSettings,
          }}
        >
          <div id="sub-root">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
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
        </GlobalAppContext.Provider>
      </Router>
    );
  }

  return <div />;
}
