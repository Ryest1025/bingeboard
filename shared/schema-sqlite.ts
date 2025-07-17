import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
<<<<<<< HEAD
import { z } from "zod";

// Session storage table (required for Express sessions)
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // JSON as text in SQLite
    expire: integer("expire").notNull(), // Unix timestamp
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Firebase Auth)
=======

// User storage table
>>>>>>> ad00a93 (🚀 Major Mobile-First Redesign & Persistent Navigation Implementation)
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email"),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
<<<<<<< HEAD
  phoneNumber: text("phone_number"), // For SMS notifications and password reset
  profileImageUrl: text("profile_image_url"),
  passwordHash: text("password_hash"), // For email authentication
  authProvider: text("auth_provider").default("firebase"), // 'firebase', 'email', 'facebook', 'google'
  facebookId: text("facebook_id"), // For Facebook authentication
  googleId: text("google_id"), // For Google authentication
  emailVerified: integer("email_verified").default(0), // Boolean as int in SQLite
  resetToken: text("reset_token"), // For password reset
  resetTokenExpires: integer("reset_token_expires"), // Unix timestamp
  onboardingCompleted: integer("onboarding_completed").default(0), // Boolean as int
  createdAt: integer("created_at"), // Unix timestamp
  updatedAt: integer("updated_at"), // Unix timestamp
=======
  phoneNumber: text("phone_number"),
  profileImageUrl: text("profile_image_url"),
  passwordHash: text("password_hash"),
  authProvider: text("auth_provider").default("firebase"),
  facebookId: text("facebook_id"),
  googleId: text("google_id"),
  emailVerified: integer("email_verified").default(0),
  resetToken: text("reset_token"),
  resetTokenExpires: integer("reset_token_expires"),
  onboardingCompleted: integer("onboarding_completed").default(0),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
>>>>>>> ad00a93 (🚀 Major Mobile-First Redesign & Persistent Navigation Implementation)
});

// TV Shows table
export const shows = sqliteTable("shows", {
  id: integer("id").primaryKey(),
  tmdbId: integer("tmdb_id").unique(),
  imdbId: text("imdb_id"),
  title: text("title").notNull(),
  originalTitle: text("original_title"),
  overview: text("overview"),
  posterPath: text("poster_path"),
  backdropPath: text("backdrop_path"),
  firstAirDate: text("first_air_date"),
  lastAirDate: text("last_air_date"),
  status: text("status"),
  type: text("type"),
  genres: text("genres"), // JSON as text
  networks: text("networks"), // JSON as text
  productionCompanies: text("production_companies"), // JSON as text
  originCountry: text("origin_country"), // JSON as text
  originalLanguage: text("original_language"),
  popularity: real("popularity"),
  voteAverage: real("vote_average"),
  voteCount: integer("vote_count"),
  numberOfSeasons: integer("number_of_seasons"),
  numberOfEpisodes: integer("number_of_episodes"),
  episodeRunTime: text("episode_run_time"), // JSON as text
  inProduction: integer("in_production"), // Boolean as int
  languages: text("languages"), // JSON as text
  homepage: text("homepage"),
  tagline: text("tagline"),
  adult: integer("adult"), // Boolean as int
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});

// Movies table
export const movies = sqliteTable("movies", {
  id: integer("id").primaryKey(),
  tmdbId: integer("tmdb_id").unique(),
  imdbId: text("imdb_id"),
  title: text("title").notNull(),
  originalTitle: text("original_title"),
  overview: text("overview"),
  posterPath: text("poster_path"),
  backdropPath: text("backdrop_path"),
  releaseDate: text("release_date"),
  runtime: integer("runtime"),
  status: text("status"),
  genres: text("genres"), // JSON as text
  productionCompanies: text("production_companies"), // JSON as text
  productionCountries: text("production_countries"), // JSON as text
  spokenLanguages: text("spoken_languages"), // JSON as text
  originalLanguage: text("original_language"),
  popularity: real("popularity"),
  voteAverage: real("vote_average"),
  voteCount: integer("vote_count"),
  budget: integer("budget"),
  revenue: integer("revenue"),
  homepage: text("homepage"),
  tagline: text("tagline"),
  adult: integer("adult"), // Boolean as int
  belongsToCollection: text("belongs_to_collection"), // JSON as text
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});

