// Test imports to verify exports
import SimpleGitHubUserDataService, { UserData, WatchlistItem } from './simple-github-data';

console.log('Testing imports:');
console.log('- SimpleGitHubUserDataService:', typeof SimpleGitHubUserDataService);
console.log('- UserData interface available');
console.log('- WatchlistItem interface available');

// Test interface usage
const testUserData: UserData = {
  userId: 'test',
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  preferences: {
    favoriteGenres: [],
    watchingGoals: '',
    experience: '',
    notifications: true,
    privacy: 'private'
  },
  watchlists: {
    watching: [],
    completed: [],
    planToWatch: [],
    dropped: []
  },
  stats: {
    showsWatched: 0,
    moviesWatched: 0,
    totalHours: 0,
    favoriteGenres: []
  },
  social: {
    friends: [],
    following: [],
    followers: []
  }
};

console.log('✅ All imports working correctly');
export { testUserData };
