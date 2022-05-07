import '../css/Main.css';
import { ReactElement, useContext, useEffect, useRef } from 'react';
import WallpaperPreview from '../components/WallpaperPreview';
import GlobalAppContext from '../GlobalAppContext';

export default function Home() {
  let wallpaperElements: Array<ReactElement> = [];

  const { wallpapers, setStartPointForView } = useContext(GlobalAppContext);

  if (wallpapers?.length) {
    wallpaperElements = wallpapers.map((apiData) => (
      <WallpaperPreview
        key={apiData.id}
        data={apiData}
        setStartPointForView={setStartPointForView}
        getThumbnail={}
      />
    ));
  }

  const canvasRef = useRef<HTMLCanvasElement | undefined>(undefined);

  const thumnailQueue = useRef<string[]>([]);

  async function processUrl(url: string): Promise<void> {
    if (canvasRef.current) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        if (!canvasRef.current) return;

        const aspectratio = img.height / img.width;
        canvasRef.current.width = 500;
        canvasRef.current.height = 500 * aspectratio;
        const newWidth = 500;
        canvasRef?.current
          ?.getContext('2d')
          ?.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            0,
            0,
            newWidth,
            newWidth * aspectratio
          );

        localStorage.setItem(url, canvasRef.current.toDataURL());

        if (thumnailQueue.current.length) {
          setTimeout(processUrl, 0, thumnailQueue.current.pop());
        }
      };
      img.src = url;
    }
  }

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    window.addEventListener('storage', (event) => {
      console.log(event);
    });
  });

  return (
    <div className="page">
      <div className="item-grid">{wallpaperElements}</div>
    </div>
  );
}
