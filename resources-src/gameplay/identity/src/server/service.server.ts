import { CharacterCreateSchema } from '@trp/contracts/identity/schemas';
import { IdentityEvents } from '@trp/contracts/identity/events';
import type { Character, CharacterCreate } from '@trp/contracts/identity/types';

type CharacterRow = {
  id: number;
  licenseId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  createdAt: Date;
};

type IdentityInfrastructureServices = {
  database: {
    db: {
      select: () => {
        from: (table: unknown) => {
          where: (predicate: unknown) => Promise<CharacterRow[]>;
        };
      };
      insert: (table: unknown) => {
        values: (values: Omit<CharacterRow, 'id' | 'createdAt'>) => {
          returning: () => Promise<CharacterRow[]>;
        };
      };
    };
    schema: {
      characters: {
        licenseId: unknown;
      };
    };
    eq: (left: unknown, right: string) => unknown;
  };
};

export class IdentityService {
  public constructor(private readonly infrastructure: IdentityInfrastructureServices) {}

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

    return rows.map((r) => ({
      id: r.id,
      licenseId: r.licenseId,
      firstName: r.firstName,
      lastName: r.lastName,
      dateOfBirth: r.dateOfBirth,
      createdAt: r.createdAt,
    }));
  }

  async createCharacter(data: CharacterCreate): Promise<Character> {
    const parsed = CharacterCreateSchema.parse(data);

    const [inserted] = await this.infrastructure.database.db
      .insert(this.infrastructure.database.schema.characters)
      .values({
        licenseId: parsed.licenseId,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        dateOfBirth: parsed.dateOfBirth,
      })
      .returning();

    if (!inserted) {
      throw new Error('[Identity] Failed to insert character');
    }

    const character: Character = {
      id: inserted.id,
      licenseId: inserted.licenseId,
      firstName: inserted.firstName,
      lastName: inserted.lastName,
      dateOfBirth: inserted.dateOfBirth,
      createdAt: inserted.createdAt,
    };

    emit(IdentityEvents.CHARACTER_CREATED, character);
    return character;
  }
}
