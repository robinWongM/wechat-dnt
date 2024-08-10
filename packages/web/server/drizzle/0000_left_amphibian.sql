CREATE TABLE `previewCache` (
	`id` integer PRIMARY KEY NOT NULL,
	`fullLink` text,
	`title` text,
	`description` text,
	`image` text,
	`authorName` text,
	`authorAvatar` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `previewCache_fullLink_unique` ON `previewCache` (`fullLink`);