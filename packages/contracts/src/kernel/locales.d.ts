export type LocaleCatalog = Record<string, Record<string, string>>;

export interface Language {
	readonly active: string;
	readonly fallback: string;
}

export interface GlobalLocaleSnapshot {
	readonly activeLocale: string;
	readonly fallbackLocale: string;
	readonly activeCatalog: LocaleCatalog;
	readonly fallbackCatalog: LocaleCatalog;
}
