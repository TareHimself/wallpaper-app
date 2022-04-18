import { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import './css/Main.css';
import Dashboard from './components/Dashboard';
import GlobalAppContext from './GlobalAppContext';
import WallpaperViewModal from './components/WallpaperViewModal';
import { IWallpaperData } from './types';

export default function App() {
  const [wallpaperBeingViewed, setWallpaperBeingViewed] = useState<
    IWallpaperData | undefined
  >(undefined);

  function setCurrentWallpaper(data: IWallpaperData | undefined) {
    setWallpaperBeingViewed(data);
  }

  return (
    <Router>
      <GlobalAppContext.Provider value={{ setCurrentWallpaper }}>
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
