import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const previewCache = sqliteTable('previewCache', {
  id: integer('id').primaryKey(),
  fullLink: text('fullLink').unique(),
  title: text('title'),
  description: text('description'),
  image: text('image'),
  authorName: text('authorName'),
  authorAvatar: text('authorAvatar'),
});
