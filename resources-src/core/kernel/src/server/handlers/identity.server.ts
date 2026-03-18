import { IdentityEvents } from "@typerp/contracts/identity/events";
import { IdentityRpc } from "@typerp/contracts/identity/rpc";
import { CharacterCreateSchema } from "@typerp/contracts/identity/schemas";
import type { Character, CharacterCreate } from "@typerp/contracts/identity/types";
import { eq, schema } from "@typerp/database";

import { initializeDatabase } from "../database.server";
import { registerRpcHandler } from "../rpc.server";

export function registerIdentityHandlers(): void {
	const { db } = initializeDatabase();

	registerRpcHandler<string, Character[]>(
		IdentityRpc.GET_CHARACTERS,
		async (licenseId) => {
			const rows = await db
				.select()
				.from(schema.characters)
				.where(eq(schema.characters.licenseId, licenseId));

			return rows.map((row) => ({
				createdAt: row.createdAt,
				dateOfBirth: row.dateOfBirth,
				firstName: row.firstName,
				id: row.id,
				lastName: row.lastName,
				licenseId: row.licenseId,
			}));
		},
	);

	registerRpcHandler<CharacterCreate, Character>(
		IdentityRpc.CREATE_CHARACTER,
		async (data) => {
			const parsed = CharacterCreateSchema.parse(data);

			const [inserted] = await db
				.insert(schema.characters)
				.values({
					dateOfBirth: parsed.dateOfBirth,
					firstName: parsed.firstName,
					lastName: parsed.lastName,
					licenseId: parsed.licenseId,
				})
				.returning();

			if (!inserted) {
				throw new Error("Failed to insert character");
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
		},
	);

	registerRpcHandler<number, boolean>(
		IdentityRpc.REMOVE_CHARACTER,
		async (characterId) => {
			const deleted = await db
				.delete(schema.characters)
				.where(eq(schema.characters.id, characterId))
				.returning();

			return deleted.length > 0;
		},
	);

	console.log("[Kernel/Identity] RPC handlers registered");
}
