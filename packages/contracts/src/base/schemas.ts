import { z } from 'zod';

export const PlayerIdSchema = z.number().int().positive();
export const NetworkIdSchema = z.number().int().positive();
export const SteamIdSchema = z.string().startsWith('steam:');
export const LicenseIdSchema = z.string().startsWith('license:');

export const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const Vector4Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  w: z.number(),
});
