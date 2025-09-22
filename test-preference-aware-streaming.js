#!/usr/bin/env node

/**
 * Test script for the new preference-aware streaming service
 */

import { MultiAPIStreamingService } from './server/services/MultiAPIStreamingService.js';

// Test data
const testTitles = [
  { tmdbId: 205715, title: "Gen V", mediaType: 'tv' },
  { tmdbId: 249039, title: "Black Rabbit", mediaType: 'tv' },
  { tmdbId: 240411, title: "Dune: Prophecy", mediaType: 'tv' }
];

// Different user preference scenarios
const userPreferences = [
  {
    name: "Netflix Only User",
    prefs: {
      preferredPlatforms: ['Netflix'],
      subscriptionTypes: ['sub']
    }
  },
  {
    name: "Budget User (Free only)",
    prefs: {
      subscriptionTypes: ['free'],
      excludedPlatforms: ['Netflix', 'Disney+', 'Max']
    }
  },
  {
    name: "Affiliate Revenue Maximizer",
    prefs: {
      onlyAffiliateSupported: true,
      preferredPlatforms: ['Netflix', 'Amazon Prime Video', 'Hulu', 'Disney+']
    }
  },
  {
    name: "No Preferences (Control)",
    prefs: undefined
  }
];

async function testPreferenceAwareStreaming() {
  console.log('🚀 Testing Preference-Aware Streaming Service\n');

  for (const { name, prefs } of userPreferences) {
    console.log(`\n📊 Testing: ${name}`);
    console.log('Preferences:', JSON.stringify(prefs, null, 2));
    console.log('─'.repeat(50));

    try {
      // Test single availability
      const singleResult = await MultiAPIStreamingService.getPreferenceAwareAvailability(
        testTitles[0].tmdbId,
        testTitles[0].title,
        testTitles[0].mediaType,
        prefs
      );

      console.log(`\n🎬 Single Test: ${testTitles[0].title}`);
      console.log(`Total Platforms: ${singleResult.totalPlatforms}`);
      console.log(`Affiliate Platforms: ${singleResult.affiliatePlatforms}`);
      console.log(`Premium Platforms: ${singleResult.premiumPlatforms}`);
      console.log(`Free Platforms: ${singleResult.freePlatforms}`);
      
      if (singleResult.platforms.length > 0) {
        console.log('Available Platforms:');
        singleResult.platforms.forEach(p => {
          console.log(`  - ${p.provider_name} (${p.type}) [${p.source}] ${p.affiliate_supported ? '💰' : ''}`);
        });
      } else {
        console.log('  No platforms match preferences');
      }

      // Test batch availability
      console.log(`\n🔄 Batch Test: ${testTitles.length} titles`);
      const batchResults = await MultiAPIStreamingService.getBatchAvailabilityWithPreferences(
        testTitles,
        prefs
      );

      let totalMatches = 0;
      let totalAffiliate = 0;
      
      batchResults.forEach((result, tmdbId) => {
        const title = testTitles.find(t => t.tmdbId === tmdbId)?.title || 'Unknown';
        totalMatches += result.totalPlatforms;
        totalAffiliate += result.affiliatePlatforms;
        console.log(`  ${title}: ${result.totalPlatforms} platforms (${result.affiliatePlatforms} affiliate)`);
      });

      console.log(`\n📈 Batch Summary:`);
      console.log(`  Total Platform Matches: ${totalMatches}`);
      console.log(`  Total Affiliate Opportunities: ${totalAffiliate}`);
      console.log(`  Coverage: ${batchResults.size}/${testTitles.length} titles`);

    } catch (error) {
      console.error(`❌ Error testing ${name}:`, error.message);
    }

    console.log('\n' + '='.repeat(60));
  }

  // Test cache performance
  console.log('\n🚀 Cache Performance Test');
  const startTime = Date.now();
  
  // First call (should hit APIs)
  await MultiAPIStreamingService.getPreferenceAwareAvailability(
    testTitles[0].tmdbId,
    testTitles[0].title,
    testTitles[0].mediaType,
    userPreferences[0].prefs
  );
  const firstCallTime = Date.now() - startTime;

  // Second call (should hit cache)
  const cacheStartTime = Date.now();
  await MultiAPIStreamingService.getPreferenceAwareAvailability(
    testTitles[0].tmdbId,
    testTitles[0].title,
    testTitles[0].mediaType,
    userPreferences[0].prefs
  );
  const cacheCallTime = Date.now() - cacheStartTime;

  console.log(`First call (API): ${firstCallTime}ms`);
  console.log(`Second call (Cache): ${cacheCallTime}ms`);
  console.log(`Cache speedup: ${Math.round(firstCallTime / cacheCallTime)}x faster`);

  // Display cache stats
  const cacheStats = MultiAPIStreamingService.getCacheStats();
  console.log('\n📊 Cache Statistics:', cacheStats);
}

// Run the test
testPreferenceAwareStreaming()
  .then(() => {
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });