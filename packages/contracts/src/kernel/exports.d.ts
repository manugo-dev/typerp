import type { FrameworkConfig } from "../config/types";
import type { GlobalLocaleSnapshot } from "./locales";
import type { KernelDatabase, KernelInfrastructureServices, KernelRedis } from "./types";

export interface KernelServerExports {
	readonly getFrameworkConfig: () => FrameworkConfig;
	readonly getActiveLanguage: () => string;
	readonly getGlobalLocaleSnapshot: () => GlobalLocaleSnapshot;
	readonly getDatabase: () => KernelDatabase;
	readonly getRedis: () => KernelRedis;
	readonly getManifests: () => { name: string; ready: boolean; version: string }[];
	readonly getServerResource: (name: string) => unknown;
	readonly registerServerResource: (name: string, service: unknown) => void;
	readonly tGlobal: (
		namespace: string,
		key: string,
		params?: Record<string, number | string>,
	) => string;
}
