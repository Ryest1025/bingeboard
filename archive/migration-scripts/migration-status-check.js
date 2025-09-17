
// Migration Status Checker
// Usage: node migration-status-check.js

const fs = require('fs');
const path = require('path');

class MigrationStatusChecker {
  static checkMigrationStatus() {
    console.log('🔍 Checking Multi-API Migration Status...');
    
    const checks = {
      'Multi-API Service Available': this.checkMultiAPIService(),
      'Enhanced Endpoints Created': this.checkEnhancedEndpoints(),
      'Client Files Updated': this.checkClientFiles(),
      'Server Files Updated': this.checkServerFiles(),
      'Streaming Cache Active': this.checkStreamingCache()
    };

    let allPassed = true;
    
    for (const [check, passed] of Object.entries(checks)) {
      const status = passed ? '✅' : '❌';
      console.log(`  ${status} ${check}`);
      if (!passed) allPassed = false;
    }

    console.log('\n📊 Migration Status:', allPassed ? '✅ COMPLETE' : '⚠️ INCOMPLETE');
    return allPassed;
  }

  static checkMultiAPIService() {
    return fs.existsSync('server/services/multiAPIStreamingService.ts');
  }

  static checkEnhancedEndpoints() {
    const routesFile = 'server/routes.ts';
    if (!fs.existsSync(routesFile)) return false;
    
    const content = fs.readFileSync(routesFile, 'utf8');
    return content.includes('/api/streaming/enhanced-search') &&
           content.includes('/api/streaming/comprehensive');
  }

  static checkClientFiles() {
    const searchApiFile = 'client/src/lib/search-api.ts';
    if (!fs.existsSync(searchApiFile)) return false;
    
    const content = fs.readFileSync(searchApiFile, 'utf8');
    return content.includes('enhanced-search');
  }

  static checkServerFiles() {
    const routesFile = 'server/routes.ts';
    if (!fs.existsSync(routesFile)) return false;
    
    const content = fs.readFileSync(routesFile, 'utf8');
    return content.includes('MultiAPIStreamingService');
  }

  static checkStreamingCache() {
    return fs.existsSync('server/cache/streaming-cache.ts') ||
           fs.existsSync('server/cache/streaming-cache.js');
  }
}

if (require.main === module) {
  MigrationStatusChecker.checkMigrationStatus();
}

module.exports = MigrationStatusChecker;
