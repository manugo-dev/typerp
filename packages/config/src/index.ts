/**
 * @trp/config — JSONC-first configuration loader
 *
 * Primary source of truth: `config/framework.config.jsonc` at the monorepo root.
 * Environment variable overrides are allowed ONLY for infrastructure secrets such as
 * DATABASE_URL and REDIS_URL, which must not be committed in clear text.
 *
 * Uses `jsonc-parser` for parsing the JSONC config file (supports comments).
 * All values are validated with Zod v4 after merging JSONC + env overrides.
 */
import { z } from 'zod';
import { parse as parseJsonc } from 'jsonc-parser';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const FrameworkConfigSchema = z.object({
  name: z.string().default('trp-framework'),
  version: z.string().default('0.0.0'),
  locale: z.string().default('en'),
  timezone: z.string().default('UTC'),
  debugMode: z.boolean().default(false),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Infrastructure secrets: sourced from env vars only and NOT stored in jsonc
  // These are merged on top of the JSONC file at load time.
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
});

export type FrameworkConfig = z.infer<typeof FrameworkConfigSchema>;

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

let _config: FrameworkConfig | null = null;

/**
 * Resolve the path to `config/framework.config.jsonc`.
 * Searches upward from `process.cwd()` so it works from both the monorepo root
 * and from inside a resource bundle running inside FiveM.
 */
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

/**
 * Load and validate the framework configuration.
 * Call once at startup; subsequent calls return the cached config.
 */
export function loadConfig(): FrameworkConfig {
  if (_config) return _config;

  const configPath = findConfigFile(process.cwd());

  let base: Record<string, unknown> = {};
  if (configPath) {
    base = readJsoncFile(configPath);
  } else {
    console.warn('[Config] config/framework.config.jsonc not found — using schema defaults only.');
  }

  // Merge infrastructure secret overrides from environment variables
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

/**
 * Get the already-loaded config. Calls `loadConfig()` on first access.
 */
export function getConfig(): FrameworkConfig {
  return _config ?? loadConfig();
}

/** Reset cached config (used in tests or hot-reload scenarios) */
export function resetConfig(): void {
  _config = null;
}

export { FrameworkConfigSchema };
export * from 'zod';
