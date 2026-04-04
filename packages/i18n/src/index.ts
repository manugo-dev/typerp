import { createInstance, type i18n, type InitOptions, type TFunction } from "i18next";

export const DEFAULT_FALLBACK_LOCALE = "en";
export const DEFAULT_LOCALES_DIRECTORY = "locales";
export const DEFAULT_LOCALE_CHANGE_EVENT = "typerp:kernel:locale:changed";

export type LocaleNamespaceCatalog = Record<string, unknown>;
export type LocaleCatalog = Record<string, LocaleNamespaceCatalog>;
export type LocaleCatalogMap = Record<string, LocaleCatalog>;
export type Translator = TFunction;

export interface FrameworkLocaleSnapshot {
	readonly activeLocale: string;
	readonly fallbackLocale: string;
	readonly locales: LocaleCatalogMap;
	readonly supportedLocales: readonly string[];
}

interface CreateI18nextInstanceOptions {
	readonly defaultNamespace: string;
	readonly fallbackLocale: string;
	readonly fallbackNamespaces: readonly string[];
	readonly localeCatalogs: LocaleCatalogMap;
	readonly localeToUse: string;
}

export interface CreateGlobalLocaleRuntimeOptions {
	readonly activeLocale: string;
	readonly defaultNamespace?: string;
	readonly fallbackLocale?: string;
	readonly fallbackNamespaces?: readonly string[];
	readonly localesDirectory?: string;
	readonly resourceName?: string;
	readonly supportedLocales?: readonly string[];
}

export interface GlobalLocaleRuntime {
	readonly getActiveLocale: () => string;
	readonly getGlobalLocaleSnapshot: () => FrameworkLocaleSnapshot;
	readonly setActiveLocale: (locale: string) => string;
	readonly t: Translator;
}

export interface CreateResourceLocaleRuntimeOptions {
	readonly fallbackNamespaces?: readonly string[];
	readonly framework?: FrameworkLocaleBridge;
	readonly kernel?: FrameworkLocaleBridge;
	readonly localesDirectory?: string;
	readonly namespace: string;
	readonly resourceName?: string;
}

export interface ResourceLocaleRuntime {
	readonly dispose: () => void;
	readonly getActiveLocale: () => string;
	readonly t: Translator;
}

interface LoadLocaleCatalogsOptions {
	readonly localesDirectory: string;
	readonly resourceName: string;
	readonly sourceLabel: string;
	readonly supportedLocales: readonly string[];
}

