// Card variant configurations
export const CARD_VARIANTS = {
  vertical: {
    width: 'w-full', // Use responsive width instead of fixed w-48
    height: 'min-h-80', // Flexible height
    padding: 'p-3',
    titleSize: 'text-base',
    textSize: 'text-sm',
    moveButtonsToBottom: false,
    showOverlayButtons: true,
  },
  'vertical-polished': {
    width: 'w-full', // Use responsive width instead of fixed w-56
    height: 'min-h-96', // Flexible height
    padding: 'p-4',
    titleSize: 'text-lg',
    textSize: 'text-base',
    moveButtonsToBottom: true,
    showOverlayButtons: false,
  },
  horizontal: {
    width: 'w-full',
    height: 'h-48',
    padding: 'p-3',
    titleSize: 'text-md',
    textSize: 'text-xs',
    moveButtonsToBottom: false,
    showOverlayButtons: true,
    layout: 'horizontal',
  },
  spotlight: {
    width: 'w-full',
    height: 'h-96',
    padding: 'p-6',
    titleSize: 'text-3xl md:text-5xl',
    textSize: 'text-sm md:text-base',
    moveButtonsToBottom: false,
    showOverlayButtons: false,
    layout: 'spotlight',
  },
  'spotlight-polished': {
    width: 'w-full',
    height: 'h-96',
    padding: 'p-6',
    titleSize: 'text-4xl lg:text-5xl',
    textSize: 'text-base',
    moveButtonsToBottom: false,
    showOverlayButtons: false,
    layout: 'spotlight',
  },
  'spotlight-poster-backdrop': {
    width: 'w-full',
    height: 'h-96',
    padding: 'p-6',
    titleSize: 'text-3xl md:text-4xl lg:text-5xl',
    textSize: 'text-base',
    moveButtonsToBottom: false,
    showOverlayButtons: false,
    layout: 'spotlight-backdrop',
  },
  compact: {
    width: 'w-full',
    height: 'h-24',
    padding: 'p-3',
    titleSize: 'text-sm',
    textSize: 'text-xs',
    moveButtonsToBottom: false,
    showOverlayButtons: false,
    layout: 'compact',
  },
};

// Size configurations
export const SIZE_CONFIG = {
  sm: { width: 'w-32', height: 'h-48', textSize: 'text-xs', titleSize: 'text-sm', padding: 'p-2' },
  md: { width: 'w-48', height: 'h-72', textSize: 'text-sm', titleSize: 'text-base', padding: 'p-3' },
  lg: { width: 'w-56', height: 'h-84', textSize: 'text-base', titleSize: 'text-lg', padding: 'p-4' },
  xl: { width: 'w-64', height: 'h-96', textSize: 'text-lg', titleSize: 'text-xl', padding: 'p-6' }
};

// Genre mapping
export const GENRE_NAMES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};