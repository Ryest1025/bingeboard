# Universal Component System

This document establishes standards for component organization, naming, and usage to prevent duplicates and ensure consistency.

## 📁 **Component Organization Standards**

### Primary Component Locations
```
/client/src/components/
├── ui/                    # Reusable UI primitives (buttons, cards, inputs)
├── dashboard/             # Dashboard-specific components
├── pages/                 # Page-level components
├── streaming-logos.tsx    # ✅ Universal streaming provider logos
└── [component-name].tsx   # Other shared components
```

### Import Standards
```typescript
// ✅ CORRECT - Use absolute imports from the canonical location
import StreamingLogos from '@/components/streaming-logos';
import SpotlightCard from '@/components/dashboard/SpotlightCard';
import { Button } from '@/components/ui/button';

// ❌ WRONG - Relative imports or wrong paths
import { StreamingLogos } from './StreamingLogos';
import StreamingLogos from '../streaming-logos-old';
```

## 🎯 **Universal Components Registry**

### Core UI Components
- **StreamingLogos** → `@/components/streaming-logos`
  - Props: `providers`, `size`, `maxDisplayed`
  - Usage: Display streaming platform logos with deduplication
  
- **SpotlightCard** → `@/components/dashboard/SpotlightCard`
  - Props: `spotlight` (optional)
  - Usage: Hero/spotlight content display with skeleton fallback

### Component Props Standards
```typescript
// ✅ STANDARD Props Interface
interface ComponentProps {
  // Required props first
  data: any;
  
  // Optional props with defaults
  size?: 'sm' | 'md' | 'lg';
  maxDisplayed?: number;
  
  // Boolean props with clear names
  showLabels?: boolean;
  isLoading?: boolean;
}

// ✅ STANDARD Default Props
export default function Component({ 
  data, 
  size = 'md', 
  maxDisplayed = 3,
  showLabels = false 
}: ComponentProps) {
  // Component logic
}
```

## 🚫 **Forbidden Patterns**

### ❌ Don't Create These
- Components with suffixes: `-old`, `-backup`, `-v2`, `-new`
- Duplicate components in different folders
- Components with inconsistent prop names (`maxLogos` vs `maxDisplayed`)
- Relative imports for shared components

### ❌ Don't Use These Props
- Inconsistent naming: `maxLogos` instead of `maxDisplayed`
- Props that should be standardized: `showNames` vs `showLabels`

## ✅ **Consolidation Rules**

### When Creating New Components
1. **Check existing components first** - Use `grep -r "ComponentName" client/src/`
2. **Use standard prop names** - Follow the props interface patterns
3. **Use absolute imports** - Always use `@/components/...`
4. **Add to this registry** - Document new components here

### When Modifying Components
1. **Update all usages** - Search and replace across the codebase
2. **Maintain backward compatibility** - Or update all imports simultaneously
3. **Update documentation** - Keep this registry current

## 🔧 **Automated Checks**

These patterns will be enforced by linting rules:
- No relative imports for shared components
- No duplicate component files
- Consistent prop naming conventions
- Required component documentation

## 📝 **Component Documentation Template**

```typescript
/**
 * ComponentName - Brief description
 * 
 * @param data - Description of required data
 * @param size - Size variant: 'sm' | 'md' | 'lg' (default: 'md')
 * @param maxDisplayed - Maximum items to display (default: 3)
 * 
 * @example
 * <ComponentName 
 *   data={items} 
 *   size="lg" 
 *   maxDisplayed={5} 
 * />
 */
```

## 🎯 **Next Steps**

1. Audit all existing components for compliance
2. Set up ESLint rules to enforce these standards
3. Create automated tests for component consistency
4. Document any exceptions to these rules