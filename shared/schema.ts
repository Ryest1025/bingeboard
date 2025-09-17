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
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enum definitions for better type safety and data integrity
export const authProviderEnum = pgEnum('auth_provider', ['replit', 'email', 'facebook', 'google']);
export const watchlistStatusEnum = pgEnum('watchlist_status', ['want_to_watch', 'watching', 'finished', 'dropped']);
export const friendshipStatusEnum = pgEnum('friendship_status', ['pending', 'accepted', 'blocked']);
export const activityTypeEnum = pgEnum('activity_type', [
  'added_to_watchlist', 
  'finished_show', 
  'rated_show', 
  'updated_progress', 
  'started_watching', 
  'sent_invitation'
]);
export const releaseTypeEnum = pgEnum('release_type', [
  'season_premiere', 
  'series_premiere', 
  'season_finale', 
  'special_episode', 
  'movie'
]);
export const reminderTypeEnum = pgEnum('reminder_type', ['day_before', 'week_before', 'on_release']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'release_reminder', 
  'friend_activity', 
  'recommendation', 
  'system', 
  'sports_reminder'
]);
export const prestigeEnum = pgEnum('prestige', ['low', 'medium', 'high', 'elite']);
export const listRoleEnum = pgEnum('list_role', ['owner', 'editor', 'viewer']);
export const interactionTypeEnum = pgEnum('interaction_type', ['positive', 'negative', 'neutral']);
export const authTypeEnum = pgEnum('auth_type', ['oauth2', 'api_key', 'manual']);
export const gameStatusEnum = pgEnum('game_status', ['scheduled', 'live', 'finished', 'postponed']);
export const platformTypeEnum = pgEnum('platform_type', ['web', 'android', 'ios']);
export const notificationStatusEnum = pgEnum('notification_status', ['sent', 'delivered', 'failed']);

