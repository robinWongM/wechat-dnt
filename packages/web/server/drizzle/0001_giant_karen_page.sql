CREATE TABLE `kfSyncCursor` (
	`id` integer PRIMARY KEY NOT NULL,
	`openKfid` text NOT NULL,
	`cursor` text,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kfSyncCursor_openKfid_unique` ON `kfSyncCursor` (`openKfid`);