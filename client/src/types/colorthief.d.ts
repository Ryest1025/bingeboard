declare module 'colorthief' {
  export default class ColorThief {
    getColor(image: HTMLImageElement | HTMLCanvasElement): [number, number, number];
    getPalette(
      image: HTMLImageElement | HTMLCanvasElement,
      colorCount?: number,
      quality?: number
    ): [number, number, number][];
  }
}
