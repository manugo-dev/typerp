import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

// Attempt to load .env from the root of the workspace if we are in node tooling context
// In actual FiveM execution context, env vars might be passed differently,
// so this should not throw aggressively if .env isn't found, relying instead on Zod defaults/validation.
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const ConfigSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  LOCALE: z.string().default('en'),
  DEBUG_MODE: z.coerce.boolean().default(false),
});

export type Config = z.infer<typeof ConfigSchema>;

let _config: Config | null = null;

export function loadConfig(envProcess: unknown = process.env): Config {
  if (_config) return _config;

  const result = ConfigSchema.safeParse(envProcess);
  if (!result.success) {
    console.error('❌ Configuration validation failed:', result.error.format());
    throw new Error('Invalid framework configuration');
  }

  _config = result.data;
  return _config;
}

export function getConfig(): Config {
  if (!_config) {
    return loadConfig();
  }
  return _config;
}

export * from 'zod'; // Re-export zod for consumer convenience
