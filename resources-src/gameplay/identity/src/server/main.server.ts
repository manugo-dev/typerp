import type { Character, CharacterCreate } from "@typerp/contracts/identity/types";
import { callRpc, getGlobalConfig, getKernelExports, initResourceLocales } from "@typerp/sdk";

import { IdentityRpc } from "@typerp/contracts/identity/rpc";

import { loadIdentityConfig } from "./config.server";

const currentResourceName = GetCurrentResourceName();
const identityConfig = loadIdentityConfig(currentResourceName);
const t = initResourceLocales(currentResourceName, "identity");

const frameworkConfig = getGlobalConfig();

console.log(
	`[${identityConfig.resourceLogLabel}] ${t("boot.starting")} locale=${frameworkConfig.locale}, maxCharacters=${identityConfig.maxCharactersPerLicense}`,
);

getKernelExports().registerServerResource("gameplay-identity", {
	name: "identity",
	version: "0.1.0",
});

// Public exports for other resources to consume identity data via RPC
globalThis.exports("getCharacters", (licenseId: string) =>
	callRpc<Character[]>(IdentityRpc.GET_CHARACTERS, licenseId),
);
globalThis.exports("createCharacter", (data: CharacterCreate) =>
	callRpc<Character>(IdentityRpc.CREATE_CHARACTER, data),
);
globalThis.exports("removeCharacter", (characterId: number) =>
	callRpc<boolean>(IdentityRpc.REMOVE_CHARACTER, characterId),
);

console.log(`[${identityConfig.resourceLogLabel}] ${t("boot.ready")}`);

// Startup smoke test — validates add/get/remove flow through the RPC broker
if (frameworkConfig.debugMode) {
	void (async () => {
		// eslint-disable-line unicorn/prefer-top-level-await -- CJS output format does not support top-level await
		const label = identityConfig.resourceLogLabel;
		try {
			const testLicense = `smoke-test-${Date.now()}`;

			const created = await callRpc<Character>(IdentityRpc.CREATE_CHARACTER, {
				dateOfBirth: "2000-01-01",
				firstName: "Smoke",
				lastName: "Test",
				licenseId: testLicense,
			});
			console.log(`[${label}] Smoke: created character id=${created.id}`);

			const characters = await callRpc<Character[]>(IdentityRpc.GET_CHARACTERS, testLicense);
			console.log(`[${label}] Smoke: fetched ${characters.length} character(s)`);

			// const removed = await callRpc<boolean>(IdentityRpc.REMOVE_CHARACTER, created.id);
			// console.log(`[${label}] Smoke: removed=${removed}`);

			// console.log(`[${label}] Smoke test passed`);
		} catch (error) {
			console.error(
				`[${label}] Smoke test failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	})();
}
