# 🎨 Official Streaming Platform Logos

## 📋 Logo Replacement Guide

To replace the current placeholder logos with official brand assets, download the logos from each service's official brand assets page and place them in `/client/public/logos/` with the exact filenames listed below.

## 🔗 Official Brand Asset Sources

| Service | Brand Assets Page | Filename Required | Notes |
|---------|-------------------|-------------------|-------|
| **Netflix** | [Netflix Brand Assets](https://brand.netflix.com/) | `netflix-official.svg` | Use full-color logo |
| **Prime Video** | [Amazon Brand Hub](https://advertising.amazon.com/resources/ad-policy/brand-guidelines) | `prime-video-official.svg` | Use "Prime Video" wordmark |
| **Hulu** | [Hulu Media Assets](https://press.hulu.com/media-assets) | `hulu-official.svg` | Use standard green logo |
| **Disney+** | [Disney+ Brand Assets](https://press.disneyplus.com/media-assets) | `disney-plus-official.svg` | Use official Disney+ logo |
| **Max** | [WBD Brand Assets](https://www.warnerbros.com/company/brand-assets) | `max-official.svg` | Use "Max" rebrand logo |
| **Apple TV+** | [Apple Brand Guidelines](https://developer.apple.com/app-store/marketing/guidelines/) | `apple-tv-plus-official.svg` | Use Apple TV+ wordmark |
| **Peacock** | [NBCUniversal Brand](https://www.nbcuniversal.com/press/brand-assets) | `peacock-official.svg` | Use Peacock TV logo |
| **Paramount+** | [Paramount Brand](https://press.paramount.com/brand-assets) | `paramount-plus-official.svg` | Use Paramount+ logo |
| **Crunchyroll** | [Crunchyroll Press Kit](https://help.crunchyroll.com/hc/en-us/articles/360033885811-Press-Resources) | `crunchyroll-official.svg` | Use orange logo |
| **ESPN+** | [ESPN Media Kit](https://espnpressroom.com/us/media-kits/) | `espn-plus-official.svg` | Use ESPN+ specific logo |
| **Discovery+** | [WBD Brand Assets](https://www.warnerbros.com/company/brand-assets) | `discovery-plus-official.svg` | Use Discovery+ logo |
| **Plex** | [Plex Press Kit](https://www.plex.tv/press/) | `plex-official.svg` | Use standard Plex logo |
| **Tubi** | [Tubi Press](https://corp.tubitv.com/press/) | `tubi-official.svg` | Use official Tubi logo |
| **Funimation** | [Funimation Press](https://www.funimation.com/press/) | `funimation-official.svg` | Use purple Funimation logo |
| **BBC iPlayer** | [BBC Branding](https://www.bbc.co.uk/branding/) | `bbc-iplayer-official.svg` | Use BBC iPlayer logo |
| **ITVX** | [ITV Press Packs](https://www.itv.com/presscentre/press-packs) | `itvx-official.svg` | Use ITVX rebrand logo |

## 📁 File Structure

```
/client/public/logos/
├── netflix-official.svg
├── prime-video-official.svg
├── hulu-official.svg
├── disney-plus-official.svg
├── max-official.svg
├── apple-tv-plus-official.svg
├── peacock-official.svg
├── paramount-plus-official.svg
├── crunchyroll-official.svg
├── espn-plus-official.svg
├── discovery-plus-official.svg
├── plex-official.svg
├── tubi-official.svg
├── funimation-official.svg
├── bbc-iplayer-official.svg
├── itvx-official.svg
└── fallback.svg (keep this)
```

## 🎯 Logo Requirements

- **Format**: SVG preferred (scalable and crisp)
- **Size**: Any size (will be auto-scaled to fit containers)
- **Colors**: Full-color versions preferred
- **Background**: Transparent background
- **Rights**: Only use official logos with proper licensing

## 🚀 Implementation Status

✅ **Code Updated**: Both landing page and mobile hub now reference official logos
✅ **Fallback System**: Will show fallback icon if official logo missing
⏳ **Logos Needed**: Replace placeholder logos with official assets

## 🔧 Current Implementation

The system automatically uses official logos when available and falls back to a generic icon if not found. Simply replace the placeholder files with official assets using the exact filenames above.

---

💡 **Pro Tip**: Download SVG versions when available for best quality and performance. Always respect brand guidelines and licensing terms when using official logos.
