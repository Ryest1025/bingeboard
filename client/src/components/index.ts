/**
 * Universal Component Index
 * 
 * This file provides a single source of truth for all shared components.
 * Import from here to ensure consistency and prevent duplicates.
 */

// ===== MAIN COMPONENTS =====
export { default as BingeBoardHeader } from './BingeBoardHeader';

// ===== STREAMING & MEDIA =====
export { default as StreamingLogos } from './streaming-logos';

// ===== UNIVERSAL COMPONENTS (NEW STANDARD) =====
export { UniversalMediaCard, UniversalScrollSection, UniversalHeroCarousel } from './universal';

// ===== UI COMPONENTS =====
export { Button } from './ui/button';
export { Card, CardContent, CardHeader, CardTitle } from './ui/card';
export { Badge } from './ui/badge';

// ===== LEGACY COMPONENTS (DEPRECATED - Use Universal Components Instead) =====
// These are kept for backward compatibility but should be replaced
export { default as SpotlightCard } from './dashboard/SpotlightCard';
export { default as EnhancedShowCard } from './EnhancedShowCard';
export { HeroCarousel } from './HeroCarousel';
export { default as TrailerButton } from './trailer-button';

// ===== FORM COMPONENTS =====
// Add form components here as they are standardized

// ===== UTILITY COMPONENTS =====
// Add utility components here as they are standardized

/**
 * Usage Examples:
 * 
 * // ✅ PREFERRED - Use Universal Components
 * import { UniversalMediaCard, UniversalScrollSection, UniversalHeroCarousel } from '@/components';
 * 
 * // ✅ ALSO OK - Direct import for universal components
 * import { UniversalMediaCard } from '@/components/universal';
 * 
 * // ⚠️ LEGACY - Still works but consider upgrading to Universal Components
 * import { EnhancedShowCard, SpotlightCard, HeroCarousel } from '@/components';
 * 
 * // ❌ AVOID - Relative imports or non-standard paths
 * import StreamingLogos from './streaming-logos';
 * import { StreamingLogos } from '../ui/StreamingLogos';
 */