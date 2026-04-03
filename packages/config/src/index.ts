import type { z } from "zod";

export type RuntimeFileLoader = (relativePath: string) => string | null;
export type RuntimeConfigSchema<TOutput = unknown> = z.ZodType<TOutput>;
export type RuntimeConfigOutput<TSchema extends RuntimeConfigSchema> = z.output<TSchema>;

export interface LoadValidatedRuntimeConfigOptions<TSchema extends RuntimeConfigSchema> {
	readonly loadFile: RuntimeFileLoader;
	readonly relativePath: string;
	readonly schema: TSchema;
	readonly sourceLabel?: string;
}

function readRuntimeJson(
	loadFile: RuntimeFileLoader,
	relativePath: string,
	sourceLabel: string,
): unknown {
	const raw = loadFile(relativePath);
	if (typeof raw !== "string") {
		throw new TypeError(`[${sourceLabel}] Missing runtime JSON file: ${relativePath}`);
	}

	try {
		return JSON.parse(raw) as unknown;
	} catch (error) {
		throw new Error(
			`[${sourceLabel}] Invalid JSON in ${relativePath}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}

export function loadValidatedRuntimeConfig<TSchema extends RuntimeConfigSchema>(
	options: LoadValidatedRuntimeConfigOptions<TSchema>,
): RuntimeConfigOutput<TSchema> {
	const sourceLabel = options.sourceLabel ?? "config";
	const rawConfig = readRuntimeJson(options.loadFile, options.relativePath, sourceLabel);
	const parsed = options.schema.safeParse(rawConfig);
	if (!parsed.success) {
		throw new Error(
			`[${sourceLabel}] Invalid config at ${options.relativePath}. ${JSON.stringify(parsed.error.format())}`,
		);
	}

	return parsed.data;
}

export function createCachedRuntimeConfigLoader<TSchema extends RuntimeConfigSchema>(
	options: LoadValidatedRuntimeConfigOptions<TSchema>,
): () => RuntimeConfigOutput<TSchema> {
	let cachedConfig: RuntimeConfigOutput<TSchema> | null = null;

	return (): RuntimeConfigOutput<TSchema> => {
		if (cachedConfig) {
			return cachedConfig;
		}

		cachedConfig = loadValidatedRuntimeConfig(options);
		return cachedConfig;
	};
}
