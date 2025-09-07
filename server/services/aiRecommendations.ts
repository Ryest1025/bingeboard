import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

interface UserProfile {
  favoriteGenres: string[];
  preferredNetworks: string[];
  watchingHabits: string[];
  contentRating: string;
  languagePreferences: string[];
  viewingHistory: any[];
  watchlist: any[];
  currentlyWatching: any[];
  recentlyWatched: any[];
}

interface AIRecommendationRequest {
  userProfile: UserProfile;
  availableShows: any[];
  excludeShows: number[];
  mood?: string;
}

// Export for use in other services
export interface Recommendation {
  tmdbId: number;
  reason: string;
  score: number;
  matchFactors: string[];
  source?: string;
  rank?: number;
}

interface AIRecommendationResponse {
  recommendations: Recommendation[];
  confidence: number;
  model?: string;
}

export class AIRecommendationService {
  private static cache = new Map<string, { result: AIRecommendationResponse; timestamp: number }>();
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  
  static async generatePersonalizedRecommendations(
    request: AIRecommendationRequest
  ): Promise<AIRecommendationResponse> {
    
    // Check cache first
    const cacheKey = this.getCacheKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log("🤖 Returning cached AI recommendations");
      return cached.result;
    }
    
    if (!openai) {
      console.log("🤖 OpenAI not configured, using fallback");
      return this.getFallbackRecommendations(request);
    }

    // Try AI with retry logic
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await this.callOpenAI(request, attempt);
        
        // Cache successful result
        this.cache.set(cacheKey, { result, timestamp: Date.now() });
        this.cleanupCache();
        
