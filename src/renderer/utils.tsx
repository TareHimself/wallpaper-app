import EventEmitter from 'events';

class ThumbnailGenerator extends EventEmitter {
  thumbnailQueue: string[];

  canvas: HTMLCanvasElement;

  image: HTMLImageElement;

  context: CanvasRenderingContext2D | null;

  currentItem: string | undefined;

  constructor() {
    super();
    this.thumbnailQueue = Array<string>();
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d', { alpha: false });
    this.currentItem = '';
    this.image = new Image();
    this.image.crossOrigin = 'Anonymous';
    this.image.onload = () => {
      if (!this.canvas) return;

      const aspectratio = this.image.height / this.image.width;
      this.canvas.width = 500;
      this.canvas.height = 500 * aspectratio;
      const newWidth = 500;

      this.context?.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height,
        0,
        0,
        newWidth,
        newWidth * aspectratio
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
    if (!this.currentItem) return;

    const url = `https://wallpaperz.nyc3.cdn.digitaloceanspaces.com/wallpapers/${this.currentItem}.png`;
    if (this.canvas && this.image) {
      this.image.src = url;
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

export default async function generateThumbnail(id: string): Promise<string> {
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
