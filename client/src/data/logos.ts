export interface LogoPlatform {
  name: string;
  logo: string;
}

export const logos: LogoPlatform[] = [
  { name: "Netflix", logo: "/logos/netflix.svg" },
  { name: "Disney+", logo: "/logos/disneyplus.svg" },
  { name: "Max", logo: "/logos/max.svg" },
  { name: "Prime Video", logo: "/logos/primevideo.svg" },
  { name: "Hulu", logo: "/logos/hulu.svg" },
  { name: "Apple TV+", logo: "/logos/appletv.svg" }
];

export default logos;
