CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`is_notice` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `posts_author_id_index` ON `posts` (`author_id`);--> statement-breakpoint
CREATE INDEX `posts_created_at_index` ON `posts` (`created_at`);--> statement-breakpoint
CREATE INDEX `posts_notice_created_at_index` ON `posts` (`is_notice`,`created_at`);