import { getRedisConnection } from "@typerp/redis";

import { environmentConfig } from "./config.server";

interface KernelRedis {
	readonly connection: ReturnType<typeof getRedisConnection>;
}

let cachedRedisServices: KernelRedis | null = null;

export function initializeRedis(): KernelRedis {
	if (cachedRedisServices) {
		return cachedRedisServices;
	}

	cachedRedisServices = {
		connection: getRedisConnection(environmentConfig.redisUrl),
	};

	return cachedRedisServices;
}
