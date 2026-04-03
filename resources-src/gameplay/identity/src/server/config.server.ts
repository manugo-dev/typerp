import { loadResourceConfig } from "@typerp/sdk";
import { z } from "zod";

const IdentityConfigSchema = z.object({
	maxCharactersPerLicense: z.number().int().positive().default(4),
	resourceLogLabel: z.string().min(1).default("identity"),
});

export type IdentityConfig = z.output<typeof IdentityConfigSchema>;

export function loadIdentityConfig(): IdentityConfig {
	return loadResourceConfig({
		configFile: "config/identity.config.json",
		schema: IdentityConfigSchema,
		sourceLabel: "identity",
	});
}
