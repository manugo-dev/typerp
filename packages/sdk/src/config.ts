import {
	loadValidatedRuntimeConfig,
	type RuntimeConfigOutput,
	type RuntimeConfigSchema,
} from "@typerp/config";

export interface LoadResourceConfigOptions<TSchema extends RuntimeConfigSchema> {
	readonly configFile: string;
	readonly resourceName?: string;
	readonly schema: TSchema;
	readonly sourceLabel?: string;
}

const configCache = new Map<string, unknown>();

function resolveResourceName(resourceName?: string): string {
	if (resourceName) {
		return resourceName;
	}

	if (typeof GetCurrentResourceName === "function") {
		return GetCurrentResourceName();
	}

	throw new Error("[SDK] Could not resolve resource name for config loading.");
}

export function loadResourceConfig<TSchema extends RuntimeConfigSchema>(
	options: LoadResourceConfigOptions<TSchema>,
): RuntimeConfigOutput<TSchema> {
	const resourceName = resolveResourceName(options.resourceName);
	const cacheKey = `${resourceName}:${options.configFile}`;
	const cached = configCache.get(cacheKey);
	if (cached) {
		return cached as RuntimeConfigOutput<TSchema>;
	}

	const config = loadValidatedRuntimeConfig({
		loadFile: (relativePath: string) => LoadResourceFile(resourceName, relativePath),
		relativePath: options.configFile,
		schema: options.schema,
		sourceLabel: options.sourceLabel ?? resourceName,
	});

	configCache.set(cacheKey, config);
	return config;
}
