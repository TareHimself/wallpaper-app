import { useEffect } from 'react';
import '../css/Main.css';
import { BiSearchAlt } from 'react-icons/bi';
import { IoResizeOutline } from 'react-icons/io5';
import { addNotification, generateThumbnail } from '../utils';

export default function WallpaperPreview({
  data,
  setStartPointForView,
}: {
  data: IWallpaperData;
  setStartPointForView:
    | React.Dispatch<React.SetStateAction<IWallpaperData | undefined>>
    | undefined;
}) {
  const uri =
    window.electron.ipcRenderer?.thumbnailCache?.get(data.id) ||
    `https://wallpaperz.nyc3.cdn.digitaloceanspaces.com/wallpapers/${data.id}.png`;

  useEffect(() => {
    if (
      uri ===
      `https://wallpaperz.nyc3.cdn.digitaloceanspaces.com/wallpapers/${data.id}.png`
    ) {
      generateThumbnail(data.id)
        .then((thumbnail: string) => {
          const element = document.getElementById(`thumb-${data.id}`);
          // eslint-disable-next-line promise/always-return
          if (element) {
            const imageElement = element as HTMLImageElement;
            imageElement.src = thumbnail;
          }
        })
        .catch((e) => addNotification(e.message));
    }
  }, [data.id, uri]);
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
        id={`thumb-${data.id}`}
        src={uri}
        alt={`${data.id} preview`}
        draggable="false"
        loading="lazy"
        decoding="async"
        crossOrigin="anonymous"
      />
      <BiSearchAlt className="wp-preview-icon" />
      <div className="wp-preview-size">
        <h3>{`${data.width}x${data.height}`}</h3> <IoResizeOutline />
      </div>
    </div>
  );
}
