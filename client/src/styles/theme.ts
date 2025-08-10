// styles/theme.ts - BingeBoard Theme Provider and Utilities
import { colors, gradients, radii, spacing, shadows } from './tokens';

export interface BingeTheme {
  colors: typeof colors;
  gradients: typeof gradients;
  radii: typeof radii;
  spacing: typeof spacing;
  shadows: typeof shadows;
}

export const bingeTheme: BingeTheme = {
  colors,
  gradients,
  radii,
  spacing,
  shadows,
};

// Utility functions for consistent styling
export const themeUtils = {
  // Glass effect utility
  glass: (opacity = 0.8) => ({
    background: `rgba(31, 31, 31, ${opacity})`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors.border}`,
  }),

  // Primary button styles
  buttonPrimary: {
    background: gradients.primary,
    color: colors.text,
    border: 'none',
    borderRadius: radii.lg,
    padding: `${spacing.sm} ${spacing.lg}`,
    boxShadow: shadows.md,
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: shadows.lg,
    },
  },

  // Secondary button styles
  buttonSecondary: {
    background: colors.backgroundCard,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: `${spacing.sm} ${spacing.lg}`,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: colors.secondaryLight,
      borderColor: colors.borderLight,
    },
  },

  // Card styles
  card: {
    background: colors.backgroundCard,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.xl,
    padding: spacing.lg,
    boxShadow: shadows.md,
  },

  // Input styles
  input: {
    background: colors.backgroundCard,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: `${spacing.sm} ${spacing.md}`,
    color: colors.text,
    '&:focus': {
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px ${colors.focus}`,
    },
  },

  // Modal overlay
  modalOverlay: {
    background: colors.backgroundOverlay,
    backdropFilter: 'blur(4px)',
  },

  // Streaming platform badge
  streamingBadge: (platform: keyof typeof colors) => ({
    backgroundColor: colors[platform] || colors.secondary,
    color: colors.text,
    borderRadius: radii.md,
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: '0.75rem',
    fontWeight: '500',
  }),
};

// CSS-in-JS style helpers
export const createStyles = {
  glassMorphism: (opacity = 0.1) => `
    background: rgba(255, 255, 255, ${opacity});
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `,

  primaryGradient: () => `
    background: ${gradients.primary};
  `,

  textGradient: () => `
    background: ${gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `,

  hoverGlow: () => `
    transition: box-shadow 0.3s ease;
    &:hover {
      box-shadow: ${shadows.glow};
    }
  `,
};

// Tailwind CSS utility classes
export const tw = {
  // Backgrounds
  bgPrimary: 'bg-[#FF4F64]',
  bgSecondary: 'bg-[#1F1F1F]',
  bgCard: 'bg-[#1A1A1A]',
  bgGlass: 'bg-[rgba(31,31,31,0.8)]',

  // Text colors
  textPrimary: 'text-white',
  textSecondary: 'text-[#B3B3B3]',
  textMuted: 'text-[#666666]',

  // Borders
  borderDefault: 'border-[rgba(255,255,255,0.1)]',
  borderLight: 'border-[rgba(255,255,255,0.2)]',

  // Buttons
  btnPrimary: 'bg-gradient-to-r from-[#FF4F64] to-[#E63946] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200',
  btnSecondary: 'bg-[#1A1A1A] text-white border border-[rgba(255,255,255,0.1)] px-4 py-2 rounded-lg hover:bg-[#2A2A2A] transition-all duration-200',

  // Cards
  cardDefault: 'bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 shadow-md',
  cardGlass: 'bg-[rgba(31,31,31,0.8)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] rounded-xl p-6',

  // Inputs
  inputDefault: 'bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-white focus:border-[#FF4F64] focus:ring-2 focus:ring-[rgba(255,79,100,0.2)]',
};

export default bingeTheme;
