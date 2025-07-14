import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  unique,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  username: varchar("username").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phoneNumber: varchar("phone_number"), // For SMS notifications and password reset
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"), // For email authentication
  authProvider: varchar("auth_provider").default("replit"), // 'replit', 'email', 'facebook', 'google'
  facebookId: varchar("facebook_id"), // For Facebook authentication
  googleId: varchar("google_id"), // For Google authentication
  emailVerified: boolean("email_verified").default(false),
  resetToken: varchar("reset_token"), // For password reset
  resetTokenExpires: timestamp("reset_token_expires"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// TV Shows table
export const shows = pgTable("shows", {
  id: serial("id").primaryKey(),
  tmdbId: integer("tmdb_id").unique().notNull(),
  title: varchar("title").notNull(),
  overview: text("overview"),
  posterPath: varchar("poster_path"),
  backdropPath: varchar("backdrop_path"),
  firstAirDate: varchar("first_air_date"),
  genres: jsonb("genres").default([]),
  numberOfSeasons: integer("number_of_seasons"),
  numberOfEpisodes: integer("number_of_episodes"),
  status: varchar("status"),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Streaming platforms
export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  logoPath: varchar("logo_path"),
  color: varchar("color"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Show streaming availability
export const showPlatforms = pgTable(
  "show_platforms",
  {
    id: serial("id").primaryKey(),
    showId: integer("show_id").references(() => shows.id).notNull(),
    platformId: integer("platform_id").references(() => platforms.id).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    unique().on(table.showId, table.platformId),
  ]
);

// User watchlists
export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  showId: integer("show_id").references(() => shows.id).notNull(),
  status: varchar("status", { enum: ["want_to_watch", "watching", "finished", "dropped"] }).notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  currentSeason: integer("current_season").default(1),
  currentEpisode: integer("current_episode").default(1),
  totalEpisodesWatched: integer("total_episodes_watched").default(0),
  isPublic: boolean("is_public").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Friend connections
export const friendships = pgTable(
  "friendships",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    friendId: varchar("friend_id").references(() => users.id).notNull(),
    status: varchar("status", { enum: ["pending", "accepted", "blocked"] }).default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    unique().on(table.userId, table.friendId),
  ]
);

// Contact imports for friend discovery
export const contactImports = pgTable("contact_imports", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  contactEmail: varchar("contact_email").notNull(),
  contactName: varchar("contact_name"),
  contactPhone: varchar("contact_phone"),
  source: varchar("source").notNull(), // "manual", "google", "csv", "facebook", "instagram", "snapchat", "tiktok"
  isMatched: boolean("is_matched").default(false),
  matchedUserId: varchar("matched_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Social network connections for friend discovery
export const socialConnections = pgTable("social_connections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(), // "facebook", "instagram", "snapchat", "tiktok"
  socialId: varchar("social_id").notNull(), // Platform-specific user ID
  username: varchar("username"), // Platform username/handle
  displayName: varchar("display_name"), // Display name on platform
  profileUrl: varchar("profile_url"), // Profile URL
  accessToken: text("access_token"), // Encrypted access token for API calls
  refreshToken: text("refresh_token"), // Encrypted refresh token
  isActive: boolean("is_active").default(true),
  lastSynced: timestamp("last_synced"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.platform),
  unique().on(table.platform, table.socialId),
]);

// Friend suggestions based on mutual connections and contacts
export const friendSuggestions = pgTable("friend_suggestions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  suggestedUserId: varchar("suggested_user_id").notNull().references(() => users.id),
  suggestionType: varchar("suggestion_type").notNull(), // "mutual_friends", "contacts", "platform", "username_search"
  mutualFriendCount: integer("mutual_friend_count").default(0),
  confidence: real("confidence").default(0.5), // 0.0 to 1.0 confidence score
  reason: text("reason"), // Why this person was suggested
  isViewed: boolean("is_viewed").default(false),
  isDismissed: boolean("is_dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity feed
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  showId: integer("show_id").references(() => shows.id),
  activityType: varchar("activity_type", { 
    enum: ["added_to_watchlist", "finished_show", "rated_show", "updated_progress", "started_watching", "sent_invitation"] 
  }).notNull(),
  content: text("content"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity likes
export const activityLikes = pgTable(
  "activity_likes",
  {
    id: serial("id").primaryKey(),
    activityId: integer("activity_id").references(() => activities.id).notNull(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    unique().on(table.activityId, table.userId),
  ]
);

// Activity comments
export const activityComments = pgTable("activity_comments", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").references(() => activities.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recommendations
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  showId: integer("show_id").references(() => shows.id).notNull(),
  reason: varchar("reason"),
  score: decimal("score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Upcoming releases and season premieres
export const upcomingReleases = pgTable("upcoming_releases", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").references(() => shows.id).notNull(),
  seasonNumber: integer("season_number"),
  episodeNumber: integer("episode_number").default(1),
  releaseDate: timestamp("release_date").notNull(),
  releaseType: varchar("release_type", { 
    enum: ["season_premiere", "series_premiere", "season_finale", "special_episode", "movie"] 
  }).notNull(),
  title: varchar("title"),
  description: text("description"),
  isConfirmed: boolean("is_confirmed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User reminders for upcoming releases
export const releaseReminders = pgTable(
  "release_reminders",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    releaseId: integer("release_id").references(() => upcomingReleases.id).notNull(),
    reminderType: varchar("reminder_type", { 
      enum: ["day_before", "week_before", "on_release"] 
    }).notNull(),
    isTriggered: boolean("is_triggered").default(false),
    triggerDate: timestamp("trigger_date").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    unique().on(table.userId, table.releaseId, table.reminderType),
  ]
);

// Notifications for reminders and alerts
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type", { 
    enum: ["release_reminder", "friend_activity", "recommendation", "system", "sports_reminder"] 
  }).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  relatedId: integer("related_id"), // Can reference shows, releases, games, etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sports tables
export const sports = pgTable("sports", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(), // "NFL", "NBA", "MLB", "NHL", "Tennis"
  sportsDbId: varchar("sports_db_id").unique(), // TheSportsDB sport ID
  displayName: varchar("display_name").notNull(),
  icon: varchar("icon"), // Icon identifier
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  sportId: integer("sport_id").notNull().references(() => sports.id),
  sportsDbId: varchar("sports_db_id").unique(), // TheSportsDB team ID
  name: varchar("name").notNull(),
  city: varchar("city"),
  abbreviation: varchar("abbreviation"),
  logoUrl: varchar("logo_url"),
  primaryColor: varchar("primary_color"),
  secondaryColor: varchar("secondary_color"),
  conference: varchar("conference"), // AFC/NFC, Eastern/Western, etc.
  division: varchar("division"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  sportId: integer("sport_id").notNull().references(() => sports.id),
  sportsDbId: varchar("sports_db_id").unique(), // TheSportsDB event ID
  homeTeamId: integer("home_team_id").notNull().references(() => teams.id),
  awayTeamId: integer("away_team_id").notNull().references(() => teams.id),
  gameDate: timestamp("game_date").notNull(),
  gameTime: varchar("game_time"), // "8:00 PM EST"
  venue: varchar("venue"),
  season: varchar("season"), // "2024-2025", "2024"
  week: integer("week"), // For NFL
  gameType: varchar("game_type"), // "regular", "playoff", "championship"
  status: varchar("status").default("scheduled"), // "scheduled", "live", "finished", "postponed"
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  tvNetworks: text("tv_networks").array(), // ["ESPN", "Fox Sports"]
  streamingPlatforms: text("streaming_platforms").array(), // ["ESPN+", "Paramount+"]
  description: text("description"), // Game description or importance
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSportsPreferences = pgTable("user_sports_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sportId: integer("sport_id").notNull().references(() => sports.id),
  teamIds: integer("team_ids").array(), // Favorite teams
  notificationsEnabled: boolean("notifications_enabled").default(true),
  reminderMinutes: integer("reminder_minutes").default(60), // Remind X minutes before game
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sportsActivities = pgTable("sports_activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: integer("game_id").notNull().references(() => games.id),
  activityType: varchar("activity_type").notNull(), // "game_reminder", "team_follow", "game_watch"
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Recommendations and Search Alerts
export const searchAlerts = pgTable("search_alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(), // User-defined name for the alert
  searchQuery: varchar("search_query"), // Text search query
  genres: text("genres").array(), // Genre filters
  networks: text("networks").array(), // Network filters
  yearFrom: integer("year_from"),
  yearTo: integer("year_to"),
  minRating: real("min_rating"),
  maxRating: real("max_rating"),
  contentRatings: text("content_ratings").array(), // TV-MA, TV-14, PG-13, etc.
  languages: text("languages").array(), // Original language
  countries: text("countries").array(), // Production countries
  runtimeMin: integer("runtime_min"), // Minimum episode/movie length in minutes
  runtimeMax: integer("runtime_max"), // Maximum episode/movie length in minutes
  keywords: text("keywords").array(), // TMDB keywords
  withCompanies: text("with_companies").array(), // Production companies
  withPeople: text("with_people").array(), // Actors, directors, writers
  awards: text("awards").array(), // Emmy, Oscar, Golden Globe, etc.
  status: varchar("status"), // "returning", "ended", "cancelled", "in_production"
  mediaType: varchar("media_type").default("tv"), // "tv", "movie", "both"
  includeAdult: boolean("include_adult").default(false),
  trendingPeriod: varchar("trending_period"), // "day", "week", null for no trending filter
  sortBy: varchar("sort_by").default("popularity.desc"),
  isActive: boolean("is_active").default(true),
  notificationFrequency: varchar("notification_frequency").default("daily"), // "immediate", "daily", "weekly"
  lastChecked: timestamp("last_checked").defaultNow(),
  lastTriggered: timestamp("last_triggered"),
  resultsFound: integer("results_found").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  showId: integer("show_id").notNull().references(() => shows.id),
  score: real("score").notNull(), // AI confidence score 0-1
  reason: text("reason").notNull(), // Why this was recommended
  recommendationType: varchar("recommendation_type").notNull(), // "collaborative", "content_based", "trending", "similar_users"
  metadata: text("metadata"), // JSON with additional recommendation data
  isViewed: boolean("is_viewed").default(false),
  isInteracted: boolean("is_interacted").default(false), // User clicked, added to watchlist, etc.
  feedback: varchar("feedback"), // "liked", "disliked", "not_interested"
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  preferredGenres: text("preferred_genres").array(),
  preferredNetworks: text("preferred_networks").array(),
  watchingHabits: text("watching_habits"), // Viewing patterns as text
  contentRating: varchar("content_rating").default("All"), // "G", "PG", "PG-13", "R", "All"
  languagePreferences: text("language_preferences").array().default(["English"]),
  aiPersonality: varchar("ai_personality").default("balanced"), // "adventurous", "conservative", "balanced"
  notificationFrequency: varchar("notification_frequency").default("weekly"), // "daily", "weekly", "monthly"
  favoriteSports: text("favorite_sports").array().default([]), // "NFL", "NBA", "MLB", "NHL", "Tennis", "Soccer"
  favoriteTeams: text("favorite_teams").array().default([]), // Team names/IDs
  sportsNotifications: boolean("sports_notifications").default(true),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  watchlists: many(watchlists),
  activities: many(activities),
  friendships: many(friendships, { relationName: "user_friendships" }),
  friendOf: many(friendships, { relationName: "friend_friendships" }),
  recommendations: many(recommendations),
  activityLikes: many(activityLikes),
  activityComments: many(activityComments),
}));

export const showsRelations = relations(shows, ({ many }) => ({
  watchlists: many(watchlists),
  activities: many(activities),
  platforms: many(showPlatforms),
  recommendations: many(recommendations),
}));

export const watchlistsRelations = relations(watchlists, ({ one }) => ({
  user: one(users, {
    fields: [watchlists.userId],
    references: [users.id],
  }),
  show: one(shows, {
    fields: [watchlists.showId],
    references: [shows.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, {
    fields: [friendships.userId],
    references: [users.id],
    relationName: "user_friendships",
  }),
  friend: one(users, {
    fields: [friendships.friendId],
    references: [users.id],
    relationName: "friend_friendships",
  }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  show: one(shows, {
    fields: [activities.showId],
    references: [shows.id],
  }),
  likes: many(activityLikes),
  comments: many(activityComments),
}));

export const activityLikesRelations = relations(activityLikes, ({ one }) => ({
  activity: one(activities, {
    fields: [activityLikes.activityId],
    references: [activities.id],
  }),
  user: one(users, {
    fields: [activityLikes.userId],
    references: [users.id],
  }),
}));

export const activityCommentsRelations = relations(activityComments, ({ one }) => ({
  activity: one(activities, {
    fields: [activityComments.activityId],
    references: [activities.id],
  }),
  user: one(users, {
    fields: [activityComments.userId],
    references: [users.id],
  }),
}));

export const platformsRelations = relations(platforms, ({ many }) => ({
  shows: many(showPlatforms),
}));

export const showPlatformsRelations = relations(showPlatforms, ({ one }) => ({
  show: one(shows, {
    fields: [showPlatforms.showId],
    references: [shows.id],
  }),
  platform: one(platforms, {
    fields: [showPlatforms.platformId],
    references: [platforms.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  user: one(users, {
    fields: [recommendations.userId],
    references: [users.id],
  }),
  show: one(shows, {
    fields: [recommendations.showId],
    references: [shows.id],
  }),
}));

export const upcomingReleasesRelations = relations(upcomingReleases, ({ one, many }) => ({
  show: one(shows, {
    fields: [upcomingReleases.showId],
    references: [shows.id],
  }),
  reminders: many(releaseReminders),
}));

export const releaseRemindersRelations = relations(releaseReminders, ({ one }) => ({
  user: one(users, {
    fields: [releaseReminders.userId],
    references: [users.id],
  }),
  release: one(upcomingReleases, {
    fields: [releaseReminders.releaseId],
    references: [upcomingReleases.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Sports relations
export const sportsRelations = relations(sports, ({ many }) => ({
  teams: many(teams),
  games: many(games),
  userPreferences: many(userSportsPreferences),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  sport: one(sports, {
    fields: [teams.sportId],
    references: [sports.id],
  }),
  homeGames: many(games, { relationName: "home_team" }),
  awayGames: many(games, { relationName: "away_team" }),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  sport: one(sports, {
    fields: [games.sportId],
    references: [sports.id],
  }),
  homeTeam: one(teams, {
    fields: [games.homeTeamId],
    references: [teams.id],
    relationName: "home_team",
  }),
  awayTeam: one(teams, {
    fields: [games.awayTeamId],
    references: [teams.id],
    relationName: "away_team",
  }),
  sportsActivities: many(sportsActivities),
}));

export const userSportsPreferencesRelations = relations(userSportsPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userSportsPreferences.userId],
    references: [users.id],
  }),
  sport: one(sports, {
    fields: [userSportsPreferences.sportId],
    references: [sports.id],
  }),
}));

export const sportsActivitiesRelations = relations(sportsActivities, ({ one }) => ({
  user: one(users, {
    fields: [sportsActivities.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [sportsActivities.gameId],
    references: [games.id],
  }),
}));

// AI and Search Alert relations
export const searchAlertsRelations = relations(searchAlerts, ({ one }) => ({
  user: one(users, {
    fields: [searchAlerts.userId],
    references: [users.id],
  }),
}));

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [aiRecommendations.userId],
    references: [users.id],
  }),
  show: one(shows, {
    fields: [aiRecommendations.showId],
    references: [shows.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertShowSchema = createInsertSchema(shows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLikeSchema = createInsertSchema(activityLikes).omit({
  id: true,
  createdAt: true,
});

export const insertActivityCommentSchema = createInsertSchema(activityComments).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformSchema = createInsertSchema(platforms).omit({
  id: true,
  createdAt: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export const insertUpcomingReleaseSchema = createInsertSchema(upcomingReleases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReleaseReminderSchema = createInsertSchema(releaseReminders).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Sports insert schemas
export const insertSportSchema = createInsertSchema(sports).omit({
  id: true,
  createdAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSportsPreferencesSchema = createInsertSchema(userSportsPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSportsActivitySchema = createInsertSchema(sportsActivities).omit({
  id: true,
  createdAt: true,
});

// AI and Search Alert schemas
export const insertSearchAlertSchema = createInsertSchema(searchAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastChecked: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  updatedAt: true,
});

// Streaming Platform Integrations
export const streamingIntegrations = pgTable("streaming_integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform").notNull(), // 'netflix', 'hulu', 'disney_plus', 'amazon_prime', etc.
  accessToken: text("access_token"), // Encrypted OAuth token
  refreshToken: text("refresh_token"), // Encrypted refresh token
  tokenExpires: timestamp("token_expires"),
  isActive: boolean("is_active").default(true),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.platform) // One integration per platform per user
]);

// User Viewing History (imported from streaming platforms)
export const viewingHistory = pgTable("viewing_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  showId: integer("show_id").references(() => shows.id, { onDelete: "cascade" }),
  platform: varchar("platform").notNull(), // Source platform
  watchedAt: timestamp("watched_at").notNull(),
  watchDuration: integer("watch_duration"), // In minutes
  totalDuration: integer("total_duration"), // Total episode/movie length
  completionPercentage: real("completion_percentage"), // 0.0 to 1.0
  episodeNumber: integer("episode_number"),
  seasonNumber: integer("season_number"),
  userRating: real("user_rating"), // If platform provides user ratings
  platformData: jsonb("platform_data"), // Raw data from platform
  createdAt: timestamp("created_at").defaultNow(),
});

// User Behavior Tracking (internal BingeBoard activity)
export const userBehavior = pgTable("user_behavior", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  actionType: varchar("action_type").notNull(), // 'watchlist_add', 'watch_now_click', 'recommendation_view', 'search', etc.
  targetType: varchar("target_type").notNull(), // 'show', 'recommendation', 'search_result'
  targetId: integer("target_id"), // ID of the target (show, recommendation, etc.)
  metadata: jsonb("metadata"), // Additional context (platform clicked, search terms, etc.)
  sessionId: varchar("session_id"), // Track user session
  timestamp: timestamp("timestamp").defaultNow(),
});

// ML Training Data for Recommendations
export const recommendationTraining = pgTable("recommendation_training", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  showId: integer("show_id").notNull().references(() => shows.id, { onDelete: "cascade" }),
  interactionType: varchar("interaction_type").notNull(), // 'positive', 'negative', 'neutral'
  interactionScore: real("interaction_score"), // 0.0 to 1.0 confidence score
  features: jsonb("features"), // Show features (genres, rating, year, etc.)
  context: jsonb("context"), // User context when interaction occurred
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform API Configurations
export const platformConfigs = pgTable("platform_configs", {
  id: serial("id").primaryKey(),
  platform: varchar("platform").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  apiEndpoint: varchar("api_endpoint"),
  authType: varchar("auth_type").notNull(), // 'oauth2', 'api_key', 'manual'
  clientId: varchar("client_id"), // OAuth client ID
  scopes: jsonb("scopes"), // Required OAuth scopes
  isActive: boolean("is_active").default(true),
  rateLimitPerHour: integer("rate_limit_per_hour").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for new tables
export const insertStreamingIntegrationSchema = createInsertSchema(streamingIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertViewingHistorySchema = createInsertSchema(viewingHistory).omit({
  id: true,
  createdAt: true,
});

export const insertUserBehaviorSchema = createInsertSchema(userBehavior).omit({
  id: true,
  timestamp: true,
});

export const insertRecommendationTrainingSchema = createInsertSchema(recommendationTraining).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformConfigSchema = createInsertSchema(platformConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Custom Lists for user-created collections
export const customLists = pgTable("custom_lists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  isCollaborative: boolean("is_collaborative").default(false),
  coverImageUrl: varchar("cover_image_url"),
  tags: jsonb("tags").$type<string[]>().default([]),
  shareCode: varchar("share_code").unique(), // For sharing via URL/QR codes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom List Items - shows added to custom lists
export const customListItems = pgTable("custom_list_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull().references(() => customLists.id, { onDelete: "cascade" }),
  showId: integer("show_id").notNull().references(() => shows.id, { onDelete: "cascade" }),
  addedBy: varchar("added_by").notNull().references(() => users.id),
  order: integer("order").default(0), // For custom ordering
  notes: text("notes"), // Personal notes about why this show is in the list
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.listId, table.showId),
]);

// Custom List Collaborators - users who can edit collaborative lists
export const customListCollaborators = pgTable("custom_list_collaborators", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull().references(() => customLists.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { enum: ["owner", "editor", "viewer"] }).default("viewer"),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.listId, table.userId),
]);

// Enhanced viewing stats and achievements
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  totalHoursWatched: integer("total_hours_watched").default(0),
  totalShowsCompleted: integer("total_shows_completed").default(0),
  currentBingeStreak: integer("current_binge_streak").default(0),
  longestBingeStreak: integer("longest_binge_streak").default(0),
  favoriteGenres: jsonb("favorite_genres").$type<string[]>().default([]),
  personalityType: varchar("personality_type"), // e.g., "Sci-Fi Explorer", "Reality Show Superfan"
  achievements: jsonb("achievements").$type<string[]>().default([]), // Badge IDs earned
  lastWatchedDate: timestamp("last_watched_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Episode Progress Tracking (detailed tracking beyond basic watchlist)
export const episodeProgress = pgTable("episode_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  showId: integer("show_id").notNull().references(() => shows.id, { onDelete: "cascade" }),
  seasonNumber: integer("season_number").notNull(),
  episodeNumber: integer("episode_number").notNull(),
  watchedAt: timestamp("watched_at").defaultNow(),
  watchTimeMinutes: integer("watch_time_minutes"), // How long they actually watched
  isCompleted: boolean("is_completed").default(true),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.showId, table.seasonNumber, table.episodeNumber),
]);

// Insert schemas for new tables
export const insertCustomListSchema = createInsertSchema(customLists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomListItemSchema = createInsertSchema(customListItems).omit({
  id: true,
  createdAt: true,
});

export const insertCustomListCollaboratorSchema = createInsertSchema(customListCollaborators).omit({
  id: true,
  createdAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});

export const insertEpisodeProgressSchema = createInsertSchema(episodeProgress).omit({
  id: true,
  createdAt: true,
});

// FCM token storage for push notifications
export const fcmTokens = pgTable("fcm_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  platform: varchar("platform").notNull(), // "web", "android", "ios"
  deviceInfo: jsonb("device_info"), // Browser/device details
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  episodeReleases: boolean("episode_releases").default(true),
  friendActivity: boolean("friend_activity").default(true),
  recommendations: boolean("recommendations").default(true),
  watchParties: boolean("watch_parties").default(true),
  systemUpdates: boolean("system_updates").default(false),
  emailNotifications: boolean("email_notifications").default(false),
  pushNotifications: boolean("push_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification history/logs
export const notificationHistory = pgTable("notification_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  body: text("body").notNull(),
  type: varchar("type").notNull(), // "episode_release", "friend_activity", etc.
  status: varchar("status").notNull().default("sent"), // "sent", "delivered", "failed"
  platform: varchar("platform").notNull(), // "web", "android", "ios"
  metadata: jsonb("metadata"), // Additional notification data
  sentAt: timestamp("sent_at").defaultNow(),
});

// Insert schemas for FCM tables
export const insertFcmTokenSchema = createInsertSchema(fcmTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationHistorySchema = createInsertSchema(notificationHistory).omit({
  id: true,
  sentAt: true,
});

// Additional insert schemas that were missing
export const insertContactImportSchema = createInsertSchema(contactImports).omit({
  id: true,
  createdAt: true,
});

export const insertFriendSuggestionSchema = createInsertSchema(friendSuggestions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Show = typeof shows.$inferSelect;
export type InsertShow = z.infer<typeof insertShowSchema>;
export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type ContactImport = typeof contactImports.$inferSelect;
export type InsertContactImport = z.infer<typeof insertContactImportSchema>;
export type FriendSuggestion = typeof friendSuggestions.$inferSelect;
export type InsertFriendSuggestion = z.infer<typeof insertFriendSuggestionSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type ActivityLike = typeof activityLikes.$inferSelect;
export type InsertActivityLike = z.infer<typeof insertActivityLikeSchema>;
export type ActivityComment = typeof activityComments.$inferSelect;
export type InsertActivityComment = z.infer<typeof insertActivityCommentSchema>;
export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type UpcomingRelease = typeof upcomingReleases.$inferSelect;
export type InsertUpcomingRelease = z.infer<typeof insertUpcomingReleaseSchema>;
export type ReleaseReminder = typeof releaseReminders.$inferSelect;
export type InsertReleaseReminder = z.infer<typeof insertReleaseReminderSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Sports types
export type Sport = typeof sports.$inferSelect;
export type InsertSport = z.infer<typeof insertSportSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type UserSportsPreferences = typeof userSportsPreferences.$inferSelect;
export type InsertUserSportsPreferences = z.infer<typeof insertUserSportsPreferencesSchema>;
export type SportsActivity = typeof sportsActivities.$inferSelect;
export type InsertSportsActivity = z.infer<typeof insertSportsActivitySchema>;

// AI and Search Alert types
export type SearchAlert = typeof searchAlerts.$inferSelect;
export type InsertSearchAlert = z.infer<typeof insertSearchAlertSchema>;
export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

// Streaming Integration types
export type StreamingIntegration = typeof streamingIntegrations.$inferSelect;
export type InsertStreamingIntegration = z.infer<typeof insertStreamingIntegrationSchema>;
export type ViewingHistory = typeof viewingHistory.$inferSelect;
export type InsertViewingHistory = z.infer<typeof insertViewingHistorySchema>;
export type UserBehavior = typeof userBehavior.$inferSelect;
export type InsertUserBehavior = z.infer<typeof insertUserBehaviorSchema>;
export type RecommendationTraining = typeof recommendationTraining.$inferSelect;
export type InsertRecommendationTraining = z.infer<typeof insertRecommendationTrainingSchema>;
export type PlatformConfig = typeof platformConfigs.$inferSelect;
export type InsertPlatformConfig = z.infer<typeof insertPlatformConfigSchema>;

// Custom Lists types
export type CustomList = typeof customLists.$inferSelect;
export type InsertCustomList = z.infer<typeof insertCustomListSchema>;
export type CustomListItem = typeof customListItems.$inferSelect;
export type InsertCustomListItem = z.infer<typeof insertCustomListItemSchema>;
export type CustomListCollaborator = typeof customListCollaborators.$inferSelect;
export type InsertCustomListCollaborator = z.infer<typeof insertCustomListCollaboratorSchema>;

// Enhanced stats types
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type EpisodeProgress = typeof episodeProgress.$inferSelect;
export type InsertEpisodeProgress = z.infer<typeof insertEpisodeProgressSchema>;

// FCM and Notification types
export type FcmToken = typeof fcmTokens.$inferSelect;
export type InsertFcmToken = z.infer<typeof insertFcmTokenSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type NotificationHistory = typeof notificationHistory.$inferSelect;
export type InsertNotificationHistory = z.infer<typeof insertNotificationHistorySchema>;

// Social connections schema exports
export const insertSocialConnectionSchema = createInsertSchema(socialConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SocialConnection = typeof socialConnections.$inferSelect;
export type InsertSocialConnection = z.infer<typeof insertSocialConnectionSchema>;

// Additional types for friend functionality
export type Friend = {
  id: number;
  userId: string;
  friendId: string;
  status: 'accepted';
  createdAt: string;
  friend?: User;
};

export type FriendRequest = {
  id: number;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  fromUser?: User;
  toUser?: User;
};
