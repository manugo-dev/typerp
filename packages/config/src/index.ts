import { z } from 'zod';
import { parse as parseJsonc } from 'jsonc-parser';
import * as fs from 'node:fs';
import * as path from 'node:path';

const FrameworkConfigSchema = z.object({
  name: z.string().default('trp-framework'),
  version: z.string().default('0.0.0'),
  locale: z.string().default('en'),
  timezone: z.string().default('UTC'),
  debugMode: z.boolean().default(false),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
});

export type FrameworkConfig = z.infer<typeof FrameworkConfigSchema>;

let _config: FrameworkConfig | null = null;

function findConfigFile(startDir: string): string | null {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'config', 'framework.config.jsonc');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function readJsoncFile(filePath: string): Record<string, unknown> {
  const raw = fs.readFileSync(filePath, 'utf8');
  const errors: import('jsonc-parser').ParseError[] = [];
  const parsed = parseJsonc(raw, errors, { allowTrailingComma: true });
  if (errors.length > 0) {
    throw new Error(
      `[Config] Failed to parse ${filePath}: ${errors.map((e) => `offset ${e.offset}, error ${e.error}`).join(', ')}`,
    );
  }
  return parsed as Record<string, unknown>;
}

export function loadConfig(): FrameworkConfig {
  if (_config) return _config;

  const configPath = findConfigFile(process.cwd());

  let base: Record<string, unknown> = {};
  if (configPath) {
    base = readJsoncFile(configPath);
  } else {
    console.warn('[Config] config/framework.config.jsonc not found — using schema defaults only.');
  }

  const envOverrides: Record<string, unknown> = {};
  if (process.env['DATABASE_URL']) envOverrides['DATABASE_URL'] = process.env['DATABASE_URL'];
  if (process.env['REDIS_URL']) envOverrides['REDIS_URL'] = process.env['REDIS_URL'];

  const merged = { ...base, ...envOverrides };

  const result = FrameworkConfigSchema.safeParse(merged);
  if (!result.success) {
    console.error('[Config] Configuration validation failed:', result.error.format());
    throw new Error('[Config] Invalid framework configuration. See errors above.');
  }

  _config = result.data;
  return _config;
}

export function getConfig(): FrameworkConfig {
  return _config ?? loadConfig();
}

export function resetConfig(): void {
  _config = null;
}

export { FrameworkConfigSchema };
