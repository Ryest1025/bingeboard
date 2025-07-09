// Device detection utilities
export const isMobileDevice = (): boolean => {
  // Check if we're running in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Check for mobile user agents
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Mobile detection patterns
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
  
  // Check if any mobile pattern matches
  const isMobileUA = mobilePatterns.some(pattern => pattern.test(userAgent));
  
  // Also check for touch capability and small screen
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasSmallScreen = window.innerWidth <= 768;
  
  // Return true if mobile user agent OR (touch screen AND small screen)
  return isMobileUA || (hasTouchScreen && hasSmallScreen);
};

// Check if device supports popups reliably
export const supportsPopups = (): boolean => {
  return !isMobileDevice();
};