// Helper function for auto-updating timestamps
export const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => sql`CURRENT_TIMESTAMP`),
};

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  'sessions',
  {
    sid: varchar('sid').primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire').notNull(),
  },
  (table) => [index('IDX_session_expire').on(table.expire)]
);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// User storage table (required for Replit Auth)
export const users = pgTable('users', {
  id: varchar('id').primaryKey().notNull(),
  email: varchar('email').unique(),
  username: varchar('username').unique(),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  phoneNumber: varchar('phone_number'), // For SMS notifications and password reset
  profileImageUrl: varchar('profile_image_url'),
  passwordHash: varchar('password_hash'), // For email authentication
  authProvider: authProviderEnum('auth_provider').default('replit'),
  facebookId: varchar('facebook_id'), // For Facebook authentication
  googleId: varchar('google_id'), // For Google authentication
  emailVerified: boolean('email_verified').default(false).notNull(),
  resetToken: varchar('reset_token'), // For password reset
  resetTokenExpires: timestamp('reset_token_expires'),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  // Soft delete support
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: timestamp('deleted_at'),
  deletedReason: varchar('deleted_reason'), // 'user_request', 'violation', 'cleanup'
  ...timestamps,
}, (table) => [
  // Performance indexes
  index('idx_users_email').on(table.email),
  index('idx_users_username').on(table.username),
  index('idx_users_auth_provider').on(table.authProvider),
  index('idx_users_active').on(table.isActive),
  index('idx_users_deleted').on(table.deletedAt),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// TV Shows table
export const shows = pgTable('shows', {
  id: serial('id').primaryKey(),
  tmdbId: integer('tmdb_id').unique().notNull(),
  title: varchar('title').notNull(),
  overview: text('overview'),
  posterPath: varchar('poster_path'),
  backdropPath: varchar('backdrop_path'),
  firstAirDate: varchar('first_air_date'),
  genres: jsonb('genres').default([]).notNull(),
  numberOfSeasons: integer('number_of_seasons'),
  numberOfEpisodes: integer('number_of_episodes'),
  status: varchar('status'),
  rating: decimal('rating', { precision: 3, scale: 1 }),
  // Awards system enhancements
  awardCount: integer('award_count').default(0).notNull(),
  nominationCount: integer('nomination_count').default(0).notNull(),
  awardsSeasonalWeight: real('awards_seasonal_weight').default(1.0).notNull(),
  lastAwardYear: integer('last_award_year'),
  ...timestamps,
}, (table) => [
  // Performance indexes for common queries
  index('idx_shows_tmdb_id').on(table.tmdbId),
  index('idx_shows_title').on(table.title),
  index('idx_shows_rating').on(table.rating),
  index('idx_shows_first_air_date').on(table.firstAirDate),
  index('idx_shows_genres').on(table.genres), // GIN index for JSONB
  index('idx_shows_awards_weight').on(table.awardsSeasonalWeight),
  index('idx_shows_award_count').on(table.awardCount),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Episodes table for detailed episode tracking
export const episodes = pgTable('episodes', {
  id: serial('id').primaryKey(),
  showId: integer('show_id')
    .references(() => shows.id, { onDelete: 'cascade' })
    .notNull(),
  tmdbId: integer('tmdb_id').unique(),
  seasonNumber: integer('season_number').notNull(),
  episodeNumber: integer('episode_number').notNull(),
  title: varchar('title').notNull(),
  overview: text('overview'),
  stillPath: varchar('still_path'), // Episode thumbnail
  airDate: varchar('air_date'),
  runtime: integer('runtime'), // Episode length in minutes
  rating: decimal('rating', { precision: 3, scale: 1 }),
  voteCount: integer('vote_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  unique().on(table.showId, table.seasonNumber, table.episodeNumber),
  index('idx_episodes_show_season').on(table.showId, table.seasonNumber),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Awards table for tracking award winners and nominees
export const awards = pgTable('awards', {
  id: serial('id').primaryKey(),
  showId: integer('show_id')
    .references(() => shows.id, { onDelete: 'cascade' })
    .notNull(),
  ceremony: varchar('ceremony').notNull(), // 'Oscar', 'Emmy', 'Golden Globe', 'SAG', 'Critics Choice', etc.
  category: varchar('category').notNull(), // 'Best Picture', 'Best Drama Series', 'Best Actor', etc.
  year: integer('year').notNull(), // Award year (ceremony year, not eligibility year)
  isWinner: boolean('is_winner').default(false).notNull(),
  personName: varchar('person_name'), // Actor/director name if person-specific award
  description: text('description'), // Additional context about the award
  awardDate: timestamp('award_date'), // Actual ceremony date for seasonal weighting
  importance: integer('importance').default(5).notNull(), // 1-10 scale, higher = more prestigious
  // Enhanced awards metadata
  ceremonyType: varchar('ceremony_type').default('film').notNull(), // 'film', 'tv', 'music', 'special'
  seasonalBoost: real('seasonal_boost').default(1.0).notNull(), // Multiplier during award season
  prestige: prestigeEnum('prestige').default('medium').notNull(),
  ...timestamps,
}, (table) => [
  // Ensure unique combinations to prevent duplicates
  unique().on(table.showId, table.ceremony, table.category, table.year, table.personName),
  // Performance indexes for common award queries
  index('idx_awards_ceremony_year').on(table.ceremony, table.year),
  index('idx_awards_year_importance').on(table.year, table.importance),
  index('idx_awards_prestige_seasonal').on(table.prestige, table.seasonalBoost),
  index('idx_awards_show_winner').on(table.showId, table.isWinner),
  index('idx_awards_ceremony_type').on(table.ceremonyType),
  index('idx_awards_award_date').on(table.awardDate),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Award Ceremonies configuration and metadata
export const awardCeremonies = pgTable('award_ceremonies', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull().unique(), // 'Oscar', 'Emmy', 'Golden Globe'
  fullName: varchar('full_name').notNull(), // 'Academy Awards', 'Primetime Emmy Awards'
  description: text('description'),
  type: varchar('type').notNull(), // 'film', 'tv', 'music'
  prestige: prestigeEnum('prestige').default('medium').notNull(),
  season: varchar('season'), // 'spring', 'winter', 'fall' for seasonal boosting
  peakMonths: jsonb('peak_months').default([]).notNull(), // [1, 2, 3] for Jan-Mar peak season
  baseWeight: real('base_weight').default(1.0).notNull(), // Base recommendation weight
  seasonalMultiplier: real('seasonal_multiplier').default(1.5).notNull(), // Peak season multiplier
  logoUrl: varchar('logo_url'),
  brandColor: varchar('brand_color'),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
}, (table) => [
  index('idx_ceremonies_type_prestige').on(table.type, table.prestige),
  index('idx_ceremonies_active').on(table.isActive),
  index('idx_ceremonies_peak_months').on(table.peakMonths), // GIN index for JSONB
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Award Categories for structured filtering and weighting
export const awardCategories = pgTable('award_categories', {
  id: serial('id').primaryKey(),
  ceremonyId: integer('ceremony_id')
    .references(() => awardCeremonies.id)
    .notNull(),
  name: varchar('name').notNull(), // 'Best Picture', 'Best Drama Series'
  displayName: varchar('display_name').notNull(),
  description: text('description'),
  categoryType: varchar('category_type').notNull(), // 'show', 'person', 'technical'
  importance: integer('importance').default(5), // 1-10 scale
  weight: real('weight').default(1.0), // Recommendation weight multiplier
  eligibleMediaTypes: jsonb('eligible_media_types').default([]), // ['tv', 'movie']
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  unique().on(table.ceremonyId, table.name),
  index('idx_categories_ceremony_importance').on(table.ceremonyId, table.importance),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Seasonal Award Recommendations - precalculated for performance
export const seasonalAwardRecommendations = pgTable('seasonal_award_recommendations', {
  id: serial('id').primaryKey(),
  showId: integer('show_id')
    .references(() => shows.id, { onDelete: 'cascade' })
    .notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(), // 1-12
  totalScore: real('total_score').notNull(), // Calculated seasonal score
  awardBoost: real('award_boost').default(1.0), // Awards-specific boost
  recencyBoost: real('recency_boost').default(1.0), // Recent awards boost
  ceremoniesActive: jsonb('ceremonies_active').default([]), // Active ceremonies this month
  winnerBoost: real('winner_boost').default(1.0), // Winner vs nominee multiplier
  isGenerated: boolean('is_generated').default(false),
  generatedAt: timestamp('generated_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // Cache expiration
}, (table) => [
  unique().on(table.showId, table.year, table.month),
  index('idx_seasonal_awards_score').on(table.year, table.month, table.totalScore),
  index('idx_seasonal_awards_expires').on(table.expiresAt),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Normalized genres table for better query performance
export const genres = pgTable('genres', {
  id: serial('id').primaryKey(),
  tmdbId: integer('tmdb_id').unique().notNull(),
  name: varchar('name').notNull().unique(),
  displayName: varchar('display_name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
}, (table) => [
  index('idx_genres_name').on(table.name),
  index('idx_genres_active').on(table.isActive),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Show-Genre many-to-many relationship for efficient querying
export const showGenres = pgTable('show_genres', {
  id: serial('id').primaryKey(),
  showId: integer('show_id')
    .references(() => shows.id, { onDelete: 'cascade' })
    .notNull(),
  genreId: integer('genre_id')
    .references(() => genres.id, { onDelete: 'cascade' })
    .notNull(),
  ...timestamps,
}, (table) => [
  unique().on(table.showId, table.genreId),
  index('idx_show_genres_show').on(table.showId),
  index('idx_show_genres_genre').on(table.genreId),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Streaming platforms
export const platforms = pgTable('platforms', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  logoPath: varchar('logo_path'),
  color: varchar('color'),
  tmdbId: integer('tmdb_id').unique(), // TMDB provider ID
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
}, (table) => [
  index('idx_platforms_name').on(table.name),
  index('idx_platforms_active').on(table.isActive),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Show streaming availability
export const showPlatforms = pgTable(
  'show_platforms',
  {
    id: serial('id').primaryKey(),
    showId: integer('show_id')
      .references(() => shows.id)
      .notNull(),
    platformId: integer('platform_id')
      .references(() => platforms.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [unique().on(table.showId, table.platformId)]
);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// User watchlists
export const watchlists = pgTable('watchlists', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  showId: integer('show_id')
    .references(() => shows.id, { onDelete: 'cascade' })
    .notNull(),
  status: watchlistStatusEnum('status').notNull(),
  rating: decimal('rating', { precision: 3, scale: 1 }),
  currentSeason: integer('current_season').default(1).notNull(),
  currentEpisode: integer('current_episode').default(1).notNull(),
  totalEpisodesWatched: integer('total_episodes_watched').default(0).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  notes: text('notes'),
  // Soft delete support
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: timestamp('deleted_at'),
  deletedReason: text('deleted_reason'),
  ...timestamps,
}, (table) => [
  unique().on(table.userId, table.showId), // Prevent duplicate watchlist entries
  index('idx_watchlists_user_status').on(table.userId, table.status),
  index('idx_watchlists_show_id').on(table.showId),
  index('idx_watchlists_rating').on(table.rating),
  index('idx_watchlists_public').on(table.isPublic),
  index('idx_watchlists_active').on(table.isActive),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Friend connections
export const friendships = pgTable(
  'friendships',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    friendId: varchar('friend_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    status: friendshipStatusEnum('status').default('pending').notNull(),
    // Soft delete support
    isActive: boolean('is_active').default(true).notNull(),
    deletedAt: timestamp('deleted_at'),
    deletedReason: text('deleted_reason'),
    ...timestamps,
  },
  (table) => [
    unique().on(table.userId, table.friendId),
    index('idx_friendships_user_status').on(table.userId, table.status),
    index('idx_friendships_friend_status').on(table.friendId, table.status),
    index('idx_friendships_active').on(table.isActive),
  ]
);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Contact imports for friend discovery
export const contactImports = pgTable('contact_imports', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id),
  contactEmail: varchar('contact_email').notNull(),
  contactName: varchar('contact_name'),
  contactPhone: varchar('contact_phone'),
  source: varchar('source').notNull(), // "manual", "google", "csv", "facebook", "instagram", "snapchat", "tiktok"
  isMatched: boolean('is_matched').default(false),
  matchedUserId: varchar('matched_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Social network connections for friend discovery
export const socialConnections = pgTable(
  'social_connections',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id')
      .notNull()
      .references(() => users.id),
    platform: varchar('platform').notNull(), // "facebook", "instagram", "snapchat", "tiktok"
    socialId: varchar('social_id').notNull(), // Platform-specific user ID
    username: varchar('username'), // Platform username/handle
    displayName: varchar('display_name'), // Display name on platform
    profileUrl: varchar('profile_url'), // Profile URL
    accessToken: text('access_token'), // Encrypted access token for API calls
    refreshToken: text('refresh_token'), // Encrypted refresh token
    isActive: boolean('is_active').default(true),
    lastSynced: timestamp('last_synced'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    unique().on(table.userId, table.platform),
    unique().on(table.platform, table.socialId),
  ]
);

// Friend suggestions based on mutual connections and contacts
export const friendSuggestions = pgTable('friend_suggestions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id),
  suggestedUserId: varchar('suggested_user_id')
    .notNull()
    .references(() => users.id),
  suggestionType: varchar('suggestion_type').notNull(), // "mutual_friends", "contacts", "platform", "username_search"
  mutualFriendCount: integer('mutual_friend_count').default(0),
  confidence: real('confidence').default(0.5), // 0.0 to 1.0 confidence score
  reason: text('reason'), // Why this person was suggested
  isViewed: boolean('is_viewed').default(false),
  isDismissed: boolean('is_dismissed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Activity feed
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  showId: integer('show_id').references(() => shows.id, { onDelete: 'cascade' }),
  activityType: activityTypeEnum('activity_type').notNull(),
  content: text('content'),
  metadata: jsonb('metadata').default({}).notNull(),
  isActive: boolean('is_active').default(true).notNull(), // For soft deletes/hiding activities
  ...timestamps,
}, (table) => [
  index('idx_activities_user_type').on(table.userId, table.activityType),
  index('idx_activities_show_id').on(table.showId),
  index('idx_activities_created_at').on(table.createdAt),
  index('idx_activities_metadata').on(table.metadata), // GIN index for JSONB
  index('idx_activities_active').on(table.isActive),
]);

// Activity likes
export const activityLikes = pgTable(
  'activity_likes',
  {
    id: serial('id').primaryKey(),
    activityId: integer('activity_id')
      .references(() => activities.id)
      .notNull(),
    userId: varchar('user_id')
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [unique().on(table.activityId, table.userId)]
);

// Activity comments
export const activityComments = pgTable('activity_comments', {
  id: serial('id').primaryKey(),
  activityId: integer('activity_id')
    .references(() => activities.id)
    .notNull(),
  userId: varchar('user_id')
    .references(() => users.id)
    .notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Recommendations
export const recommendations = pgTable('recommendations', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .references(() => users.id)
    .notNull(),
  showId: integer('show_id')
    .references(() => shows.id)
    .notNull(),
  reason: varchar('reason'),
  score: decimal('score', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Upcoming releases and season premieres
export const upcomingReleases = pgTable('upcoming_releases', {
  id: serial('id').primaryKey(),
  showId: integer('show_id')
    .references(() => shows.id, { onDelete: 'cascade' })
    .notNull(),
  seasonNumber: integer('season_number'),
  episodeNumber: integer('episode_number').default(1).notNull(),
  releaseDate: timestamp('release_date').notNull(),
  releaseType: releaseTypeEnum('release_type').notNull(),
  title: varchar('title'),
  description: text('description'),
  isConfirmed: boolean('is_confirmed').default(false).notNull(),
  ...timestamps,
}, (table) => [
  index('idx_upcoming_releases_show').on(table.showId),
  index('idx_upcoming_releases_date').on(table.releaseDate),
  index('idx_upcoming_releases_type').on(table.releaseType),
  index('idx_upcoming_releases_confirmed').on(table.isConfirmed),
]);

// User reminders for upcoming releases
export const releaseReminders = pgTable(
  'release_reminders',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    releaseId: integer('release_id')
      .references(() => upcomingReleases.id, { onDelete: 'cascade' })
      .notNull(),
    reminderType: reminderTypeEnum('reminder_type').notNull(),
    isTriggered: boolean('is_triggered').default(false).notNull(),
    triggerDate: timestamp('trigger_date').notNull(),
    ...timestamps,
  },
  (table) => [
    unique().on(table.userId, table.releaseId, table.reminderType),
    index('idx_release_reminders_trigger').on(table.triggerDate, table.isTriggered),
    index('idx_release_reminders_user').on(table.userId),
  ]
);

// Notifications for reminders and alerts
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title').notNull(),
  message: text('message').notNull(),
  relatedId: integer('related_id'), // Can reference shows, releases, games, etc.
  relatedType: varchar('related_type'), // 'show', 'game', 'release', 'user'
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at'),
  expiresAt: timestamp('expires_at'), // When notification becomes irrelevant
  priority: varchar('priority').default('normal').notNull(), // 'low', 'normal', 'high', 'urgent'
  ...timestamps,
}, (table) => [
  index('idx_notifications_user_read').on(table.userId, table.isRead),
  index('idx_notifications_type').on(table.type),
  index('idx_notifications_created').on(table.createdAt),
  index('idx_notifications_expires').on(table.expiresAt),
  index('idx_notifications_priority').on(table.priority),
]);

// Sports tables
export const sports = pgTable('sports', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(), // "NFL", "NBA", "MLB", "NHL", "Tennis"
  sportsDbId: varchar('sports_db_id').unique(), // TheSportsDB sport ID
  displayName: varchar('display_name').notNull(),
  icon: varchar('icon'), // Icon identifier
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  sportId: integer('sport_id')
    .notNull()
    .references(() => sports.id),
  sportsDbId: varchar('sports_db_id').unique(), // TheSportsDB team ID
  name: varchar('name').notNull(),
  city: varchar('city'),
  abbreviation: varchar('abbreviation'),
  logoUrl: varchar('logo_url'),
  primaryColor: varchar('primary_color'),
  secondaryColor: varchar('secondary_color'),
  conference: varchar('conference'), // AFC/NFC, Eastern/Western, etc.
  division: varchar('division'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  sportId: integer('sport_id')
    .notNull()
    .references(() => sports.id),
  sportsDbId: varchar('sports_db_id').unique(), // TheSportsDB event ID
  homeTeamId: integer('home_team_id')
    .notNull()
    .references(() => teams.id),
  awayTeamId: integer('away_team_id')
    .notNull()
    .references(() => teams.id),
  gameDate: timestamp('game_date').notNull(),
  gameTime: varchar('game_time'), // "8:00 PM EST"
  venue: varchar('venue'),
  season: varchar('season'), // "2024-2025", "2024"
  week: integer('week'), // For NFL
  gameType: varchar('game_type'), // "regular", "playoff", "championship"
  status: varchar('status').default('scheduled'), // "scheduled", "live", "finished", "postponed"
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  tvNetworks: text('tv_networks').array(), // ["ESPN", "Fox Sports"]
  streamingPlatforms: text('streaming_platforms').array(), // ["ESPN+", "Paramount+"]
  description: text('description'), // Game description or importance
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userSportsPreferences = pgTable('user_sports_preferences', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  sportId: integer('sport_id')
    .notNull()
    .references(() => sports.id, { onDelete: 'cascade' }),
  teamIds: integer('team_ids').array().default([]).notNull(), // Favorite teams
  notificationsEnabled: boolean('notifications_enabled').default(true).notNull(),
  reminderMinutes: integer('reminder_minutes').default(60).notNull(), // Remind X minutes before game
  ...timestamps,
}, (table) => [
  unique().on(table.userId, table.sportId),
  index('idx_user_sports_prefs_user').on(table.userId),
  index('idx_user_sports_prefs_notifications').on(table.notificationsEnabled),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// Unified notification scheduling system
export const notificationSchedules = pgTable('notification_schedules', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  notificationType: notificationTypeEnum('notification_type').notNull(),
  targetId: integer('target_id').notNull(), // ID of show, game, release, etc.
  targetType: varchar('target_type').notNull(), // 'show', 'game', 'release', 'friend_activity'
  scheduledFor: timestamp('scheduled_for').notNull(),
  reminderMinutes: integer('reminder_minutes').default(0).notNull(),
  isProcessed: boolean('is_processed').default(false).notNull(),
  processedAt: timestamp('processed_at'),
  retryCount: integer('retry_count').default(0).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  ...timestamps,
}, (table) => [
  index('idx_notification_schedules_user_type').on(table.userId, table.notificationType),
  index('idx_notification_schedules_scheduled').on(table.scheduledFor),
  index('idx_notification_schedules_unprocessed').on(table.isProcessed, table.scheduledFor),
  index('idx_notification_schedules_target').on(table.targetType, table.targetId),
]);

export const sportsActivities = pgTable('sports_activities', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id),
  gameId: integer('game_id')
    .notNull()
    .references(() => games.id),
  activityType: varchar('activity_type').notNull(), // "game_reminder", "team_follow", "game_watch"
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow(),
});

// AI Recommendations and Search Alerts
export const searchAlerts = pgTable('search_alerts', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name').notNull(), // User-defined name for the alert
  searchQuery: varchar('search_query'), // Text search query
  genres: text('genres').array(), // Genre filters
  networks: text('networks').array(), // Network filters
  yearFrom: integer('year_from'),
  yearTo: integer('year_to'),
  minRating: real('min_rating'),
  maxRating: real('max_rating'),
  contentRatings: text('content_ratings').array(), // TV-MA, TV-14, PG-13, etc.
  languages: text('languages').array(), // Original language
  countries: text('countries').array(), // Production countries
  runtimeMin: integer('runtime_min'), // Minimum episode/movie length in minutes
  runtimeMax: integer('runtime_max'), // Maximum episode/movie length in minutes
  keywords: text('keywords').array(), // TMDB keywords
  withCompanies: text('with_companies').array(), // Production companies
  withPeople: text('with_people').array(), // Actors, directors, writers
  awards: text('awards').array(), // Emmy, Oscar, Golden Globe, etc.
  status: varchar('status'), // "returning", "ended", "cancelled", "in_production"
  mediaType: varchar('media_type').default('tv'), // "tv", "movie", "both"
  includeAdult: boolean('include_adult').default(false),
  trendingPeriod: varchar('trending_period'), // "day", "week", null for no trending filter
  sortBy: varchar('sort_by').default('popularity.desc'),
  isActive: boolean('is_active').default(true),
  notificationFrequency: varchar('notification_frequency').default('daily'), // "immediate", "daily", "weekly"
  lastChecked: timestamp('last_checked').defaultNow(),
  lastTriggered: timestamp('last_triggered'),
  resultsFound: integer('results_found').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const aiRecommendations = pgTable('ai_recommendations', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  showId: integer('show_id')
    .notNull()
    .references(() => shows.id, { onDelete: 'cascade' }),
  score: real('score').notNull(), // AI confidence score 0-1
  reason: text('reason').notNull(), // Why this was recommended
  recommendationType: varchar('recommendation_type').notNull(), // "collaborative", "content_based", "trending", "similar_users"
  metadata: jsonb('metadata').default({}).notNull(), // Additional recommendation data
  isViewed: boolean('is_viewed').default(false).notNull(),
  isInteracted: boolean('is_interacted').default(false).notNull(), // User clicked, added to watchlist, etc.
  feedback: varchar('feedback'), // "liked", "disliked", "not_interested"
  isActive: boolean('is_active').default(true).notNull(), // For recommendation lifecycle management
  expiresAt: timestamp('expires_at'), // When recommendation becomes stale
  ...timestamps,
}, (table) => [
  // Critical performance indexes
  unique().on(table.userId, table.showId), // Prevent duplicate recommendations
  index('idx_ai_recommendations_user_active').on(table.userId, table.isActive),
  index('idx_ai_recommendations_score').on(table.score),
  index('idx_ai_recommendations_type').on(table.recommendationType),
  index('idx_ai_recommendations_expires').on(table.expiresAt),
  index('idx_ai_recommendations_metadata').on(table.metadata), // GIN index for JSONB
]);

export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  watchingHabits: text('watching_habits'), // Viewing patterns as text
  contentRating: varchar('content_rating').default('All').notNull(), // "G", "PG", "PG-13", "R", "All"
  aiPersonality: varchar('ai_personality').default('balanced').notNull(), // "adventurous", "conservative", "balanced"
  notificationFrequency: varchar('notification_frequency').default('weekly').notNull(), // "daily", "weekly", "monthly"
  sportsNotifications: boolean('sports_notifications').default(true).notNull(),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  ...timestamps,
}, (table) => [
  index('idx_user_preferences_content_rating').on(table.contentRating),
  index('idx_user_preferences_ai_personality').on(table.aiPersonality),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// User-Genre preferences (normalized for better performance)
export const userGenrePreferences = pgTable('user_genre_preferences', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  genreId: integer('genre_id')
    .notNull()
    .references(() => genres.id, { onDelete: 'cascade' }),
  preference: real('preference').default(1.0).notNull(), // 0.0-1.0 preference strength
  ...timestamps,
}, (table) => [
  unique().on(table.userId, table.genreId),
  index('idx_user_genre_prefs_user').on(table.userId),
  index('idx_user_genre_prefs_preference').on(table.preference),
]);

/* ignore-unused-export (used for schema definition, migrations, or future extensibility) */
// User-Platform preferences (which platforms they have access to)
export const userPlatformPreferences = pgTable('user_platform_preferences', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  platformId: integer('platform_id')
    .notNull()
    .references(() => platforms.id, { onDelete: 'cascade' }),
  hasAccess: boolean('has_access').default(true).notNull(),
  preference: real('preference').default(1.0).notNull(), // 0.0-1.0 preference strength
  ...timestamps,
}, (table) => [
  unique().on(table.userId, table.platformId),
  index('idx_user_platform_prefs_user').on(table.userId),
  index('idx_user_platform_prefs_access').on(table.hasAccess),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  watchlists: many(watchlists),
  activities: many(activities),
  friendships: many(friendships, { relationName: 'user_friendships' }),
  friendOf: many(friendships, { relationName: 'friend_friendships' }),
  recommendations: many(recommendations),
  activityLikes: many(activityLikes),
  activityComments: many(activityComments),
}));

export const showsRelations = relations(shows, ({ many }) => ({
  watchlists: many(watchlists),
  activities: many(activities),
  platforms: many(showPlatforms),
  recommendations: many(recommendations),
  awards: many(awards),
  episodes: many(episodes),
  seasonalRecommendations: many(seasonalAwardRecommendations),
  genres: many(showGenres),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  shows: many(showGenres),
  userPreferences: many(userGenrePreferences),
}));

export const showGenresRelations = relations(showGenres, ({ one }) => ({
  show: one(shows, {
    fields: [showGenres.showId],
    references: [shows.id],
  }),
  genre: one(genres, {
    fields: [showGenres.genreId],
    references: [genres.id],
  }),
}));

export const userGenrePreferencesRelations = relations(userGenrePreferences, ({ one }) => ({
  user: one(users, {
    fields: [userGenrePreferences.userId],
    references: [users.id],
  }),
  genre: one(genres, {
    fields: [userGenrePreferences.genreId],
    references: [genres.id],
  }),
}));

export const userPlatformPreferencesRelations = relations(userPlatformPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPlatformPreferences.userId],
    references: [users.id],
  }),
  platform: one(platforms, {
    fields: [userPlatformPreferences.platformId],
    references: [platforms.id],
  }),
}));

export const notificationSchedulesRelations = relations(notificationSchedules, ({ one }) => ({
  user: one(users, {
    fields: [notificationSchedules.userId],
    references: [users.id],
  }),
}));

export const episodesRelations = relations(episodes, ({ one }) => ({
  show: one(shows, {
    fields: [episodes.showId],
    references: [shows.id],
  }),
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
    relationName: 'user_friendships',
  }),
  friend: one(users, {
    fields: [friendships.friendId],
    references: [users.id],
    relationName: 'friend_friendships',
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

export const activityCommentsRelations = relations(
  activityComments,
  ({ one }) => ({
    activity: one(activities, {
      fields: [activityComments.activityId],
      references: [activities.id],
    }),
    user: one(users, {
      fields: [activityComments.userId],
      references: [users.id],
    }),
  })
);

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

export const recommendationsRelations = relations(
  recommendations,
  ({ one }) => ({
    user: one(users, {
      fields: [recommendations.userId],
      references: [users.id],
    }),
    show: one(shows, {
      fields: [recommendations.showId],
      references: [shows.id],
    }),
  })
);

export const upcomingReleasesRelations = relations(
  upcomingReleases,
  ({ one, many }) => ({
    show: one(shows, {
      fields: [upcomingReleases.showId],
      references: [shows.id],
    }),
    reminders: many(releaseReminders),
  })
);

export const releaseRemindersRelations = relations(
  releaseReminders,
  ({ one }) => ({
    user: one(users, {
      fields: [releaseReminders.userId],
      references: [users.id],
    }),
    release: one(upcomingReleases, {
      fields: [releaseReminders.releaseId],
      references: [upcomingReleases.id],
    }),
  })
);

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
  homeGames: many(games, { relationName: 'home_team' }),
  awayGames: many(games, { relationName: 'away_team' }),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  sport: one(sports, {
    fields: [games.sportId],
    references: [sports.id],
  }),
  homeTeam: one(teams, {
    fields: [games.homeTeamId],
    references: [teams.id],
    relationName: 'home_team',
  }),
  awayTeam: one(teams, {
    fields: [games.awayTeamId],
    references: [teams.id],
    relationName: 'away_team',
  }),
  sportsActivities: many(sportsActivities),
}));

export const userSportsPreferencesRelations = relations(
  userSportsPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [userSportsPreferences.userId],
      references: [users.id],
    }),
    sport: one(sports, {
      fields: [userSportsPreferences.sportId],
      references: [sports.id],
    }),
  })
);

export const sportsActivitiesRelations = relations(
  sportsActivities,
  ({ one }) => ({
    user: one(users, {
      fields: [sportsActivities.userId],
      references: [users.id],
    }),
    game: one(games, {
      fields: [sportsActivities.gameId],
      references: [games.id],
    }),
  })
);

// AI and Search Alert relations
export const searchAlertsRelations = relations(searchAlerts, ({ one }) => ({
  user: one(users, {
    fields: [searchAlerts.userId],
    references: [users.id],
  }),
}));

export const aiRecommendationsRelations = relations(
  aiRecommendations,
  ({ one }) => ({
    user: one(users, {
      fields: [aiRecommendations.userId],
      references: [users.id],
    }),
    show: one(shows, {
      fields: [aiRecommendations.showId],
      references: [shows.id],
    }),
  })
);

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [userPreferences.userId],
      references: [users.id],
    }),
  })
);

// Awards relations
export const awardsRelations = relations(awards, ({ one }) => ({
  show: one(shows, {
    fields: [awards.showId],
    references: [shows.id],
  }),
}));

export const awardCeremoniesRelations = relations(awardCeremonies, ({ many }) => ({
  categories: many(awardCategories),
}));

export const awardCategoriesRelations = relations(awardCategories, ({ one }) => ({
  ceremony: one(awardCeremonies, {
    fields: [awardCategories.ceremonyId],
    references: [awardCeremonies.id],
  }),
}));

export const seasonalAwardRecommendationsRelations = relations(seasonalAwardRecommendations, ({ one }) => ({
  show: one(shows, {
    fields: [seasonalAwardRecommendations.showId],
    references: [shows.id],
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
  isActive: true,
  deletedAt: true,
  deletedReason: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  isActive: true,
  deletedAt: true,
  deletedReason: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLikeSchema = createInsertSchema(activityLikes).omit({
  id: true,
  createdAt: true,
});

export const insertActivityCommentSchema = createInsertSchema(
  activityComments
).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformSchema = createInsertSchema(platforms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecommendationSchema = createInsertSchema(
  recommendations
).omit({
  id: true,
  createdAt: true,
});

export const insertUpcomingReleaseSchema = createInsertSchema(
  upcomingReleases
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReleaseReminderSchema = createInsertSchema(
  releaseReminders
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertUserSportsPreferencesSchema = createInsertSchema(
  userSportsPreferences
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSportsActivitySchema = createInsertSchema(
  sportsActivities
).omit({
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

export const insertAiRecommendationSchema = createInsertSchema(
  aiRecommendations
).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(
  userPreferences
).omit({
  id: true,
  updatedAt: true,
});

// Awards insert schemas
export const insertAwardSchema = createInsertSchema(awards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEpisodeSchema = createInsertSchema(episodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAwardCeremonySchema = createInsertSchema(awardCeremonies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAwardCategorySchema = createInsertSchema(awardCategories).omit({
  id: true,
  createdAt: true,
});

export const insertSeasonalAwardRecommendationSchema = createInsertSchema(seasonalAwardRecommendations).omit({
  id: true,
  generatedAt: true,
});

// Normalized table insert schemas
export const insertGenreSchema = createInsertSchema(genres).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShowGenreSchema = createInsertSchema(showGenres).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserGenrePreferenceSchema = createInsertSchema(userGenrePreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPlatformPreferenceSchema = createInsertSchema(userPlatformPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationScheduleSchema = createInsertSchema(notificationSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Streaming Platform Integrations
export const streamingIntegrations = pgTable(
  'streaming_integrations',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    platform: varchar('platform').notNull(), // 'netflix', 'hulu', 'disney_plus', 'amazon_prime', etc.
    accessToken: text('access_token'), // Encrypted OAuth token
    refreshToken: text('refresh_token'), // Encrypted refresh token
    tokenExpires: timestamp('token_expires'),
    isActive: boolean('is_active').default(true),
    lastSync: timestamp('last_sync'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    unique().on(table.userId, table.platform), // One integration per platform per user
  ]
);

// User Viewing History (imported from streaming platforms)
export const viewingHistory = pgTable('viewing_history', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  showId: integer('show_id').references(() => shows.id, {
    onDelete: 'cascade',
  }),
  platform: varchar('platform').notNull(), // Source platform
  watchedAt: timestamp('watched_at').notNull(),
  watchDuration: integer('watch_duration'), // In minutes
  totalDuration: integer('total_duration'), // Total episode/movie length
  completionPercentage: real('completion_percentage'), // 0.0 to 1.0
  episodeNumber: integer('episode_number'),
  seasonNumber: integer('season_number'),
  userRating: real('user_rating'), // If platform provides user ratings
  platformData: jsonb('platform_data'), // Raw data from platform
  ...timestamps,
}, (table) => [
  // Performance indexes for large viewing history table
  index('idx_viewing_history_user_watched').on(table.userId, table.watchedAt),
  index('idx_viewing_history_show_user').on(table.showId, table.userId),
  index('idx_viewing_history_platform').on(table.platform),
  index('idx_viewing_history_completion').on(table.completionPercentage),
  index('idx_viewing_history_episode').on(table.showId, table.seasonNumber, table.episodeNumber),
  // Composite unique to prevent duplicate viewing records
  unique().on(table.userId, table.showId, table.episodeNumber, table.seasonNumber, table.watchedAt),
]);

// User Behavior Tracking (internal BingeBoard activity)
export const userBehavior = pgTable('user_behavior', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  actionType: varchar('action_type').notNull(), // 'watchlist_add', 'watch_now_click', 'recommendation_view', 'search', etc.
  targetType: varchar('target_type').notNull(), // 'show', 'recommendation', 'search_result'
  targetId: integer('target_id'), // ID of the target (show, recommendation, etc.)
  metadata: jsonb('metadata').default({}).notNull(), // Additional context (platform clicked, search terms, etc.)
  sessionId: varchar('session_id'), // Track user session
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => [
  // Performance indexes for behavior analytics
  index('idx_user_behavior_user_time').on(table.userId, table.timestamp),
  index('idx_user_behavior_action_type').on(table.actionType),
  index('idx_user_behavior_target').on(table.targetType, table.targetId),
  index('idx_user_behavior_session').on(table.sessionId),
  index('idx_user_behavior_metadata').on(table.metadata), // GIN index for JSONB
]);

// ML Training Data for Recommendations
export const recommendationTraining = pgTable('recommendation_training', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  showId: integer('show_id')
    .notNull()
    .references(() => shows.id, { onDelete: 'cascade' }),
  interactionType: interactionTypeEnum('interaction_type').notNull(),
  interactionScore: real('interaction_score'), // 0.0 to 1.0 confidence score
  features: jsonb('features').default({}).notNull(), // Show features (genres, rating, year, etc.)
  context: jsonb('context').default({}).notNull(), // User context when interaction occurred
  ...timestamps,
}, (table) => [
  // Indexes for ML training queries
  index('idx_recommendation_training_user_type').on(table.userId, table.interactionType),
  index('idx_recommendation_training_show_score').on(table.showId, table.interactionScore),
  index('idx_recommendation_training_features').on(table.features), // GIN index
  index('idx_recommendation_training_context').on(table.context), // GIN index
]);

// Platform API Configurations
export const platformConfigs = pgTable('platform_configs', {
  id: serial('id').primaryKey(),
  platform: varchar('platform').notNull().unique(),
  displayName: varchar('display_name').notNull(),
  apiEndpoint: varchar('api_endpoint'),
  authType: authTypeEnum('auth_type').notNull(),
  clientId: varchar('client_id'), // OAuth client ID
  scopes: jsonb('scopes').default({}).notNull(), // Required OAuth scopes
  isActive: boolean('is_active').default(true).notNull(),
  rateLimitPerHour: integer('rate_limit_per_hour').default(100).notNull(),
  ...timestamps,
}, (table) => [
  index('idx_platform_configs_active').on(table.isActive),
  index('idx_platform_configs_auth_type').on(table.authType),
]);

// Insert schemas for new tables
export const insertStreamingIntegrationSchema = createInsertSchema(
  streamingIntegrations
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertViewingHistorySchema = createInsertSchema(
  viewingHistory
).omit({
  id: true,
  createdAt: true,
});

export const insertUserBehaviorSchema = createInsertSchema(userBehavior).omit({
  id: true,
  timestamp: true,
});

export const insertRecommendationTrainingSchema = createInsertSchema(
  recommendationTraining
).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformConfigSchema = createInsertSchema(
  platformConfigs
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Custom Lists for user-created collections
export const customLists = pgTable('custom_lists', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(),
  isCollaborative: boolean('is_collaborative').default(false).notNull(),
  coverImageUrl: varchar('cover_image_url'),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  shareCode: varchar('share_code').unique(), // For sharing via URL/QR codes
  // Soft delete support
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: timestamp('deleted_at'),
  ...timestamps,
}, (table) => [
  index('idx_custom_lists_user_active').on(table.userId, table.isActive),
  index('idx_custom_lists_public').on(table.isPublic),
  index('idx_custom_lists_share_code').on(table.shareCode),
  index('idx_custom_lists_tags').on(table.tags), // GIN index
]);

// Custom List Items - shows added to custom lists
export const customListItems = pgTable(
  'custom_list_items',
  {
    id: serial('id').primaryKey(),
    listId: integer('list_id')
      .notNull()
      .references(() => customLists.id, { onDelete: 'cascade' }),
    showId: integer('show_id')
      .notNull()
      .references(() => shows.id, { onDelete: 'cascade' }),
    addedBy: varchar('added_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    order: integer('order').default(0).notNull(), // For custom ordering
    notes: text('notes'), // Personal notes about why this show is in the list
    ...timestamps,
  },
  (table) => [
    unique().on(table.listId, table.showId),
    index('idx_custom_list_items_list').on(table.listId),
    index('idx_custom_list_items_show').on(table.showId),
    index('idx_custom_list_items_added_by').on(table.addedBy),
    index('idx_custom_list_items_order').on(table.listId, table.order),
  ]
);

// Custom List Collaborators - users who can edit collaborative lists
export const customListCollaborators = pgTable(
  'custom_list_collaborators',
  {
    id: serial('id').primaryKey(),
    listId: integer('list_id')
      .notNull()
      .references(() => customLists.id, { onDelete: 'cascade' }),
    userId: varchar('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: varchar('role', { enum: ['owner', 'editor', 'viewer'] }).default(
      'viewer'
    ),
    invitedBy: varchar('invited_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [unique().on(table.listId, table.userId)]
);

// Enhanced viewing stats and achievements
export const userStats = pgTable('user_stats', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  totalHoursWatched: integer('total_hours_watched').default(0),
  totalShowsCompleted: integer('total_shows_completed').default(0),
  currentBingeStreak: integer('current_binge_streak').default(0),
  longestBingeStreak: integer('longest_binge_streak').default(0),
  favoriteGenres: jsonb('favorite_genres').$type<string[]>().default([]),
  personalityType: varchar('personality_type'), // e.g., "Sci-Fi Explorer", "Reality Show Superfan"
  achievements: jsonb('achievements').$type<string[]>().default([]), // Badge IDs earned
  lastWatchedDate: timestamp('last_watched_date'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Episode Progress Tracking (detailed tracking beyond basic watchlist)
export const episodeProgress = pgTable(
  'episode_progress',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    showId: integer('show_id')
      .notNull()
      .references(() => shows.id, { onDelete: 'cascade' }),
    seasonNumber: integer('season_number').notNull(),
    episodeNumber: integer('episode_number').notNull(),
    watchedAt: timestamp('watched_at').defaultNow(),
    watchTimeMinutes: integer('watch_time_minutes'), // How long they actually watched
    isCompleted: boolean('is_completed').default(true),
    rating: decimal('rating', { precision: 3, scale: 1 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    unique().on(
      table.userId,
      table.showId,
      table.seasonNumber,
      table.episodeNumber
    ),
  ]
);

// Insert schemas for new tables
export const insertCustomListSchema = createInsertSchema(customLists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomListItemSchema = createInsertSchema(
  customListItems
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomListCollaboratorSchema = createInsertSchema(
  customListCollaborators
).omit({
  id: true,
  createdAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});

export const insertEpisodeProgressSchema = createInsertSchema(
  episodeProgress
).omit({
  id: true,
  createdAt: true,
});

// FCM token storage for push notifications
export const fcmTokens = pgTable('fcm_tokens', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  platform: varchar('platform').notNull(), // "web", "android", "ios"
  deviceInfo: jsonb('device_info'), // Browser/device details
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Notification preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  episodeReleases: boolean('episode_releases').default(true),
  friendActivity: boolean('friend_activity').default(true),
  recommendations: boolean('recommendations').default(true),
  watchParties: boolean('watch_parties').default(true),
  systemUpdates: boolean('system_updates').default(false),
  emailNotifications: boolean('email_notifications').default(false),
  pushNotifications: boolean('push_notifications').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Notification history/logs
export const notificationHistory = pgTable('notification_history', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title').notNull(),
  body: text('body').notNull(),
  type: varchar('type').notNull(), // "episode_release", "friend_activity", etc.
  status: varchar('status').notNull().default('sent'), // "sent", "delivered", "failed"
  platform: varchar('platform').notNull(), // "web", "android", "ios"
  metadata: jsonb('metadata'), // Additional notification data
  sentAt: timestamp('sent_at').defaultNow(),
});

// Insert schemas for FCM tables
export const insertFcmTokenSchema = createInsertSchema(fcmTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationPreferencesSchema = createInsertSchema(
  notificationPreferences
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationHistorySchema = createInsertSchema(
  notificationHistory
).omit({
  id: true,
  sentAt: true,
});

// Additional insert schemas that were missing
export const insertContactImportSchema = createInsertSchema(
  contactImports
).omit({
  id: true,
  createdAt: true,
});

export const insertFriendSuggestionSchema = createInsertSchema(
  friendSuggestions
).omit({
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
export type InsertFriendSuggestion = z.infer<
  typeof insertFriendSuggestionSchema
>;
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
export type InsertUserSportsPreferences = z.infer<
  typeof insertUserSportsPreferencesSchema
>;
export type SportsActivity = typeof sportsActivities.$inferSelect;
export type InsertSportsActivity = z.infer<typeof insertSportsActivitySchema>;

// AI and Search Alert types
export type SearchAlert = typeof searchAlerts.$inferSelect;
export type InsertSearchAlert = z.infer<typeof insertSearchAlertSchema>;
export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = z.infer<
  typeof insertAiRecommendationSchema
>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

// Awards types
export type Award = typeof awards.$inferSelect;
export type InsertAward = z.infer<typeof insertAwardSchema>;
export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;
export type AwardCeremony = typeof awardCeremonies.$inferSelect;
export type InsertAwardCeremony = z.infer<typeof insertAwardCeremonySchema>;
export type AwardCategory = typeof awardCategories.$inferSelect;
export type InsertAwardCategory = z.infer<typeof insertAwardCategorySchema>;
export type SeasonalAwardRecommendation = typeof seasonalAwardRecommendations.$inferSelect;
export type InsertSeasonalAwardRecommendation = z.infer<typeof insertSeasonalAwardRecommendationSchema>;

// Normalized table types
export type Genre = typeof genres.$inferSelect;
export type InsertGenre = z.infer<typeof insertGenreSchema>;
export type ShowGenre = typeof showGenres.$inferSelect;
export type InsertShowGenre = z.infer<typeof insertShowGenreSchema>;
export type UserGenrePreference = typeof userGenrePreferences.$inferSelect;
export type InsertUserGenrePreference = z.infer<typeof insertUserGenrePreferenceSchema>;
export type UserPlatformPreference = typeof userPlatformPreferences.$inferSelect;
export type InsertUserPlatformPreference = z.infer<typeof insertUserPlatformPreferenceSchema>;
export type NotificationSchedule = typeof notificationSchedules.$inferSelect;
export type InsertNotificationSchedule = z.infer<typeof insertNotificationScheduleSchema>;

// Streaming Integration types
export type StreamingIntegration = typeof streamingIntegrations.$inferSelect;
export type InsertStreamingIntegration = z.infer<
  typeof insertStreamingIntegrationSchema
>;
export type ViewingHistory = typeof viewingHistory.$inferSelect;
export type InsertViewingHistory = z.infer<typeof insertViewingHistorySchema>;
export type UserBehavior = typeof userBehavior.$inferSelect;
export type InsertUserBehavior = z.infer<typeof insertUserBehaviorSchema>;
export type RecommendationTraining = typeof recommendationTraining.$inferSelect;
export type InsertRecommendationTraining = z.infer<
  typeof insertRecommendationTrainingSchema
>;
export type PlatformConfig = typeof platformConfigs.$inferSelect;
export type InsertPlatformConfig = z.infer<typeof insertPlatformConfigSchema>;

// Custom Lists types
export type CustomList = typeof customLists.$inferSelect;
export type InsertCustomList = z.infer<typeof insertCustomListSchema>;
export type CustomListItem = typeof customListItems.$inferSelect;
export type InsertCustomListItem = z.infer<typeof insertCustomListItemSchema>;
export type CustomListCollaborator =
  typeof customListCollaborators.$inferSelect;
export type InsertCustomListCollaborator = z.infer<
  typeof insertCustomListCollaboratorSchema
>;

// Enhanced stats types
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type EpisodeProgress = typeof episodeProgress.$inferSelect;
export type InsertEpisodeProgress = z.infer<typeof insertEpisodeProgressSchema>;

// FCM and Notification types
export type FcmToken = typeof fcmTokens.$inferSelect;
export type InsertFcmToken = z.infer<typeof insertFcmTokenSchema>;
export type NotificationPreferences =
  typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = z.infer<
  typeof insertNotificationPreferencesSchema
>;
export type NotificationHistory = typeof notificationHistory.$inferSelect;
export type InsertNotificationHistory = z.infer<
  typeof insertNotificationHistorySchema
>;

// Social connections schema exports
export const insertSocialConnectionSchema = createInsertSchema(
  socialConnections
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SocialConnection = typeof socialConnections.$inferSelect;
export type InsertSocialConnection = z.infer<
  typeof insertSocialConnectionSchema
>;



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
