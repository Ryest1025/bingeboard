// Define logos + consistent colors in one place
export const PLATFORM_MAP: Record<
  string,
  { logo: string; bg: string; text: string }
> = {
  netflix: {
    logo: "netflix.png",
    bg: "bg-red-600",
    text: "text-white",
  },
  "netflix standard with ads": {
    logo: "netflix.png",
    bg: "bg-red-600",
    text: "text-white",
  },
  hulu: {
    logo: "hulu.png",
    bg: "bg-green-600",
    text: "text-white",
  },
  "prime video": {
    logo: "prime-video.png",
    bg: "bg-blue-600",
    text: "text-white",
  },
  "amazon prime video": {
    logo: "prime-video.png",
    bg: "bg-blue-600",
    text: "text-white",
  },
  "amazon prime": {
    logo: "prime-video.png",
    bg: "bg-blue-600",
    text: "text-white",
  },
  "disney plus": {
    logo: "disney-plus.png",
    bg: "bg-sky-600",
    text: "text-white",
  },
  "disney+": {
    logo: "disney-plus.png",
    bg: "bg-sky-600",
    text: "text-white",
  },
  "hbo max": {
    logo: "hbo-max.png",
    bg: "bg-purple-700",
    text: "text-white",
  },
  max: {
    logo: "hbo-max.png",
    bg: "bg-purple-700",
    text: "text-white",
  },
  "apple tv plus": {
    logo: "apple-tv.png",
    bg: "bg-gray-900",
    text: "text-white",
  },
  "apple tv+": {
    logo: "apple-tv.png",
    bg: "bg-gray-900",
    text: "text-white",
  },
  "apple tv": {
    logo: "apple-tv.png",
    bg: "bg-gray-900",
    text: "text-white",
  },
  peacock: {
    logo: "peacock.png",
    bg: "bg-yellow-500",
    text: "text-black",
  },
  "peacock premium": {
    logo: "peacock.png",
    bg: "bg-yellow-500",
    text: "text-black",
  },
  "paramount plus": {
    logo: "paramount-plus.png",
    bg: "bg-blue-800",
    text: "text-white",
  },
  "paramount+": {
    logo: "paramount-plus.png",
    bg: "bg-blue-800",
    text: "text-white",
  },
  paramount: {
    logo: "paramount-plus.png",
    bg: "bg-blue-800",
    text: "text-white",
  },
  showtime: {
    logo: "showtime.png",
    bg: "bg-red-700",
    text: "text-white",
  },
  starz: {
    logo: "starz.png",
    bg: "bg-black",
    text: "text-white",
  },
  crunchyroll: {
    logo: "crunchyroll.png",
    bg: "bg-orange-500",
    text: "text-white",
  },
  espn: {
    logo: "espn.png",
    bg: "bg-red-600",
    text: "text-white",
  },
  "espn plus": {
    logo: "espn.png",
    bg: "bg-red-600",
    text: "text-white",
  },
  "discovery plus": {
    logo: "discovery-plus.png",
    bg: "bg-blue-500",
    text: "text-white",
  },
  "discovery+": {
    logo: "discovery-plus.png",
    bg: "bg-blue-500",
    text: "text-white",
  },
  "youtube tv": {
    logo: "youtube-tv.png",
    bg: "bg-red-500",
    text: "text-white",
  },
};

// ✅ Get normalized key
const normalizePlatform = (platform: string) =>
  platform.toLowerCase().trim();

// ✅ Export helpers
export const getPlatformLogo = (platform: string) => {
  const key = normalizePlatform(platform);
  return PLATFORM_MAP[key]?.logo || null;
};

export const getPlatformColor = (platform: string) => {
  const key = normalizePlatform(platform);
  return PLATFORM_MAP[key] || { bg: "bg-gray-600", text: "text-white", logo: "" };
};

// Helper to get all platform info at once
export const getPlatformInfo = (platform: string) => {
  const key = normalizePlatform(platform);
  return PLATFORM_MAP[key] || { 
    bg: "bg-gray-600", 
    text: "text-white", 
    logo: null 
  };
};