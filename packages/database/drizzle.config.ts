import { parse as parseJsonc } from "jsonc-parser";
import * as path from "node:path";
import { defineConfig } from "drizzle-kit";
import * as fs from "node:fs";

const config = parseJsonc(
	fs.readFileSync(
		path.join(
			path.resolve(process.cwd()),
			"../../resources-src/core/kernel/config/framework.config.jsonc",
		),
		"utf8",
	),
);

export default defineConfig({
	schema: "./src/schema/index.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: config.databaseUrl,
	},
	verbose: true,
	strict: true,
});
