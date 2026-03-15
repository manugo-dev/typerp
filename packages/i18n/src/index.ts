export type LocaleData = Record<string, string>;

export class I18nService {
  private activeLocale: string;
  private fallbackLocale: string = 'en';
  private dictionaries: Map<string, LocaleData> = new Map();

  constructor(activeLocale: string = 'en') {
    this.activeLocale = activeLocale;
  }

  /**
   * Loads or merges dictionary keys for a specific locale and namespace.
   * e.g., registerModuleLocale('es', 'trp-core', { "welcome": "Bienvenido" })
   */
  public registerLocale(locale: string, namespace: string, data: LocaleData) {
    const key = `${locale}:${namespace}`;
    const existing = this.dictionaries.get(key) || {};
    this.dictionaries.set(key, { ...existing, ...data });
  }

  /**
   * Retrieves a translation key, optionally falling back to the fallback locale if missing.
   */
  public t(namespace: string, key: string, params?: Record<string, string | number>): string {
    const primaryDict = this.dictionaries.get(`${this.activeLocale}:${namespace}`);
    let text = primaryDict?.[key];

    if (!text && this.activeLocale !== this.fallbackLocale) {
      const fallbackDict = this.dictionaries.get(`${this.fallbackLocale}:${namespace}`);
      text = fallbackDict?.[key];
    }

    if (!text) {
      return `[missing:${namespace}:${key}]`;
    }

    if (params) {
      return this.interpolate(text, params);
    }

    return text;
  }

  private interpolate(text: string, params: Record<string, string | number>): string {
    let result = text;
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
    return result;
  }
}

// Global hook for ease of use (assumes the kernel initializes this once)
let globalI18n: I18nService | null = null;

export function initI18n(activeLocale: string) {
  globalI18n = new I18nService(activeLocale);
  return globalI18n;
}

export function t(
  namespace: string,
  key: string,
  params?: Record<string, string | number>,
): string {
  if (!globalI18n) {
    console.warn('I18nService not initialized yet, returning fallback key format');
    return `[uninitialized:${namespace}:${key}]`;
  }
  return globalI18n.t(namespace, key, params);
}
