import { IWallpaperData } from 'renderer/types';

export default function WallpaperViewModal({ data }: { data: IWallpaperData }) {
  return (
    <div className="wallpaper-view-modal">
      <div className="wallpaper-view-modal-content">
        <img src={data.uri} alt="modal" />
      </div>
    </div>
  );
}
