import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

let cachedSqlClient: ReturnType<typeof postgres> | null = null;
let cachedDatabase: ReturnType<typeof drizzleDatabase> | null = null;

function drizzleDatabase(sqlClient: ReturnType<typeof postgres>) {
	return drizzle(sqlClient, { schema });
}

function resolveDatabaseUrl(): string {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error(
			"[Database] DATABASE_URL is not configured. Set DATABASE_URL as an environment variable.",
		);
	}

	return databaseUrl;
}

export function createDatabaseClient() {
	if (cachedDatabase) {
		return cachedDatabase;
	}

	if (!cachedSqlClient) {
		cachedSqlClient = postgres(resolveDatabaseUrl(), { max: 10 });
	}

	cachedDatabase = drizzleDatabase(cachedSqlClient);
	return cachedDatabase;
}

export async function closeDatabaseClient(): Promise<void> {
	if (!cachedSqlClient) {
		return;
	}

	await cachedSqlClient.end({ timeout: 5 });
	cachedSqlClient = null;
	cachedDatabase = null;
}

export { schema };
export { eq };
