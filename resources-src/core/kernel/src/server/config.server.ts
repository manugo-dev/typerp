import { EnvironmentConfigSchema, FrameworkConfigSchema } from "@typerp/contracts/config/schemas";
import type { EnvironmentConfig, FrameworkConfig } from "@typerp/contracts/config/types";

const FRAMEWORK_CONFIG_FILE = "config/framework.config.json";
const ENVIRONMENT_CONFIG_FILE = "config/environment.config.json";

let cachedFrameworkConfig: FrameworkConfig | null = null;
let cachedEnvironmentConfig: EnvironmentConfig | null = null;

function readResourceJson(resourceName: string, relativePath: string): unknown {
	const raw = LoadResourceFile(resourceName, relativePath);
	if (typeof raw !== "string") {
		throw new TypeError(`[Kernel] Missing runtime JSON file: ${resourceName}/${relativePath}`);
	}

	try {
		return JSON.parse(raw) as unknown;
	} catch (error) {
		throw new Error(
			`[Kernel] Invalid JSON in ${resourceName}/${relativePath}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}

export function loadFrameworkConfig(resourceName: string): FrameworkConfig {
	if (cachedFrameworkConfig) {
		return cachedFrameworkConfig;
	}

	const rawConfig = readResourceJson(resourceName, FRAMEWORK_CONFIG_FILE);
	const parsed = FrameworkConfigSchema.safeParse(rawConfig);
	if (!parsed.success) {
		throw new Error(`[Kernel] Invalid framework config. ${JSON.stringify(parsed.error.format())}`);
	}

	cachedFrameworkConfig = parsed.data;
	return cachedFrameworkConfig;
}

function loadEnvironmentConfig(resourceName: string): EnvironmentConfig {
	if (cachedEnvironmentConfig) {
		return cachedEnvironmentConfig;
	}

	const rawConfig = readResourceJson(resourceName, ENVIRONMENT_CONFIG_FILE);
	const parsed = EnvironmentConfigSchema.safeParse(rawConfig);
	if (!parsed.success) {
		throw new Error(
			`[Kernel] Invalid environment config. ${JSON.stringify(parsed.error.format())}`,
		);
	}

	cachedEnvironmentConfig = parsed.data;
	return cachedEnvironmentConfig;
}

export const frameworkConfig = loadFrameworkConfig(GetCurrentResourceName());
export const environmentConfig = loadEnvironmentConfig(GetCurrentResourceName());
