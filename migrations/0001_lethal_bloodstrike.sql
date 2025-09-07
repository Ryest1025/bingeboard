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
ALTER TABLE `users` ADD `phone_number` text;