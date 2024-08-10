import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../../schema';

export const sqlite = new Database('./cache.db');
export const db = drizzle(sqlite, { schema });
