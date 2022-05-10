import EventEmitter from 'events';

function pad(number: number) {
  return number < 10 ? `0${number}` : `${number}`;
}

export function TimeToSqliteInteger(date: Date) {
  return parseInt(
    `${date.getUTCFullYear()}${pad(date.getUTCMonth())}${pad(
      date.getUTCDate()
    )}${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(
      date.getUTCSeconds()
    )}${pad(date.getUTCMilliseconds())}`,
    10
  );
}

export function addNotification(noti: string) {
  document.dispatchEvent(
    new CustomEvent<INotificationInfo>('notification', {
      detail: {
        id: TimeToSqliteInteger(new Date()),
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
      if (this.currentItem) {
        localStorage.setItem(this.currentItem, result);
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
