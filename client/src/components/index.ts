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

// ===== DASHBOARD COMPONENTS =====
export { default as SpotlightCard } from './dashboard/SpotlightCard';

// ===== UI COMPONENTS =====
export { Button } from './ui/button';
export { Card, CardContent, CardHeader, CardTitle } from './ui/card';
export { Badge } from './ui/badge';

// ===== ENHANCED COMPONENTS =====
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
 * // ✅ PREFERRED - Import from component index
 * import { StreamingLogos, SpotlightCard, Button } from '@/components';
 * 
 * // ✅ ALSO OK - Direct import for specific components
 * import StreamingLogos from '@/components/streaming-logos';
 * 
 * // ❌ AVOID - Relative imports or non-standard paths
 * import StreamingLogos from './streaming-logos';
 * import { StreamingLogos } from '../ui/StreamingLogos';
 */