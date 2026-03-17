import { loadIdentityConfig } from "./config.server";
import { loadIdentityLocales, tIdentity } from "./locales.server";

const IDENTITY_RESOURCE_NAME = "identity";
const currentResourceName = GetCurrentResourceName();

const kernel = globalThis.exports["typerp-core-kernel"];

if (!kernel) {
	throw new Error(
		"Kernel exports not found. Ensure that the kernel resource is running and exports are properly defined.",
	);
}

// const frameworkConfig = kernel.getFrameworkConfig();
const identityConfig = loadIdentityConfig(currentResourceName);
loadIdentityLocales(currentResourceName, kernel.getGlobalLocaleSnapshot());

// const identityRepository = new DrizzleIdentityRepository(kernel.getDatabase());
// const identityService = new IdentityService(identityRepository);

console.log(
	`[${identityConfig.resourceLogLabel}] ${tIdentity("boot.starting")} locale=${frameworkConfig.locale}, maxCharacters=${identityConfig.maxCharactersPerLicense}`,
);

kernel.registerServerResource("gameplay-identity", {
	name: IDENTITY_RESOURCE_NAME,
	version: "0.1.0",
});

// globalThis.exports("getCharacters", (licenseId: string) =>
// 	identityService.getCharacters(licenseId),
// );
// globalThis.exports("createCharacter", (data: CharacterCreate) =>
// 	identityService.createCharacter(data),
// );

console.log(`[${identityConfig.resourceLogLabel}] ${tIdentity("boot.ready")}`);
