export type LocaleNamespaceCatalog = Record<string, unknown>;
export type LocaleCatalog = Record<string, LocaleNamespaceCatalog>;
export type LocaleCatalogMap = Record<string, LocaleCatalog>;

export interface KernelLocaleSnapshot {
	readonly activeLocale: string;
	readonly fallbackLocale: string;
	readonly locales: LocaleCatalogMap;
	readonly supportedLocales: readonly string[];
}
