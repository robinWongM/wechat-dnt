import 'dotenv/config';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';

// This will run migrations on the database, skipping the ones already applied
await migrate(db, { migrationsFolder: './server/drizzle' });
