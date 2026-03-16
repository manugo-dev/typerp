import { getConfig } from "@typerp/config";
import type { KernelInfrastructureServices } from "@typerp/contracts/kernel/types";

import { KERNEL_RESOURCE_NAME } from "../shared/kernel.shared";
import { initializeInfrastructureServices } from "./infrastructure.server";
import { ServerResourceRegistry } from "./registry.server";

console.log(`[${KERNEL_RESOURCE_NAME}] Initializing server runtime...`);

const serverResources = new ServerResourceRegistry();
const frameworkConfig = getConfig();
const infrastructureServices = initializeInfrastructureServices();

globalThis.exports("registerServerResource", (name: string, service: unknown) => {
	serverResources.register(name, service);
});
globalThis.exports("getServerResource", (name: string) => serverResources.get(name));
globalThis.exports("getManifests", () => serverResources.getManifests());
globalThis.exports("getFrameworkConfig", () => frameworkConfig);
globalThis.exports(
	"getInfrastructureServices",
	(): KernelInfrastructureServices => infrastructureServices,
);

console.log(
	`[${KERNEL_RESOURCE_NAME}] Ready. locale=${frameworkConfig.locale}, logLevel=${frameworkConfig.logLevel}`,
);
