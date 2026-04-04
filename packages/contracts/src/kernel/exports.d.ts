import type { FrameworkConfig } from "../config/types";
import type { KernelLocaleSnapshot } from "./locales";

export interface KernelServerExports {
	readonly getActiveLocale: () => string;
	readonly getFrameworkConfig: () => FrameworkConfig;
	readonly getGlobalLocaleSnapshot: () => KernelLocaleSnapshot;
	readonly getManifests: () => { name: string; ready: boolean; version: string }[];
	readonly getServerResource: (name: string) => unknown;
	readonly registerServerResource: (name: string, service: unknown) => void;
	readonly setActiveLocale: (locale: string) => string;
	readonly tGlobal: (key: string, interpolationValues?: Record<string, unknown>) => string;
}
