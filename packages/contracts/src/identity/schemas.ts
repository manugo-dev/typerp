import { z } from 'zod';
import type { Character, CharacterCreate } from './types';

export const CharacterCreateSchema = z.object({
  licenseId: z.string().min(1),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
});

export const CharacterSchema = CharacterCreateSchema.extend({
  id: z.number().int().positive(),
  createdAt: z.date(),
});

const _characterTypeCheck: z.ZodType<Character> = CharacterSchema;
const _characterCreateTypeCheck: z.ZodType<CharacterCreate> = CharacterCreateSchema;
void _characterTypeCheck;
void _characterCreateTypeCheck;
