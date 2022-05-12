import { SyntheticEvent } from 'react';
import { IoResizeOutline } from 'react-icons/io5';

export default function WallpaperUploadItem({
  data,
  index,
  updateFunc,
}: {
  data: IConvertedSystemFiles;
  index: number;
  updateFunc: (index: number, update: IConvertedSystemFiles) => void;
}) {
  function onTagsChanged(event: SyntheticEvent<HTMLInputElement, Event>) {
    updateFunc(index, { ...data, tags: event.currentTarget.value });
  }

  function onImageLoaded(event: SyntheticEvent<HTMLImageElement, Event>) {
    if (data.height === 0 || data.width === 0) {
      const imageWidth = (event.target as HTMLImageElement).naturalWidth;
      const imageHeight = (event.target as HTMLImageElement).naturalHeight;
      updateFunc(index, {
        ...data,
        width: imageWidth,
        height: imageHeight,
      });
    }
  }

  return (
    <div className="upload-item">
      <img
        src={`data:image/png;base64,${data.file}`}
        alt="upload"
        onLoad={onImageLoaded}
        draggable="false"
      />
      <div className="tags-input">
        <input
          type="text"
          value={data.tags}
          onChange={onTagsChanged}
          placeholder="wallpaper tags seperated by commas"
        />
      </div>
      <div className="wp-upload-size">
        <h3>{`${data.width}x${data.height}`}</h3>
        <IoResizeOutline />
      </div>
    </div>
  );
}
