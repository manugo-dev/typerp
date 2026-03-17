import { KERNEL_RESOURCE_NAME } from "../shared/kernel.shared";
import { frameworkConfig } from "./config.server";
import {
	getActiveLanguage,
	getGlobalLocales,
	getLanguage,
	initializeGlobalLocales,
	tGlobal,
} from "./locales.server";
import { ServerResourceRegistry } from "./registry.server";
import { initializeDatabase } from "./database.server";
import { initializeRedis } from "./redis.server";

console.log(`[${KERNEL_RESOURCE_NAME}] Initializing server runtime...`);

const locales = initializeGlobalLocales();
const serverResources = new ServerResourceRegistry();
const database = initializeDatabase();
const redis = initializeRedis();
const infrastructure = { database, redis };

globalThis.exports("registerServerResource", (name: string, service: unknown) => {
	serverResources.register(name, service);
});
globalThis.exports("getServerResource", (name: string) => serverResources.get(name));
globalThis.exports("getManifests", () => serverResources.getManifests());
globalThis.exports("getFrameworkConfig", () => frameworkConfig);
globalThis.exports("getLanguage", () => getLanguage());
globalThis.exports("getActiveLanguage", () => getActiveLanguage());
globalThis.exports("getGlobalLocales", () => getGlobalLocales());
globalThis.exports("getGlobalLocaleSnapshot", () => getGlobalLocales());
globalThis.exports(
	"tGlobal",
	(namespace: string, key: string, params?: Record<string, number | string>) =>
		tGlobal(namespace, key, params),
);
globalThis.exports("getDatabase", () => database);
globalThis.exports("getRedis", () => redis);

console.log(
	`[${KERNEL_RESOURCE_NAME}] locale=${getActiveLanguage()}, logLevel=${frameworkConfig.logLevel}`,
);
