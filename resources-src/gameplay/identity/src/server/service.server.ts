import { IdentityEvents } from "@typerp/contracts/identity/events";
import { CharacterCreateSchema } from "@typerp/contracts/identity/schemas";
import type {
	Character,
	CharacterCreate,
	IdentityRepository,
} from "@typerp/contracts/identity/types";

export class IdentityService {
	public constructor(private readonly repository: IdentityRepository) {}

	async getCharacters(licenseId: string): Promise<Character[]> {
		return this.repository.getCharactersByLicenseId(licenseId);
	}

	async createCharacter(data: CharacterCreate): Promise<Character> {
		const parsed = CharacterCreateSchema.parse(data);
		const character = await this.repository.createCharacter({
			dateOfBirth: parsed.dateOfBirth,
			firstName: parsed.firstName,
			lastName: parsed.lastName,
			licenseId: parsed.licenseId,
		});

		emit(IdentityEvents.CHARACTER_CREATED, character);
		return character;
	}
}
