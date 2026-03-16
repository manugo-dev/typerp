import { parse as parseJsonc } from "jsonc-parser";
import type { ParseError } from "jsonc-parser";
import * as fs from "node:fs";
import * as path from "node:path";
import { z } from "zod";

const FrameworkConfigSchema = z.object({
	debugMode: z.boolean().default(false),
	locale: z.string().default("en"),
	logLevel: z.enum(["error", "warn", "info", "debug"]).default("info"),
	name: z.string().default("typerp"),
	timezone: z.string().default("UTC"),
	version: z.string().default("0.0.0"),
});

export type FrameworkConfig = z.infer<typeof FrameworkConfigSchema>;

let _config: FrameworkConfig | null = null;

function findConfigFile(startDirectory: string): string | null {
	let currentDirectory = startDirectory;
	for (let index = 0; index < 6; index++) {
		const candidate = path.join(currentDirectory, "config", "framework.config.jsonc");
		if (fs.existsSync(candidate)) return candidate;
		const parent = path.dirname(currentDirectory);
		if (parent === currentDirectory) break;
		currentDirectory = parent;
	}
	return null;
}

function readJsoncFile(filePath: string): Record<string, unknown> {
	const raw = fs.readFileSync(filePath, "utf8");
	const errors: ParseError[] = [];
	const parsed = parseJsonc(raw, errors, { allowTrailingComma: true });
	if (errors.length > 0) {
		throw new Error(
			`[Config] Failed to parse ${filePath}: ${errors.map((e) => `offset ${e.offset}, error ${e.error}`).join(", ")}`,
		);
	}
	return parsed as Record<string, unknown>;
}

export function loadConfig(): FrameworkConfig {
	if (_config) return _config;

	const configPath = findConfigFile(process.cwd());

	let base: Record<string, unknown> = {};
	if (configPath) {
		base = readJsoncFile(configPath);
	} else {
		console.warn("[Config] config/framework.config.jsonc not found — using schema defaults only.");
	}

	const result = FrameworkConfigSchema.safeParse(base);

	if (!result.success) {
		console.error("[Config] Configuration validation failed:", result.error.format());
		throw new Error("[Config] Invalid framework configuration. See errors above.");
	}

	_config = result.data;
	return _config;
}

export function getConfig(): FrameworkConfig {
	return _config ?? loadConfig();
}

export function resetConfig(): void {
	_config = null;
}

export { FrameworkConfigSchema };
