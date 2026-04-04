import {
	createResourceLocaleRuntime,
	type ResourceLocaleRuntime,
	type Translator,
} from "@typerp/i18n";

import { resolveCurrentResourceName } from "./resource";

export interface InitResourceLocalesOptions {
	readonly fallbackNamespaces?: readonly string[];
	readonly localesDirectory?: string;
	readonly resourceName?: string;
	readonly useCache?: boolean;
}

const localeRuntimeCache = new Map<string, ResourceLocaleRuntime>();

function createRuntimeCacheKey(resourceName: string, namespace: string): string {
	return `${resourceName}:${namespace}`;
}

export function initResourceLocales(
	namespace: string,
	options: InitResourceLocalesOptions = {},
): Translator {
	const resourceName = resolveCurrentResourceName(options.resourceName, "SDK/i18n");
	const cacheKey = createRuntimeCacheKey(resourceName, namespace);
	const shouldUseCache = options.useCache ?? true;

	if (shouldUseCache) {
		const cachedRuntime = localeRuntimeCache.get(cacheKey);
		if (cachedRuntime) {
			return cachedRuntime.t;
		}
	}

	const localeRuntime = createResourceLocaleRuntime({
		namespace,
		resourceName,
		...(options.fallbackNamespaces ? { fallbackNamespaces: options.fallbackNamespaces } : {}),
		...(options.localesDirectory ? { localesDirectory: options.localesDirectory } : {}),
	});

	if (shouldUseCache) {
		localeRuntimeCache.set(cacheKey, localeRuntime);
	}

	return localeRuntime.t;
}

export function disposeResourceLocaleRuntime(namespace: string, resourceName?: string): void {
	const resolvedResourceName = resolveCurrentResourceName(resourceName, "SDK/i18n");
	const cacheKey = createRuntimeCacheKey(resolvedResourceName, namespace);
	const cachedRuntime = localeRuntimeCache.get(cacheKey);
	if (!cachedRuntime) {
		return;
	}

	cachedRuntime.dispose();
	localeRuntimeCache.delete(cacheKey);
}

export function disposeAllResourceLocaleRuntimes(): void {
	for (const runtime of localeRuntimeCache.values()) {
		runtime.dispose();
	}

	localeRuntimeCache.clear();
}
