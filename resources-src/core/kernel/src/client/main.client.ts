import { KERNEL_RESOURCE_NAME } from "../shared/kernel.shared";
import { ClientResourceRegistry } from "./registry.client";

console.log(`[${KERNEL_RESOURCE_NAME}] Initializing client runtime...`);

const registry = new ClientResourceRegistry();

globalThis.exports("registerClientResource", (name: string, resource: unknown) =>
	registry.register(name, resource),
);
globalThis.exports("getClientResource", (name: string) => registry.get(name));

console.log(`[${KERNEL_RESOURCE_NAME}] Client initialization complete.`);
