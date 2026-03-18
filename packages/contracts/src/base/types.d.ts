export interface Vector3 {
	x: number;
	y: number;
	z: number;
}

export interface Vector4 extends Vector3 {
	w: number;
}

// Semantic domain aliases for FiveM player/network identifiers
export type PlayerId = number; // eslint-disable-line sonarjs/redundant-type-aliases
export type NetworkId = number; // eslint-disable-line sonarjs/redundant-type-aliases
export type SteamId = `steam:${string}`;
export type LicenseId = `license:${string}`;
