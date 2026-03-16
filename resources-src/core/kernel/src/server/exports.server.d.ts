import type { FrameworkConfig } from "@typerp/config";

import type { KernelServiceManifest } from "../shared/kernel.shared";
import type { KernelInfrastructureServices } from "./infrastructure.server";

export type KernelServerExports = {
	getFrameworkConfig: () => FrameworkConfig;
	getInfrastructureServices: () => KernelInfrastructureServices;
	getServerResource: (name: string) => unknown;
	getManifests: () => KernelServiceManifest[];
	registerServerResource: (name: string, service: unknown) => void;
};
