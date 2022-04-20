import { SyntheticEvent, useContext } from 'react';
import '../css/Main.css';
import GlobalAppContext from 'renderer/GlobalAppContext';
import { IWallpaperData } from 'renderer/types';
import { BiSearchAlt } from 'react-icons/bi';

export default function WallpaperPreview({ data }: { data: IWallpaperData }) {
  const { setCurrentWallpaper } = useContext(GlobalAppContext);

  function detectImageSize(
    imageLoadEvent: SyntheticEvent<HTMLImageElement, Event>
  ) {
    const textElement: HTMLElement | null = document.getElementById(
      `${data.id}-size`
    );

    const imageElement: HTMLImageElement =
      imageLoadEvent.target as HTMLImageElement;

    if (textElement) {
      textElement.innerHTML = `${imageElement.naturalWidth}x${imageElement.naturalHeight}`;
    }
  }

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
      <img src={data.uri} alt="someImage" onLoad={detectImageSize} />
      <BiSearchAlt className="wallpaper-preview-icon" />
      <div className="wallpaper-preview-size-panel">
        <h2 id={`${data.id}-size`}>Size</h2>
      </div>
    </div>
  );
}
