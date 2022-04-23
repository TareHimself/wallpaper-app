import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import './css/Main.css';
import Dashboard from './components/Dashboard';
import GlobalAppContext from './GlobalAppContext';
import WallpaperViewModal from './components/WallpaperViewModal';
import { IWallpaperData } from './types';
import useWallpaperApi from './hooks/useWallpaperApi';

export default function App() {
  const [wallpaperBeingViewed, setWallpaperBeingViewed] = useState<
    IWallpaperData | undefined
  >(undefined);

  const [query, setQuery] = useState('');

  function setCurrentWallpaper(data: IWallpaperData | undefined) {
    setWallpaperBeingViewed(data);
  }

  function setSearchQuery(queryString: string) {
    setQuery(queryString);
  }

  const wallpapers = useWallpaperApi();
  const queryToLow = query.toLowerCase();

  const queriedWallpapers = query.length
    ? wallpapers.filter((wallpaper) => wallpaper.tags.includes(queryToLow))
    : wallpapers;

  useEffect(() => {
    document.body.classList.add('theme-light');
  });

  return (
    <Router>
      <GlobalAppContext.Provider
        value={{
          setCurrentWallpaper,
          wallpapers: queriedWallpapers,
          setSearchQuery,
        }}
      >
        <div id="sub-root">
          <Dashboard />
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
        {wallpaperBeingViewed !== undefined && (
          <WallpaperViewModal data={wallpaperBeingViewed} />
        )}
      </GlobalAppContext.Provider>
    </Router>
  );
}
