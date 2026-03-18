import { KERNEL_RESOURCE_NAME } from "../shared/kernel.shared";
import { frameworkConfig } from "./config.server";
import { initializeDatabase } from "./database.server";
import { registerIdentityHandlers } from "./handlers/identity.server";
import {
	getActiveLanguage,
	getGlobalLocaleSnapshot,
	getLanguage,
	initializeGlobalLocales,
	tGlobal,
} from "./locales.server";
import { initializeRedis } from "./redis.server";
import { ServerResourceRegistry } from "./registry.server";
import { initializeRpcBroker } from "./rpc.server";

console.log(`[${KERNEL_RESOURCE_NAME}] Initializing server runtime...`);

initializeGlobalLocales();
const serverResources = new ServerResourceRegistry();
initializeDatabase();
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
globalThis.exports("getLanguage", () => getLanguage());
globalThis.exports("getActiveLanguage", () => getActiveLanguage());
globalThis.exports("getGlobalLocaleSnapshot", () => getGlobalLocaleSnapshot());
globalThis.exports(
	"tGlobal",
	(namespace: string, key: string, params?: Record<string, number | string>) =>
		tGlobal(namespace, key, params),
);

console.log(
	`[${KERNEL_RESOURCE_NAME}] locale=${getActiveLanguage()}, logLevel=${frameworkConfig.logLevel}`,
);
