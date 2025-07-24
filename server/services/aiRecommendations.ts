import OpenAI from "openai";

// Initialize OpenAI - will be available through environment variables
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

interface UserProfile {
  favoriteGenres: string[];
  preferredNetworks: string[];
  watchingHabits: string[];
  contentRating: string;
  languagePreferences: string[];
  viewingHistory: any[]; // Shows from uploaded CSV/JSON files
  watchlist: any[]; // Current shows user is tracking
  currentlyWatching: any[]; // Shows with "watching" status
  recentlyWatched: any[]; // Recently completed shows
}

interface AIRecommendationRequest {
  userProfile: UserProfile;
  availableShows: any[];
  excludeShows: number[];
  mood?: string; // Current user mood filter
}

interface AIRecommendationResponse {
  recommendations: {
    tmdbId: number;
    reason: string;
    score: number;
    matchFactors: string[];
  }[];
  confidence: number;
}

export class AIRecommendationService {
  
  static async generatePersonalizedRecommendations(
    request: AIRecommendationRequest
  ): Promise<AIRecommendationResponse> {
    
    if (!openai) {
      console.log('OpenAI not configured, using fallback recommendation logic');
      return this.getFallbackRecommendations(request);
    }

    try {
      const prompt = this.buildRecommendationPrompt(request);
      
      console.log('Sending AI recommendation request...');
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert TV show recommendation engine that provides highly personalized suggestions based on user preferences, viewing history, and behavioral patterns. 

Your goal is to recommend shows that users will genuinely enjoy by analyzing their taste profile comprehensively. Consider genre preferences, streaming platform availability, content rating requirements, and viewing habits.

Always respond with valid JSON in this exact format:
{
  "recommendations": [
    {
      "tmdbId": 123456,
      "reason": "Specific reason why this matches user preferences",
      "score": 0.95,
      "matchFactors": ["genre match", "network preference", "similar viewing history"]
    }
  ],
  "confidence": 0.88
}`
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      console.log(`AI generated ${result.recommendations?.length || 0} recommendations with confidence ${result.confidence}`);
      
      return result;
      
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return this.getFallbackRecommendations(request);
    }
  }

  private static buildRecommendationPrompt(request: AIRecommendationRequest): string {
    const { userProfile, availableShows, excludeShows } = request;
    
    const userSummary = `
USER PROFILE:
- Favorite Genres: ${userProfile.favoriteGenres.join(', ') || 'None specified'}
- Preferred Streaming Networks: ${userProfile.preferredNetworks.join(', ') || 'None specified'}  
- Watching Habits: ${userProfile.watchingHabits.join(', ') || 'None specified'}
- Content Rating Preference: ${userProfile.contentRating}
- Language Preferences: ${userProfile.languagePreferences.join(', ')}
- Shows in Watchlist: ${userProfile.watchlist.length}
- Viewing History Items: ${userProfile.viewingHistory.length}

VIEWING HISTORY & CURRENT SHOWS:
Currently Watching: ${userProfile.currentlyWatching?.length || 0} shows
${userProfile.currentlyWatching?.slice(0, 5).map(show => 
  `- WATCHING: ${show.title} (${show.genres?.join(', ') || 'genres unknown'})`
).join('\n') || 'No current shows'}

Recently Completed: ${userProfile.recentlyWatched?.length || 0} shows  
${userProfile.recentlyWatched?.slice(0, 5).map(show => 
  `- COMPLETED: ${show.title} (Rating: ${show.rating || 'unrated'})`
).join('\n') || 'No recently completed shows'}

Uploaded Viewing History: ${userProfile.viewingHistory?.length || 0} items
${userProfile.viewingHistory?.slice(0, 5).map(item => 
  `- HISTORY: ${item.showTitle || item.title || 'Unknown Show'} (watched ${item.watchedAt || item.dateWatched || 'recently'})`
).join('\n') || 'No uploaded viewing history'}

SHOWS TO EXCLUDE (already watched/in watchlist):
${excludeShows.join(', ')}
`;

    const availableShowsSummary = `
AVAILABLE SHOWS FOR RECOMMENDATION (select from these TMDB IDs):
${availableShows.slice(0, 50).map(show => 
  `- TMDB ID: ${show.id}, Title: "${show.name || show.title}", Genres: [${show.genre_ids?.join(', ') || 'Unknown'}], Rating: ${show.vote_average || 'N/A'}`
).join('\n')}
`;

    return `${userSummary}

${availableShowsSummary}

TASK: Analyze the user's preferences and recommend 5-8 shows from the available list that best match their taste profile. 

REQUIREMENTS:
1. Only recommend shows using TMDB IDs from the available shows list above
2. **PRIORITY 1**: Find shows similar to what they're currently watching
3. **PRIORITY 2**: Avoid shows from their viewing history (already watched)
4. **PRIORITY 3**: Match genres/patterns from their completed shows 
5. Consider their preferred streaming networks and content rating
6. Factor in viewing habits and completion patterns
7. Score each recommendation 0.0-1.0 based on similarity to viewing patterns
8. Provide specific reasoning mentioning current shows and viewing history
9. Include overall confidence score for the recommendation set

**CRITICAL**: Weight current shows and viewing history MUCH higher than general preferences. If they're watching crime dramas, recommend similar crime dramas regardless of stated genre preferences.`;
  }

  private static getFallbackRecommendations(request: AIRecommendationRequest): AIRecommendationResponse {
    console.log('Using fallback recommendation algorithm');
    
    const { userProfile, availableShows, excludeShows } = request;
    const recommendations = [];
    
    // Simple scoring algorithm as fallback
    for (const show of availableShows.slice(0, 20)) {
      if (excludeShows.includes(show.id)) continue;
      
      let score = show.vote_average ? (show.vote_average / 10) : 0.5;
      let matchFactors = [];
      let reason = 'Popular show that matches your interests';
      
      // Boost score for genre matches
      if (show.genre_ids && userProfile.favoriteGenres.length > 0) {
        const genreMapping: Record<number, string> = {
          10759: 'Action', 35: 'Comedy', 18: 'Drama',
          80: 'Crime', 99: 'Documentary', 10751: 'Family',
          9648: 'Mystery', 10749: 'Romance', 10765: 'Sci-Fi'
        };
        
        const showGenres = show.genre_ids.map((id: number) => genreMapping[id]).filter(Boolean);
        const genreMatches = showGenres.filter((genre: string) => 
          userProfile.favoriteGenres.includes(genre)
        );
        
        if (genreMatches.length > 0) {
          score += 0.2;
          matchFactors.push('genre match');
          reason = `Great ${genreMatches[0].toLowerCase()} show that matches your taste`;
        }
      }
      
      recommendations.push({
        tmdbId: show.id,
        reason,
        score: Math.min(1.0, score),
        matchFactors
      });
      
      if (recommendations.length >= 6) break;
    }
    
    return {
      recommendations: recommendations.sort((a, b) => b.score - a.score),
      confidence: 0.6
    };
  }
}