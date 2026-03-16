import type { FrameworkConfig } from "@typerp/config";
import type { KernelInfrastructureServices } from "@typerp/contracts/kernel/infrastructure";

import type { KernelServiceManifest } from "../shared/kernel.shared";

export type KernelServerExports = {
	getFrameworkConfig: () => FrameworkConfig;
	getInfrastructureServices: () => KernelInfrastructureServices;
	getServerResource: (name: string) => unknown;
	getManifests: () => KernelServiceManifest[];
	registerServerResource: (name: string, service: unknown) => void;
};
