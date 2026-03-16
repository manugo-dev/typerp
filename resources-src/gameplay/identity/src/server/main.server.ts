import { getConfig } from "@typerp/config";
import type { CharacterCreate } from "@typerp/contracts/identity/types";

import { IdentityService } from "./service.server";

const IDENTITY_RESOURCE_NAME = "identity";

const kernel = globalThis.exports["core-kernel"];

const config = getConfig();

if (!kernel) {
	throw new Error(
		"Kernel exports not found. Ensure that the kernel resource is running and exports are properly defined.",
	);
}

const identityService = new IdentityService(kernel.getInfrastructureServices());

console.log(
	`[${IDENTITY_RESOURCE_NAME}] Initializing module... locale=${config.locale}`,
);

kernel.registerService("identity", {
	name: IDENTITY_RESOURCE_NAME,
	version: "0.1.0",
});

globalThis.exports("getCharacters", (licenseId: string) =>
	identityService.getCharacters(licenseId),
);
globalThis.exports("createCharacter", (data: CharacterCreate) =>
	identityService.createCharacter(data),
);

console.log(`[${IDENTITY_RESOURCE_NAME}] Server initialization complete.`);
