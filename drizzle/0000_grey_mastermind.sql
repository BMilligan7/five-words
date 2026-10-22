CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`object_key` text NOT NULL,
	`share_token` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `photos_owner` ON `photos` (`owner_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `photos_share_token` ON `photos` (`share_token`);--> statement-breakpoint
CREATE TABLE `photo_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`photo_id` text NOT NULL,
	`respondent_hash` text NOT NULL,
	`words` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `responses_photo_browser` ON `photo_responses` (`photo_id`,`respondent_hash`);