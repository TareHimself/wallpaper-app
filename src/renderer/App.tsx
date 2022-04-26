import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import './css/Main.css';
import Dashboard from './components/Dashboard';
import GlobalAppContext from './GlobalAppContext';
import WallpaperViewModal from './components/WallpaperViewModal';
import useWallpaperApi from './hooks/useWallpaperApi';
import WallpaperUploadModal from './components/WallpaperUploadModal';
import useSettings from './hooks/useSettings';
import Settings from './components/Settings';

export default function App() {
  const [currentWallpaper, setCurrentWallpaper] = useState<
    IWallpaperData | undefined
  >(undefined);

  const [query, setQuery] = useState('');

  const [uploadedFiles, setUploadedFiles] = useState(
    Array<IConvertedSystemFiles>()
  );
  const [wallpapers, setWallpapers] = useWallpaperApi();

  const [settings, setSettings] = useSettings();

  const [shouldShowSettings, setShowSettings] = useState(true);

  const [userData, setUserData] = useState<IUserAccountData | undefined>(
    undefined
  );

  const queryToLow = query.toLowerCase();

  const queriedWallpapers = query.length
    ? wallpapers.filter((wallpaper) => wallpaper.tags.includes(queryToLow))
    : wallpapers;

  // eslint-disable-next-line no-empty
  if (settings) {
  }

  useEffect(() => {
    document.body.classList.add('theme-dark');
  });

  return (
    <Router>
      <GlobalAppContext.Provider
        value={{
          setCurrentWallpaper,
          wallpapers: queriedWallpapers,
          setQuery,
          setUploadedFiles,
          setWallpapers,
          settings,
          setSettings,
        }}
      >
        <div id="sub-root">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
        <Dashboard setShowSettings={setShowSettings} />
        <Settings
          activeClass={
            shouldShowSettings
              ? 'wallpaper-settings-open'
              : 'wallpaper-settings-closed'
          }
          setShowSettings={setShowSettings}
        />
        {currentWallpaper !== undefined && (
          <WallpaperViewModal data={currentWallpaper} />
        )}
        {uploadedFiles.length > 0 && (
          <WallpaperUploadModal uploads={uploadedFiles} />
        )}
      </GlobalAppContext.Provider>
    </Router>
  );
}
