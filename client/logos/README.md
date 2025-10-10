# Streaming Network Logos

This folder contains SVG logos for streaming networks and TV channels.

## Current Files
- ✅ `Paramount.svg` - Paramount logo
- ✅ `appletv.svg` - Apple TV+ logo (mapped from 'apple' ID)
- ✅ `crunchyroll.svg` - Crunchyroll logo
- ✅ `espn.svg` - ESPN logo
- ✅ `max.svg` - HBO Max logo (mapped from 'hbo' ID)
- ✅ `paramountplus.svg` - Paramount+ logo (mapped from 'paramount' ID)
- ✅ `peacock.svg` - Peacock logo
- ✅ `primevideo.svg` - Prime Video logo (mapped from 'prime' ID)
- ✅ `starz.svg` - Starz logo

## Missing Files (needed for full functionality)
- `netflix.svg` - Netflix logo
- `disney.svg` - Disney+ logo
- `hulu.svg` - Hulu logo
- `showtime.svg` - Showtime logo
- `abc.svg` - ABC logo
- `cbs.svg` - CBS logo
- `nbc.svg` - NBC logo
- `fox.svg` - FOX logo
- `cw.svg` - The CW logo

## File Naming Convention

Files should be named using either:
1. The network ID from `streaming-networks.ts` (e.g., `netflix.svg`)
2. The mapped name from `LOGO_FILE_MAPPING` in `StreamingLogos.tsx`

## Logo Requirements

- **Format**: SVG (recommended) or PNG
- **Size**: Optimized for small display (24x24 to 48x48 pixels)
- **Background**: Transparent
- **Colors**: Use official brand colors when possible
- **Quality**: High resolution, clean vectors

## Fallback Behavior

If an SVG logo is not found, the component will display an emoji fallback defined in `streaming-networks.ts`.

## Usage

The `StreamingLogos` component automatically looks for logos in this directory and displays them with proper fallback handling.