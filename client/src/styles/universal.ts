/**
 * 🎨 BingeBoard Universal Class Names
 * 🔒 LOCKED DESIGN: Site-wide consistency utilities
 * 📅 Created: August 27, 2025 - Universal styling standards
 * ✨ Consistent class name patterns for the entire application
 */

// Universal spacing scale - USE THESE INSTEAD OF ARBITRARY TAILWIND VALUES
export const spacing = {
  // Vertical spacing (replaces space-y-* variations)
  sectionY: 'bb-space-y-2xl',    // 48px - Between major sections
  contentY: 'bb-space-y-lg',     // 24px - Between content blocks  
  elementY: 'bb-space-y-md',     // 16px - Between related elements
  itemY: 'bb-space-y-sm',        // 8px - Between small items

  // Horizontal spacing
  sectionX: 'bb-space-x-2xl',    // 48px - Major horizontal sections
  contentX: 'bb-space-x-lg',     // 24px - Content blocks
  elementX: 'bb-space-x-md',     // 16px - Related elements
  itemX: 'bb-space-x-sm',        // 8px - Small items
} as const;

// Universal container classes
export const containers = {
  main: 'bb-container',          // Main content wrapper
  section: 'bb-section',        // Major page sections
  content: 'bb-content-block',  // Content blocks within sections
} as const;

// Universal card patterns
export const cards = {
  default: 'bb-card',           // Standard card
  glass: 'bb-card-glass',       // Glass effect card
  hover: 'bb-card hover:bb-card-hover',  // Card with hover effect
} as const;

// Universal button patterns
export const buttons = {
  primary: 'bb-btn bb-btn-primary',     // Primary action button
  secondary: 'bb-btn bb-btn-secondary', // Secondary button
  ghost: 'bb-btn bb-btn-ghost',         // Ghost/subtle button
} as const;

// Universal input patterns
export const inputs = {
  default: 'bb-input',          // Standard input field
  search: 'bb-input bb-input-search', // Search input
} as const;

// Universal badge patterns
export const badges = {
  default: 'bb-badge',          // Standard badge
  primary: 'bb-badge bb-badge-primary',   // Primary colored badge
  success: 'bb-badge bb-badge-success',   // Success badge
} as const;

// Universal grid patterns
export const grids = {
  responsive: 'bb-grid-responsive',     // Auto-fit responsive grid
  poster: 'bb-poster-grid',            // Poster/card grid
  two: 'bb-grid bb-grid-2',            // 2-column grid
  three: 'bb-grid bb-grid-3',          // 3-column grid
  four: 'bb-grid bb-grid-4',           // 4-column grid
} as const;

// Universal animation classes
export const animations = {
  fadeIn: 'bb-animate-fade-in',        // Fade in animation
  slideUp: 'bb-animate-slide-up',      // Slide up animation
  scaleIn: 'bb-animate-scale-in',      // Scale in animation
} as const;

// Universal utility classes
export const utilities = {
  scrollbarHide: 'bb-scrollbar-hide',   // Hide scrollbar
  scrollbarThin: 'bb-scrollbar-thin',   // Thin scrollbar
  hideMobile: 'bb-hide-mobile',         // Hide on mobile
  hideDesktop: 'bb-hide-desktop',       // Hide on desktop
  textResponsive: 'bb-text-responsive', // Responsive text size
  loading: 'bb-loading',                // Loading state
  disabled: 'bb-disabled',              // Disabled state
  hidden: 'bb-hidden',                  // Hidden element
  srOnly: 'bb-sr-only',                 // Screen reader only
  focusVisible: 'bb-focus-visible',     // Focus visible
  focusRing: 'bb-focus-ring',           // Focus ring
  noPrint: 'bb-no-print',               // Hide when printing
} as const;

// Universal section header pattern
export const sectionHeader = {
  container: 'bb-section-header',       // Header container
  title: 'bb-section-title',           // Section title
  subtitle: 'bb-section-subtitle',     // Section subtitle
} as const;

// Utility function to combine universal classes with Tailwind
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Helper functions for common patterns
export const createSectionClasses = (spacingKey: keyof typeof spacing = 'sectionY') =>
  cn(containers.section, spacing[spacingKey]);

export const createCardClasses = (variant: keyof typeof cards = 'default', additionalClasses?: string) =>
  cn(cards[variant], additionalClasses);

export const createButtonClasses = (variant: keyof typeof buttons = 'primary', additionalClasses?: string) =>
  cn(buttons[variant], additionalClasses);

export const createGridClasses = (variant: keyof typeof grids = 'responsive', additionalClasses?: string) =>
  cn(grids[variant], additionalClasses);

// Responsive breakpoint utilities (matching design tokens)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Common class combinations for different components
export const componentPatterns = {
  // Hero section
  hero: cn(containers.section, 'min-h-[400px] relative overflow-hidden'),

  // Content section
  contentSection: cn(containers.section, spacing.contentY),

  // Card grid section
  cardGrid: cn(containers.section, grids.poster, spacing.contentY),

  // Horizontal scroll container
  horizontalScroll: cn(
    'flex overflow-x-auto',
    utilities.scrollbarHide,
    spacing.itemX
  ),

  // Modal overlay
  modalOverlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50',

  // Loading spinner
  loadingSpinner: cn(
    'animate-spin rounded-full border-2 border-gray-300 border-t-white',
    utilities.loading
  ),

  // Glass navigation
  navGlass: cn(
    'fixed top-0 left-0 right-0 z-40',
    cards.glass,
    'border-b border-white/10'
  ),
} as const;

// Export all universal class patterns
export const universal = {
  spacing,
  containers,
  cards,
  buttons,
  inputs,
  badges,
  grids,
  animations,
  utilities,
  sectionHeader,
  componentPatterns,
  // Helper functions
  cn,
  createSectionClasses,
  createCardClasses,
  createButtonClasses,
  createGridClasses,
} as const;

export default universal;
