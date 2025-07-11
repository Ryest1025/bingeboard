/**
 * Device detection and mobile optimization utilities
 */

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Mobile device patterns
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Mobile/i
  ];
  
  return mobilePatterns.some(pattern => pattern.test(userAgent));
};

export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  
  return /Android/.test(navigator.userAgent);
};

export const getDeviceType = () => {
  if (isMobileDevice()) {
    if (isIOS()) return 'iOS';
    if (isAndroid()) return 'Android';
    return 'Mobile';
  }
  return 'Desktop';
};

export const getMobileViewportMeta = () => {
  // Optimized viewport settings for mobile
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: 'no',
    viewportFit: 'cover'
  };
};

export const applyMobileOptimizations = () => {
  if (typeof window === 'undefined') return;
  
  // Add mobile-specific CSS classes
  if (isMobileDevice()) {
    document.documentElement.classList.add('mobile-device');
    
    if (isIOS()) {
      document.documentElement.classList.add('ios-device');
    }
    
    if (isAndroid()) {
      document.documentElement.classList.add('android-device');
    }
  }
  
  // Prevent zoom on input focus (mobile)
  if (isMobileDevice()) {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }
};