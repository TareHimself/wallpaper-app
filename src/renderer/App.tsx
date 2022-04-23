import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import './css/Main.css';
import Dashboard from './components/Dashboard';
import GlobalAppContext from './GlobalAppContext';
import WallpaperViewModal from './components/WallpaperViewModal';
import useWallpaperApi from './hooks/useWallpaperApi';
import WallpaperUploadModal from './components/WallpaperUploadModal';

export default function App() {
  const [wallpaperBeingViewed, setWallpaperBeingViewed] = useState<
    IWallpaperData | undefined
  >(undefined);

  const [query, setQuery] = useState('');

  const [uploadedFiles, setUploadedFiles] = useState(
    Array<IConvertedSystemFiles>()
  );

  function setCurrentWallpaper(data: IWallpaperData | undefined) {
    setWallpaperBeingViewed(data);
  }

  function setSearchQuery(queryString: string) {
    setQuery(queryString);
  }

  function setUploadedFilesFunction(files: IConvertedSystemFiles[]) {
    setUploadedFiles(files);
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
          setUploadedFiles: setUploadedFilesFunction,
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
        {uploadedFiles.length > 0 && (
          <WallpaperUploadModal uploads={uploadedFiles} />
        )}
      </GlobalAppContext.Provider>
    </Router>
  );
}
