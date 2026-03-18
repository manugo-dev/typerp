export type LocaleCatalog = Record<string, Record<string, string>>;

export interface Language {
	readonly active: string;
	readonly fallback: string;
}

export interface GlobalLocaleSnapshot {
	readonly activeCatalog: LocaleCatalog;
	readonly activeLocale: string;
	readonly fallbackCatalog: LocaleCatalog;
	readonly fallbackLocale: string;
}