// User watch history
export const watchHistory = sqliteTable("watch_history", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  contentType: text("content_type").notNull(), // 'movie' or 'tv'
  contentId: integer("content_id").notNull(), // tmdb_id
  watchedAt: integer("watched_at").notNull(),
  rating: integer("rating"), // 1-10
  review: text("review"),
  progress: real("progress").default(0), // 0-1 percentage
  completed: integer("completed").default(0), // Boolean as int
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});

// User watchlist
export const watchlist = sqliteTable("watchlist", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  contentType: text("content_type").notNull(), // 'movie' or 'tv'
  contentId: integer("content_id").notNull(), // tmdb_id
  status: text("status").default("plan_to_watch"), // 'watching', 'completed', 'plan_to_watch', 'dropped', 'on_hold'
  priority: integer("priority").default(0), // 1-5
  notes: text("notes"),
  addedAt: integer("added_at").notNull(),
  startedAt: integer("started_at"),
  completedAt: integer("completed_at"),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});

// User preferences
export const userPreferences = sqliteTable("user_preferences", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  preferredGenres: text("preferred_genres"), // JSON as text
  excludedGenres: text("excluded_genres"), // JSON as text
  preferredLanguages: text("preferred_languages"), // JSON as text
  adultContent: integer("adult_content").default(0), // Boolean as int
  notificationSettings: text("notification_settings"), // JSON as text
  privacySettings: text("privacy_settings"), // JSON as text
<<<<<<< HEAD
=======
  preferredNetworks: text("preferred_networks"), // JSON as text
  watchingHabits: text("watching_habits"), // JSON as text
  contentRating: text("content_rating").default("All"),
  languagePreferences: text("language_preferences"), // JSON as text
  aiPersonality: text("ai_personality").default("balanced"),
  notificationFrequency: text("notification_frequency").default("weekly"),
  favoriteSports: text("favorite_sports"), // JSON as text
  favoriteTeams: text("favorite_teams"), // JSON as text
  sportsNotifications: integer("sports_notifications").default(1), // Boolean as int
  onboardingCompleted: integer("onboarding_completed").default(0), // Boolean as int
>>>>>>> ad00a93 (🚀 Major Mobile-First Redesign & Persistent Navigation Implementation)
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});

<<<<<<< HEAD
// Password reset codes table (for SMS/email codes)
=======
// Sessions table
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // JSON as text in SQLite
    expire: integer("expire").notNull(), // Unix timestamp
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Password reset codes table
>>>>>>> ad00a93 (🚀 Major Mobile-First Redesign & Persistent Navigation Implementation)
export const passwordResetCodes = sqliteTable("password_reset_codes", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  code: text("code").notNull(), // 6-digit code
  email: text("email"), // For email delivery
  phoneNumber: text("phone_number"), // For SMS delivery  
  deliveryMethod: text("delivery_method").notNull(), // 'email' or 'sms'
  isUsed: integer("is_used").default(0), // Boolean as int
  expiresAt: integer("expires_at").notNull(), // Unix timestamp
  createdAt: integer("created_at").notNull(), // Unix timestamp
});

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertWatchHistorySchema = createInsertSchema(watchHistory);
export const insertWatchlistSchema = createInsertSchema(watchlist);
export const insertUserPreferencesSchema = createInsertSchema(userPreferences);
export const insertPasswordResetCodeSchema = createInsertSchema(passwordResetCodes);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type WatchHistory = typeof watchHistory.$inferSelect;
export type NewWatchHistory = typeof watchHistory.$inferInsert;
export type Watchlist = typeof watchlist.$inferSelect;
export type NewWatchlist = typeof watchlist.$inferInsert;
<<<<<<< HEAD
export type PasswordResetCode = typeof passwordResetCodes.$inferSelect;
export type NewPasswordResetCode = typeof passwordResetCodes.$inferInsert;
=======
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
export type PasswordResetCode = typeof passwordResetCodes.$inferSelect;
export type NewPasswordResetCode = typeof passwordResetCodes.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  watchHistory: many(watchHistory),
  watchlist: many(watchlist),
  preferences: many(userPreferences),
}));

export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, {
    fields: [watchHistory.userId],
    references: [users.id],
  }),
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, {
    fields: [watchlist.userId],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));
>>>>>>> ad00a93 (🚀 Major Mobile-First Redesign & Persistent Navigation Implementation)
