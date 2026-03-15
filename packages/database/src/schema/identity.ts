/**
 * @trp/database — Identity schema (Drizzle ORM)
 *
 * Defines the `characters` table for persistent identity data.
 */
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  licenseId: text('license_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
