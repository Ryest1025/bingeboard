import { DatabaseIntegrationService } from './server/services/databaseIntegration.ts';

async function testEnhancedDatabase() {
  console.log('🧪 Testing Enhanced Database Integration Service...');
  
  const db = new DatabaseIntegrationService();

  try {
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test health status
    const health = await db.getHealthStatus();
    console.log('✅ Database Health:', health);
    
    // Test user behavior recording with experiment data
    await db.recordUserBehavior({
      userId: 'manual_1752272712977_25fdy83s7', // Rachel's user ID that exists
      tmdbId: 550, // Fight Club
      action: 'viewed',
      timestamp: Math.floor(Date.now() / 1000),
      sessionDuration: 4200,
      rating: 9.2,
      contextualData: {
        timeOfDay: 'evening',
        dayOfWeek: 'Friday',
        device: 'desktop',
        location: 'US',
        experimentName: 'recommendation_algorithm_test',
        experimentVariant: 'enhanced_ml_v2'
      }
    });
    
    // Add a completion record for the same experiment
    await db.recordUserBehavior({
      userId: 'manual_1752272712977_25fdy83s7',
      tmdbId: 550,
      action: 'completed',
      timestamp: Math.floor(Date.now() / 1000),
      contextualData: {
        timeOfDay: 'evening',
        dayOfWeek: 'Friday', 
        device: 'desktop',
        location: 'US',
        experimentName: 'recommendation_algorithm_test',
        experimentVariant: 'enhanced_ml_v2'
      }
    });
    console.log('✅ User behavior recorded');
    
    // Test content metrics
    await db.updateContentMetrics(550, 'movie', 'Fight Club', ['Drama', 'Thriller']);
    const metrics = await db.getContentMetrics(550);
    console.log('✅ Content metrics:', metrics);
    
    // Test analytics
    const analytics = await db.getUserBehaviorAnalytics('manual_1752272712977_25fdy83s7');
    console.log('✅ User analytics:', analytics);
    
    // Test experiment results with improved implementation
    const experiments = await db.getExperimentResults('recommendation_algorithm_test', {
      start: Math.floor(Date.now() / 1000) - 3600,
      end: Math.floor(Date.now() / 1000)
    });
    console.log('✅ Improved experiment results:', experiments);
    
    console.log('🎉 All enhanced database features working!');
    
  } catch (error) {
    console.error('❌ Enhanced database test failed:', error);
  } finally {
    await db.close();
  }
}

testEnhancedDatabase();
