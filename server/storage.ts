// Import core tables from SQLite schema for compatibility
import {
  users,
  shows,
  watchlist,
  userPreferences,
  passwordResetCodes
} from "../shared/schema/index";



// Import all other tables from PostgreSQL schema (they will use fallback behavior)
import {
  watchlists,
  friendships,
  activities,
  activityLikes,
  activityComments,
  recommendations,
  upcomingReleases,
  releaseReminders,
  notifications,
  userSportsPreferences,
  sportsActivities,
  aiRecommendations,
  searchAlerts,
  streamingIntegrations,
  viewingHistory,
  userBehavior,
  recommendationTraining,
  contactImports,
  friendSuggestions,
  socialConnections,
  episodeProgress,
  customLists,
  customListItems,
  type User,
  type UpsertUser,
  type Show,
  type InsertShow,
  type Watchlist,
  type InsertWatchlist,
  type Friend,
  type FriendRequest,
  type Friendship,
  type InsertFriendship,
  type Activity,
  type InsertActivity,
  type ActivityLike,
  type InsertActivityLike,
  type ActivityComment,
  type InsertActivityComment,
  type Recommendation,
  type InsertRecommendation,
  type UpcomingRelease,
  type InsertUpcomingRelease,
  type ReleaseReminder,
  type InsertReleaseReminder,
  type Notification,
  type InsertNotification,
  type UserSportsPreferences,
  type InsertUserSportsPreferences,
  type SportsActivity,
  type InsertSportsActivity,
  type AiRecommendation,
  type InsertAiRecommendation,
  type SearchAlert,
  type ContactImport,
  type InsertContactImport,
  type FriendSuggestion,
  type InsertFriendSuggestion,
  type InsertSearchAlert,
  type UserPreferences,
  type InsertUserPreferences,
  type StreamingIntegration,
  type InsertStreamingIntegration,
  type ViewingHistory,
  type InsertViewingHistory,
  type UserBehavior,
  type InsertUserBehavior,
  type RecommendationTraining,
  type InsertRecommendationTraining,
  type EpisodeProgress,
  type InsertEpisodeProgress,
  type SocialConnection,
  type InsertSocialConnection
} from "../shared/schema";
import { db } from "./db";
import { eq, and, or, desc, count, ilike, inArray, sql } from "drizzle-orm";

interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Show methods
  getShow(id: number): Promise<Show | undefined>;
  getShowByTmdbId(tmdbId: number): Promise<Show | undefined>;
  createShow(insertShow: InsertShow): Promise<Show>;
  upsertShow(show: InsertShow): Promise<Show>;
  getOrCreateShow(show: InsertShow): Promise<Show>;

  // Watchlist methods
  getUserWatchlist(userId: string, status?: string): Promise<Watchlist[]>;
  addToWatchlist(watchlistItem: InsertWatchlist): Promise<Watchlist>;
  updateWatchlistItem(id: number, userId: string, updates: Partial<InsertWatchlist>): Promise<Watchlist>;
  removeFromWatchlist(id: number, userId: string): Promise<void>;

  // Friend methods
  getUserFriends(userId: string): Promise<Friend[]>;
  sendFriendRequest(userId: string, friendId: string): Promise<Friendship>;
  updateFriendship(id: number, userId: string, status: string): Promise<Friendship>;
  getFriendRequests(userId: string): Promise<FriendRequest[]>;
  acceptFriendRequest(requestId: number, userId: string): Promise<Friendship>;
  rejectFriendRequest(requestId: number, userId: string): Promise<void>;
  searchUsers(query: string): Promise<User[]>;

  // Activity methods
  getActivityFeed(userId: string): Promise<Activity[]>;
  getFriendActivities(friendIds: string[]): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  likeActivity(activityId: number, userId: string): Promise<ActivityLike>;
  unlikeActivity(activityId: number, userId: string): Promise<void>;
  commentOnActivity(activityId: number, userId: string, content: string): Promise<ActivityComment>;

  // Recommendation methods
  getUserRecommendations(userId: string): Promise<Recommendation[]>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  generateRecommendations(userId: string): Promise<Recommendation[]>;

  // Stats methods
  getUserStats(userId: string): Promise<any>;

  // Upcoming releases methods
  getUpcomingReleases(): Promise<UpcomingRelease[]>;
  getUpcomingReleasesForUser(userId: string): Promise<UpcomingRelease[]>;
  createUpcomingRelease(release: InsertUpcomingRelease): Promise<UpcomingRelease>;
  updateUpcomingRelease(id: number, updates: Partial<InsertUpcomingRelease>): Promise<UpcomingRelease>;

  // Release reminder methods
  getUserReminders(userId: string): Promise<ReleaseReminder[]>;
  createReleaseReminder(reminder: InsertReleaseReminder): Promise<ReleaseReminder>;
  updateReleaseReminder(id: number, userId: string, updates: Partial<InsertReleaseReminder>): Promise<ReleaseReminder>;
  deleteReleaseReminder(id: number, userId: string): Promise<void>;

  // Notification methods
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number, userId: string): Promise<void>;
  deleteNotification(id: number, userId: string): Promise<void>;

  // Sports methods
  getFollowedTeams(userId: string): Promise<any[]>;
  followTeam(userId: string, teamId: number): Promise<any>;
  unfollowTeam(userId: string, teamId: number): Promise<void>;
  getUserSportsPreferences(userId: string): Promise<UserSportsPreferences[]>;
  updateSportsPreferences(userId: string, preferences: Partial<InsertUserSportsPreferences>): Promise<UserSportsPreferences>;
  getGamesForFollowedTeams(userId: string, days?: number): Promise<any[]>;
  createSportsActivity(activity: InsertSportsActivity): Promise<SportsActivity>;

  // AI Recommendations methods
  getUserRecommendations(userId: string): Promise<AiRecommendation[]>;
  createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;
  updateRecommendationFeedback(id: number, userId: string, feedback: string): Promise<AiRecommendation>;
  markRecommendationAsViewed(id: number, userId: string): Promise<void>;
  markRecommendationAsInteracted(id: number, userId: string): Promise<void>;
  generatePersonalizedRecommendations(userId: string): Promise<AiRecommendation[]>;

  // Search Alerts methods
  getUserSearchAlerts(userId: string): Promise<SearchAlert[]>;
  createSearchAlert(alert: InsertSearchAlert): Promise<SearchAlert>;
  updateSearchAlert(id: number, userId: string, updates: Partial<InsertSearchAlert>): Promise<SearchAlert>;
  deleteSearchAlert(id: number, userId: string): Promise<void>;
  toggleSearchAlert(id: number, userId: string, isActive: boolean): Promise<SearchAlert>;
  processSearchAlerts(): Promise<void>;

  // User Preferences methods
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;

  // Streaming Integration methods
  getStreamingIntegration(userId: string, platform: string): Promise<StreamingIntegration | undefined>;
  getUserStreamingIntegrations(userId: string): Promise<StreamingIntegration[]>;
  createStreamingIntegration(integration: InsertStreamingIntegration): Promise<StreamingIntegration>;
  updateStreamingIntegration(id: number, updates: Partial<InsertStreamingIntegration>): Promise<StreamingIntegration>;
  deleteStreamingIntegration(id: number, userId: string): Promise<void>;

  // Viewing History methods
  getUserViewingHistory(userId: string, limit?: number): Promise<ViewingHistory[]>;
  createViewingHistory(history: InsertViewingHistory): Promise<ViewingHistory>;
  getShowByTitle(title: string): Promise<Show | undefined>;

  // User Behavior Tracking methods
  trackUserBehavior(behavior: InsertUserBehavior): Promise<UserBehavior>;
  getUserBehavior(userId: string, actionType?: string): Promise<UserBehavior[]>;

  // Recommendation Training methods
  createRecommendationTraining(training: InsertRecommendationTraining): Promise<RecommendationTraining>;
  getUserRecommendationTraining(userId: string): Promise<RecommendationTraining[]>;

  // Episode Progress methods
  createEpisodeProgress(progress: InsertEpisodeProgress): Promise<EpisodeProgress>;
  getEpisodeProgress(userId: string, showId: number): Promise<EpisodeProgress[]>;

  // Custom Lists methods
  getUserLists(userId: string): Promise<any[]>;
  createList(listData: any): Promise<any>;
  addShowToList(listId: number, showId: number, userId: string): Promise<void>;

  // Password Reset methods
  createPasswordResetToken(userId: string, token: string, expiresAt: number): Promise<void>;
  verifyPasswordResetToken(token: string): Promise<User | undefined>;
  clearPasswordResetToken(userId: string): Promise<void>;
  createPasswordResetCode(code: any): Promise<any>;
  verifyPasswordResetCode(code: string, email?: string, phoneNumber?: string): Promise<any>;
  clearPasswordResetCode(codeId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: UpsertUser): Promise<User> {
    console.log('Storage: Creating user with data:', JSON.stringify(insertUser, null, 2));

    try {
      // SQLite expects Unix timestamps (numbers), not Date objects
      const timestamp = Math.floor(Date.now() / 1000);

      const newUser = {
        ...insertUser,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const [user] = await db
        .insert(users)
        .values(newUser)
        .returning();
      console.log('Storage: User created successfully:', user.id, user.email);
      return user;
    } catch (error) {
      console.error('Storage: Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    // SQLite expects Unix timestamps (numbers), not Date objects
    const timestamp = Math.floor(Date.now() / 1000);

    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: timestamp })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    console.log('🔄 Storage: Upserting user with data:', JSON.stringify(user, null, 2));

    try {
      const timestamp = Math.floor(Date.now() / 1000);

      // Account merging strategy:
      // 1. Look for existing user by Firebase ID (exact ID match)
      // 2. If no ID match and user has email, look for existing user by email
      // 3. If found by email, merge the accounts (update the existing user with new auth provider info)
      // 4. If not found by either, create new user

      let existingUser: User | null = null;

      // Strategy 1: Look for exact ID match (for returning Firebase users)
      try {
        const foundUser = await this.getUser(user.id);
        if (foundUser) {
          existingUser = foundUser;
          console.log('📍 Found existing user by ID:', existingUser.id, existingUser.email);

          // Update existing user with any new information
          const [updatedUser] = await db
            .update(users)
            .set({
              email: user.email || existingUser.email, // Keep existing email if new one is null
              firstName: user.firstName || existingUser.firstName,
              lastName: user.lastName || existingUser.lastName,
              profileImageUrl: user.profileImageUrl || existingUser.profileImageUrl,
              authProvider: user.authProvider, // Update to current auth provider
              updatedAt: timestamp,
            })
            .where(eq(users.id, user.id))
            .returning();

          console.log('✅ Storage: User updated by ID:', updatedUser.id, updatedUser.email);
          return updatedUser;
        }
      } catch (error) {
        console.log('🔍 No existing user found by ID, checking by email...');
      }

      // Strategy 2: Look for user by email (for account merging)
      if (user.email && !existingUser) {
        const foundByEmail = await this.getUserByEmail(user.email);
        if (foundByEmail) {
          existingUser = foundByEmail;
          console.log('🔗 Found existing user by email - merging accounts:', existingUser.id, 'with', user.id);

          // This is account merging! Update the existing user with Firebase ID and other info
          const [updatedUser] = await db
            .update(users)
            .set({
              // Keep the original ID but update other fields
              firstName: user.firstName || existingUser.firstName,
              lastName: user.lastName || existingUser.lastName,
              profileImageUrl: user.profileImageUrl || existingUser.profileImageUrl,
              authProvider: user.authProvider, // Update to current auth provider
              updatedAt: timestamp,
            })
            .where(eq(users.email, user.email))
            .returning();

          console.log('✅ Storage: Accounts merged successfully:', updatedUser.id, updatedUser.email);
          return updatedUser;
        }
      }

      // Strategy 3: Create new user
      const newUser = {
        ...user,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      console.log('➕ Creating new user:', newUser);

      const [insertedUser] = await db
        .insert(users)
        .values(newUser)
        .returning();

      console.log('✅ Storage: New user created:', insertedUser.id, insertedUser.email);
      return insertedUser;
    } catch (error) {
      console.error('❌ Storage: Error upserting user:', error);
      throw error;
    }
  }

  // Show methods
  async getShow(id: number): Promise<Show | undefined> {
    const [show] = await db.select().from(shows).where(eq(shows.id, id));
    return show || undefined;
  }

  async getShowByTmdbId(tmdbId: number): Promise<Show | undefined> {
    const [show] = await db.select().from(shows).where(eq(shows.tmdbId, tmdbId));
    return show || undefined;
  }

  async createShow(insertShow: InsertShow): Promise<Show> {
    const [show] = await db
      .insert(shows)
      .values(insertShow)
      .returning();
    return show;
  }

  async upsertShow(show: InsertShow): Promise<Show> {
    const existingShow = await this.getShowByTmdbId(show.tmdbId);

    if (existingShow) {
      const [updatedShow] = await db
        .update(shows)
        .set(show)
        .where(eq(shows.tmdbId, show.tmdbId))
        .returning();
      return updatedShow;
    } else {
      return this.createShow(show);
    }
  }

  async getOrCreateShow(show: InsertShow): Promise<Show> {
    return this.upsertShow(show);
  }

  // Watchlist methods
  async getUserWatchlist(userId: string, status?: string): Promise<Watchlist[]> {
    let baseQuery = db
      .select()
      .from(watchlists)
      .leftJoin(shows, eq(watchlists.showId, shows.id))
      .where(eq(watchlists.userId, userId));

    if (status) {
      baseQuery = baseQuery.where(and(
        eq(watchlists.userId, userId),
        eq(watchlists.status, status as "want_to_watch" | "watching" | "finished" | "dropped")
      ));
    }

    const results = await baseQuery.orderBy(desc(watchlists.updatedAt));

    // Transform results to include show data
    return results.map(result => ({
      ...result.watchlists,
      show: result.shows
    })) as Watchlist[];
  }

  async addToWatchlist(watchlistItem: InsertWatchlist): Promise<Watchlist> {
    const [item] = await db
      .insert(watchlists)
      .values(watchlistItem)
      .returning();
    return item;
  }

  async updateWatchlistItem(id: number, userId: string, updates: Partial<InsertWatchlist>): Promise<Watchlist> {
    const [item] = await db
      .update(watchlists)
      .set(updates)
      .where(and(eq(watchlists.id, id), eq(watchlists.userId, userId)))
      .returning();
    return item;
  }

  async removeFromWatchlist(id: number, userId: string): Promise<void> {
    await db
      .delete(watchlists)
      .where(and(eq(watchlists.id, id), eq(watchlists.userId, userId)));
  }

  // Friend methods
  async getUserFriends(userId: string): Promise<User[]> {
    // Simple implementation - return empty array for now
    return [];
  }

  async sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    const [friendship] = await db
      .insert(friendships)
      .values({
        userId,
        friendId,
        status: "pending"
      })
      .returning();
    return friendship;
  }

  async getUserFriends(userId: string): Promise<Friend[]> {
    const friendshipsData = await db
      .select({
        id: friendships.id,
        userId: friendships.userId,
        friendId: friendships.friendId,
        status: friendships.status,
        createdAt: friendships.createdAt,
        friend: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
          username: users.username
        }
      })
      .from(friendships)
      .innerJoin(users, eq(users.id, friendships.friendId))
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.status, "accepted")
      ));

    return friendshipsData;
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const requests = await db
      .select({
        id: friendships.id,
        fromUserId: friendships.userId,
        toUserId: friendships.friendId,
        status: friendships.status,
        createdAt: friendships.createdAt,
        fromUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
          username: users.username
        }
      })
      .from(friendships)
      .innerJoin(users, eq(users.id, friendships.userId))
      .where(and(
        eq(friendships.friendId, userId),
        eq(friendships.status, "pending")
      ));

    return requests;
  }

  async acceptFriendRequest(requestId: number, userId: string): Promise<Friendship> {
    const [friendship] = await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(and(
        eq(friendships.id, requestId),
        eq(friendships.friendId, userId),
        eq(friendships.status, "pending")
      ))
      .returning();

    // Create the reciprocal friendship
    if (friendship) {
      await db
        .insert(friendships)
        .values({
          userId: friendship.friendId,
          friendId: friendship.userId,
          status: "accepted"
        })
        .onConflictDoNothing();
    }

    return friendship;
  }

  async rejectFriendRequest(requestId: number, userId: string): Promise<void> {
    await db
      .delete(friendships)
      .where(and(
        eq(friendships.id, requestId),
        eq(friendships.friendId, userId),
        eq(friendships.status, "pending")
      ));
  }

  async searchUsers(query: string): Promise<User[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(users)
      .where(
        or(
          sql`LOWER(${users.firstName}) LIKE ${searchTerm}`,
          sql`LOWER(${users.lastName}) LIKE ${searchTerm}`,
          sql`LOWER(${users.email}) LIKE ${searchTerm}`,
          sql`LOWER(${users.username}) LIKE ${searchTerm}`
        )
      )
      .limit(20);
  }

  async updateFriendship(id: number, userId: string, status: string): Promise<Friendship> {
    const [friendship] = await db
      .update(friendships)
      .set({ status: status as "pending" | "accepted" | "blocked" })
      .where(eq(friendships.id, id))
      .returning();
    return friendship;
  }

  // Activity methods
  async getActivityFeed(userId: string): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(50);
  }

  async getFriendActivities(friendIds: string[]): Promise<Activity[]> {
    if (friendIds.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(activities)
      .where(inArray(activities.userId, friendIds))
      .orderBy(desc(activities.createdAt))
      .limit(100);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async likeActivity(activityId: number, userId: string): Promise<ActivityLike> {
    const [like] = await db
      .insert(activityLikes)
      .values({
        activityId,
        userId
      })
      .returning();
    return like;
  }

  async unlikeActivity(activityId: number, userId: string): Promise<void> {
    await db
      .delete(activityLikes)
      .where(
        and(
          eq(activityLikes.activityId, activityId),
          eq(activityLikes.userId, userId)
        )
      );
  }

  async commentOnActivity(activityId: number, userId: string, content: string): Promise<ActivityComment> {
    const [comment] = await db
      .insert(activityComments)
      .values({
        activityId,
        userId,
        content
      })
      .returning();
    return comment;
  }

  // Recommendation methods  
  async getUserRecommendations(userId: string): Promise<AiRecommendation[]> {
    return await db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.userId, userId))
      .orderBy(desc(aiRecommendations.createdAt));
  }

  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    const [newRecommendation] = await db
      .insert(recommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }

  async generateRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      // First, clear existing recommendations for this user
      await db.delete(recommendations).where(eq(recommendations.userId, userId));

      console.log('Generating AI-powered recommendations for user:', userId);

      // Get comprehensive user preferences from onboarding
      const userPrefs = await this.getUserPreferences(userId);
      const favoriteGenres = userPrefs?.preferredGenres || [];
      const preferredNetworks = userPrefs?.preferredNetworks || [];
      const watchingHabits = userPrefs?.watchingHabits || [];
      const contentRating = userPrefs?.contentRating || 'All';
      const languagePreferences = userPrefs?.languagePreferences || ['English'];

      console.log('User onboarding preferences:', {
        favoriteGenres,
        preferredNetworks,
        watchingHabits,
        contentRating,
        languagePreferences
      });

      // Get user's viewing history and watchlist to avoid duplicates
      const viewingHistory = await this.getUserViewingHistory(userId, 100);
      const watchlist = await this.getUserWatchlist(userId);
      const watchedShowIds = viewingHistory.map(vh => vh.showId);
      const watchlistShowIds = watchlist.map(w => w.showId);
      const avoidShowIds = [...watchedShowIds, ...watchlistShowIds];

      console.log('User preferences:', { favoriteGenres, preferredNetworks, watchingHabits });
      console.log('Avoiding shows already in watchlist/history:', avoidShowIds.length);

      // Get trending shows from TMDB as potential recommendations
      const trendingResponse = await fetch(
        `https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.TMDB_API_KEY}&page=1`
      );
      const trendingData = await trendingResponse.json();
      const availableShows = trendingData.results || [];

      // Get dynamic recommendations from multiple sources
      const recommendationSources = [];

      // 1. Genre-based recommendations from TMDB
      if (favoriteGenres.length > 0) {
        // Map user preferences to TMDB genre IDs
        const genreMapping: Record<string, number> = {
          'Action': 10759, 'Adventure': 10759,
          'Comedy': 35, 'Drama': 18, 'Crime': 80,
          'Documentary': 99, 'Family': 10751,
          'Horror': 9648, 'Mystery': 9648,
          'Romance': 10749, 'Sci-Fi': 10765,
          'Thriller': 9648, 'Western': 37
        };

        for (const genre of favoriteGenres.slice(0, 2)) { // Limit to 2 genres
          const genreId = genreMapping[genre];
          if (genreId) {
            recommendationSources.push({
              type: 'genre',
              source: genre,
              genreId: genreId
            });
          }
        }
      }

      // 2. Similar shows based on viewing history
      if (viewingHistory.length > 0) {
        // Get the most recently watched shows
        const recentShows = viewingHistory.slice(0, 3);
        for (const viewedShow of recentShows) {
          if (viewedShow.showId != null) {
            const show = await this.getShow(viewedShow.showId);
            if (show?.tmdbId) {
              recommendationSources.push({
                type: 'similar',
                source: show.title,
                tmdbId: show.tmdbId
              });
            }
          }
        }
      }

      // 3. Fallback to trending content if no preferences
      if (recommendationSources.length === 0) {
        recommendationSources.push({
          type: 'trending',
          source: 'popular'
        });
      }

      const newRecommendations = [];
      const seenTmdbIds = new Set();

      // Process each recommendation source
      for (const source of recommendationSources) {
        try {
          let apiResults = [];

          if (source.type === 'genre') {
            // Get shows by genre from TMDB
            const response = await fetch(
              `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_API_KEY}&with_genres=${source.genreId}&sort_by=vote_average.desc&vote_count.gte=100&page=1`
            );
            const data = await response.json();
            apiResults = data.results || [];
          } else if (source.type === 'similar') {
            // Get similar shows from TMDB
            const response = await fetch(
              `https://api.themoviedb.org/3/tv/${source.tmdbId}/similar?api_key=${process.env.TMDB_API_KEY}&page=1`
            );
            const data = await response.json();
            apiResults = data.results || [];
          } else if (source.type === 'trending') {
            // Get trending shows from TMDB
            const response = await fetch(
              `https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.TMDB_API_KEY}&page=1`
            );
            const data = await response.json();
            apiResults = data.results || [];
          }

          // Process results from this source
          for (const tmdbShow of apiResults.slice(0, 3)) { // Limit per source
            if (seenTmdbIds.has(tmdbShow.id)) continue;
            seenTmdbIds.add(tmdbShow.id);

            // Check if show already exists in database
            let show = await this.getShowByTmdbId(tmdbShow.id);
            if (show && avoidShowIds.includes(show.id)) {
              continue; // Skip if already in user's watchlist/history
            }

            // Create or update show record
            if (!show) {
              show = await this.upsertShow({
                tmdbId: tmdbShow.id,
                title: tmdbShow.name || tmdbShow.title,
                overview: tmdbShow.overview,
                posterPath: tmdbShow.poster_path,
                backdropPath: tmdbShow.backdrop_path,
                firstAirDate: tmdbShow.first_air_date || tmdbShow.release_date,
                genres: tmdbShow.genre_ids ? tmdbShow.genre_ids.map(String) : [],
                status: 'Released'
              });
            }

            // Generate personalized reason
            let reason = 'Recommended for you';
            if (source.type === 'genre') {
              reason = `Because you like ${source.source}`;
            } else if (source.type === 'similar') {
              reason = `Similar to ${source.source}`;
            } else if (source.type === 'trending') {
              reason = 'Currently trending';
            }

            // Calculate score based on ratings and preferences
            let score = (tmdbShow.vote_average || 5) / 10;

            // Boost score for preferred genres
            if (tmdbShow.genre_ids && favoriteGenres.length > 0) {
              const genreMapping: Record<number, string> = {
                10759: 'Action', 35: 'Comedy', 18: 'Drama',
                80: 'Crime', 99: 'Documentary', 10751: 'Family',
                9648: 'Horror', 10749: 'Romance', 10765: 'Sci-Fi'
              };

              const showGenres = tmdbShow.genre_ids.map((id: number) => genreMapping[id]).filter(Boolean);
              const matchingGenres = showGenres.filter((g: string) => favoriteGenres.includes(g));
              if (matchingGenres.length > 0) {
                score = Math.min(1.0, score + 0.2); // Boost for genre match
              }
            }

            // Create recommendation
            const rec = await this.createRecommendation({
              userId,
              showId: show.id,
              reason,
              score: score.toFixed(2)
            });

            newRecommendations.push(rec);

            if (newRecommendations.length >= 8) break; // Limit total recommendations
          }

          if (newRecommendations.length >= 8) break;
        } catch (error) {
          console.error(`Error processing recommendation source ${source.type}:`, error);
        }
      }

      console.log(`Generated ${newRecommendations.length} dynamic recommendations for user ${userId}`);
      return newRecommendations;

    } catch (error) {
      console.error('Error generating dynamic recommendations:', error);
      return [];
    }
  }

  // Stats methods
  async getUserStats(userId: string): Promise<any> {
    try {
      // Get user's watchlist
      const watchlist = await this.getUserWatchlist(userId);

      const currentlyWatching = watchlist.filter(item => item.status === 'watching').length;
      const favorites = watchlist.filter(item => item.rating && parseFloat(item.rating) >= 4.5).length;
      const toWatch = watchlist.filter(item => item.status === 'want_to_watch').length;

      // Calculate hours watched based on episodes watched
      const hoursWatched = watchlist.reduce((total, item) => {
        // Assume 45 minutes per episode on average
        const episodeMinutes = (item.totalEpisodesWatched || 0) * 45;
        return total + Math.round(episodeMinutes / 60);
      }, 0);

      return {
        currentlyWatching,
        favorites,
        toWatch,
        hoursWatched,
        watchlistCount: watchlist.length,
        totalShows: watchlist.length,
        avgRating: watchlist.length > 0
          ? (watchlist
            .filter(item => item.rating)
            .reduce((sum, item) => sum + parseFloat(item.rating || '0'), 0) /
            watchlist.filter(item => item.rating).length) || 0
          : 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        currentlyWatching: 0,
        favorites: 0,
        toWatch: 0,
        hoursWatched: 0,
        watchlistCount: 0,
        totalShows: 0,
        avgRating: 0
      };
    }
  }

  // Upcoming releases methods
  async getUpcomingReleases(): Promise<UpcomingRelease[]> {
    const releases = await db
      .select()
      .from(upcomingReleases)
      .where(eq(upcomingReleases.releaseDate, new Date()))
      .orderBy(desc(upcomingReleases.releaseDate))
      .limit(50);
    return releases;
  }

  async getUpcomingReleasesForUser(userId: string): Promise<UpcomingRelease[]> {
    const userWatchlist = await db
      .select({ showId: watchlists.showId })
      .from(watchlists)
      .where(eq(watchlists.userId, userId));

    const watchlistShowIds = userWatchlist.map(w => w.showId);

    if (watchlistShowIds.length === 0) {
      return [];
    }

    const releases = await db
      .select()
      .from(upcomingReleases)
      .where(
        and(
          eq(upcomingReleases.showId, watchlistShowIds[0]), // Using first show for simplicity
          eq(upcomingReleases.releaseDate, new Date())
        )
      )
      .orderBy(desc(upcomingReleases.releaseDate));

    return releases;
  }

  async createUpcomingRelease(release: InsertUpcomingRelease): Promise<UpcomingRelease> {
    const [newRelease] = await db
      .insert(upcomingReleases)
      .values(release)
      .returning();
    return newRelease;
  }

  async updateUpcomingRelease(id: number, updates: Partial<InsertUpcomingRelease>): Promise<UpcomingRelease> {
    const [updatedRelease] = await db
      .update(upcomingReleases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(upcomingReleases.id, id))
      .returning();
    return updatedRelease;
  }

  // Release reminder methods
  async getUserReminders(userId: string): Promise<ReleaseReminder[]> {
    const reminders = await db
      .select()
      .from(releaseReminders)
      .where(eq(releaseReminders.userId, userId))
      .orderBy(desc(releaseReminders.triggerDate));
    return reminders;
  }

  async createReleaseReminder(reminder: InsertReleaseReminder): Promise<ReleaseReminder> {
    const [newReminder] = await db
      .insert(releaseReminders)
      .values(reminder)
      .returning();
    return newReminder;
  }

  async updateReleaseReminder(id: number, userId: string, updates: Partial<InsertReleaseReminder>): Promise<ReleaseReminder> {
    const [updatedReminder] = await db
      .update(releaseReminders)
      .set(updates)
      .where(
        and(
          eq(releaseReminders.id, id),
          eq(releaseReminders.userId, userId)
        )
      )
      .returning();
    return updatedReminder;
  }

  async deleteReleaseReminder(id: number, userId: string): Promise<void> {
    await db
      .delete(releaseReminders)
      .where(
        and(
          eq(releaseReminders.id, id),
          eq(releaseReminders.userId, userId)
        )
      );
  }

  // Notification methods
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return userNotifications;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, userId)
        )
      );
  }

  async deleteNotification(id: number, userId: string): Promise<void> {
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, userId)
        )
      );
  }

  // Streaming Integration methods
  async getStreamingIntegration(userId: string, platform: string): Promise<StreamingIntegration | undefined> {
    const [integration] = await db
      .select()
      .from(streamingIntegrations)
      .where(
        and(
          eq(streamingIntegrations.userId, userId),
          eq(streamingIntegrations.platform, platform)
        )
      );
    return integration || undefined;
  }

  async getUserStreamingIntegrations(userId: string): Promise<StreamingIntegration[]> {
    return await db
      .select()
      .from(streamingIntegrations)
      .where(eq(streamingIntegrations.userId, userId));
  }

  async createStreamingIntegration(integration: InsertStreamingIntegration): Promise<StreamingIntegration> {
    const [newIntegration] = await db
      .insert(streamingIntegrations)
      .values(integration)
      .returning();
    return newIntegration;
  }

  async updateStreamingIntegration(id: number, updates: Partial<InsertStreamingIntegration>): Promise<StreamingIntegration> {
    const [updatedIntegration] = await db
      .update(streamingIntegrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(streamingIntegrations.id, id))
      .returning();
    return updatedIntegration;
  }

  async deleteStreamingIntegration(id: number, userId: string): Promise<void> {
    await db
      .delete(streamingIntegrations)
      .where(
        and(
          eq(streamingIntegrations.id, id),
          eq(streamingIntegrations.userId, userId)
        )
      );
  }

  // Viewing History methods
  async getUserViewingHistory(userId: string, limit?: number): Promise<ViewingHistory[]> {
    const query = db
      .select()
      .from(viewingHistory)
      .where(eq(viewingHistory.userId, userId))
      .orderBy(desc(viewingHistory.watchedAt));

    if (limit) {
      query.limit(limit);
    }

    return await query;
  }

  async createViewingHistory(history: InsertViewingHistory): Promise<ViewingHistory> {
    const [newHistory] = await db
      .insert(viewingHistory)
      .values(history)
      .returning();
    return newHistory;
  }

  async getShowByTitle(title: string): Promise<Show | undefined> {
    const [show] = await db
      .select()
      .from(shows)
      .where(eq(shows.title, title));
    return show || undefined;
  }

  // User Behavior Tracking methods
  async trackUserBehavior(behavior: InsertUserBehavior): Promise<UserBehavior> {
    const [newBehavior] = await db
      .insert(userBehavior)
      .values(behavior)
      .returning();
    return newBehavior;
  }

  async getUserBehavior(userId: string, actionType?: string): Promise<UserBehavior[]> {
    const conditions = [eq(userBehavior.userId, userId)];
    if (actionType) {
      conditions.push(eq(userBehavior.actionType, actionType));
    }

    return await db
      .select()
      .from(userBehavior)
      .where(and(...conditions))
      .orderBy(desc(userBehavior.timestamp));
  }

  // Recommendation Training methods
  async createRecommendationTraining(training: InsertRecommendationTraining): Promise<RecommendationTraining> {
    const [newTraining] = await db
      .insert(recommendationTraining)
      .values(training)
      .returning();
    return newTraining;
  }

  async getUserRecommendationTraining(userId: string): Promise<RecommendationTraining[]> {
    return await db
      .select()
      .from(recommendationTraining)
      .where(eq(recommendationTraining.userId, userId))
      .orderBy(desc(recommendationTraining.createdAt));
  }

  // Friend discovery methods
  async searchUsers(query: string): Promise<User[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    const searchResults = await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.username, searchTerm),
          ilike(users.firstName, searchTerm),
          ilike(users.lastName, searchTerm),
          ilike(users.email, searchTerm)
        )
      )
      .limit(20);

    return searchResults;
  }

  async importContacts(userId: string, contacts: InsertContactImport[]): Promise<ContactImport[]> {
    const result = await db
      .insert(contactImports)
      .values(contacts)
      .returning();
    return result;
  }

  async getContactImports(userId: string): Promise<ContactImport[]> {
    const contacts = await db
      .select({
        id: contactImports.id,
        userId: contactImports.userId,
        contactEmail: contactImports.contactEmail,
        contactName: contactImports.contactName,
        contactPhone: contactImports.contactPhone,
        source: contactImports.source,
        isMatched: contactImports.isMatched,
        matchedUserId: contactImports.matchedUserId,
        createdAt: contactImports.createdAt,
        matchedUser: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(contactImports)
      .leftJoin(users, eq(contactImports.matchedUserId, users.id))
      .where(eq(contactImports.userId, userId))
      .orderBy(desc(contactImports.createdAt));

    return contacts.map(contact => ({
      ...contact,
      matchedUser: contact.matchedUser.id ? contact.matchedUser : undefined,
    }));
  }

  async matchContactsToUsers(userId: string): Promise<ContactImport[]> {
    // Find contacts that match existing users by email
    const unmatchedContacts = await db
      .select()
      .from(contactImports)
      .where(
        and(
          eq(contactImports.userId, userId),
          eq(contactImports.isMatched, false)
        )
      );

    const matchedContacts = [];

    for (const contact of unmatchedContacts) {
      const [matchedUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, contact.contactEmail))
        .limit(1);

      if (matchedUser) {
        const [updated] = await db
          .update(contactImports)
          .set({
            isMatched: true,
            matchedUserId: matchedUser.id,
          })
          .where(eq(contactImports.id, contact.id))
          .returning();

        matchedContacts.push(updated);
      }
    }

    return matchedContacts;
  }

  async getFriendSuggestions(userId: string): Promise<FriendSuggestion[]> {
    const suggestions = await db
      .select({
        id: friendSuggestions.id,
        suggestedUserId: friendSuggestions.suggestedUserId,
        suggestionType: friendSuggestions.suggestionType,
        mutualFriendCount: friendSuggestions.mutualFriendCount,
        confidence: friendSuggestions.confidence,
        reason: friendSuggestions.reason,
        isViewed: friendSuggestions.isViewed,
        isDismissed: friendSuggestions.isDismissed,
        createdAt: friendSuggestions.createdAt,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(friendSuggestions)
      .innerJoin(users, eq(friendSuggestions.suggestedUserId, users.id))
      .where(
        and(
          eq(friendSuggestions.userId, userId),
          eq(friendSuggestions.isDismissed, false)
        )
      )
      .orderBy(desc(friendSuggestions.confidence), desc(friendSuggestions.createdAt))
      .limit(50);

    return suggestions;
  }

  async createFriendSuggestion(suggestion: InsertFriendSuggestion): Promise<FriendSuggestion> {
    const [created] = await db
      .insert(friendSuggestions)
      .values(suggestion)
      .returning();
    return created;
  }

  async dismissFriendSuggestion(suggestionId: number): Promise<void> {
    await db
      .update(friendSuggestions)
      .set({ isDismissed: true })
      .where(eq(friendSuggestions.id, suggestionId));
  }

  async generateMutualFriendSuggestions(userId: string): Promise<FriendSuggestion[]> {
    // This is a simplified implementation
    // In a real app, you'd have more sophisticated algorithms

    // Generate suggestions based on contacts
    const matchedContacts = await db
      .select()
      .from(contactImports)
      .where(
        and(
          eq(contactImports.userId, userId),
          eq(contactImports.isMatched, true)
        )
      );

    const suggestions = [];

    for (const contact of matchedContacts) {
      if (contact.matchedUserId) {
        // Check if suggestion already exists or if they're already friends
        const [existingSuggestion] = await db
          .select()
          .from(friendSuggestions)
          .where(
            and(
              eq(friendSuggestions.userId, userId),
              eq(friendSuggestions.suggestedUserId, contact.matchedUserId)
            )
          )
          .limit(1);

        const [existingFriendship] = await db
          .select()
          .from(friendships)
          .where(
            and(
              eq(friendships.userId, userId),
              eq(friendships.friendId, contact.matchedUserId)
            )
          )
          .limit(1);

        if (!existingSuggestion && !existingFriendship) {
          const suggestion = await this.createFriendSuggestion({
            userId,
            suggestedUserId: contact.matchedUserId,
            suggestionType: "contacts",
            mutualFriendCount: 0,
            confidence: 0.8,
            reason: "Found in your contacts",
          });
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const [updatedPreferences] = await db
      .insert(userPreferences)
      .values({
        userId,
        ...preferences,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...preferences,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updatedPreferences;
  }

  // Episode Progress methods
  async createEpisodeProgress(progress: InsertEpisodeProgress): Promise<EpisodeProgress> {
    const [newProgress] = await db
      .insert(episodeProgress)
      .values(progress)
      .onConflictDoUpdate({
        target: [episodeProgress.userId, episodeProgress.showId, episodeProgress.seasonNumber, episodeProgress.episodeNumber],
        set: {
          watchedAt: new Date(),
          watchTimeMinutes: progress.watchTimeMinutes,
          isCompleted: progress.isCompleted,
          rating: progress.rating,
          notes: progress.notes
        }
      })
      .returning();
    return newProgress;
  }

  async getEpisodeProgress(userId: string, showId: number): Promise<EpisodeProgress[]> {
    return await db
      .select()
      .from(episodeProgress)
      .where(
        and(
          eq(episodeProgress.userId, userId),
          eq(episodeProgress.showId, showId)
        )
      )
      .orderBy(episodeProgress.seasonNumber, episodeProgress.episodeNumber);
  }

  // Custom Lists methods
  async getUserLists(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(customLists)
      .where(eq(customLists.userId, userId))
      .orderBy(customLists.createdAt);
  }

  async createList(listData: any): Promise<any> {
    const [newList] = await db
      .insert(customLists)
      .values({
        userId: listData.userId,
        name: listData.name,
        description: listData.description,
        isPublic: listData.isPublic,
        isCollaborative: listData.isCollaborative,
        tags: listData.tags || []
      })
      .returning();
    return newList;
  }

  async addShowToList(listId: number, showId: number, userId: string): Promise<void> {
    await db
      .insert(customListItems)
      .values({
        listId,
        showId,
        addedBy: userId
      })
      .onConflictDoNothing();
  }

  // Password Reset methods implementation
  async createPasswordResetToken(userId: string, token: string, expiresAt: number): Promise<void> {
    await db
      .update(users)
      .set({
        resetToken: token,
        resetTokenExpires: expiresAt,
        updatedAt: Math.floor(Date.now() / 1000)
      })
      .where(eq(users.id, userId));
  }

  async verifyPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetToken, token),
          sql`${users.resetTokenExpires} > ${Math.floor(Date.now() / 1000)}`
        )
      );
    return user || undefined;
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        resetToken: null,
        resetTokenExpires: null,
        updatedAt: Math.floor(Date.now() / 1000)
      })
      .where(eq(users.id, userId));
  }

  async createPasswordResetCode(code: any): Promise<any> {
    const [newCode] = await db
      .insert(passwordResetCodes)
      .values(code)
      .returning();
    return newCode;
  }

  async verifyPasswordResetCode(code: string, email?: string, phoneNumber?: string): Promise<any> {
    const conditions = [
      eq(passwordResetCodes.code, code),
      eq(passwordResetCodes.isUsed, 0),
      sql`${passwordResetCodes.expiresAt} > ${Math.floor(Date.now() / 1000)}`
    ];

    if (email) {
      conditions.push(eq(passwordResetCodes.email, email));
    }

    if (phoneNumber) {
      conditions.push(eq(passwordResetCodes.phoneNumber, phoneNumber));
    }

    const [resetCode] = await db
      .select()
      .from(passwordResetCodes)
      .where(and(...conditions));

    return resetCode || undefined;
  }

  async clearPasswordResetCode(codeId: number): Promise<void> {
    await db
      .update(passwordResetCodes)
      .set({ isUsed: 1 })
      .where(eq(passwordResetCodes.id, codeId));
  }

  // AI Recommendation feedback and interaction methods
  async markRecommendationAsViewed(id: number, userId: string): Promise<void> {
    await db
      .update(aiRecommendations)
      .set({
        isViewed: true,
        isInteracted: true
      })
      .where(and(
        eq(aiRecommendations.id, id),
        eq(aiRecommendations.userId, userId)
      ));
  }

  async markRecommendationAsInteracted(id: number, userId: string): Promise<void> {
    await db
      .update(aiRecommendations)
      .set({
        isInteracted: true
      })
      .where(and(
        eq(aiRecommendations.id, id),
        eq(aiRecommendations.userId, userId)
      ));
  }

  async updateRecommendationFeedback(id: number, userId: string, feedback: string): Promise<AiRecommendation> {
    const [updatedRec] = await db
      .update(aiRecommendations)
      .set({
        feedback,
        isInteracted: true
      })
      .where(and(
        eq(aiRecommendations.id, id),
        eq(aiRecommendations.userId, userId)
      ))
      .returning();

    return updatedRec;
  }

  async createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    const [newRecommendation] = await db
      .insert(aiRecommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }

  async generatePersonalizedRecommendations(userId: string): Promise<AiRecommendation[]> {
    // This would use ML algorithms to generate personalized recommendations
    // For now, return existing recommendations
    return await this.getUserRecommendations(userId);
  }
}

export const storage = new DatabaseStorage();