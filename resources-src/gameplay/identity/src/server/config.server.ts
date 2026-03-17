const IDENTITY_CONFIG_FILE = "config/identity.config.json";

export interface IdentityConfig {
	readonly resourceLogLabel: string;
	readonly maxCharactersPerLicense: number;
}

let cachedIdentityConfig: IdentityConfig | null = null;

export function loadIdentityConfig(resourceName: string): IdentityConfig {
	if (cachedIdentityConfig) {
		return cachedIdentityConfig;
	}

	const raw = LoadResourceFile(resourceName, IDENTITY_CONFIG_FILE);
	if (typeof raw !== "string") {
		throw new Error(`[identity] Missing config file: ${resourceName}/${IDENTITY_CONFIG_FILE}`);
	}

	let parsedJson: unknown;
	try {
		parsedJson = JSON.parse(raw) as unknown;
	} catch (error) {
		throw new Error(
			`[identity] Invalid config JSON: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	const configObject =
		parsedJson && typeof parsedJson === "object"
			? (parsedJson as Record<string, unknown>)
			: {};

	const resourceLogLabel =
		typeof configObject.resourceLogLabel === "string" && configObject.resourceLogLabel.length > 0
			? configObject.resourceLogLabel
			: "identity";
	const maxCharactersPerLicense =
		typeof configObject.maxCharactersPerLicense === "number" &&
		Number.isInteger(configObject.maxCharactersPerLicense) &&
		configObject.maxCharactersPerLicense > 0
			? configObject.maxCharactersPerLicense
			: 4;

	cachedIdentityConfig = {
		maxCharactersPerLicense,
		resourceLogLabel,
	};
	return cachedIdentityConfig;
}