function resolveCurrentResourceName(resourceName?: string, sourceLabel: string = "SDK"): string {
	if (resourceName) {
		return resourceName;
	}

	if (typeof GetCurrentResourceName === "function") {
		return GetCurrentResourceName();
	}

	throw new Error(`[${sourceLabel}] Could not resolve current resource name.`);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeLocale(locale: string): string {
	const normalizedLocale = locale.trim();
	if (!normalizedLocale) {
		throw new Error("[i18n] Locale cannot be empty.");
	}

	return normalizedLocale;
}

function normalizeLocaleList(locales: readonly string[]): string[] {
	const uniqueLocales = new Set<string>();
	for (const locale of locales) {
		const normalizedLocale = locale.trim();
		if (normalizedLocale) {
			uniqueLocales.add(normalizedLocale);
		}
	}

	return [...uniqueLocales];
}

function parseLocaleCatalog(raw: string, sourceLabel: string): LocaleCatalog {
	let parsed: unknown;

	try {
		parsed = JSON.parse(raw) as unknown;
	} catch (error) {
		throw new Error(
			`[${sourceLabel}] Invalid locale JSON: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	if (!isPlainRecord(parsed)) {
		throw new TypeError(`[${sourceLabel}] Locale file must contain a JSON object.`);
	}

	const normalizedCatalog: LocaleCatalog = {};
	for (const [namespace, namespaceCatalog] of Object.entries(parsed)) {
		if (!isPlainRecord(namespaceCatalog)) {
			throw new TypeError(
				`[${sourceLabel}] Namespace '${namespace}' must contain an object catalog.`,
			);
		}

		normalizedCatalog[namespace] = namespaceCatalog;
	}

	return normalizedCatalog;
}

function readLocaleCatalog(
	resourceName: string,
	localesDirectory: string,
	locale: string,
	sourceLabel: string,
): LocaleCatalog | null {
	const relativePath = `${localesDirectory}/${locale}.json`;
	const rawCatalog = LoadResourceFile(resourceName, relativePath);
	if (typeof rawCatalog !== "string") {
		return null;
	}
	const parsedCatalog = parseLocaleCatalog(rawCatalog, `${sourceLabel}:${relativePath}`);
	return parsedCatalog;
}

function loadLocaleCatalogs({
	localesDirectory,
	resourceName,
	sourceLabel,
	supportedLocales,
}: LoadLocaleCatalogsOptions): LocaleCatalogMap {
	const localeCatalogs: LocaleCatalogMap = {};

	for (const locale of normalizeLocaleList(supportedLocales)) {
		const parsedCatalog = readLocaleCatalog(resourceName, localesDirectory, locale, sourceLabel);

		if (parsedCatalog) {
			localeCatalogs[locale] = parsedCatalog;
		}
	}

	return localeCatalogs;
}

function collectNamespaces(catalogs: LocaleCatalogMap): string[] {
	const namespaces = new Set<string>();
	for (const localeCatalog of Object.values(catalogs)) {
		for (const namespace of Object.keys(localeCatalog)) {
			namespaces.add(namespace);
		}
	}
	return [...namespaces];
}

function normalizeFallbackNamespaces(fallbackNamespaces?: readonly string[]): string[] {
	const nextFallbackNamespaces = fallbackNamespaces ?? ["global"];
	if (nextFallbackNamespaces.length === 0) {
		return ["global"];
	}
	return normalizeLocaleList(nextFallbackNamespaces);
}

function createI18nextInstance({
	defaultNamespace,
	fallbackLocale,
	fallbackNamespaces,
	localeCatalogs,
	localeToUse,
}: CreateI18nextInstanceOptions): i18n {
	const instance = createInstance();
	const configuredNamespaces = collectNamespaces(localeCatalogs);
	const namespaces = normalizeLocaleList([
		...configuredNamespaces,
		defaultNamespace,
		...fallbackNamespaces,
	]);
	const initOptions: InitOptions = {
		defaultNS: defaultNamespace,
		fallbackLng: fallbackLocale,
		fallbackNS: fallbackNamespaces,
		initImmediate: false,
		interpolation: {
			escapeValue: false,
			prefix: "${",
			suffix: "}",
		},
		keySeparator: false,
		lng: localeToUse,
		ns: namespaces,
		resources: localeCatalogs,
		returnNull: false,
	};
	instance.init(initOptions);
	return instance;
}

function addLocaleCatalogsToInstance(instance: i18n, localeCatalogs: LocaleCatalogMap): void {
	for (const [locale, localeCatalog] of Object.entries(localeCatalogs)) {
		for (const [namespace, namespaceCatalog] of Object.entries(localeCatalog)) {
			instance.addResourceBundle(locale, namespace, namespaceCatalog, true, true);
		}
	}
}

function hasAnyLocaleCatalog(localeCatalogs: LocaleCatalogMap, locale: string): boolean {
	return Boolean(localeCatalogs[locale]);
}

function resolveLocaleFromEventPayload(payload: unknown): string | null {
	if (typeof payload === "string") {
		return payload.trim() || null;
	}

	if (!isPlainRecord(payload)) {
		return null;
	}

	if (typeof payload.locale === "string") {
		const locale = payload.locale.trim();
		return locale || null;
	}

	return null;
}

export function createGlobalLocaleRuntime({
	activeLocale,
	defaultNamespace,
	fallbackLocale,
	fallbackNamespaces,
	localesDirectory,
	resourceName,
	supportedLocales,
}: CreateGlobalLocaleRuntimeOptions): GlobalLocaleRuntime {
	const resourceName = resolveCurrentResourceName(resourceName, "i18n");
	const localesDirectory = localesDirectory ?? DEFAULT_LOCALES_DIRECTORY;
	const defaultNamespace = defaultNamespace ?? "global";
	const activeLocale = normalizeLocale(activeLocale);
	const requestedFallbackLocale = normalizeLocale(fallbackLocale ?? DEFAULT_FALLBACK_LOCALE);
	const requestedLocales = normalizeLocaleList([
		...(supportedLocales ?? []),
		activeLocale,
		requestedFallbackLocale,
	]);

	const localeCatalogs = loadLocaleCatalogs({
		localesDirectory,
		resourceName,
		sourceLabel: "framework-global-locales",
		supportedLocales: requestedLocales,
	});

	if (!hasAnyLocaleCatalog(localeCatalogs, activeLocale)) {
		throw new Error(
			`[framework-global-locales] Active locale '${activeLocale}' is missing in ${localesDirectory}/${activeLocale}.json`,
		);
	}

	let fallbackLocale = requestedFallbackLocale;
	if (!hasAnyLocaleCatalog(localeCatalogs, fallbackLocale)) {
		fallbackLocale = activeLocale;
	}

	let currentLocale = activeLocale;
	const i18nInstance = createI18nextInstance({
		defaultNamespace,
		fallbackLocale,
		fallbackNamespaces: normalizeFallbackNamespaces(fallbackNamespaces),
		localeCatalogs,
		localeToUse: currentLocale,
	});

	const loadedLocales = normalizeLocaleList(Object.keys(localeCatalogs));

	const getGlobalLocaleSnapshot = (): FrameworkLocaleSnapshot => ({
		activeLocale: currentLocale,
		fallbackLocale,
		locales: localeCatalogs,
		supportedLocales: loadedLocales,
	});

	const setActiveLocale = (locale: string): string => {
		const requestedLocale = normalizeLocale(locale);
		const nextLocale = hasAnyLocaleCatalog(localeCatalogs, requestedLocale)
			? requestedLocale
			: fallbackLocale;

		if (nextLocale === currentLocale) {
			return currentLocale;
		}

		currentLocale = nextLocale;
		i18nInstance.changeLanguage(nextLocale);
		emit(DEFAULT_LOCALE_CHANGE_EVENT, nextLocale);
		return currentLocale;
	};

	return {
		getActiveLocale: () => currentLocale,
		getGlobalLocaleSnapshot,
		setActiveLocale,
		t: i18nInstance.t.bind(i18nInstance),
	};
}

export function createResourceLocaleRuntime({
	fallbackNamespaces,
	localesDirectory,
	namespace,
	resourceName,
}: CreateResourceLocaleRuntimeOptions): ResourceLocaleRuntime {
	const resourceName = resolveCurrentResourceName(resourceName, "i18n");
	const snapshot = getGlobalLocaleSnapshot();
	const localesDirectory = localesDirectory ?? DEFAULT_LOCALES_DIRECTORY;
	const fallbackNamespaces = normalizeFallbackNamespaces(fallbackNamespaces);

	const localLocaleCatalogs = loadLocaleCatalogs({
		localesDirectory,
		resourceName,
		sourceLabel: `${resourceName}-locales`,
		supportedLocales: snapshot.supportedLocales,
	});

	const i18nInstance = createI18nextInstance({
		defaultNamespace: namespace,
		fallbackLocale: snapshot.fallbackLocale,
		fallbackNamespaces,
		localeCatalogs: snapshot.locales,
		localeToUse: snapshot.activeLocale,
	});

	addLocaleCatalogsToInstance(i18nInstance, localLocaleCatalogs);

	let currentLocale = snapshot.activeLocale;

	const handleLocaleChange = (payload: unknown): void => {
		const nextLocaleFromPayload = resolveLocaleFromEventPayload(payload);
		if (!nextLocaleFromPayload) {
			return;
		}

		const nextLocale = hasAnyLocaleCatalog(snapshot.locales, nextLocaleFromPayload)
			? nextLocaleFromPayload
			: snapshot.fallbackLocale;

		if (nextLocale === currentLocale) {
			return;
		}

		currentLocale = nextLocale;
		i18nInstance.changeLanguage(nextLocale);
	};

	on(DEFAULT_LOCALE_CHANGE_EVENT, handleLocaleChange);

	return {
		dispose: () => removeEventListener(DEFAULT_LOCALE_CHANGE_EVENT, handleLocaleChange),
		getActiveLocale: () => currentLocale,
		t: i18nInstance.t.bind(i18nInstance),
	};
}