        return result;
      } catch (error) {
        const isRetryable = this.isRetryableError(error);
        console.error(`🤖 AI error (attempt ${attempt}):`, (error as any)?.message || error);
        
        if (attempt === 2 || !isRetryable) {
          console.log("🤖 Falling back to heuristic recommendations");
          return this.getFallbackRecommendations(request);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    return this.getFallbackRecommendations(request);
  }

  private static async callOpenAI(request: AIRecommendationRequest, attempt: number): Promise<AIRecommendationResponse> {
    const prompt = this.buildAdvancedPrompt(request);
    
    console.log(`🤖 Sending OpenAI request (attempt ${attempt})...`, { 
      model: OPENAI_MODEL,
      promptLength: prompt.length,
      availableShows: request.availableShows.length,
      userGenres: request.userProfile.favoriteGenres.length
    });
    
    const response = await openai!.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert TV show recommendation engine that provides highly personalized suggestions based on user preferences, viewing history, and behavioral patterns.

CRITICAL: Always respond with valid JSON in this exact format:
{
  "recommendations": [
    {
      "tmdbId": 123456,
      "reason": "Specific detailed reason why this matches the user's taste",
      "score": 0.95,
      "matchFactors": ["genre match", "viewing history similarity", "network preference"]
    }
  ],
  "confidence": 0.88
}

Focus on:
1. Understanding user's current viewing patterns
2. Matching mood and content preferences
3. Avoiding already watched content
4. Providing specific, personalized reasoning
5. Scoring based on likelihood of user enjoyment (0.0-1.0)`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500
    });

    console.log("🤖 OpenAI response received:", {
      tokensUsed: response.usage?.total_tokens || 'unknown',
      finishReason: response.choices?.[0]?.finish_reason
    });

    const raw = response.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    
    // Validate and enhance recommendations
    const recommendations: Recommendation[] = (parsed.recommendations || []).map((rec: any) => ({
      tmdbId: rec.tmdbId,
      reason: rec.reason || "AI-powered recommendation",
      score: Math.min(1.0, Math.max(0.0, rec.score || 0.7)),
      matchFactors: Array.isArray(rec.matchFactors) ? rec.matchFactors : ["AI analysis"],
      source: "AI"
    }));

    console.log(`🤖 AI generated ${recommendations.length} recommendations with confidence ${parsed.confidence || 0.8}`);
    
    // AI Top-up Strategy: If AI returns fewer than 10, fill with fallback recommendations
    if (recommendations.length < 10) {
      console.log(`🔄 AI returned ${recommendations.length} recs, topping up to 10 with fallback recommendations`);
      
      const excludedIds = new Set([...request.excludeShows, ...recommendations.map(r => r.tmdbId)]);
      const topUpRecommendations = this.getTopUpRecommendations(
        request.availableShows, 
        Array.from(excludedIds), 
        10 - recommendations.length,
        request.userProfile
      );
      
      recommendations.push(...topUpRecommendations);
      console.log(`✅ Final recommendation count: ${recommendations.length}`);
    }
    
    return {
      recommendations: recommendations.slice(0, 10), // Ensure exactly 10
      confidence: Math.min(1.0, Math.max(0.0, parsed.confidence || 0.8)),
      model: OPENAI_MODEL
    };
  }

  private static buildAdvancedPrompt(request: AIRecommendationRequest): string {
    const { userProfile, availableShows, excludeShows } = request;
    
    // Limit items to manage token usage
    const limitedShows = availableShows.slice(0, 40);
    const limitedHistory = userProfile.viewingHistory.slice(0, 8);
    const limitedCurrent = userProfile.currentlyWatching.slice(0, 5);
    const limitedRecent = userProfile.recentlyWatched.slice(0, 5);
    
    let prompt = `USER PROFILE:
• Favorite Genres: ${userProfile.favoriteGenres.join(', ') || 'None specified'}
• Preferred Networks: ${userProfile.preferredNetworks.join(', ') || 'Any'}
• Viewing Habits: ${userProfile.watchingHabits.join(', ') || 'Standard viewer'}
• Content Rating: ${userProfile.contentRating || 'Any'}
• Languages: ${userProfile.languagePreferences.join(', ') || 'English'}`;

    if (request.mood) {
      prompt += `\n• Current Mood: ${request.mood}`;
    }

    prompt += `\n\nCURRENT VIEWING CONTEXT:`;
    
    if (limitedCurrent.length > 0) {
      prompt += `\n• Currently Watching (${limitedCurrent.length} shows):`;
      limitedCurrent.forEach(show => {
        prompt += `\n  - ${show.title} ${show.genres ? `(${show.genres.join(', ')})` : ''}`;
      });
    }

    if (limitedRecent.length > 0) {
      prompt += `\n• Recently Finished (${limitedRecent.length} shows):`;
      limitedRecent.forEach(show => {
        prompt += `\n  - ${show.showTitle || show.title} ${show.rating ? `[Rated: ${show.rating}/10]` : ''}`;
      });
    }

    if (limitedHistory.length > 0) {
      prompt += `\n• Viewing History (${limitedHistory.length} recent):`;
      limitedHistory.forEach(item => {
        prompt += `\n  - ${item.showTitle || item.title}`;
      });
    }

    if (excludeShows.length > 0) {
      prompt += `\n\n⛔ EXCLUDE these TMDB IDs (already watched/in watchlist): ${excludeShows.slice(0, 20).join(', ')}`;
    }

    prompt += `\n\n📺 AVAILABLE SHOWS TO RECOMMEND FROM (select ONLY from these TMDB IDs):`;
    limitedShows.forEach(show => {
      const title = show.name || show.title || 'Unknown';
      const genres = show.genre_ids?.length ? `[${show.genre_ids.join(',')}]` : '[Unknown genres]';
      const rating = show.vote_average ? `★${show.vote_average}` : '';
      prompt += `\n• ID:${show.id} "${title}" ${genres} ${rating}`;
    });

    prompt += `\n\n🎯 TASK: Recommend 6-8 shows from the available list above that best match this user's taste profile.

REQUIREMENTS:
1. **CRITICAL**: Only use TMDB IDs from the available shows list
2. **PRIORITY 1**: Match current viewing patterns and recently finished shows
3. **PRIORITY 2**: Consider mood, genres, and preferences
4. **PRIORITY 3**: Avoid content already watched (excluded IDs)
5. Provide specific reasoning that references their viewing behavior
6. Score each recommendation 0.0-1.0 based on match confidence
7. Include relevant match factors in your analysis

Focus heavily on their current and recent viewing to understand their evolving taste preferences.`;

    return prompt;
  }

  private static getCacheKey(request: AIRecommendationRequest): string {
    return JSON.stringify({
      genres: request.userProfile.favoriteGenres.sort(),
      networks: request.userProfile.preferredNetworks.sort(),
      mood: request.mood || '',
      currentShows: request.userProfile.currentlyWatching.slice(0, 3).map(s => s.title || s.tmdbId).sort(),
      showIds: request.availableShows.slice(0, 20).map(s => s.id).sort(),
      excludeCount: request.excludeShows.length
    });
  }

  private static cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, cached] of entries) {
      if (now - cached.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  private static isRetryableError(error: any): boolean {
    const message = error?.message || '';
    return (
      message.includes('timeout') ||
      message.includes('rate limit') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('ECONNRESET')
    );
  }

  private static getFallbackRecommendations(request: AIRecommendationRequest): AIRecommendationResponse {
    console.log("🤖 Using enhanced fallback recommendation algorithm");
    
    const { userProfile, availableShows, excludeShows } = request;
    const recommendations: Recommendation[] = [];
    
    // Genre mapping for better matching
    const genreMapping: Record<number, string> = {
      10759: 'Action', 35: 'Comedy', 18: 'Drama', 80: 'Crime',
      99: 'Documentary', 10751: 'Family', 9648: 'Mystery',
      10749: 'Romance', 10765: 'Sci-Fi', 53: 'Thriller',
      27: 'Horror', 16: 'Animation', 37: 'Western', 14: 'Fantasy'
    };

    for (const show of availableShows.slice(0, 30)) {
      if (excludeShows.includes(show.id)) continue;
      
      let score = show.vote_average ? (show.vote_average / 10) * 0.6 : 0.3;
      let matchFactors: string[] = [];
      let reason = "Popular show with good ratings";
      
      // Enhanced genre matching with multiple bonuses
      if (show.genre_ids && userProfile.favoriteGenres.length > 0) {
        const showGenres = show.genre_ids.map((id: number) => genreMapping[id]).filter(Boolean);
        const genreMatches = showGenres.filter((genre: string) => 
          userProfile.favoriteGenres.some(fav => 
            fav.toLowerCase().includes(genre.toLowerCase()) ||
            genre.toLowerCase().includes(fav.toLowerCase())
          )
        );
        
        if (genreMatches.length > 0) {
          const genreBonus = Math.min(0.3, genreMatches.length * 0.15);
          score += genreBonus;
          matchFactors.push('genre match');
          
          if (genreMatches.length > 1) {
            matchFactors.push('multiple genres');
            score += 0.1;
          }
          
          reason = `Excellent ${genreMatches[0].toLowerCase()} show that aligns with your ${genreMatches.join(' and ')} preferences`;
        }
      }
      
      // Quality bonus for highly rated shows
      if (show.vote_average >= 8.0) {
        score += 0.15;
        matchFactors.push('highly rated');
        reason = `Critically acclaimed ${reason.toLowerCase()}`;
      }
      
      // Mood matching bonus
      if (request.mood) {
        const moodBonus = this.getMoodBonus(show, request.mood);
        if (moodBonus > 0) {
          score += moodBonus;
          matchFactors.push('mood match');
          reason += ` perfect for your ${request.mood} mood`;
        }
      }
      
      // Content rating consideration
      if (userProfile.contentRating !== 'Any' && userProfile.contentRating) {
        // Simple penalty for potentially inappropriate content
        const ratingPenalty = this.getContentRatingPenalty(userProfile.contentRating);
        score -= ratingPenalty;
      }
      
      recommendations.push({
        tmdbId: show.id,
        reason,
        score: Math.min(1.0, Math.max(0.1, score)),
        matchFactors,
        source: "fallback"
      });
      
      if (recommendations.length >= 10) break; // Aim for 10 instead of 8
    }
    
    // Ensure we have enough recommendations - aim for 10 items
    const finalRecommendations = recommendations.length >= 10 
      ? recommendations 
      : recommendations.concat(this.getBackupRecommendations(availableShows, excludeShows, recommendations.length));

    return {
      recommendations: finalRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 10) // Always return 10 recommendations
        .map((rec, index) => ({ ...rec, rank: index + 1 })),
      confidence: Math.min(0.8, 0.5 + (recommendations.length * 0.03))
    };
  }

  private static getMoodBonus(show: any, mood: string): number {
    const moodGenreMap: Record<string, number[]> = {
      'intense': [53, 27, 80, 10759], // Thriller, Horror, Crime, Action
      'light': [35, 10751, 16], // Comedy, Family, Animation
      'thought-provoking': [99, 18], // Documentary, Drama
      'escapist': [14, 10765, 16], // Fantasy, Sci-Fi, Animation
      'dramatic': [18, 10749], // Drama, Romance
      'exciting': [10759, 53, 80] // Action, Thriller, Crime
    };
    
    const moodGenres = moodGenreMap[mood.toLowerCase()] || [];
    const hasMatch = show.genre_ids?.some((id: number) => moodGenres.includes(id));
    return hasMatch ? 0.1 : 0;
  }

  private static getContentRatingPenalty(userRating: string): number {
    // Simple content rating logic - could be expanded based on show data
    if (userRating === 'G' || userRating === 'PG') return 0.05;
    if (userRating === 'PG-13') return 0.02;
    return 0;
  }

  private static getTopUpRecommendations(
    availableShows: any[], 
    excludeShows: number[], 
    needed: number,
    userProfile: UserProfile
  ): Recommendation[] {
    console.log(`🔄 Generating ${needed} top-up recommendations`);
    
    // Use smart fallback logic similar to getFallbackRecommendations but more targeted
    const genreMapping: Record<number, string> = {
      10759: 'Action', 35: 'Comedy', 18: 'Drama', 80: 'Crime',
      99: 'Documentary', 10751: 'Family', 9648: 'Mystery',
      10749: 'Romance', 10765: 'Sci-Fi', 53: 'Thriller',
      27: 'Horror', 16: 'Animation', 37: 'Western', 14: 'Fantasy'
    };
    
    const candidates = availableShows
      .filter(show => !excludeShows.includes(show.id))
      .map(show => {
        let score = (show.vote_average || 5) / 10 * 0.5; // Base score from rating
        let matchFactors: string[] = ["top-up"];
        
        // Bonus for genre matching
        if (show.genre_ids && userProfile.favoriteGenres.length > 0) {
          const showGenres = show.genre_ids.map((id: number) => genreMapping[id]).filter(Boolean);
          const genreMatches = showGenres.filter((genre: string) => 
            userProfile.favoriteGenres.some(fav => 
              fav.toLowerCase().includes(genre.toLowerCase()) ||
              genre.toLowerCase().includes(fav.toLowerCase())
            )
          );
          
          if (genreMatches.length > 0) {
            score += genreMatches.length * 0.1;
            matchFactors.push('genre match');
          }
        }
        
        // Quality bonus
        if (show.vote_average >= 8.0) {
          score += 0.1;
          matchFactors.push('highly rated');
        }
        
        return {
          tmdbId: show.id,
          reason: `Smart fallback recommendation based on your preferences`,
          score: Math.min(0.8, score), // Cap at 0.8 since it's fallback
          matchFactors,
          source: "AI-topup" as const
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, needed);
    
    console.log(`✅ Generated ${candidates.length} top-up recommendations`);
    return candidates;
  }

  private static getBackupRecommendations(
    availableShows: any[], 
    excludeShows: number[], 
    currentCount: number
  ): Recommendation[] {
    const needed = Math.max(0, 10 - currentCount); // Ensure we get to 10 total
    return availableShows
      .filter(show => !excludeShows.includes(show.id))
      .slice(currentCount, currentCount + needed)
      .map(show => ({
        tmdbId: show.id,
        reason: "Popular choice based on overall ratings",
        score: Math.min(0.6, (show.vote_average || 5) / 10),
        matchFactors: ["popular", "backup choice"],
        source: "backup"
      }));
  }
}
