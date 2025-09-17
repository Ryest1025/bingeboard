import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === Tables ===

// Session storage table (required for Express sessions)
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: integer("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Firebase Auth)
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email"),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
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
  genres: text("genres"),
  networks: text("networks"),
  productionCompanies: text("production_companies"),
  originCountry: text("origin_country"),
  originalLanguage: text("original_language"),
  popularity: real("popularity"),
  voteAverage: real("vote_average"),
  voteCount: integer("vote_count"),
  numberOfSeasons: integer("number_of_seasons"),
  numberOfEpisodes: integer("number_of_episodes"),
  episodeRunTime: text("episode_run_time"),
  inProduction: integer("in_production"),
  languages: text("languages"),
  homepage: text("homepage"),
  tagline: text("tagline"),
  adult: integer("adult"),
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
  genres: text("genres"),
  productionCompanies: text("production_companies"),
  productionCountries: text("production_countries"),
  spokenLanguages: text("spoken_languages"),
  originalLanguage: text("original_language"),
  popularity: real("popularity"),
  voteAverage: real("vote_average"),
  voteCount: integer("vote_count"),
  budget: integer("budget"),
  revenue: integer("revenue"),
  homepage: text("homepage"),
  tagline: text("tagline"),
  adult: integer("adult"),
  belongsToCollection: text("belongs_to_collection"),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});

// User watch history
export const watchHistory = sqliteTable("watch_history", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  contentType: text("content_type").notNull(),
  contentId: integer("content_id").notNull(),
  watchedAt: integer("watched_at").notNull(),
  rating: integer("rating"),
  review: text("review"),
  progress: real("progress").default(0),
  completed: integer("completed").default(0),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});

// User watchlist
export const watchlist = sqliteTable("watchlist", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  contentType: text("content_type").notNull(),
  contentId: integer("content_id").notNull(),
  status: text("status").default("plan_to_watch"),
  priority: integer("priority").default(0),
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
  preferredGenres: text("preferred_genres"),
  excludedGenres: text("excluded_genres"),
  preferredLanguages: text("preferred_languages"),
  adultContent: integer("adult_content").default(0),
  notificationSettings: text("notification_settings"),
  privacySettings: text("privacy_settings"),
  onboardingCompleted: integer("onboarding_completed").default(0),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});

// Password reset codes table
export const passwordResetCodes = sqliteTable("password_reset_codes", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  code: text("code").notNull(),
  email: text("email"),
  phoneNumber: text("phone_number"),
  deliveryMethod: text("delivery_method").notNull(),
  isUsed: integer("is_used").default(0),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

// Awards table for tracking award winners and nominees
export const awards = sqliteTable("awards", {
  id: integer("id").primaryKey(),
  showId: integer("show_id").notNull(),
  movieId: integer("movie_id"), // For movie awards
  ceremony: text("ceremony").notNull(), // 'Oscar', 'Emmy', 'Golden Globe', 'SAG', 'Critics Choice', etc.
  category: text("category").notNull(), // 'Best Picture', 'Best Drama Series', 'Best Actor', etc.
  year: integer("year").notNull(), // Award year (ceremony year, not eligibility year)
  isWinner: integer("is_winner").default(0), // 1 if won, 0 if just nominated
  personName: text("person_name"), // Actor/director name if person-specific award
  description: text("description"), // Additional context about the award
  awardDate: integer("award_date"), // Actual ceremony date timestamp for seasonal weighting
  importance: integer("importance").default(5), // 1-10 scale, higher = more prestigious
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
}, (table) => [
  // Index for efficient filtering by ceremony and year
  index("idx_awards_ceremony_year").on(table.ceremony, table.year),
  index("idx_awards_year_importance").on(table.year, table.importance),
]);

// === Insert Schemas for validation ===

export const insertUserSchema = createInsertSchema(users);
export const insertWatchHistorySchema = createInsertSchema(watchHistory);
export const insertWatchlistSchema = createInsertSchema(watchlist);
export const insertUserPreferencesSchema = createInsertSchema(userPreferences);
export const insertPasswordResetCodeSchema = createInsertSchema(passwordResetCodes);
export const insertAwardSchema = createInsertSchema(awards);

// === Types ===

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type WatchHistory = typeof watchHistory.$inferSelect;
export type NewWatchHistory = typeof watchHistory.$inferInsert;
export type Watchlist = typeof watchlist.$inferSelect;
export type NewWatchlist = typeof watchlist.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
export type PasswordResetCode = typeof passwordResetCodes.$inferSelect;
export type NewPasswordResetCode = typeof passwordResetCodes.$inferInsert;
export type Award = typeof awards.$inferSelect;
export type NewAward = typeof awards.$inferInsert;
