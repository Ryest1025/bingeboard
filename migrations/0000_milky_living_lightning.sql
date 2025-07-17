CREATE TABLE `movies` (
	`id` integer PRIMARY KEY NOT NULL,
	`tmdb_id` integer,
	`imdb_id` text,
	`title` text NOT NULL,
	`original_title` text,
	`overview` text,
	`poster_path` text,
	`backdrop_path` text,
	`release_date` text,
	`runtime` integer,
	`status` text,
	`genres` text,
	`production_companies` text,
	`production_countries` text,
	`spoken_languages` text,
	`original_language` text,
	`popularity` real,
	`vote_average` real,
	`vote_count` integer,
	`budget` integer,
	`revenue` integer,
	`homepage` text,
	`tagline` text,
	`adult` integer,
	`belongs_to_collection` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movies_tmdb_id_unique` ON `movies` (`tmdb_id`);--> statement-breakpoint
CREATE TABLE `password_reset_codes` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`email` text,
	`phone_number` text,
	`delivery_method` text NOT NULL,
	`is_used` integer DEFAULT 0,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sid` text PRIMARY KEY NOT NULL,
	`sess` text NOT NULL,
	`expire` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `IDX_session_expire` ON `sessions` (`expire`);--> statement-breakpoint
CREATE TABLE `shows` (
	`id` integer PRIMARY KEY NOT NULL,
	`tmdb_id` integer,
	`imdb_id` text,
	`title` text NOT NULL,
	`original_title` text,
	`overview` text,
	`poster_path` text,
	`backdrop_path` text,
	`first_air_date` text,
	`last_air_date` text,
	`status` text,
	`type` text,
	`genres` text,
	`networks` text,
	`production_companies` text,
	`origin_country` text,
	`original_language` text,
	`popularity` real,
	`vote_average` real,
	`vote_count` integer,
	`number_of_seasons` integer,
	`number_of_episodes` integer,
	`episode_run_time` text,
	`in_production` integer,
	`languages` text,
	`homepage` text,
	`tagline` text,
	`adult` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shows_tmdb_id_unique` ON `shows` (`tmdb_id`);--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`preferred_genres` text,
	`excluded_genres` text,
	`preferred_languages` text,
	`adult_content` integer DEFAULT 0,
	`notification_settings` text,
	`privacy_settings` text,
	`preferred_networks` text,
	`watching_habits` text,
	`content_rating` text DEFAULT 'All',
	`language_preferences` text,
	`ai_personality` text DEFAULT 'balanced',
	`notification_frequency` text DEFAULT 'weekly',
	`favorite_sports` text,
	`favorite_teams` text,
	`sports_notifications` integer DEFAULT 1,
	`onboarding_completed` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`username` text,
	`first_name` text,
	`last_name` text,
	`phone_number` text,
	`profile_image_url` text,
	`password_hash` text,
	`auth_provider` text DEFAULT 'firebase',
	`facebook_id` text,
	`google_id` text,
	`email_verified` integer DEFAULT 0,
	`reset_token` text,
	`reset_token_expires` integer,
	`onboarding_completed` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `watch_history` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content_type` text NOT NULL,
	`content_id` integer NOT NULL,
	`watched_at` integer NOT NULL,
	`rating` integer,
	`review` text,
	`progress` real DEFAULT 0,
	`completed` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `watchlist` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content_type` text NOT NULL,
	`content_id` integer NOT NULL,
	`status` text DEFAULT 'plan_to_watch',
	`priority` integer DEFAULT 0,
	`notes` text,
	`added_at` integer NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer,
	`updated_at` integer
);
