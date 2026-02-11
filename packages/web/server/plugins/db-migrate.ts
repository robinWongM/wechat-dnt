import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "~/server/utils/db";

const migrationFolderCandidates = [
  resolve(process.cwd(), "drizzle"),
  resolve(process.cwd(), "server/drizzle"),
  resolve(process.cwd(), "packages/web/server/drizzle"),
];

let migrationPromise: Promise<void> | null = null;

const resolveMigrationFolder = () =>
  migrationFolderCandidates.find((folder) => existsSync(folder));

const runMigrations = async () => {
  const folder = resolveMigrationFolder();
  if (!folder) {
    throw createError({
      statusCode: 500,
      statusMessage: "Migration folder not found",
    });
  }

  await migrate(db, { migrationsFolder: folder });
};

export default defineNitroPlugin(async () => {
  if (!migrationPromise) {
    migrationPromise = runMigrations();
  }

  await migrationPromise;
});
