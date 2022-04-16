import { IApiResult } from 'renderer/types';

export default function WallpaperViewModal({ data }: { data: IApiResult }) {
  return (
    <div className="wallpaper-view-modal">
      <div className="wallpaper-view-modal-content">
        <img src={data.uri} alt="modal" />
      </div>
    </div>
  );
}
