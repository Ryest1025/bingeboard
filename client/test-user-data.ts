// Example test for GitHub user data service
import SimpleGitHubUserDataService, { UserData } from '../src/lib/simple-github-data';

// This is a demonstration of how the GitHub user data service would work
// In production, you'd get a real GitHub personal access token

console.log('🧪 BingeBoard GitHub User Data Service Test');

// Example user data
const sampleUserData: UserData = {
  userId: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  preferences: {
    favoriteGenres: ['Action', 'Sci-Fi', 'Comedy'],
    watchingGoals: 'Watch 50 movies this year',
    experience: 'intermediate',
    notifications: true,
    privacy: 'private'
  },
  watchlists: {
    watching: [
      {
        id: 'movie-1',
        title: 'The Matrix',
        type: 'movie',
        poster: 'https://example.com/matrix.jpg',
        dateAdded: new Date().toISOString(),
        rating: 5,
        notes: 'Mind-blowing!'
      }
    ],
    completed: [],
    planToWatch: [
      {
        id: 'tv-1',
        title: 'Stranger Things',
        type: 'tv',
        dateAdded: new Date().toISOString()
      }
    ],
    dropped: []
  },
  stats: {
    showsWatched: 15,
    moviesWatched: 23,
    totalHours: 156,
    favoriteGenres: ['Action', 'Sci-Fi']
  },
  social: {
    friends: [],
    following: [],
    followers: []
  }
};

console.log('📊 Sample User Data:');
console.log('- Favorite Genres:', sampleUserData.preferences.favoriteGenres);
console.log('- Watching Goals:', sampleUserData.preferences.watchingGoals);
console.log('- Shows Watched:', sampleUserData.stats.showsWatched);
console.log('- Movies Watched:', sampleUserData.stats.moviesWatched);
console.log('- Total Hours:', sampleUserData.stats.totalHours);
console.log('- Watchlist Items:', Object.values(sampleUserData.watchlists).flat().length);

console.log('\n✅ User data service is ready!');
console.log('🔑 To use GitHub storage, provide a GitHub personal access token');
console.log('📝 For now, data is stored in localStorage as fallback');

export { sampleUserData };
