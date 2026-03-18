import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export { eq } from "drizzle-orm";
export * as schema from "./schema";

let cachedSqlClient: ReturnType<typeof postgres> | null = null;
let cachedDatabase: ReturnType<typeof drizzleDatabase> | null = null;

function drizzleDatabase(sqlClient: ReturnType<typeof postgres>) {
	return drizzle(sqlClient, { schema });
}

export function createDatabaseClient(databaseUrl: string) {
	if (cachedDatabase) {
		return cachedDatabase;
	}

	if (!cachedSqlClient) {
		cachedSqlClient = postgres(databaseUrl, { max: 10 });
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
