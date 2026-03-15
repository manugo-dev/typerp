import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const coreMetadata = pgTable('core_metadata', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
