import { IdentityEvents } from "@typerp/contracts/identity/events";
import { CharacterCreateSchema } from "@typerp/contracts/identity/schemas";
import type { Character, CharacterCreate } from "@typerp/contracts/identity/types";

export class IdentityService {
	public constructor() {}

	async getCharacters(licenseId: string): Promise<Character[]> {
		const rows = await this.infrastructure.database.db
			.select()
			.from(this.infrastructure.database.schema.characters)
			.where(
				this.infrastructure.database.eq(
					this.infrastructure.database.schema.characters.licenseId,
					licenseId,
				),
			);

		return rows.map((row) => ({
			createdAt: row.createdAt,
			dateOfBirth: row.dateOfBirth,
			firstName: row.firstName,
			id: row.id,
			lastName: row.lastName,
			licenseId: row.licenseId,
		}));
	}

	async createCharacter(data: CharacterCreate): Promise<Character> {
		const parsed = CharacterCreateSchema.parse(data);

		const [inserted] = await this.infrastructure.database.db
			.insert(this.infrastructure.database.schema.characters)
			.values({
				dateOfBirth: parsed.dateOfBirth,
				firstName: parsed.firstName,
				lastName: parsed.lastName,
				licenseId: parsed.licenseId,
			})
			.returning();

		if (!inserted) {
			throw new Error("[Identity] Failed to insert character");
		}

		const character: Character = {
			createdAt: inserted.createdAt,
			dateOfBirth: inserted.dateOfBirth,
			firstName: inserted.firstName,
			id: inserted.id,
			lastName: inserted.lastName,
			licenseId: inserted.licenseId,
		};

		emit(IdentityEvents.CHARACTER_CREATED, character);
		return character;
	}
}
