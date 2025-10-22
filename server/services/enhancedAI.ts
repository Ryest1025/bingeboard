/**
 * Enhanced AI Recommendation Engine
 * 
 * Multi-model approach with behavioral analysis, real-time relevance, and explainability
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

// Model selection based on task
const MODELS = {
  creative: "gpt-4o", // Creative recommendations, mood-based
  analytical: "gpt-4o-mini", // Fast filtering, genre matching
  claude: "claude-3-5-sonnet-20241022", // Deep analysis, nuanced understanding
};

interface BehavioralPattern {
  genreAffinities: Map<string, number>; // Genre → confidence score
  timeOfDayPreferences: Map<string, number>; // Time → watch probability
  bingeVsEpisodic: number; // -1 to 1: episodic to binge
  newVsClassic: number; // -1 to 1: classic to new
  mainstreamVsNiche: number; // -1 to 1: niche to mainstream
  moodPatterns: Map<string, string[]>; // Mood → genres watched
  platformLoyalty: Map<string, number>; // Platform → usage score
  completionRate: number; // 0-1: how often they finish shows
  averageSessionLength: number; // Minutes per session
  preferredContentLength: string; // "short" | "medium" | "long"
}

interface EnhancedRecommendation {
  tmdbId: number;
  title: string;
  reason: string;
  score: number;
  confidence: number;
  matchFactors: {
    factor: string;
    weight: number;
    explanation: string;
  }[];
  aiModel: string;
  personalityFit: number; // 0-1: how well it matches user personality
  trendingScore: number; // 0-1: current popularity
  qualityScore: number; // 0-1: critical acclaim
  diversityBonus: number; // 0-1: helps diversify recommendations
  explanations: {
    why: string; // Why this show matches
    howDiscovered: string; // How AI found this
    whatToExpect: string; // What user will experience
    whenToWatch: string; // Best time/mood to watch
  };
}

export class EnhancedAIEngine {
  
  /**
   * Analyze user behavior to build psychological profile
   */
  static async analyzeBehavioralPatterns(userProfile: any): Promise<BehavioralPattern> {
    console.log('🧠 Analyzing behavioral patterns...');
    
    const patterns: BehavioralPattern = {
      genreAffinities: new Map(),
      timeOfDayPreferences: new Map(),
      bingeVsEpisodic: 0,
      newVsClassic: 0,
      mainstreamVsNiche: 0,
      moodPatterns: new Map(),
      platformLoyalty: new Map(),
      completionRate: 0,
      averageSessionLength: 0,
      preferredContentLength: "medium"
    };

    // Analyze viewing history for genre preferences
    const allViewed = [
      ...userProfile.viewingHistory || [],
      ...userProfile.recentlyWatched || [],
      ...userProfile.currentlyWatching || []
    ];

    // Genre affinity scoring
    const genreCounts = new Map<string, number>();
    allViewed.forEach((item: any) => {
      const genres = item.genres || [];
      genres.forEach((genre: string) => {
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
      });
    });

    const totalViews = allViewed.length || 1;
    genreCounts.forEach((count, genre) => {
      patterns.genreAffinities.set(genre, count / totalViews);
    });

    // Completion rate analysis
    const finished = userProfile.recentlyWatched?.filter((s: any) => s.status === 'finished').length || 0;
    const started = allViewed.length || 1;
    patterns.completionRate = finished / started;

    // New vs Classic preference
    const recentYears = allViewed.filter((s: any) => {
      const year = parseInt(s.releaseYear || s.first_air_date?.substring(0, 4) || '0');
      return year >= new Date().getFullYear() - 2;
    }).length;
    patterns.newVsClassic = (recentYears / totalViews) * 2 - 1; // Normalize to -1 to 1

    // Binge behavior analysis
    const multiSeasonShows = userProfile.currentlyWatching?.filter((s: any) => 
      s.numberOfSeasons && s.numberOfSeasons > 2
    ).length || 0;
    patterns.bingeVsEpisodic = multiSeasonShows > 3 ? 0.7 : multiSeasonShows > 1 ? 0.3 : -0.3;

    console.log('🧠 Behavioral analysis complete:', {
      topGenres: Array.from(patterns.genreAffinities.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre, score]) => `${genre} (${(score * 100).toFixed(0)}%)`),
      completionRate: `${(patterns.completionRate * 100).toFixed(0)}%`,
      bingeScore: patterns.bingeVsEpisodic.toFixed(2),
      newVsClassic: patterns.newVsClassic > 0 ? 'Prefers new' : 'Likes classics'
    });

    return patterns;
  }

  /**
   * Multi-model ensemble recommendations
   */
  static async generateEnsembleRecommendations(
    userProfile: any,
    availableShows: any[],
    behavioralPatterns: BehavioralPattern,
    context: { mood?: string; timeOfDay?: string; filters?: any }
  ): Promise<EnhancedRecommendation[]> {
    console.log('🎯 Generating ensemble AI recommendations...');

    const results = await Promise.allSettled([
      this.getCreativeRecommendations(userProfile, availableShows, behavioralPatterns, context),
      this.getAnalyticalRecommendations(userProfile, availableShows, behavioralPatterns),
      anthropic && this.getClaudeRecommendations(userProfile, availableShows, behavioralPatterns, context)
    ].filter(Boolean));

    // Combine and deduplicate
    const allRecs = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r as PromiseFulfilledResult<EnhancedRecommendation[]>).value);

    // Deduplicate and merge scores
    const mergedMap = new Map<number, EnhancedRecommendation>();
    
    allRecs.forEach(rec => {
      const existing = mergedMap.get(rec.tmdbId);
      if (!existing) {
        mergedMap.set(rec.tmdbId, rec);
      } else {
        // Merge: boost score if multiple models agree
        existing.score = (existing.score + rec.score) / 2 + 0.1; // Agreement bonus
        existing.confidence = Math.max(existing.confidence, rec.confidence);
        existing.matchFactors = [...existing.matchFactors, ...rec.matchFactors];
      }
    });

    const finalRecs = Array.from(mergedMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    console.log(`🎯 Ensemble complete: ${finalRecs.length} recommendations from ${allRecs.length} raw results`);

    return finalRecs;
  }

  /**
   * Creative AI - Focus on mood, storytelling, emotional resonance
   */
  private static async getCreativeRecommendations(
    userProfile: any,
    availableShows: any[],
    patterns: BehavioralPattern,
    context: any
  ): Promise<EnhancedRecommendation[]> {
    if (!openai) return [];

    console.log('🎨 Generating creative recommendations with GPT-4...');

    const prompt = this.buildCreativePrompt(userProfile, availableShows, patterns, context);

    try {
      const response = await openai.chat.completions.create({
        model: MODELS.creative,
        messages: [
          {
            role: "system",
            content: `You are a creative TV curator with deep understanding of storytelling, emotional arcs, and viewer psychology. 
            
Your task is to recommend shows that will emotionally resonate with the user, considering their mood, personality, and viewing patterns.

RESPONSE FORMAT (JSON):
{
  "recommendations": [
    {
      "tmdbId": 123456,
      "title": "Show Name",
      "score": 0.95,
      "confidence": 0.88,
      "personalityFit": 0.92,
      "matchFactors": [
        {"factor": "emotional tone", "weight": 0.3, "explanation": "Specific reason"},
        {"factor": "storytelling style", "weight": 0.25, "explanation": "Why it matches"}
      ],
      "why": "Deep explanation of why this matches their personality",
      "howDiscovered": "What made me think of this show",
      "whatToExpect": "What viewing experience they'll have",
      "whenToWatch": "Best time/mood for this show"
    }
  ]
}

Focus on EMOTIONAL and PSYCHOLOGICAL fit, not just genre matching.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8, // Higher creativity
        max_tokens: 2000
      });

      const data = JSON.parse(response.choices[0].message.content || "{}");
      
      return (data.recommendations || []).map((rec: any) => ({
        ...rec,
        aiModel: "gpt-4o-creative",
        reason: rec.why || "Creative AI match",
        trendingScore: 0.5,
        qualityScore: 0.7,
        diversityBonus: 0,
        explanations: {
          why: rec.why || "",
          howDiscovered: rec.howDiscovered || "",
          whatToExpect: rec.whatToExpect || "",
          whenToWatch: rec.whenToWatch || ""
        }
      }));
    } catch (error) {
      console.error('❌ Creative AI failed:', error);
      return [];
    }
  }

  /**
   * Analytical AI - Fast, precise, data-driven
   */
  private static async getAnalyticalRecommendations(
    userProfile: any,
    availableShows: any[],
    patterns: BehavioralPattern
  ): Promise<EnhancedRecommendation[]> {
    if (!openai) return [];

    console.log('📊 Generating analytical recommendations with GPT-4-mini...');

    const topGenres = Array.from(patterns.genreAffinities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const prompt = `Analyze these shows and recommend the top 8 that best match this data profile:

USER METRICS:
- Top genres: ${topGenres.map(([g, s]) => `${g} (${(s * 100).toFixed(0)}%)`).join(', ')}
- Completion rate: ${(patterns.completionRate * 100).toFixed(0)}%
- Binge score: ${patterns.bingeVsEpisodic.toFixed(2)} (-1=episodic, 1=binge)
- Preference: ${patterns.newVsClassic > 0 ? 'New shows' : 'Classic content'}

AVAILABLE SHOWS (top 30):
${availableShows.slice(0, 30).map(s => 
  `ID:${s.id} "${s.name || s.title}" [${s.genre_ids?.join(',')}] ★${s.vote_average || 'N/A'}`
).join('\n')}

Return JSON with data-driven matches scored 0-1.`;

    try {
      const response = await openai.chat.completions.create({
        model: MODELS.analytical,
        messages: [
          { role: "system", content: "You are a data analyst specializing in content matching algorithms. Respond with JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Low creativity, high precision
        max_tokens: 1200
      });

      const data = JSON.parse(response.choices[0].message.content || "{}");
      
      return (data.recommendations || []).map((rec: any) => ({
        tmdbId: rec.tmdbId,
        title: rec.title || "Unknown",
        reason: rec.reason || "Data-driven match",
        score: rec.score || 0.7,
        confidence: rec.confidence || 0.85,
        matchFactors: (rec.matchFactors || []).map((f: string) => ({
          factor: f,
          weight: 0.5,
          explanation: `Analytical match: ${f}`
        })),
        aiModel: "gpt-4o-mini-analytical",
        personalityFit: rec.score || 0.7,
        trendingScore: 0.5,
        qualityScore: 0.8,
        diversityBonus: 0,
        explanations: {
          why: rec.reason || "",
          howDiscovered: "Data analysis",
          whatToExpect: "Statistically aligned with your preferences",
          whenToWatch: "Anytime"
        }
      }));
    } catch (error) {
      console.error('❌ Analytical AI failed:', error);
      return [];
    }
  }

  /**
   * Claude AI - Deep contextual understanding
   */
  private static async getClaudeRecommendations(
    userProfile: any,
    availableShows: any[],
    patterns: BehavioralPattern,
    context: any
  ): Promise<EnhancedRecommendation[]> {
    if (!anthropic) return [];

    console.log('🧬 Generating deep recommendations with Claude...');

    const prompt = this.buildDeepContextPrompt(userProfile, availableShows, patterns, context);

    try {
      const response = await anthropic.messages.create({
        model: MODELS.claude,
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      const text = content.type === 'text' ? content.text : '{}';
      
      // Extract JSON from Claude's response (it might include explanatory text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      
      return (data.recommendations || []).map((rec: any) => ({
        tmdbId: rec.tmdbId,
        title: rec.title || "Unknown",
        reason: rec.reason || "Deep context match",
        score: rec.score || 0.8,
        confidence: rec.confidence || 0.9,
        matchFactors: (rec.matchFactors || []).map((f: any) => ({
          factor: f.factor || f,
          weight: f.weight || 0.5,
          explanation: f.explanation || ""
        })),
        aiModel: "claude-3.5-sonnet",
        personalityFit: rec.personalityFit || rec.score || 0.8,
        trendingScore: rec.trendingScore || 0.5,
        qualityScore: rec.qualityScore || 0.85,
        diversityBonus: rec.diversityBonus || 0,
        explanations: {
          why: rec.why || rec.reason || "",
          howDiscovered: rec.howDiscovered || "Deep analysis",
          whatToExpect: rec.whatToExpect || "",
          whenToWatch: rec.whenToWatch || "When you want depth"
        }
      }));
    } catch (error) {
      console.error('❌ Claude AI failed:', error);
      return [];
    }
  }

  private static buildCreativePrompt(
    userProfile: any,
    shows: any[],
    patterns: BehavioralPattern,
    context: any
  ): string {
    const recentShows = userProfile.recentlyWatched?.slice(0, 5) || [];
    const currentShows = userProfile.currentlyWatching?.slice(0, 3) || [];

    return `I need emotionally resonant TV recommendations for a viewer with this profile:

VIEWING PERSONALITY:
${patterns.bingeVsEpisodic > 0.3 ? '• Binge-watcher - loves deep dives into series' : '• Measured viewer - appreciates episodic content'}
${patterns.completionRate > 0.7 ? '• High completion rate - commits to shows they start' : '• Selective - drops shows that don't hook them'}
${patterns.newVsClassic > 0 ? '• Prefers current/recent content' : '• Appreciates timeless classics'}

CURRENTLY WATCHING:
${currentShows.map((s: any) => `- ${s.title || s.showTitle}`).join('\n') || 'None'}

RECENTLY FINISHED & LOVED:
${recentShows.filter((s: any) => s.rating && s.rating >= 8).map((s: any) => 
  `- ${s.showTitle} (rated ${s.rating}/10)`
).join('\n') || 'None specified'}

${context.mood ? `CURRENT MOOD: ${context.mood}` : ''}

AVAILABLE TO RECOMMEND (${shows.length} shows):
${shows.slice(0, 25).map(s => 
  `ID:${s.id} "${s.name || s.title}" ★${s.vote_average || 'N/A'} [${s.overview?.substring(0, 100) || 'No description'}...]`
).join('\n')}

Find 6-8 shows that will emotionally connect with this viewer. Consider their storytelling preferences, emotional investment patterns, and current state.`;
  }

  private static buildDeepContextPrompt(
    userProfile: any,
    shows: any[],
    patterns: BehavioralPattern,
    context: any
  ): string {
    return `You are a sophisticated content recommendation system with deep understanding of viewer psychology.

Analyze this viewer's complete profile and recommend shows from the available list that will provide maximum satisfaction and engagement.

BEHAVIORAL ANALYSIS:
- Completion Rate: ${(patterns.completionRate * 100).toFixed(0)}% (how often they finish what they start)
- Binge Tendency: ${patterns.bingeVsEpisodic > 0 ? 'High' : 'Low'} (${patterns.bingeVsEpisodic.toFixed(2)})
- Content Age Preference: ${patterns.newVsClassic > 0 ? 'Modern/Recent' : 'Classic/Timeless'}
- Top Genres: ${Array.from(patterns.genreAffinities.entries()).slice(0, 5).map(([g, s]) => g).join(', ')}

CURRENT CONTEXT:
${context.mood ? `- Mood: ${context.mood}` : ''}
${context.timeOfDay ? `- Time: ${context.timeOfDay}` : ''}
${context.filters ? `- Filters: ${JSON.stringify(context.filters)}` : ''}

VIEWING HISTORY INSIGHTS:
- Total shows tracked: ${(userProfile.viewingHistory?.length || 0) + (userProfile.recentlyWatched?.length || 0)}
- Currently watching: ${userProfile.currentlyWatching?.length || 0} shows
- Watchlist size: ${userProfile.watchlist?.length || 0}

AVAILABLE SHOWS TO RECOMMEND (select from these TMDB IDs only):
${shows.slice(0, 30).map(s => 
  `ID:${s.id} "${s.name || s.title}" ★${s.vote_average || 'N/A'} Genres:[${s.genre_ids?.join(',') || 'unknown'}]`
).join('\n')}

Provide 6-8 recommendations in JSON format with deep reasoning about why each show matches this specific viewer's psychological profile and viewing patterns.

Required JSON structure:
{
  "recommendations": [
    {
      "tmdbId": number,
      "title": string,
      "score": number (0-1),
      "confidence": number (0-1),
      "personalityFit": number (0-1),
      "matchFactors": [{"factor": string, "weight": number, "explanation": string}],
      "why": string,
      "howDiscovered": string,
      "whatToExpect": string,
      "whenToWatch": string
    }
  ]
}`;
  }

  /**
   * Real-time trending boost
   */
  static async calculateTrendingScore(tmdbId: number): Promise<number> {
    // Placeholder for real-time trending data
    // Could integrate with TMDB trending API, social media mentions, etc.
    return 0.5;
  }

  /**
   * Diversity scoring to avoid recommendation bubbles
   */
  static calculateDiversityBonus(
    recommendation: any,
    previousRecommendations: any[],
    userProfile: any
  ): number {
    // Check if this recommendation introduces new genres
    const userGenres = new Set(userProfile.favoriteGenres || []);
    const recGenres = new Set(recommendation.genreIds || []);
    
    const newGenres = Array.from(recGenres).filter(g => !userGenres.has(g));
    const diversityScore = newGenres.length > 0 ? 0.2 : 0;

    // Check if it's from a new platform
    const userPlatforms = new Set(userProfile.preferredNetworks || []);
    const recPlatform = recommendation.network || recommendation.platform;
    const newPlatform = recPlatform && !userPlatforms.has(recPlatform) ? 0.1 : 0;

    return Math.min(0.3, diversityScore + newPlatform);
  }
}
