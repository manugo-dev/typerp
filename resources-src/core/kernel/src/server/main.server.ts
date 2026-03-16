import { getConfig } from "@typerp/config";

import { KERNEL_RESOURCE_NAME } from "../shared/kernel.shared";
import {
	initializeInfrastructureServices,
	type KernelInfrastructureServices,
} from "./infrastructure.server";
import { ServiceRegistry } from "./service-registry.server";

console.log(`[${KERNEL_RESOURCE_NAME}] Initializing server runtime...`);

const serviceRegistry = new ServiceRegistry();
const frameworkConfig = getConfig();
const infrastructureServices = initializeInfrastructureServices();

globalThis.exports("registerService", (name: string, service: unknown) => {
	serviceRegistry.register(name, service);
});
globalThis.exports("getService", (name: string) => serviceRegistry.get(name));
globalThis.exports("getServicesManifest", () => serviceRegistry.getManifests());
globalThis.exports("getFrameworkConfig", () => frameworkConfig);
globalThis.exports(
	"getInfrastructureServices",
	(): KernelInfrastructureServices => infrastructureServices,
);

console.log(
	`[${KERNEL_RESOURCE_NAME}] Ready. locale=${frameworkConfig.locale}, logLevel=${frameworkConfig.logLevel}`,
);
