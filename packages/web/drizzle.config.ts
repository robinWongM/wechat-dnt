import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/schema.ts',
  out: './server/drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './cache.db',
  },
});
