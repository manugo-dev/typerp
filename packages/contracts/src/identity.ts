/**
 * @trp/contracts — Identity schemas and types
 *
 * Shared Zod schemas defining the identity domain's public data model.
 * These are bundled into any resource that needs to validate or type identity data.
 * The source of truth for identity state lives in the `identity` runtime resource.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Character
// ---------------------------------------------------------------------------

export const CharacterCreateSchema = z.object({
  licenseId: z.string().min(1).describe('Rockstar license identifier'),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
});

export const CharacterSchema = CharacterCreateSchema.extend({
  id: z.number().int().positive(),
  createdAt: z.date(),
});

export type CharacterCreate = z.infer<typeof CharacterCreateSchema>;
export type Character = z.infer<typeof CharacterSchema>;

// ---------------------------------------------------------------------------
// Identity Events (namespaced constants)
// ---------------------------------------------------------------------------

export const IdentityEvents = {
  CHARACTER_LOADED: 'trp:identity:characterLoaded',
  CHARACTER_CREATED: 'trp:identity:characterCreated',
} as const;
