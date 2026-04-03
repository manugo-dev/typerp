import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export interface DatabaseServices {
	readonly db: ReturnType<typeof createDatabaseClient>;
	readonly eq: typeof eq;
	readonly schema: typeof schema;
}

let cachedSqlClient: ReturnType<typeof postgres> | null = null;
let cachedDatabase: ReturnType<typeof drizzleDatabase> | null = null;
let cachedDatabaseServices: DatabaseServices | null = null;

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

export function initializeDatabaseServices(databaseUrl: string): DatabaseServices {
	if (cachedDatabaseServices) {
		return cachedDatabaseServices;
	}

	cachedDatabaseServices = {
		db: createDatabaseClient(databaseUrl),
		eq,
		schema,
	};

	return cachedDatabaseServices;
}

export async function closeDatabaseClient(): Promise<void> {
	if (!cachedSqlClient) {
		return;
	}

	await cachedSqlClient.end({ timeout: 5 });
	cachedSqlClient = null;
	cachedDatabase = null;
	cachedDatabaseServices = null;
}
