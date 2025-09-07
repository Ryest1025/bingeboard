import { UnifiedRecommendationService } from './unifiedRecommendationService.js';

// Enhanced recommendation interfaces
interface IntelligentRecommendation {
  tmdbId: number;
  score: number;
  reason: string;
  matchFactors: string[];
  source: string;
  explainability: {
    primaryReason: string;
    contributingFactors: Array<{
      factor: string;
      weight: number;
      explanation: string;
    }>;
    confidenceScore: number;
  };
  diversityMetrics: {
    genreNovelty: number; // 0-1, how different from recent watches
    networkNovelty: number;
    themeNovelty: number;
  };
}

interface SmartMergingWeights {
  ai: number;
  tmdb: number;
  trending: number;
  collaborative: number;
  contextual: number; // time/device based boost
  behavioral: number; // based on user patterns
}

interface RecommendationMetrics {
  diversityScore: number; // genre/platform diversity
  noveltyScrore: number; // how different from usual
  temporalRelevance: number; // fits current context
  personalizedScore: number; // individual user fit
}

export class IntelligentRecommendationService {
  
  /**
   * Generate contextually-aware AI recommendations with embedding-based similarity
   */
  static async getEnhancedAIRecommendations(
    userProfile: any,
    availableShows: any[],
    excludeShows: number[] = []
  ): Promise<{ result: IntelligentRecommendation[]; timing: number }> {
    const startTime = performance.now();
    const recommendations: IntelligentRecommendation[] = [];
    
    // Enhanced AI logic with contextual intelligence
    const contextualBoosts = this.calculateContextualBoosts(userProfile);
    const behavioralWeights = this.calculateBehavioralWeights(userProfile);
    const moodEmbeddings = this.getMoodEmbeddings(userProfile.contextualCues.currentMood);
    
    // Process available shows with intelligent scoring
    for (const show of availableShows.slice(0, 20)) {
      if (excludeShows.includes(show.id)) continue;
      
      const baseScore = (show.vote_average || 5) / 10;
      const contextualScore = this.calculateContextualScore(show, userProfile, contextualBoosts);
      const behavioralScore = this.calculateBehavioralFit(show, userProfile, behavioralWeights);
      const moodScore = this.calculateMoodAlignment(show, moodEmbeddings);
      const noveltyScore = this.calculateNoveltyScore(show, userProfile);
      
      const finalScore = this.combineScores({
        base: baseScore,
        contextual: contextualScore,
        behavioral: behavioralScore,
        mood: moodScore,
        novelty: noveltyScore
      }, userProfile);
      
      const explainability = this.generateExplainability(show, userProfile, {
        baseScore, contextualScore, behavioralScore, moodScore, noveltyScore
      });
      
      recommendations.push({
        tmdbId: show.id,
        score: finalScore,
        reason: explainability.primaryReason,
        matchFactors: this.extractMatchFactors(show, userProfile),
        source: 'Enhanced-AI',
        explainability,
        diversityMetrics: this.calculateDiversityMetrics(show, userProfile)
      });
    }
    
    // Sort by intelligent score and return top recommendations
    const sortedRecs = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
    
    return {
      result: sortedRecs,
      timing: performance.now() - startTime
    };
  }
  
  /**
   * Calculate contextual boosts based on time, device, season
   */
  private static calculateContextualBoosts(userProfile: any): Record<string, number> {
    const { contextualCues, temporalPatterns } = userProfile;
    const boosts: Record<string, number> = {};
    
    // Time of day boosts
    const timePrefs = temporalPatterns.timeSlotPreferences[contextualCues.timeOfDay] || [];
    timePrefs.forEach((genre: string) => {
      boosts[`time_${genre.toLowerCase()}`] = 1.2;
    });
    
    // Device-based content length preference
    if (contextualCues.deviceType === 'mobile') {
      boosts['short_content'] = 1.3;
    } else if (contextualCues.deviceType === 'tv') {
      boosts['long_content'] = 1.2;
    }
    
    // Seasonal boosts
    Object.entries(contextualCues.seasonalTrends).forEach(([theme, boost]) => {
      boosts[`seasonal_${theme}`] = boost as number;
    });
    
    return boosts;
  }
  
  /**
   * Calculate behavioral weights based on user patterns
   */
  private static calculateBehavioralWeights(userProfile: any): Record<string, number> {
    const { behavioralData, preferences } = userProfile;
    
    return {
      // Novelty seekers prefer less popular content
      novelty: preferences.noveltySeeker ? 1.4 : 0.8,
      // Binge watchers prefer series over movies
      series_preference: behavioralData.bingePatterns === 'heavy' ? 1.3 : 1.0,
      // High completion rate users get more complex content
      complexity: behavioralData.completionRate > 0.8 ? 1.2 : 0.9,
      // Low skip rate users get more adventurous recommendations
      adventure: behavioralData.skipRate < 0.2 ? 1.3 : 1.0
    };
  }
  
