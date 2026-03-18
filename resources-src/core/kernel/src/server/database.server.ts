import { createDatabaseClient, eq, schema } from "@typerp/database";

import { environmentConfig } from "./config.server";

interface KernelDatabase {
	readonly db: ReturnType<typeof createDatabaseClient>;
	readonly eq: typeof eq;
	readonly schema: typeof schema;
}

let cachedDatabaseServices: KernelDatabase | null = null;

export function initializeDatabase(): KernelDatabase {
	if (cachedDatabaseServices) {
		return cachedDatabaseServices;
	}

	cachedDatabaseServices = {
		db: createDatabaseClient(environmentConfig.databaseUrl),
		eq,
		schema,
	};

	return cachedDatabaseServices;
}
