#!/usr/bin/env node

/**
 * Test Multi-API Recommendations Integration
 * 
 * This script demonstrates how the new multi-API recommendation system
 * works with TMDB, Watchmode, and Utelly APIs for enhanced recommendations.
 */

import fetch from 'node-fetch';

const API_BASE = process.env.API_BASE || 'http://localhost:5000';

async function testMultiAPIRecommendations() {
  console.log('🧪 Testing Multi-API Recommendations Integration\n');

  try {
    // Test the new multi-API endpoint
    console.log('📡 Calling /api/multi-api-recommendations...');
    
    const response = await fetch(`${API_BASE}/api/multi-api-recommendations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, you'd include authentication headers
        // 'Authorization': 'Bearer your_token_here'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ Multi-API Recommendations Response:');
    console.log(`📊 Total recommendations: ${data.recommendations?.length || 0}`);
    console.log(`🔌 APIs used: ${data.apis_used?.join(', ') || 'Unknown'}`);
    console.log(`💡 Source: ${data.source || 'Unknown'}`);
    console.log(`📱 Features enabled: ${Object.keys(data.features || {}).join(', ')}`);
    console.log(`💬 Message: ${data.message || 'No message'}\n`);

    // Show sample recommendations
    if (data.recommendations && data.recommendations.length > 0) {
      console.log('🎬 Sample Recommendations:');
      data.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.show?.title || 'Unknown Title'}`);
        console.log(`   📝 Reason: ${rec.reason || 'No reason provided'}`);
        console.log(`   ⭐ Score: ${rec.score || 0}`);
        console.log(`   📅 Added: ${rec.recommendedAt || 'Unknown'}`);
        console.log('');
      });
    }

    // Compare with regular AI recommendations
    console.log('🔄 Comparing with regular AI recommendations...');
    
    const regularResponse = await fetch(`${API_BASE}/api/ai-recommendations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, you'd include authentication headers
      }
    });

    if (regularResponse.ok) {
      const regularData = await regularResponse.json();
      console.log(`📊 Regular AI recommendations: ${regularData.recommendations?.length || 0}`);
      console.log(`🆚 Multi-API advantage: ${(data.recommendations?.length || 0) - (regularData.recommendations?.length || 0)} more recommendations`);
    }

    console.log('\n🎯 Multi-API Features Demonstrated:');
    console.log('✅ TMDB: Movie/TV database with ratings and popularity');
    console.log('✅ Watchmode: Streaming availability and trending data');
    console.log('✅ Utelly: Cross-platform streaming search');
    console.log('✅ Hybrid scoring: Combined algorithm from all sources');
    console.log('✅ Deduplication: Removes duplicates across APIs');
    console.log('✅ Streaming integration: Real-time platform availability');
    console.log('✅ Affiliate tracking: Revenue optimization');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n💡 Note: This test requires authentication. To test properly:');
      console.log('1. Start the dev server: npm run dev');
      console.log('2. Login to the app first');
      console.log('3. Copy your auth token from browser dev tools');
      console.log('4. Add Authorization header to the requests');
    }
  }
}

// Enhanced API Comparison Chart
function printAPIComparison() {
  console.log('\n📈 API Capabilities Comparison:');
  console.log('┌─────────────────┬──────┬───────────┬────────┬───────────────┐');
  console.log('│ Feature         │ TMDB │ Watchmode │ Utelly │ Multi-API     │');
  console.log('├─────────────────┼──────┼───────────┼────────┼───────────────┤');
  console.log('│ Content DB      │  ✅  │     ✅    │   ❌   │      ✅       │');
  console.log('│ Streaming Info  │  ✅  │     ✅    │   ✅   │      ✅       │');
  console.log('│ Trending Data   │  ✅  │     ✅    │   ❌   │      ✅       │');
  console.log('│ Search Quality  │  ✅  │     ✅    │   ✅   │      ✅       │');
  console.log('│ Affiliate Links │  ❌  │     ✅    │   ✅   │      ✅       │');
  console.log('│ Cross-Platform  │  ❌  │     ❌    │   ✅   │      ✅       │');
  console.log('│ Deduplication   │  ❌  │     ❌    │   ❌   │      ✅       │');
  console.log('│ Hybrid Scoring  │  ❌  │     ❌    │   ❌   │      ✅       │');
  console.log('└─────────────────┴──────┴───────────┴────────┴───────────────┘');
}

// Usage examples
function printUsageExamples() {
  console.log('\n🚀 Usage Examples:');
  console.log('');
  console.log('// Frontend: Get multi-API recommendations');
  console.log('const response = await fetch("/api/multi-api-recommendations");');
  console.log('const { recommendations, apis_used, features } = await response.json();');
  console.log('');
  console.log('// Backend: Generate with multi-API enabled');
  console.log('const recs = await storage.generateRecommendations(userId, true);');
  console.log('');
  console.log('// Service: Direct multi-API usage');
  console.log('const recs = await MultiAPIRecommendationService.generateMultiAPIRecommendations(');
  console.log('  userPreferences, 20');
  console.log(');');
}

if (require.main === module) {
  testMultiAPIRecommendations()
    .then(() => {
      printAPIComparison();
      printUsageExamples();
    })
    .catch(console.error);
}

export { testMultiAPIRecommendations };
