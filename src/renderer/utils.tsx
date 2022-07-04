import EventEmitter from 'events';

function pad(number: number) {
  return number < 10 ? `0${number}` : `${number}`;
}

export function TimeToInteger(date: Date) {
  return parseInt(
    `${date.getUTCFullYear()}${pad(date.getUTCMonth())}${pad(
      date.getUTCDate()
    )}${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(
      date.getUTCSeconds()
    )}`,
    10
  );
}

export function SqlIntegerToTime(number: number) {
  const string = number.toString();

  const newDate = new Date();
  newDate.setUTCSeconds(parseInt(string.slice(-2, string.length), 10));
  newDate.setUTCMinutes(parseInt(string.slice(-4, string.length - 2), 10));
  newDate.setUTCHours(parseInt(string.slice(-6, string.length - 4), 10));
  newDate.setUTCDate(parseInt(string.slice(-8, string.length - 6), 10));
  newDate.setUTCMonth(parseInt(string.slice(-10, string.length - 8), 10));
  newDate.setUTCFullYear(parseInt(string.slice(0, -10), 10));

  return newDate;
}

export function addNotification(noti: string) {
  document.dispatchEvent(
    new CustomEvent<INotificationInfo>('notification', {
      detail: {
        id: performance.now(),
        content: noti,
      },
    })
  );
}

class ThumbnailGenerator extends EventEmitter {
  thumbnailQueue: string[];

  canvas: HTMLCanvasElement;

  image: HTMLImageElement;

  context: CanvasRenderingContext2D | null;

  currentItem: string | undefined;

  bHasNotified: boolean;

  constructor() {
    super();
    this.thumbnailQueue = Array<string>();
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d', { alpha: false });
    this.currentItem = '';
    this.image = new Image();
    this.image.crossOrigin = 'Anonymous';
    this.bHasNotified = false;
    this.image.onload = () => {
      if (!this.canvas) return;

      const aspectRatio = 16 / 9;
      const bUsingWidth = this.image.width / this.image.height < aspectRatio;
      this.canvas.width = 700;
      this.canvas.height = this.canvas.width * (1 / aspectRatio);
      const imageRatio = this.image.width / this.image.height;
      const finalWidth = bUsingWidth
        ? this.canvas.width
        : this.canvas.height * imageRatio;
      const finalHeight = bUsingWidth
        ? this.canvas.width * (1 / imageRatio)
        : this.canvas.height;
      const widthOffset = bUsingWidth
        ? 0
        : this.image.width / 2 -
          (this.canvas.width / 2) * (this.image.height / this.canvas.height);
      const heightOffset = bUsingWidth
        ? this.image.height / 2 -
          (this.canvas.height / 2) * (this.image.width / this.canvas.width)
        : 0;

      this.context?.drawImage(
        this.image,
        widthOffset,
        heightOffset,
        this.image.width,
        this.image.height,
        0,
        0,
        finalWidth,
        finalHeight
      );

      const result = this.canvas.toDataURL();
      if (this.currentItem && window.electron.ipcRenderer.thumbnailCache) {
        window.electron.ipcRenderer.thumbnailCache.set(
          this.currentItem,
          result
        );
        this.emit(this.currentItem, result);
      }
      this.currentItem = undefined;
      this.generateThumbnail();
    };
  }

  generateThumbnail(): void {
    if (this.currentItem) return;
    this.currentItem = this.thumbnailQueue.pop();
    if (!this.currentItem) {
      addNotification('Done Generating Thumbnails');
      if (window.electron.ipcRenderer.thumbnailCache) {
        window.electron.ipcRenderer.updateThumnailCache(
          window.electron.ipcRenderer.thumbnailCache
        );
      }

      this.bHasNotified = false;
      return;
    }

    const url = `https://wallpaperz.nyc3.cdn.digitaloceanspaces.com/wallpapers/${this.currentItem}.png`;
    if (this.canvas && this.image) {
      this.image.src = url;
      if (!this.bHasNotified) {
        this.bHasNotified = true;
        addNotification('Generating Thumbnails');
      }
    }
  }

  getThumbnail(id: string): void {
    this.thumbnailQueue.push(id);

    if (!this.currentItem) {
      this.generateThumbnail();
    }
  }
}

let ThumbnailGuru: ThumbnailGenerator;

export async function generateThumbnail(id: string): Promise<string> {
  return new Promise<string>((resolve) => {
    if (!ThumbnailGuru) {
      ThumbnailGuru = new ThumbnailGenerator();
    }

    ThumbnailGuru.once(id, (thumbnail) => {
      resolve(thumbnail);
    });

    ThumbnailGuru.getThumbnail(id);
  });
}

export async function getServerUrl() {
  if (window.electron && (await window.electron.ipcRenderer.isDev())) {
    return 'http://localhost:3001';
  }
  return 'https://wallpaperz-server.oyintare.dev';
}

export async function getDatabaseUrl() {
  if (window.electron && (await window.electron.ipcRenderer.isDev())) {
    return 'http://localhost:3002';
  }
  return 'https://wallpaperz-database.oyintare.dev';
}
