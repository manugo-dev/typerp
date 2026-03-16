export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector4 extends Vector3 {
  w: number;
}

export type PlayerId = number;
export type NetworkId = number;
export type SteamId = `steam:${string}`;
export type LicenseId = `license:${string}`;
