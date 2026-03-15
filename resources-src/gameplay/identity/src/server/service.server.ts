
import {
  CharacterCreateSchema,
  IdentityEvents,
  type Character,
  type CharacterCreate,
} from '@trp/contracts';
import { db, schema, eq } from '@trp/database';

export class IdentityService {
  /* Retrieve all characters belonging to a license. */
  async getCharacters(licenseId: string): Promise<Character[]> {
    const rows = await db
      .select()
      .from(schema.characters)
      .where(eq(schema.characters.licenseId, licenseId));

    return rows.map((r) => ({
      id: r.id,
      licenseId: r.licenseId,
      firstName: r.firstName,
      lastName: r.lastName,
      dateOfBirth: r.dateOfBirth,
      createdAt: r.createdAt,
    }));
  }

  /* Create a new character. Validates input with Zod before inserting. */
  async createCharacter(data: CharacterCreate): Promise<Character> {
    // Validate at the boundary
    const parsed = CharacterCreateSchema.parse(data);

    const [inserted] = await db
      .insert(schema.characters)
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