  /**
   * Get mood embeddings for semantic matching
   */
  private static getMoodEmbeddings(mood?: string): Record<string, number> {
    // Simplified mood embedding - in production would use actual embeddings
    const moodMappings: Record<string, Record<string, number>> = {
      'thought-provoking': {
        'complex': 1.0, 'philosophical': 0.9, 'psychological': 0.8,
        'mystery': 0.7, 'drama': 0.8, 'documentary': 0.6
      },
      'intense': {
        'thriller': 1.0, 'action': 0.9, 'crime': 0.8,
        'horror': 0.7, 'war': 0.6
      },
      'light': {
        'comedy': 1.0, 'family': 0.9, 'animation': 0.7,
        'romance': 0.6, 'musical': 0.5
      },
      'escapist': {
        'fantasy': 1.0, 'sci-fi': 0.9, 'adventure': 0.8,
        'superhero': 0.7, 'animation': 0.6
      }
    };
    
    return moodMappings[mood || 'thought-provoking'] || {};
  }
  
  /**
   * Calculate how well a show fits current context
   */
  private static calculateContextualScore(show: any, userProfile: any, boosts: Record<string, number>): number {
    let score = 0.5; // base contextual score
    
    // Apply contextual boosts based on show characteristics
    // This is simplified - in production you'd analyze show metadata more deeply
    const showGenres = this.getShowGenres(show);
    
    showGenres.forEach((genre: string) => {
      const timeBoost = boosts[`time_${genre.toLowerCase()}`] || 1.0;
      const seasonalBoost = boosts[`seasonal_${genre.toLowerCase()}`] || 1.0;
      score *= (timeBoost * seasonalBoost);
    });
    
    // Device-based length preferences
    const estimatedLength = show.runtime || (show.episode_run_time?.[0]) || 45;
    if (estimatedLength < 30 && boosts['short_content']) {
      score *= boosts['short_content'];
    } else if (estimatedLength > 60 && boosts['long_content']) {
      score *= boosts['long_content'];
    }
    
    return Math.min(1.0, score);
  }
  
  /**
   * Calculate behavioral fit score
   */
  private static calculateBehavioralFit(show: any, userProfile: any, weights: Record<string, number>): number {
    let score = 0.5;
    
    // Series vs movie preference
    if (show.type === 'tv' || show.first_air_date) {
      score *= weights.series_preference;
    }
    
    // Complexity matching
    const complexity = this.estimateContentComplexity(show);
    if (complexity === userProfile.preferences.contentComplexity) {
      score *= weights.complexity;
    }
    
    // Adventure factor for low-skip users
    const adventureFactor = this.calculateAdventureFactor(show);
    score *= (1 + (adventureFactor * (weights.adventure - 1)));
    
    return Math.min(1.0, score);
  }
  
  /**
   * Calculate mood alignment using simplified NLP
   */
  private static calculateMoodAlignment(show: any, moodEmbeddings: Record<string, number>): number {
    let score = 0.5;
    
    // Analyze show overview for mood keywords
    const overview = (show.overview || '').toLowerCase();
    const title = (show.name || show.title || '').toLowerCase();
    
    Object.entries(moodEmbeddings).forEach(([keyword, weight]) => {
      if (overview.includes(keyword) || title.includes(keyword)) {
        score += (weight * 0.1);
      }
    });
    
    return Math.min(1.0, score);
  }
  
  /**
   * Calculate novelty score - how different from usual watches
   */
  private static calculateNoveltyScore(show: any, userProfile: any): number {
    const recentGenres = this.extractRecentGenres(userProfile);
    const showGenres = this.getShowGenres(show);
    
    // Calculate genre novelty
    const genreOverlap = showGenres.filter((g: string) => recentGenres.includes(g)).length;
    const noveltyScore = 1 - (genreOverlap / Math.max(showGenres.length, 1));
    
    // Novelty seekers get bonus for novel content
    return userProfile.preferences.noveltySeeker ? noveltyScore : (1 - noveltyScore);
  }
  
