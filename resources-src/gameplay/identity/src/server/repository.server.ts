import type {
	Character,
	CharacterCreate,
	IdentityRepository,
} from "@typerp/contracts/identity/types";
import type { KernelInfrastructureServices } from "@typerp/contracts/kernel/types";

export type IdentityDatabaseServices = KernelInfrastructureServices["database"];

export class DrizzleIdentityRepository implements IdentityRepository {
	public constructor(private readonly database: IdentityDatabaseServices) {}

	public async getCharactersByLicenseId(licenseId: string): Promise<Character[]> {
		const rows = await this.database.db
			.select()
			.from(this.database.schema.characters)
			.where(this.database.eq(this.database.schema.characters.licenseId, licenseId));

		return rows.map((row) => ({
			createdAt: row.createdAt,
			dateOfBirth: row.dateOfBirth,
			firstName: row.firstName,
			id: row.id,
			lastName: row.lastName,
			licenseId: row.licenseId,
		}));
	}

	public async createCharacter(input: CharacterCreate): Promise<Character> {
		const [inserted] = await this.database.db
			.insert(this.database.schema.characters)
			.values({
				dateOfBirth: input.dateOfBirth,
				firstName: input.firstName,
				lastName: input.lastName,
				licenseId: input.licenseId,
			})
			.returning();

		if (!inserted) {
			throw new Error("[IdentityRepository] Failed to insert character");
		}

		return {
			createdAt: inserted.createdAt,
			dateOfBirth: inserted.dateOfBirth,
			firstName: inserted.firstName,
			id: inserted.id,
			lastName: inserted.lastName,
			licenseId: inserted.licenseId,
		};
	}
}
