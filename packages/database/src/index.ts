import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export function createDatabaseClient() {
	const databaseUrl = "";

	if (!databaseUrl) {
		throw new Error(
			"[Database] DATABASE_URL is not configured. Set DATABASE_URL as an environment variable.",
		);
	}

	const queryClient = postgres(databaseUrl, { max: 10 });
	return drizzle(queryClient, { schema });
}

export { schema };
export * from "drizzle-orm";
