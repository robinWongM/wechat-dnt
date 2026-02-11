import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../schema';

export const sqlite = new Database('./data/cache.db', { create: true });
export const db = drizzle(sqlite, { schema });
