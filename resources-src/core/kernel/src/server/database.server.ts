import { createDatabaseClient, eq, schema } from "@typerp/database";
import { environmentConfig } from "./config.server";
import { getRedisConnection } from "@typerp/redis";
import { KernelDatabase, KernelRedis } from "@typerp/contracts/kernel/types";

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
