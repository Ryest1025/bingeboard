// styles/tokens.ts - BingeBoard Brand Design System
export const colors = {
  // Primary brand colors
  primary: "#FF4F64", // BingeBoard signature pink-red
  primaryHover: "#E63946", // Darker variant for hover states
  primaryLight: "#FF6B7D", // Lighter variant for backgrounds

  // Secondary colors
  secondary: "#1F1F1F", // Deep charcoal
  secondaryLight: "#2A2A2A", // Lighter charcoal

  // Accent colors
  accent: "#FFD369", // Warm gold accent
  accentHover: "#FFB627", // Darker gold for hover

  // Backgrounds
  background: "#0F0F0F", // Pure dark background
  backgroundCard: "#1A1A1A", // Card backgrounds
  backgroundGlass: "rgba(31, 31, 31, 0.8)", // Glass effect
  backgroundOverlay: "rgba(0, 0, 0, 0.6)", // Modal overlays

  // Text colors
  text: "#FFFFFF", // Primary text
  textSecondary: "#B3B3B3", // Secondary text
  textMuted: "#666666", // Muted text
  textDark: "#000000", // Dark text for light backgrounds

  // Status colors
  success: "#4ADE80", // Green for success states
  warning: "#FBBF24", // Yellow for warnings
  error: "#EF4444", // Red for errors
  info: "#3B82F6", // Blue for info

  // Streaming platform colors (from existing system)
  netflix: "#E50914",
  disney: "#113CCF",
  prime: "#00A8E1",
  hbo: "#7B2CBF",
  hulu: "#1CE783",
  apple: "#000000",

  // Interactive states
  hover: "rgba(255, 79, 100, 0.1)", // Primary hover background
  focus: "rgba(255, 79, 100, 0.2)", // Focus ring color
  border: "rgba(255, 255, 255, 0.1)", // Border color
  borderLight: "rgba(255, 255, 255, 0.2)", // Lighter borders
} as const;

export const gradients = {
  primary: "linear-gradient(135deg, #FF4F64 0%, #E63946 100%)",
  secondary: "linear-gradient(135deg, #1F1F1F 0%, #2A2A2A 100%)",
  accent: "linear-gradient(135deg, #FFD369 0%, #FFB627 100%)",
  glass: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
  overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%)",
} as const;

export const radii = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  "3xl": "24px",
  full: "9999px",
} as const;

export const spacing = {
  "0": "0px",
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
  "4xl": "80px",
  "5xl": "96px",
} as const;

export const typography = {
  fontFamily: {
    primary: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    secondary: "Poppins, sans-serif",
    mono: "JetBrains Mono, Consolas, monospace",
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  glow: "0 0 20px rgba(255, 79, 100, 0.3)",
  glowAccent: "0 0 20px rgba(255, 211, 105, 0.3)",
} as const;

export const animations = {
  duration: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },
  easing: {
    linear: "linear",
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Utility function to get CSS custom properties
export const getCSSVariables = () => {
  const cssVars: Record<string, string> = {};

  // Colors
  Object.entries(colors).forEach(([key, value]) => {
    cssVars[`--binge-${key}`] = value;
  });

  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    cssVars[`--binge-spacing-${key}`] = value;
  });

  // Radii
  Object.entries(radii).forEach(([key, value]) => {
    cssVars[`--binge-radius-${key}`] = value;
  });

  return cssVars;
};

// Theme configuration for Tailwind CSS
export const tailwindTheme = {
  colors,
  spacing,
  borderRadius: radii,
  fontFamily: typography.fontFamily,
  fontSize: typography.fontSize,
  fontWeight: typography.fontWeight,
  lineHeight: typography.lineHeight,
  boxShadow: shadows,
  screens: breakpoints,
};
