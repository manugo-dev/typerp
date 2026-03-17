import type { FrameworkConfig } from "@typerp/contracts/config/types";
import type { GlobalLocaleSnapshot, Language } from "@typerp/contracts/kernel/locales";
import type { KernelDatabase, KernelRedis } from "@typerp/contracts/kernel/types";

import type { KernelServiceManifest } from "../shared/kernel.shared";

export type KernelServerExports = {
	getFrameworkConfig: () => FrameworkConfig;
	getActiveLanguage: () => string;
	getLanguage: () => Language;
	getGlobalLocales: () => GlobalLocaleSnapshot;
	getGlobalLocaleSnapshot: () => GlobalLocaleSnapshot;
	getDatabase: () => KernelDatabase;
	getRedis: () => KernelRedis;
	getServerResource: (name: string) => unknown;
	getManifests: () => KernelServiceManifest[];
	registerServerResource: (name: string, service: unknown) => void;
	tGlobal: (namespace: string, key: string, params?: Record<string, number | string>) => string;
};
