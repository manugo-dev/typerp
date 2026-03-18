import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const kernelMetadata = pgTable("kernelMetadata", {
	id: serial("id").primaryKey(),
	key: text("key").notNull().unique(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	value: text("value"),
});
