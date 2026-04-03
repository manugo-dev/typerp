import type { FrameworkConfig } from "../config/types";

export interface KernelServerExports {
	readonly getFrameworkConfig: () => FrameworkConfig;
	readonly getManifests: () => { name: string; ready: boolean; version: string }[];
	readonly getServerResource: (name: string) => unknown;
	readonly registerServerResource: (name: string, service: unknown) => void;
}
