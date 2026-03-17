import { createTranslator, readLocaleCatalog, type LocaleCatalog, type LocaleTranslator } from "@typerp/i18n";
import type { GlobalLocaleSnapshot } from "@typerp/contracts/kernel/locales";

let translator: LocaleTranslator = createTranslator({ activeLocale: "en" });

function parseLocaleFile(resourceName: string, locale: string): LocaleCatalog {
	return readLocaleCatalog(
		(relativePath: string) => LoadResourceFile(resourceName, relativePath),
		locale,
		{ sourceLabel: "identity" },
	);
}

export function loadIdentityLocales(resourceName: string, globalSnapshot: GlobalLocaleSnapshot): void {
	const localFallbackCatalog = parseLocaleFile(resourceName, globalSnapshot.fallbackLocale);
	let localActiveCatalog = localFallbackCatalog;
	if (globalSnapshot.activeLocale !== globalSnapshot.fallbackLocale) {
		try {
			localActiveCatalog = parseLocaleFile(resourceName, globalSnapshot.activeLocale);
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

export function tIdentity(key: string): string {
	return translator.t("identity", key);
}
