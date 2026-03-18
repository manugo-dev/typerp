import type { Character, CharacterCreate } from "@typerp/contracts/identity/types";

export type IdentityServerExports = {
	createCharacter: (data: CharacterCreate) => Promise<Character>;
	getCharacters: (licenseId: string) => Promise<Character[]>;
};
