import { KernelRedis } from "@typerp/contracts/kernel/types";
import { getRedisConnection } from "@typerp/redis";
import { environmentConfig } from "./config.server";

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
