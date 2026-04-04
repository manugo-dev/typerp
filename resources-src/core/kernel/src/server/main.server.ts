import { KERNEL_RESOURCE_NAME } from "../shared/kernel.shared";
import { frameworkConfig } from "./config.server";
import { registerIdentityHandlers } from "./handlers/identity.server";
import {
	getActiveLocale,
	getGlobalLocaleSnapshot,
	setActiveLocale,
	tGlobal,
} from "./locales.server";
import { initializeRedis } from "./redis.server";
import { ServerResourceRegistry } from "./registry.server";
import { initializeRpcBroker } from "./rpc.server";

console.log(`[${KERNEL_RESOURCE_NAME}] Initializing server runtime...`);

const serverResources = new ServerResourceRegistry();
initializeRedis();

// Register domain RPC handlers before starting the broker
registerIdentityHandlers();
initializeRpcBroker();

globalThis.exports("registerServerResource", (name: string, service: unknown) => {
	serverResources.register(name, service);
});
globalThis.exports("getServerResource", (name: string) => serverResources.get(name));
globalThis.exports("getManifests", () => serverResources.getManifests());
globalThis.exports("getFrameworkConfig", () => frameworkConfig);
globalThis.exports("getActiveLocale", () => getActiveLocale());
globalThis.exports("setActiveLocale", (locale: string) => setActiveLocale(locale));
globalThis.exports("setLanguage", (locale: string) => setActiveLocale(locale));
globalThis.exports("getGlobalLocaleSnapshot", () => getGlobalLocaleSnapshot());
globalThis.exports("tGlobal", (key: string, interpolationValues?: Record<string, unknown>) =>
	tGlobal(key, interpolationValues),
);

console.log(
	`[${KERNEL_RESOURCE_NAME}] locale=${getActiveLocale()}, logLevel=${frameworkConfig.logLevel}`,
);
