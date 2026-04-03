import { EnvironmentConfigSchema, FrameworkConfigSchema } from "@typerp/contracts/config/schemas";
import type { EnvironmentConfig, FrameworkConfig } from "@typerp/contracts/config/types";

import { createCachedRuntimeConfigLoader } from "@typerp/config";

const FRAMEWORK_CONFIG_FILE = "config/framework.config.json";
const ENVIRONMENT_CONFIG_FILE = "config/environment.config.json";

const frameworkConfigLoaders = new Map<string, () => FrameworkConfig>();
const environmentConfigLoaders = new Map<string, () => EnvironmentConfig>();

function createResourceFileLoader(resourceName: string) {
	return (relativePath: string): string | null => LoadResourceFile(resourceName, relativePath);
}

function getFrameworkConfigLoader(resourceName: string): () => FrameworkConfig {
	const cachedLoader = frameworkConfigLoaders.get(resourceName);
	if (cachedLoader) {
		return cachedLoader;
	}

	const nextLoader = createCachedRuntimeConfigLoader({
		loadFile: createResourceFileLoader(resourceName),
		relativePath: FRAMEWORK_CONFIG_FILE,
		schema: FrameworkConfigSchema,
		sourceLabel: "Kernel",
	});
	frameworkConfigLoaders.set(resourceName, nextLoader);
	return nextLoader;
}

function getEnvironmentConfigLoader(resourceName: string): () => EnvironmentConfig {
	const cachedLoader = environmentConfigLoaders.get(resourceName);
	if (cachedLoader) {
		return cachedLoader;
	}

	const nextLoader = createCachedRuntimeConfigLoader({
		loadFile: createResourceFileLoader(resourceName),
		relativePath: ENVIRONMENT_CONFIG_FILE,
		schema: EnvironmentConfigSchema,
		sourceLabel: "Kernel",
	});
	environmentConfigLoaders.set(resourceName, nextLoader);
	return nextLoader;
}

export function loadFrameworkConfig(resourceName: string): FrameworkConfig {
	return getFrameworkConfigLoader(resourceName)();
}

function loadEnvironmentConfig(resourceName: string): EnvironmentConfig {
	return getEnvironmentConfigLoader(resourceName)();
}

export const frameworkConfig = loadFrameworkConfig(GetCurrentResourceName());
export const environmentConfig = loadEnvironmentConfig(GetCurrentResourceName());
