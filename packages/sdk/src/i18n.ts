import type { GlobalLocaleSnapshot } from "@typerp/contracts/kernel/locales";
import { createTranslator, type LocaleParams, readLocaleCatalog } from "@typerp/i18n";

import { getKernelExports } from "./kernel";

export function initResourceLocales(
	resourceName: string,
	namespace: string,
): (key: string, params?: LocaleParams) => string {
	const snapshot: GlobalLocaleSnapshot = getKernelExports().getGlobalLocaleSnapshot();

	const loadFile = (relativePath: string): string | null =>
		LoadResourceFile(resourceName, relativePath);

	const localFallback = readLocaleCatalog(loadFile, snapshot.fallbackLocale, {
		sourceLabel: namespace,
	});

	let localActive = localFallback;
	if (snapshot.activeLocale !== snapshot.fallbackLocale) {
		try {
			localActive = readLocaleCatalog(loadFile, snapshot.activeLocale, {
				sourceLabel: namespace,
			});
		} catch {
			localActive = localFallback;
		}
	}

	const translator = createTranslator({
		activeLocale: snapshot.activeLocale,
		fallbackLocale: snapshot.fallbackLocale,
		globalActiveCatalog: snapshot.activeCatalog,
		globalFallbackCatalog: snapshot.fallbackCatalog,
		localActiveCatalog: localActive,
		localFallbackCatalog: localFallback,
	});

	return (key: string, params?: LocaleParams): string => translator.t(namespace, key, params);
}
