export type LocaleCatalog = Record<string, Record<string, string>>;
export type LocaleParams = Record<string, number | string>;

export interface LocaleSnapshot {
	readonly activeCatalog: LocaleCatalog;
	readonly activeLocale: string;
	readonly fallbackCatalog: LocaleCatalog;
	readonly fallbackLocale: string;
}

export interface LocaleTranslator {
	readonly activeLocale: string;
	readonly fallbackLocale: string;
	t: (namespace: string, key: string, params?: LocaleParams) => string;
}

export interface LocaleTranslatorOptions {
	readonly activeLocale: string;
	readonly fallbackLocale?: string;
	readonly globalActiveCatalog?: LocaleCatalog;
	readonly globalFallbackCatalog?: LocaleCatalog;
	readonly localActiveCatalog?: LocaleCatalog;
	readonly localFallbackCatalog?: LocaleCatalog;
}

export interface ReadLocaleCatalogOptions {
	readonly basePath?: string;
	readonly sourceLabel?: string;
}

function mergeCatalogs(base: LocaleCatalog, override: LocaleCatalog): LocaleCatalog {
	const merged: LocaleCatalog = { ...base };
	for (const [namespace, namespaceValues] of Object.entries(override)) {
		merged[namespace] = {
			...base[namespace],
			...namespaceValues,
		};
	}
	return merged;
}

function renderTemplate(template: string, params?: LocaleParams): string {
	if (!params) {
		return template;
	}

	let rendered = template;
	for (const [key, value] of Object.entries(params)) {
		const encoded = String(value);
		rendered = rendered.replaceAll(`{${key}}`, encoded);
		rendered = rendered.replaceAll(`\${${key}}`, encoded);
	}
	return rendered;
}

export function createTranslator(options: LocaleTranslatorOptions): LocaleTranslator {
	const fallbackLocale = options.fallbackLocale ?? "en";

	const globalActive = options.globalActiveCatalog ?? {};
	const globalFallback = options.globalFallbackCatalog ?? {};
	const localActive = options.localActiveCatalog ?? {};
	const localFallback = options.localFallbackCatalog ?? {};

	const resolvedActive = mergeCatalogs(globalActive, localActive);
	const resolvedFallback = mergeCatalogs(globalFallback, localFallback);

	return {
		activeLocale: options.activeLocale,
		fallbackLocale,
		t(namespace: string, key: string, params?: LocaleParams): string {
			const activeMessage = resolvedActive[namespace]?.[key];
			if (typeof activeMessage === "string") {
				return renderTemplate(activeMessage, params);
			}

			const fallbackMessage = resolvedFallback[namespace]?.[key];
			if (typeof fallbackMessage === "string") {
				return renderTemplate(fallbackMessage, params);
			}

			return `[missing:${namespace}:${key}]`;
		},
	};
}

export function readLocaleCatalog(
	loadFile: (relativePath: string) => string | null,
	locale: string,
	options: ReadLocaleCatalogOptions = {},
): LocaleCatalog {
	const basePath = options.basePath ?? "locales";
	const sourceLabel = options.sourceLabel ?? "locale";
	const filePath = `${basePath}/${locale}.json`;
	const raw = loadFile(filePath);

	if (typeof raw !== "string") {
		throw new TypeError(`[${sourceLabel}] Missing locale file: ${filePath}`);
	}

	try {
		return JSON.parse(raw) as LocaleCatalog;
	} catch (error) {
		throw new Error(
			`[${sourceLabel}] Invalid locale JSON (${locale}): ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}
