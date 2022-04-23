import React, { SyntheticEvent, useState } from 'react';
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
        src={data.uri}
        alt="upload"
        onLoad={onImageLoaded}
        draggable="false"
      />
      <div className="tags-input">
        <input
          type="text"
          onChange={onTagsChanged}
          placeholder="wallpaper tags seperated by commas"
        />
      </div>
      <div className="wallpaper-upload-size">
        <h2>{`${data.width}x${data.height}`}</h2>
        <IoResizeOutline />
      </div>
    </div>
  );
}
