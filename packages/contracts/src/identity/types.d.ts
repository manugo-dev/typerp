export interface CharacterCreate {
	dateOfBirth: string;
	firstName: string;
	lastName: string;
	licenseId: string;
}

export interface Character extends CharacterCreate {
	createdAt: Date;
	id: number;
}
