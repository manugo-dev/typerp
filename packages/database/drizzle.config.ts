import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/schema/index.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: "postgresql://postgres:postgres@127.0.0.1:5432/typerp_framework",
	},
	verbose: true,
	strict: true,
});
