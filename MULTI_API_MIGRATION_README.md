# 🚀 BingeBoard Multi-API Migration System

## Overview

This comprehensive migration system transforms BingeBoard from using TMDB-only APIs to a **Multi-API streaming system** that combines:

- **TMDB** (The Movie Database) - Show metadata and basic info
- **Watchmode** - Primary streaming availability data  
- **Utelly** - Secondary streaming availability data

The migration provides enhanced streaming data, affiliate monetization, and superior user experience across the entire application.

## ✨ Key Features Added

### 🎬 Enhanced Streaming Data
- **Comprehensive Platform Coverage**: Data from 3 streaming APIs
- **Real-time Availability**: Up-to-date streaming platform information
- **Platform-specific Links**: Direct deep links to shows on each platform
- **Geographic Support**: Country-specific streaming availability

### 💰 Affiliate Monetization
- **Automatic Affiliate Links**: Generate tracked affiliate URLs for major platforms
- **Commission Tracking**: Track click-through rates and conversion metrics
- **Revenue Analytics**: Real-time monetization metrics and reporting
- **Platform Optimization**: Commission rate management and optimization

### ⚡ Performance Enhancements
- **Intelligent Caching**: 30-minute TTL cache for streaming data
- **Batch Processing**: Efficient bulk streaming availability lookups
- **Rate Limiting**: Respectful API usage to avoid hitting limits
- **Fallback System**: Graceful degradation if streaming APIs are unavailable

## 📁 Migration Components

### Core Migration Scripts

```bash
migrate-to-multi-api.js        # Main migration script
migrate-to-multi-api.sh        # Interactive migration interface  
migration-config.json          # Detailed migration configuration
migration-status-check.js      # Check migration status
migration-rollback.js          # Rollback utility
```

### Generated Files

```bash
MIGRATION_REPORT.md           # Detailed migration report
migration-report.json         # Machine-readable migration data
migration-backup-{timestamp}/ # Backup of original files
```

## 🚀 Quick Start

### Option 1: Interactive Migration (Recommended)

```bash
# Make the script executable (if not already done)
chmod +x migrate-to-multi-api.sh

# Run the interactive migration interface
./migrate-to-multi-api.sh
```

Choose from these options:
- **1**: 🚀 Run Full Migration (Recommended)
- **2**: 🔍 Check Migration Status  
- **3**: 🔄 Rollback Previous Migration
- **4**: 📋 View Migration Config
- **5**: 🧪 Test Multi-API Endpoints
- **6**: ❌ Exit

### Option 2: Direct Migration

```bash
# Run the migration script directly
node migrate-to-multi-api.js
```

### Option 3: Check Status Only

```bash
# Check if migration has been completed
node migration-status-check.js
```

## 📊 What Gets Migrated

### Client-Side Updates

#### Search Components
- `client/src/components/search/BrandedSearchBar.tsx`
- `client/src/components/search/BrandedShowModal.tsx` 
- `client/src/lib/search-api.ts`

**Changes:**
- Replace `/api/tmdb/search` → `/api/streaming/enhanced-search`
- Add streaming platform badges to search results
- Display affiliate revenue potential
- Include comprehensive streaming availability

#### Dashboard & Discovery
- `client/src/pages/dashboard.tsx`
- `client/src/pages/modern-discover.tsx`
- All trending and discovery components

**Changes:**
- Replace `/api/tmdb/trending` → `/api/content/trending-enhanced`
- Replace `/api/tmdb/discover` → `/api/content/discover-enhanced`
- Add streaming availability indicators
- Include affiliate opportunity badges

#### Show Details
- All components using `/api/tmdb/{type}/{id}`

**Changes:**
- Replace with `/api/streaming/comprehensive/{type}/{id}`
- Display all available streaming platforms
- Generate affiliate links with tracking
- Show commission rates and revenue potential

### Server-Side Updates

#### New Enhanced Endpoints

```typescript
// Enhanced search with streaming data
GET /api/streaming/enhanced-search
  ?query={search_term}
  &type={tv|movie|multi}
  &includeStreaming={true|false}

// Comprehensive show data with streaming
GET /api/streaming/comprehensive/{type}/{id}
  ?title={show_title}
  &includeAffiliate={true|false}

// Enhanced trending with streaming info  
GET /api/content/trending-enhanced
  ?mediaType={tv|movie|all}
  &timeWindow={day|week}
  &includeStreaming={true|false}

// Enhanced discovery with platform filtering
GET /api/content/discover-enhanced
  ?genres={genre_ids}
  &platforms={platform_ids}
  &includeStreaming={true|false}

// Batch streaming availability processing
POST /api/streaming/batch-availability
  Body: { titles: [{ tmdbId, title, mediaType, imdbId }] }
```

#### Enhanced Features
- **Multi-API Integration**: Combines data from TMDB, Watchmode, and Utelly
- **Affiliate Link Generation**: Creates tracked URLs for major platforms
- **Caching System**: Reduces API calls and improves performance
- **Error Handling**: Graceful fallback to TMDB-only data if needed

## 🔧 Configuration

### Affiliate Commission Rates

The system includes pre-configured commission rates for major platforms:

```json
{
  "Netflix": 8.5,
  "Amazon Prime Video": 4.5,
  "Hulu": 6.0,
  "Disney+": 7.2,
  "HBO Max": 9.0,
  "Apple TV+": 5.0,
  "Paramount+": 5.5,
  "Peacock": 4.8
}
```

### Caching Configuration

