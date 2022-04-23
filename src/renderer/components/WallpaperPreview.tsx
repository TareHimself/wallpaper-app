import { SyntheticEvent, useContext } from 'react';
import '../css/Main.css';
import GlobalAppContext from 'renderer/GlobalAppContext';
import { IWallpaperData } from 'renderer/types';
import { BiSearchAlt } from 'react-icons/bi';
import { IoMdDownload } from 'react-icons/io';

export default function WallpaperPreview({ data }: { data: IWallpaperData }) {
  const { setCurrentWallpaper } = useContext(GlobalAppContext);

  function onImageLoaded(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _imageLoadEvent: SyntheticEvent<HTMLImageElement, Event>
  ) {}

  return (
    <div
      role="none"
      className="grid-item"
      onClick={() => {
        if (setCurrentWallpaper) {
          setCurrentWallpaper(data);
        }
      }}
    >
      <img
        src={data.uri}
        alt="someImage"
        onLoad={onImageLoaded}
        draggable="false"
      />
      <BiSearchAlt className="wallpaper-preview-icon" />
      <div className="wallpaper-preview-size">
        <h2>{`${data.width}x${data.height}`}</h2>
      </div>
      <div className="wallpaper-preview-downloads">
        <h2>{data.downloads}</h2> <IoMdDownload />
      </div>
    </div>
  );
}
