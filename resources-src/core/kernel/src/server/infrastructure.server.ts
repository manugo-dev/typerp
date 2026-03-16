import type { KernelInfrastructureServices } from "@typerp/contracts/kernel/types";
import { getRedisConnection } from "@typerp/redis";
import { initializeKernelDatabaseServices } from "./database.server";

let cachedServices: KernelInfrastructureServices | null = null;

export function initializeInfrastructureServices(): KernelInfrastructureServices {
	if (cachedServices) {
		return cachedServices;
	}

	const database = initializeKernelDatabaseServices();
	const redisConnection = getRedisConnection();

	cachedServices = {
		database,
		redis: {
			connection: redisConnection,
		},
	};

	return cachedServices;
}
