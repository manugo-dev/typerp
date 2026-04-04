import { createGlobalLocaleRuntime } from "@typerp/i18n";

import { frameworkConfig } from "./config.server";

const kernelLocaleRuntime = createGlobalLocaleRuntime({
	activeLocale: frameworkConfig.locale,
	fallbackLocale: frameworkConfig.fallbackLocale,
	fallbackNamespaces: ["global"],
	localesDirectory: "locales",
	supportedLocales: frameworkConfig.supportedLocales,
});

export function getActiveLocale(): string {
	return kernelLocaleRuntime.getActiveLocale();
}

export function getGlobalLocaleSnapshot() {
	return kernelLocaleRuntime.getGlobalLocaleSnapshot();
}

export function setActiveLocale(locale: string): string {
	return kernelLocaleRuntime.setActiveLocale(locale);
}

export function tGlobal(key: string, interpolationValues?: Record<string, unknown>): string {
	return String(kernelLocaleRuntime.t(key, interpolationValues));
}
