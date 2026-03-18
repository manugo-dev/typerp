import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const characters = pgTable("characters", {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	dateOfBirth: text("date_of_birth").notNull(),
	firstName: text("first_name").notNull(),
	id: serial("id").primaryKey(),
	lastName: text("last_name").notNull(),
	licenseId: text("license_id").notNull(),
});
