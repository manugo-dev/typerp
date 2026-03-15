/**
 * @trp/redis — Redis connection and BullMQ helpers
 *
 * Context: SERVER only.
 * REDIS_URL must be provided as an environment variable override when running with
 * the JSONC-based config, since connection secrets are not stored in JSONC.
 */
import { Redis, type RedisOptions } from 'ioredis';
import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import type { Processor } from 'bullmq';
import { getConfig } from '@trp/config';

// Shared singleton connection
let sharedRedisConnection: Redis | undefined;

function getRedisUrl(): string {
  const config = getConfig();
  const url = config.REDIS_URL;
  if (!url) {
    throw new Error('[Redis] REDIS_URL is not configured. Set REDIS_URL as an environment variable.');
  }
  return url;
}

export function getRedisConnection(): Redis {
  if (!sharedRedisConnection) {
    // BullMQ requires maxRetriesPerRequest: null — we disable the eslint rule for this one line
    // because the ioredis types conflict with strictOptionalProperties under exactOptionalPropertyTypes.
    const options: RedisOptions = { maxRetriesPerRequest: null as unknown as number };
    sharedRedisConnection = new Redis(getRedisUrl(), options);
  }
  return sharedRedisConnection;
}

// ---------------------------------------------------------------------------
// BullMQ helpers
// ---------------------------------------------------------------------------

// The connection type between ioredis and bullmq is compatible at runtime but
// the TS generics diverge slightly. We use ConnectionOptions which accepts IORedis.
function getConnection(): ConnectionOptions {
  return getRedisConnection() as unknown as ConnectionOptions;
}

export function createQueue<T = unknown, R = unknown>(name: string) {
  return new Queue<T, R>(name, { connection: getConnection() });
}

export function createWorker<T = unknown, R = unknown>(
  name: string,
  processor: Processor<T, R>,
) {
  return new Worker<T, R>(name, processor, { connection: getConnection() });
}

export { Queue, Worker, Redis };
export type { RedisOptions, ConnectionOptions };
