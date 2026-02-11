import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import * as schema from '../../schema';

const sqlitePath = resolve(process.cwd(), './data/cache.db');
mkdirSync(dirname(sqlitePath), { recursive: true });

export const sqlite = new Database(sqlitePath, { create: true });
export const db = drizzle(sqlite, { schema });
