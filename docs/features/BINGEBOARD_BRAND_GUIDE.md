# BingeBoard Brand Style Guide

## Logo & Visual Identity

### TV Icon (Primary Logo)
```css
/* Exact TV Frame Structure */
.tv-logo {
  width: 10px (w-10);
  height: 8px (h-8);
  background: linear-gradient(to bottom right, rgb(51, 65, 85), rgb(15, 23, 42)); /* from-slate-700 to-slate-900 */
  border-radius: 8px (rounded-lg);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-xl */
  border: 2px solid rgb(71, 85, 105); /* border-slate-600 */
  position: relative;
}

/* TV Screen with "B" */
.tv-screen {
  position: absolute;
  inset: 4px; /* inset-1 */
  background: linear-gradient(to bottom right, rgb(20, 184, 166), rgb(6, 182, 212), rgb(59, 130, 246)); /* from-teal-500 via-cyan-500 to-blue-500 */
  border-radius: 6px; /* rounded-md */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* "B" Letter Styling */
.tv-screen-letter {
  font-size: 14px; /* text-sm */
  font-weight: bold;
  color: white;
  filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07));
  text-shadow: 0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3);
}

/* TV Base */
.tv-base {
  position: absolute;
  bottom: -4px; /* -bottom-1 */
  left: 50%;
  transform: translateX(-50%);
  width: 12px; /* w-3 */
  height: 4px; /* h-1 */
  background: rgb(51, 65, 85); /* bg-slate-700 */
  border-radius: 2px; /* rounded-sm */
}

/* TV Legs */
.tv-legs {
  position: absolute;
  bottom: -8px; /* -bottom-2 */
  left: 50%;
  transform: translateX(-50%);
  width: 20px; /* w-5 */
  height: 4px; /* h-1 */
  background: rgb(71, 85, 105); /* bg-slate-600 */
  border-radius: 2px; /* rounded-sm */
}
```

### Brand Typography

#### Main Brand Name: "BingeBoard"
```css
.brand-name {
  background: linear-gradient(to right, rgb(45, 212, 191), rgb(34, 211, 238), rgb(59, 130, 246)); /* from-teal-400 via-cyan-400 to-blue-400 */
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  font-weight: 900; /* font-black */
  font-size: 1.25rem; /* text-xl */
}

@media (min-width: 640px) {
  .brand-name {
    font-size: 1.5rem; /* sm:text-2xl */
  }
}
```

#### Subtitle: "Entertainment Hub"
```css
.brand-subtitle {
  font-size: 0.75rem; /* text-xs */
  color: rgb(45, 212, 191); /* text-teal-400 */
  font-weight: 500; /* font-medium */
  letter-spacing: 0.1em; /* tracking-widest */
  text-transform: uppercase;
  opacity: 0.75;
}
```

#### Tagline: "What To Binge Next!"
```css
.brand-tagline {
  font-size: 1.25rem; /* text-xl */
  color: white;
}

.brand-tagline .highlight {
  background: linear-gradient(to right, rgb(45, 212, 191), rgb(34, 211, 238)); /* from-teal-400 to-cyan-400 */
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  font-weight: 700; /* font-bold */
}
```

## Color Palette

### Primary Colors
- **Teal**: `rgb(45, 212, 191)` - `#2DD4BF` - `text-teal-400`
- **Cyan**: `rgb(34, 211, 238)` - `#22D3EE` - `text-cyan-400`
- **Blue**: `rgb(59, 130, 246)` - `#3B82F6` - `text-blue-400`

### Secondary Colors
- **White**: `rgb(255, 255, 255)` - `#FFFFFF` - Primary text
- **Gray-400**: `rgb(156, 163, 175)` - `#9CA3AF` - Secondary text
- **Gray-500**: `rgb(107, 114, 128)` - `#6B7280` - Tertiary text

### Background Colors
- **Black**: `rgb(0, 0, 0)` - `#000000` - Primary background
- **Gray-900**: `rgb(17, 24, 39)` - `#111827` - Card backgrounds
- **Slate-700**: `rgb(51, 65, 85)` - `#334155` - Frame elements
- **Slate-600**: `rgb(71, 85, 105)` - `#475569` - Border elements

### Gradient Definitions
```css
/* Primary Brand Gradient */
.gradient-brand {
  background: linear-gradient(to right, rgb(45, 212, 191), rgb(34, 211, 238), rgb(59, 130, 246));
}

/* TV Screen Gradient */
.gradient-screen {
  background: linear-gradient(to bottom right, rgb(20, 184, 166), rgb(6, 182, 212), rgb(59, 130, 246));
}

/* Frame Gradient */
.gradient-frame {
  background: linear-gradient(to bottom right, rgb(51, 65, 85), rgb(15, 23, 42));
}
```

## Component Standards

### Glass Effect
```css
.glass-effect {
  background: rgba(17, 24, 39, 0.5); /* bg-gray-900/50 */
  border: 1px solid rgba(55, 65, 81, 1); /* border-gray-700 */
  backdrop-filter: blur(4px); /* backdrop-blur-sm */
}
```

### Button Styles
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(to right, rgb(13, 148, 136), rgb(6, 182, 212)); /* from-teal-600 to-cyan-600 */
  color: white;
  padding: 0.5rem; /* py-2 */
  font-size: 0.875rem; /* text-sm */
}

