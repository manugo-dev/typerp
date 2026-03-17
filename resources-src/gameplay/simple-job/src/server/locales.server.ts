import { createTranslator, readLocaleCatalog, type LocaleCatalog, type LocaleTranslator } from "@typerp/i18n";
import type { GlobalLocaleSnapshot } from "@typerp/contracts/kernel/locales";

let translator: LocaleTranslator = createTranslator({ activeLocale: "en" });

function loadLocaleFile(resourceName: string, locale: string): LocaleCatalog {
	return readLocaleCatalog(
		(relativePath: string) => LoadResourceFile(resourceName, relativePath),
		locale,
		{ sourceLabel: "job-simple" },
	);
}

export function loadJobLocales(resourceName: string, globalSnapshot: GlobalLocaleSnapshot): void {
	const localFallbackCatalog = loadLocaleFile(resourceName, globalSnapshot.fallbackLocale);
	let localActiveCatalog = localFallbackCatalog;
	if (globalSnapshot.activeLocale !== globalSnapshot.fallbackLocale) {
		try {
			localActiveCatalog = loadLocaleFile(resourceName, globalSnapshot.activeLocale);
		} catch {
			localActiveCatalog = localFallbackCatalog;
		}
	}

	translator = createTranslator({
		activeLocale: globalSnapshot.activeLocale,
		fallbackLocale: globalSnapshot.fallbackLocale,
		globalActiveCatalog: globalSnapshot.activeCatalog,
		globalFallbackCatalog: globalSnapshot.fallbackCatalog,
		localActiveCatalog,
		localFallbackCatalog,
	});
}

export function tJob(key: string, params?: Record<string, number | string>): string {
	return translator.t("job", key, params);
}
