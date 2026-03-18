import { defineConfig } from "drizzle-kit";
import { parse as parseJsonc } from "jsonc-parser";
import * as fs from "node:fs";
import * as path from "node:path";

const environmentConfig = parseJsonc(
	fs.readFileSync(
		path.join(
			path.resolve(process.cwd()),
			"../../resources-src/core/kernel/config/environment.config.jsonc",
		),
		"utf8",
	),
);

export default defineConfig({
	dbCredentials: {
		url: environmentConfig.databaseUrl,
	},
	dialect: "postgresql",
	out: "./drizzle",
	schema: "./src/schema/index.ts",
	strict: true,
	verbose: true,
});