  /**
   * Combine multiple scores intelligently
   */
  private static combineScores(scores: Record<string, number>, userProfile: any): number {
    // Dynamic weighting based on user profile
    const weights = {
      base: 0.2,
      contextual: userProfile.contextualCues.timeOfDay === 'evening' ? 0.25 : 0.15,
      behavioral: userProfile.behavioralData.completionRate > 0.8 ? 0.25 : 0.2,
      mood: userProfile.preferences.mood ? 0.2 : 0.1,
      novelty: userProfile.preferences.noveltySeeker ? 0.2 : 0.1
    };
    
    return Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score * (weights[key as keyof typeof weights] || 0.1));
    }, 0);
  }
  
  /**
   * Generate explainable AI reasoning
   */
  private static generateExplainability(show: any, userProfile: any, scores: any) {
    const factors = [];
    
    if (scores.contextual > 0.6) {
      factors.push({
        factor: 'contextual',
        weight: scores.contextual,
        explanation: `Perfect for ${userProfile.contextualCues.timeOfDay} watching`
      });
    }
    
    if (scores.behavioral > 0.6) {
      factors.push({
        factor: 'behavioral',
        weight: scores.behavioral,
        explanation: `Matches your ${userProfile.behavioralData.bingePatterns} viewing style`
      });
    }
    
    if (scores.mood > 0.6) {
      factors.push({
        factor: 'mood',
        weight: scores.mood,
        explanation: `Aligns with your ${userProfile.preferences.mood} mood`
      });
    }
    
    const primaryReason = factors.length > 0 
      ? factors[0].explanation 
      : `Recommended based on your interest in ${userProfile.favoriteGenres[0]}`;
    
    return {
      primaryReason,
      contributingFactors: factors,
      confidenceScore: Math.max(...Object.values(scores).map(s => typeof s === 'number' ? s : 0))
    };
  }
  
  // Helper methods
  private static getShowGenres(show: any): string[] {
    // Map genre IDs to genre names - simplified mapping
    const genreMap: Record<number, string> = {
      28: 'Action', 35: 'Comedy', 18: 'Drama', 14: 'Fantasy',
      27: 'Horror', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
      53: 'Thriller', 37: 'Western', 10765: 'Sci-Fi', 80: 'Crime'
    };
    
    return (show.genre_ids || []).map((id: number) => genreMap[id]).filter(Boolean);
  }
  
  private static extractRecentGenres(userProfile: any): string[] {
    // Extract genres from recent viewing history
    return ['Drama', 'Sci-Fi', 'Thriller']; // Simplified
  }
  
  private static estimateContentComplexity(show: any): 'simple' | 'moderate' | 'complex' {
    const rating = show.vote_average || 5;
    const overview = (show.overview || '').toLowerCase();
    
    // Simplified complexity estimation
    if (rating > 8.0 || overview.includes('complex') || overview.includes('psychological')) {
      return 'complex';
    } else if (rating > 6.5) {
      return 'moderate';
    }
    return 'simple';
  }
  
  private static calculateAdventureFactor(show: any): number {
    // How adventurous/risky is this recommendation
    const genres = this.getShowGenres(show);
    const adventurousGenres = ['Horror', 'Thriller', 'Mystery', 'Sci-Fi'];
    const overlap = genres.filter(g => adventurousGenres.includes(g)).length;
    return overlap / Math.max(genres.length, 1);
  }
  
  private static extractMatchFactors(show: any, userProfile: any): string[] {
    const factors = ['intelligent-ai'];
    const genres = this.getShowGenres(show);
    
    // Add matching factors
    genres.forEach(genre => {
      if (userProfile.favoriteGenres.includes(genre)) {
        factors.push(`genre-${genre.toLowerCase()}`);
      }
    });
    
    // Contextual factors
    if (userProfile.contextualCues.currentMood) {
      factors.push(`mood-${userProfile.contextualCues.currentMood}`);
    }
    
    return factors;
  }
  
  private static calculateDiversityMetrics(show: any, userProfile: any) {
    const recentGenres = this.extractRecentGenres(userProfile);
    const showGenres = this.getShowGenres(show);
    
    return {
      genreNovelty: 1 - (showGenres.filter(g => recentGenres.includes(g)).length / Math.max(showGenres.length, 1)),
      networkNovelty: 0.7, // Simplified
      themeNovelty: 0.6 // Simplified
    };
  }
  
  /**
   * Smart merging with dynamic source weighting
   */
  static calculateDynamicWeights(userProfile: any): SmartMergingWeights {
    const { behavioralData, preferences } = userProfile;
    
    // Base weights
    let weights: SmartMergingWeights = {
      ai: 1.0,
      tmdb: 0.8,
      trending: 0.6,
      collaborative: 0.7,
      contextual: 0.5,
      behavioral: 0.6
    };
    
    // Adjust weights based on user characteristics
    if (preferences.noveltySeeker) {
      weights.ai *= 1.2; // AI better for novel recommendations
      weights.trending *= 0.8; // Less weight on popular content
    }
    
    if (behavioralData.completionRate > 0.8) {
      weights.collaborative *= 1.3; // High completion users benefit from collaborative
    }
    
    if (behavioralData.skipRate < 0.2) {
      weights.ai *= 1.1; // Low skip rate users trust AI more
    }
    
    // Context-aware weighting
    if (userProfile.contextualCues.timeOfDay === 'evening') {
      weights.contextual *= 1.4; // Evening context more important
    }
    
    return weights;
  }
  
  /**
   * Calculate comprehensive recommendation metrics
   */
  static calculateRecommendationMetrics(recommendations: any[]): RecommendationMetrics {
    const genres = recommendations.flatMap(r => r.matchFactors.filter((f: string) => f.startsWith('genre-')));
    const uniqueGenres = new Set(genres);
    
    return {
      diversityScore: uniqueGenres.size / Math.max(recommendations.length, 1),
      noveltyScrore: recommendations.reduce((avg, r) => avg + (r.diversityMetrics?.genreNovelty || 0), 0) / recommendations.length,
      temporalRelevance: recommendations.reduce((avg, r) => avg + (r.matchFactors.includes('contextual') ? 1 : 0), 0) / recommendations.length,
      personalizedScore: recommendations.reduce((avg, r) => avg + (r.explainability?.confidenceScore || 0), 0) / recommendations.length
    };
  }
}