```json
{
  "streaming_data": "30 minutes TTL",
  "show_metadata": "24 hours TTL", 
  "affiliate_links": "1 hour TTL",
  "batch_requests": "15 minutes TTL"
}
```

### Batch Processing Limits

```json
{
  "max_batch_size": 20,
  "rate_limiting": "500ms between batches",
  "parallel_requests": 5,
  "timeout_per_request": "10 seconds"
}
```

## 📈 Expected Benefits

### For Users
- **Better Streaming Discovery**: See all platforms where content is available
- **Direct Access**: Click through to watch content immediately  
- **Up-to-date Information**: Real-time streaming availability
- **Platform Comparison**: Compare options across multiple services

### For Revenue
- **Affiliate Income**: Earn commissions from streaming platform referrals
- **User Engagement**: Higher engagement with streaming availability data
- **Platform Partnerships**: Foundation for streaming service partnerships
- **Analytics Insights**: Detailed user behavior and platform preference data

### For Performance  
- **Faster Loading**: Intelligent caching reduces API response times
- **Better Reliability**: Fallback system ensures app always works
- **Scalable Architecture**: Batch processing handles high traffic
- **Optimized Requests**: Reduced API calls through smart data management

## 🧪 Testing the Migration

### Automated Status Check

```bash
# Run comprehensive status check
node migration-status-check.js
```

Expected output:
```
🔍 Checking Multi-API Migration Status...
  ✅ Multi-API Service Available
  ✅ Enhanced Endpoints Created  
  ✅ Client Files Updated
  ✅ Server Files Updated
  ✅ Streaming Cache Active

📊 Migration Status: ✅ COMPLETE
```

### Manual API Testing

```bash
# Test enhanced search
curl "http://localhost:5000/api/streaming/enhanced-search?query=Breaking+Bad&type=tv"

# Test comprehensive show data
curl "http://localhost:5000/api/streaming/comprehensive/tv/1396?title=Breaking%20Bad"

# Test trending with streaming data
curl "http://localhost:5000/api/content/trending-enhanced?mediaType=tv&includeStreaming=true"
```

### Application Testing Checklist

- [ ] Search returns results with streaming platform badges
- [ ] Show details modal displays all available platforms
- [ ] Affiliate links generate correctly with tracking parameters
- [ ] Dashboard shows streaming availability for trending content
- [ ] Discovery page allows filtering by streaming platforms
- [ ] Performance is acceptable (< 2s for most requests)
- [ ] Caching is working (subsequent requests are faster)
- [ ] Error handling works (graceful fallback to TMDB-only)

## 🔄 Rollback Instructions

### Automatic Rollback

```bash
# Use the interactive interface
./migrate-to-multi-api.sh
# Select option 3: Rollback Previous Migration

# Or run directly
node migration-rollback.js migration-backup-{timestamp}
```

### Manual Rollback

1. Stop the application server
2. Copy files from `migration-backup-{timestamp}/` back to their original locations
3. Restart the server
4. Verify functionality is restored

### Rollback Time

- **Estimated Time**: < 5 minutes
- **Data Loss Risk**: None (all data preserved in backup)
- **Service Downtime**: ~ 1-2 minutes during file restoration

## 📚 Additional Resources

### Documentation Files

- `MIGRATION_REPORT.md` - Detailed post-migration report
- `migration-config.json` - Complete migration configuration
- `migration-report.json` - Machine-readable migration data

### Multi-API Service Files

- `server/services/multiAPIStreamingService.ts` - Core Multi-API service
- `server/cache/streaming-cache.ts` - Streaming data cache system
- `server/clients/utellyClient.ts` - Utelly API client
- `server/services/watchmodeService.ts` - Watchmode API client

### Enhanced Components

- `client/src/hooks/useEnhancedSearch.ts` - React Query hook for enhanced search
- `client/src/components/search/BrandedShowModal.tsx` - Enhanced show modal
- All search and discovery components with streaming data integration

## 🆘 Troubleshooting

### Common Issues

**Migration Script Fails**
```bash
# Check Node.js version (requires 14+)
node --version

# Ensure MultiAPIStreamingService exists
ls server/services/multiAPIStreamingService.ts

# Check for syntax errors
node -c migrate-to-multi-api.js
```

**API Endpoints Not Working**
```bash
# Restart the server
npm run dev

# Check server logs for errors
# Verify all required environment variables are set
```

**Performance Issues**
```bash
# Check cache status
# Monitor API rate limits
# Review batch processing settings
```

**Streaming Data Missing**
```bash
# Verify API keys are configured:
# - WATCHMODE_API_KEY
# - UTELLY_API_KEY (RapidAPI)

# Check API service status
curl "http://localhost:5000/api/health"
```

### Support

If you encounter issues:

1. Check the migration report for errors: `MIGRATION_REPORT.md`
2. Run status check: `node migration-status-check.js`
3. Review server logs for API errors
4. Test individual API endpoints manually
5. Use rollback if needed: `./migrate-to-multi-api.sh` → Option 3

## 🎉 Success Criteria

The migration is successful when:

- ✅ All search results include streaming platform information
- ✅ Show details display comprehensive streaming availability  
- ✅ Affiliate links are generated with proper tracking
- ✅ Performance is acceptable (cached requests < 500ms)
- ✅ Revenue tracking and analytics are functional
- ✅ All existing functionality remains intact
- ✅ No critical errors in application logs

**Welcome to the enhanced BingeBoard Multi-API streaming experience! 🚀**
