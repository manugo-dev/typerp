import type { FrameworkConfig } from "../config/types";
import type { GlobalLocaleSnapshot, Language } from "./locales";

export interface KernelServerExports {
	readonly getActiveLanguage: () => string;
	readonly getFrameworkConfig: () => FrameworkConfig;
	readonly getGlobalLocaleSnapshot: () => GlobalLocaleSnapshot;
	readonly getLanguage: () => Language;
	readonly getManifests: () => { name: string; ready: boolean; version: string }[];
	readonly getServerResource: (name: string) => unknown;
	readonly registerServerResource: (name: string, service: unknown) => void;
	readonly tGlobal: (
		namespace: string,
		key: string,
		params?: Record<string, number | string>,
	) => string;
}
