import { KERNEL_RESOURCE_NAME } from "../shared/kernel.shared";
import { ClientServiceRegistry } from "./service-registry.client";

console.log(`[${KERNEL_RESOURCE_NAME}] Initializing client runtime...`);

const registry = new ClientServiceRegistry();

globalThis.exports("registerClientService", (name: string, service: unknown) =>
	registry.register(name, service),
);
globalThis.exports("getClientService", (name: string) => registry.get(name));

console.log(`[${KERNEL_RESOURCE_NAME}] Client initialization complete.`);