.btn-primary:hover {
  background: linear-gradient(to right, rgb(15, 118, 110), rgb(8, 145, 178)); /* hover:from-teal-700 hover:to-cyan-700 */
}

/* Outline Button */
.btn-outline {
  background: rgba(17, 24, 39, 0.5); /* glass-effect */
  border: 1px solid rgba(107, 114, 128, 0.3); /* border-gray-500/30 */
  color: white;
}

.btn-outline:hover {
  background: rgba(107, 114, 128, 0.1); /* hover:bg-gray-500/10 */
}
```

## Layout Standards

### Header Navigation
- Height: `64px` (`h-16`)
- Background: `bg-black` with `backdrop-blur-md`
- Border: `border-b border-slate-800/50`
- Logo positioning: Left-aligned with `space-x-3` gap
- Actions: Right-aligned search, notifications, profile

### Page Containers
- Max width: `max-w-7xl mx-auto`
- Padding: `px-4 sm:px-6 lg:px-8`
- Background: `bg-black` (full viewport)

### Card Components
- Background: `bg-gray-900/50` (glass effect)
- Border: `border-gray-700`
- Border radius: `rounded-lg` or `rounded-xl`
- Backdrop blur: `backdrop-blur-sm`

## Page Headers

### Standard Page Header Pattern
```tsx
{/* Page Header */}
<div className="flex items-center space-x-3 mb-6">
  <div className="relative">
    {/* TV Logo Component */}
    <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
      <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
        <div className="text-sm font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}>B</div>
      </div>
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
    </div>
  </div>
  <div className="block">
    <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black text-xl sm:text-2xl">
      BingeBoard
    </span>
    <div className="text-xs text-teal-400 font-medium tracking-widest uppercase opacity-75">
      Entertainment Hub
    </div>
  </div>
</div>
```

## Login Page Design Standards

### CRITICAL: Login Page Header Requirements
The login page MUST use the identical BingeBoard logo and typography as the main application header. This is the official locked design:

```tsx
{/* BingeBoard Logo - EXACT DESIGN REQUIRED */}
<div className="flex items-center justify-center mb-6">
  <div className="flex items-center space-x-3">
    <div className="relative">
      {/* TV Frame */}
      <div className="w-12 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
        {/* TV Screen */}
        <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
          <div className="text-sm font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}>B</div>
        </div>
        {/* TV Base */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
      </div>
    </div>
    
    {/* Brand Name */}
    <div className="block">
      <span className="text-xl sm:text-2xl select-none">
        <span className="font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Binge
        </span>
        <span className="font-light text-white ml-1">Board</span>
      </span>
      <div className="text-xs text-teal-400 font-medium tracking-widest uppercase opacity-75 hidden sm:block">
        Entertainment Hub
      </div>
    </div>
  </div>
</div>
```

### Login Page Design Rules
1. **NEVER modify the TV logo design** - Must use exact slate gradient frame with teal screen
2. **NEVER change typography** - "Binge" must be font-black with teal gradient, "Board" must be font-light white
3. **NEVER remove Entertainment Hub subtitle** - Must appear on desktop (hidden on mobile)
4. **NEVER use simplified or alternative logos** - Only the authentic TV design is permitted
5. **NEVER change spacing or layout** - Logo and text must use horizontal flex layout with space-x-3

## Section Headers with "Binge" Branding

### Discover Page
```tsx
<h1 className="text-3xl font-bold text-white mb-6">
  Discover What to <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Binge</span>
</h1>
```

### Lists Page
```tsx
<h1 className="text-3xl font-bold text-white mb-6">
  Organize Your <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Binge</span> Lists
</h1>
```

### Social Page
```tsx
<h1 className="text-3xl font-bold text-white mb-6">
  <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Binge</span> with Friends
</h1>
```

## Implementation Rules

### DO's
1. **Always use the exact TV logo structure** with slate frame, teal/cyan/blue screen, and "B" letter
2. **Use consistent font weights**: `font-black` for brand name, `font-bold` for highlights
3. **Apply gradient to "B" letters** in "BingeBoard" and "Binge" keywords
4. **Maintain glass effect** on cards and modals
5. **Use proper spacing**: `space-x-3` for logo elements, `mb-6` for section breaks

### DON'Ts
1. **Never modify the TV logo structure** - it must remain exactly as specified
2. **Don't use different gradients** - stick to teal-cyan-blue combinations
3. **Avoid inconsistent font sizes** - use `text-xl sm:text-2xl` for brand name
4. **Don't change the "Entertainment Hub" subtitle** styling or positioning
5. **Never use green colors** in the logo or primary branding

## Usage Examples

### Login Page Header
```tsx
<div className="flex items-center justify-center space-x-3 mb-6">
  {/* Exact TV Logo */}
  <div className="relative">
    <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
      <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
        <div className="text-sm font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}>B</div>
      </div>
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
    </div>
  </div>
  <div className="block">
    <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black text-xl sm:text-2xl">
      BingeBoard
    </span>
    <div className="text-xs text-teal-400 font-medium tracking-widest uppercase opacity-75">
      Entertainment Hub
    </div>
  </div>
</div>
```

This brand guide ensures consistency across all components and prevents future design inconsistencies.