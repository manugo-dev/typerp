import { Redis } from 'ioredis';
import { Queue, Worker, Job } from 'bullmq';
import { getConfig } from '@trp/config';

// Redis connection instance
let sharedRedisConnection: Redis;

export function getRedisConnection(): Redis {
  if (!sharedRedisConnection) {
    const config = getConfig();
    sharedRedisConnection = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: null,
    });
  }
  return sharedRedisConnection;
}

// BullMQ helpers
export function createQueue(name: string) {
  return new Queue(name, { connection: getRedisConnection() });
}

export function createWorker<T, R>(name: string, processor: (job: Job<T, R>) => Promise<R>) {
  return new Worker(name, processor, { connection: getRedisConnection() });
}

export { Queue, Worker, Job, Redis };
