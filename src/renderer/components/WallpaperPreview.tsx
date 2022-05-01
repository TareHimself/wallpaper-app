import { SyntheticEvent, useContext } from 'react';
import '../css/Main.css';
import GlobalAppContext from 'renderer/GlobalAppContext';
import { BiSearchAlt } from 'react-icons/bi';
import { IoMdDownload } from 'react-icons/io';
import { IoResizeOutline } from 'react-icons/io5';

export default function WallpaperPreview({
  data,
  setStartPointForView,
}: {
  data: IWallpaperData;
  setStartPointForView:
    | React.Dispatch<React.SetStateAction<IWallpaperData | undefined>>
    | undefined;
}) {
  function onImageLoaded(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _imageLoadEvent: SyntheticEvent<HTMLImageElement, Event>
  ) {}

  return (
    <div
      role="none"
      className="grid-item"
      onClick={() => {
        if (setStartPointForView) {
          setStartPointForView(data);
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
        <h3>{`${data.width}x${data.height}`}</h3> <IoResizeOutline />
      </div>
      <div className="wallpaper-preview-downloads">
        <h3>{data.downloads}</h3> <IoMdDownload />
      </div>
    </div>
  );
}
