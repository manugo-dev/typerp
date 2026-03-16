export interface CharacterCreate {
	licenseId: string;
	firstName: string;
	lastName: string;
	dateOfBirth: string;
}

export interface Character extends CharacterCreate {
	id: number;
	createdAt: Date;
}

export interface IdentityRepository {
	createCharacter(input: CharacterCreate): Promise<Character>;
	getCharactersByLicenseId(licenseId: string): Promise<Character[]>;
}
