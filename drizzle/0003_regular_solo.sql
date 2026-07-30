CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`author_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comments_post_id_created_at_index` ON `comments` (`post_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_author_id_index` ON `comments` (`author_id`);--> statement-breakpoint
CREATE TABLE `post_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_likes_post_user_unique` ON `post_likes` (`post_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `post_likes_post_id_index` ON `post_likes` (`post_id`);--> statement-breakpoint
CREATE INDEX `post_likes_user_id_index` ON `post_likes` (`user_id`);--> statement-breakpoint
ALTER TABLE `posts` ADD `view_count` integer DEFAULT 0 NOT NULL;