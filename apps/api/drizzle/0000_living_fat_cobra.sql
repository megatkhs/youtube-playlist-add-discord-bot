CREATE TABLE `channel_monthly_playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`discord_channel_id` text NOT NULL,
	`target_month` text NOT NULL,
	`playlist_id` text NOT NULL,
	FOREIGN KEY (`discord_channel_id`) REFERENCES `channels`(`discord_channel_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `channel_playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`discord_channel_id` text NOT NULL,
	`playlist_id` text NOT NULL,
	FOREIGN KEY (`discord_channel_id`) REFERENCES `channels`(`discord_channel_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `channels` (
	`discord_channel_id` text PRIMARY KEY NOT NULL,
	`create_monthly_playlist` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `credentials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text NOT NULL
);
