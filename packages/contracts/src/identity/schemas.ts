import { z } from "zod";

export const CharacterCreateSchema = z.object({
	dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
	firstName: z.string().min(1).max(50),
	lastName: z.string().min(1).max(50),
	licenseId: z.string().min(1),
});

export const CharacterSchema = CharacterCreateSchema.extend({
	createdAt: z.date(),
	id: z.number().int().positive(),
});
