#!/usr/bin/env node

// Direct test of AI service
import 'dotenv/config';
import { AIRecommendationService } from './server/services/aiRecommendations.ts';

const mockProfile = {
  favoriteGenres: ['Drama', 'Sci-Fi'],
  preferredNetworks: ['netflix', 'hulu'],
  watchingHabits: ['binges', 'evening viewer'],
  contentRating: 'TV-14',
  languagePreferences: ['English'],
  viewingHistory: [],
  watchlist: [],
  currentlyWatching: [],
  recentlyWatched: []
};

const mockShows = [
  { id: 1399, name: 'Game of Thrones', vote_average: 8.4, genre_ids: [18, 10765] },
  { id: 82856, name: 'The Mandalorian', vote_average: 8.5, genre_ids: [10765, 10759] },
  { id: 66732, name: 'Stranger Things', vote_average: 8.6, genre_ids: [18, 9648, 10765] }
];

console.log('🧪 Testing AI recommendations directly...');
console.log('Environment check:');
console.log('- OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
console.log('- OPENAI_MODEL:', process.env.OPENAI_MODEL || 'gpt-4o (default)');

try {
  const result = await AIRecommendationService.generatePersonalizedRecommendations({
    userProfile: mockProfile,
    availableShows: mockShows,
    excludeShows: [],
    mood: 'thought-provoking'
  });
  
  console.log('✅ Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('❌ Error:', error);
}
