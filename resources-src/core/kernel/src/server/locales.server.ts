import type { GlobalLocaleSnapshot, Language } from "@typerp/contracts/kernel/locales";
import { createTranslator, readLocaleCatalog, type LocaleCatalog, type LocaleTranslator } from "@typerp/i18n";

import { frameworkConfig } from "./config.server";

const DEFAULT_FALLBACK_LOCALE = "en";

let activeLocale = frameworkConfig.locale ?? DEFAULT_FALLBACK_LOCALE;
let fallbackLocale = DEFAULT_FALLBACK_LOCALE;
let activeCatalog: LocaleCatalog = {};
let fallbackCatalog: LocaleCatalog = {};
let translator: LocaleTranslator = createTranslator({
	activeLocale: DEFAULT_FALLBACK_LOCALE,
	fallbackLocale: DEFAULT_FALLBACK_LOCALE,
});

function readKernelLocale(locale: string): LocaleCatalog {
	return readLocaleCatalog(
		(relativePath: string) => LoadResourceFile(GetCurrentResourceName(), relativePath),
		locale,
		{ sourceLabel: "core-kernel" },
	);
}

export function getLanguage(): Language {
	return { active: activeLocale, fallback: fallbackLocale };
}

export function getActiveLanguage(): string {
	return activeLocale;
}

export function getGlobalLocales(): GlobalLocaleSnapshot {
	return {
		activeCatalog,
		activeLocale,
		fallbackCatalog,
		fallbackLocale,
	};
}

export function initializeGlobalLocales(): GlobalLocaleSnapshot {
	fallbackCatalog = readKernelLocale(fallbackLocale);
	if (activeLocale === fallbackLocale) {
		activeCatalog = fallbackCatalog;
	} else {
		try {
			activeCatalog = readKernelLocale(activeLocale);
		} catch {
			activeLocale = fallbackLocale;
			activeCatalog = fallbackCatalog;
		}
	}

	translator = createTranslator({
		activeLocale,
		fallbackLocale,
		globalActiveCatalog: activeCatalog,
		globalFallbackCatalog: fallbackCatalog,
	});

	return getGlobalLocales();
}

export function tGlobal(namespace: string, key: string, params?: Record<string, number | string>): string {
	return translator.t(namespace, key, params);
}
