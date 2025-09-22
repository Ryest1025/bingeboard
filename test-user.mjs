import { db } from './server/db.ts';
import { users, watchHistory } from './shared/schema/index.ts';
import { eq } from 'drizzle-orm';

const testUser = {
  id: 'demo-user-123',
  email: 'demo@bingeboard.local',
  displayName: 'Demo User',
  authProvider: 'email',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

try {
  console.log('🔄 Creating test user...');

  // Check if user exists
  const existing = await db.select().from(users).where(eq(users.id, testUser.id));

  if (existing.length === 0) {
    // Create test user
    await db.insert(users).values(testUser);
    console.log('✅ Created test user:', testUser.email);

    // Add some test watch history with progress
    const testWatchHistory = [
      {
        userId: testUser.id,
        contentType: 'movie',
        contentId: 456,
        progress: 0.25, // 25% watched
        completed: 0,
        watchedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        userId: testUser.id,
        contentType: 'tv',
        contentId: 789,
        progress: 0.8, // 80% watched
        completed: 0,
        watchedAt: Date.now() - 86400000, // Yesterday
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000
      }
    ];

    await db.insert(watchHistory).values(testWatchHistory);
    console.log('✅ Added test watch history with progress');

  } else {
    console.log('ℹ️ Test user already exists:', testUser.email);
  }

  // Show current users
  const allUsers = await db.select().from(users).limit(5);
  console.log('\n📊 Current users:', allUsers.map(u => u.email));

  // Show watch history for test user
  const history = await db.select().from(watchHistory).where(eq(watchHistory.userId, testUser.id));
  console.log('📺 Test user watch history entries:', history.length);
  
  if (history.length > 0) {
    console.log('📈 Progress details:');
    history.forEach(item => {
      console.log(`  - ${item.contentType} ${item.contentId}: ${Math.round(item.progress * 100)}% watched`);
    });
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
