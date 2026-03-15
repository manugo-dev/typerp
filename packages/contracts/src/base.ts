import { z } from 'zod';

// ==========================================
// Base Identifiers
// ==========================================

export const PlayerIdSchema = z.number().int().positive().describe('Internal player ID');
export const NetworkIdSchema = z.number().int().positive().describe('Network entity ID');
export const SteamIdSchema = z.string().startsWith('steam:').describe('Steam hexadecimal ID');
export const LicenseIdSchema = z.string().startsWith('license:').describe('Rockstar License ID');

// ==========================================
// Common Spatial and Math
// ==========================================

export const Vector3Schema = z
  .object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  })
  .describe('3D coordinates');

export const Vector4Schema = z
  .object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
    w: z.number(),
  })
  .describe('3D coordinates with heading');

// ==========================================
// Foundation Types Inference
// ==========================================

export type PlayerId = z.infer<typeof PlayerIdSchema>;
export type NetworkId = z.infer<typeof NetworkIdSchema>;
export type SteamId = z.infer<typeof SteamIdSchema>;
export type LicenseId = z.infer<typeof LicenseIdSchema>;
export type Vector3 = z.infer<typeof Vector3Schema>;
export type Vector4 = z.infer<typeof Vector4Schema>;
