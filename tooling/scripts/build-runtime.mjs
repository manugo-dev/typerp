// tooling/scripts/build-runtime.mjs
import * as esbuild from "esbuild";
import { parse } from "jsonc-parser";
import * as fs from "node:fs";
// eslint-disable-next-line unicorn/import-style
import * as path from "node:path";

const ROOT_DIR = path.resolve(process.cwd());
const RESOURCES_SRC = path.join(ROOT_DIR, "resources-src");
const FRAMEWORK_CONFIG_PATH = path.join(
	ROOT_DIR,
	"resources-src",
	"core",
	"kernel",
	"config",
	"framework.config.jsonc",
);
const DEFAULT_FRAMEWORK_CONFIG = {
	debugMode: false,
	locale: "en",
	logLevel: "info",
	name: "typerp",
	timezone: "UTC",
	version: "0.0.0",
};

function parseJsonc(raw, sourceLabel) {
	const errors = [];
	const parsed = parse(raw, errors, { allowTrailingComma: true });
	if (errors.length > 0) {
		const details = errors.map((error) => `offset=${error.offset}, code=${error.error}`).join("; ");
		throw new Error(`[ERROR] Failed to parse JSONC at ${sourceLabel}. ${details}`);
	}
	return parsed;
}

function readJsoncFile(filePath) {
	const raw = fs.readFileSync(filePath, "utf8");
	return parseJsonc(raw, filePath);
}

function getFrameworkConfig() {
	if (!fs.existsSync(FRAMEWORK_CONFIG_PATH)) {
		return DEFAULT_FRAMEWORK_CONFIG;
	}

	const parsed = readJsoncFile(FRAMEWORK_CONFIG_PATH);
	if (!parsed || typeof parsed !== "object") {
		throw new Error("[ERROR] framework.config.jsonc must contain a JSON object.");
	}

	return {
		...DEFAULT_FRAMEWORK_CONFIG,
		...parsed,
	};
}

const FRAMEWORK_CONFIG = getFrameworkConfig();
const OUTPUT_DIR = path.join(ROOT_DIR, `../resources/[${FRAMEWORK_CONFIG.name}]`);

/**
 * Recursively find all resource directories that contain a package.json.
 */
function findResources(directory) {
	const results = [];
	if (!fs.existsSync(directory)) return results;

	const entries = fs.readdirSync(directory, { withFileTypes: true });
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		if (entry.name === "node_modules") continue;
		const fullPath = path.join(directory, entry.name);
		const packagePath = path.join(fullPath, "package.json");
		if (fs.existsSync(packagePath)) {
			results.push(fullPath);
		} else {
			// Recurse deeper (category directories like gameplay/, core/)
			results.push(...findResources(fullPath));
		}
	}
	return results;
}

function findEntrypoint(contextDirectory, suffix) {
	if (!fs.existsSync(contextDirectory)) return;

	const candidates = [];
	const stack = [contextDirectory];
	while (stack.length > 0) {
		const current = stack.pop();
		const entries = fs.readdirSync(current, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(current, entry.name);
			if (entry.isDirectory()) {
				stack.push(fullPath);
				continue;
			}
			if (entry.isFile() && fullPath.endsWith(suffix)) {
				candidates.push(fullPath);
			}
		}
	}

	const preferred = candidates.find((candidate) => candidate.endsWith(`main${suffix}`));
	if (preferred) return preferred;

	const secondary = candidates.find((candidate) => candidate.endsWith(`index${suffix}`));
	if (secondary) return secondary;

	if (candidates.length === 1) {
		return candidates[0];
	}

	if (candidates.length > 1) {
		throw new Error(
			`Multiple entrypoints found in ${contextDirectory} for ${suffix}. Add main${suffix} to disambiguate.`,
		);
	}
}

function listFilesRecursively(directoryPath) {
	const files = [];
	const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
	for (const entry of entries) {
		const absolutePath = path.join(directoryPath, entry.name);
		if (entry.isDirectory()) {
			files.push(...listFilesRecursively(absolutePath));
			continue;
		}
		if (entry.isFile()) {
			files.push(absolutePath);
		}
	}
	return files;
}

function emitEditableJsonFiles(sourceDirectory, outputDirectory) {
	if (!fs.existsSync(sourceDirectory)) {
		return;
	}

	for (const sourceFilePath of listFilesRecursively(sourceDirectory)) {
		const relativeSourcePath = path.relative(sourceDirectory, sourceFilePath);
		const sourceExtension = path.extname(sourceFilePath);
		if (sourceExtension !== ".jsonc" && sourceExtension !== ".json") {
			continue;
		}

		const outputRelativePath =
			sourceExtension === ".jsonc"
				? relativeSourcePath.replace(/\.jsonc$/u, ".json")
				: relativeSourcePath;
		const outputFilePath = path.join(outputDirectory, outputRelativePath);
		const outputParentDirectory = path.dirname(outputFilePath);
		fs.mkdirSync(outputParentDirectory, { recursive: true });

		if (sourceExtension === ".jsonc") {
			const parsed = readJsoncFile(sourceFilePath);
			const serialized = `${JSON.stringify(parsed, undefined, 2)}\n`;
			fs.writeFileSync(outputFilePath, serialized, "utf8");
			continue;
		}

		fs.copyFileSync(sourceFilePath, outputFilePath);
	}
}

function emitResourceEditableAssets(sourcePath, outputDirectory) {
	const configurationSourceDirectory = path.join(sourcePath, "config");
	const localesSourceDirectory = path.join(sourcePath, "locales");
	emitEditableJsonFiles(configurationSourceDirectory, path.join(outputDirectory, "config"));
	emitEditableJsonFiles(localesSourceDirectory, path.join(outputDirectory, "locales"));
}

/**
 * Builds a specific FiveM resource using esbuild and generates its fxmanifest.lua.
 *
 * @param {string} sourcePath Path to the resource's source folder
 */
async function buildResource(sourcePath) {
	const packagePath = path.join(sourcePath, "package.json");
	if (!fs.existsSync(packagePath)) return;

	const package_ = JSON.parse(fs.readFileSync(packagePath, "utf8"));
	const relativePath = path.relative(RESOURCES_SRC, sourcePath);
	const resourceName = `${FRAMEWORK_CONFIG.name}-${relativePath.split(path.sep).join("-")}`;

	const sourceServer = findEntrypoint(path.join(sourcePath, "src", "server"), ".server.ts");
	const sourceClient = findEntrypoint(path.join(sourcePath, "src", "client"), ".client.ts");

	const hasServer = sourceServer !== null;
	const hasClient = sourceClient !== null;

	if (!hasServer && !hasClient) {
		console.warn(`[WARN] Skipping ${resourceName}: No valid entry points found.`);
		return;
	}

	const outputDirectory = path.join(OUTPUT_DIR, resourceName);
	const distributionDirectory = path.join(outputDirectory, "dist");
	fs.mkdirSync(distributionDirectory, { recursive: true });

	const buildManifest = {
		client: false,
		dependencies: package_.fxmanifest?.dependencies ?? [],
		server: false,
	};

	try {
		// Custom plugin to resolve pnpm workspace packages directly to their source
		const workspaceResolverPlugin = {
			name: "workspace-resolver",
			setup(build) {
				build.onResolve({ filter: /^@typerp\// }, (arguments_) => {
					const [, packageName, ...subpathParts] = arguments_.path.split("/");
					const packageRoot = path.join(ROOT_DIR, "packages", packageName, "src");
					const entryPath =
						subpathParts.length === 0
							? path.join(packageRoot, "index.ts")
							: path.join(packageRoot, ...subpathParts) + ".ts";

					if (fs.existsSync(entryPath)) {
						return { path: entryPath };
					}
				});
			},
		};

		const buildConfig = {
			bundle: true,
			conditions: ["module", "import", "node", "default"],
			external: ["node:*"],
			format: "cjs",
			mainFields: ["module", "main"],
			metafile: true,
			minifyIdentifiers: false,
			minifySyntax: true,
			minifyWhitespace: true,
			platform: "node",
			plugins: [workspaceResolverPlugin],
			target: "node22",
			treeShaking: true,
		};

		// 1. Build Server
		if (hasServer) {
			const serverResult = await esbuild.build({
				entryPoints: [sourceServer],
				outfile: path.join(distDir, "server.js"),
				...buildConfig,
			});
			buildManifest.server = true;
			if (serverResult.metafile) {
				fs.writeFileSync(
					path.join(distDir, "server.meta.json"),
					JSON.stringify(serverResult.metafile),
				);
			}
		}

		// 2. Build Client
		if (hasClient) {
			const clientResult = await esbuild.build({
				entryPoints: [sourceClient],
				outfile: path.join(distDir, "client.js"),
				...buildConfig,
			});
			buildManifest.client = true;
			if (clientResult.metafile) {
				fs.writeFileSync(
					path.join(distDir, "client.meta.json"),
					JSON.stringify(clientResult.metafile),
				);
			}
		}

		// 3. Emit editable JSON assets (config/locales)
		emitResourceEditableAssets(sourcePath, outDir);

		// 4. Generate Manifest
		generateManifest(outDir, buildManifest);

		console.log(`[SUCCESS] Built ${resourceName} -> ${outDir}`);
	} catch (error) {
		console.error(`[ERROR] Failed to build ${resourceName}`, error);
		// eslint-disable-next-line unicorn/no-process-exit
		process.exit(1);
	}
}

/**
 * Generates fxmanifest.lua based on architectural constraints.
 */
function generateManifest(outDirectory, manifestData) {
	const lines = [
		`-- TypeRP Framework: Generated by build-runtime.mjs`,
		`fx_version 'cerulean'`,
		`game 'gta5'`,
		`author 'ManuGO - www.manugo.dev <typerp@manugo.dev>'`,
	];

	if (manifestData.server && !manifestData.client) {
		lines.push(`server_only 'yes'`, ``);
	}

	if (manifestData.server) {
		lines.push(`node_version '22'`, `server_scripts {`, `  'dist/server.js'`, `}`, ``);
	}

	if (manifestData.client) {
		lines.push(`client_scripts {`, `  'dist/client.js'`, `}`, ``);
	}

	// Dependencies
	if (manifestData.dependencies && manifestData.dependencies.length > 0) {
		lines.push(`dependencies {`);
		for (const dep of manifestData.dependencies) {
			lines.push(`  '${dep}',`);
		}
		lines.push(`}`, ``);
	}

	const manifestContent = lines.join("\n");
	const manifestPath = path.join(outDirectory, "fxmanifest.lua");
	fs.writeFileSync(manifestPath, manifestContent);

	// Validation
	if (!fs.existsSync(manifestPath) || fs.statSync(manifestPath).size === 0) {
		console.error(`[VALIDATION ERROR] Manifest missing or empty at ${manifestPath}`);
		// eslint-disable-next-line unicorn/no-process-exit
		process.exit(1);
	}
}

async function run() {
	console.log("🚀 Starting TypeRP Framework Runtime Build...");

	const resources = findResources(RESOURCES_SRC);

	if (resources.length === 0) {
		console.warn("[WARN] No runtime resources found under resources-src/");
		return;
	}

	for (const resourcePath of resources) {
		await buildResource(resourcePath);
	}

	console.log(`✅ TypeRP Framework Build Complete (${resources.length} resource(s)).`);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
run().catch((error) => {
	console.error(error);
	// eslint-disable-next-line unicorn/no-process-exit
	process.exit(1);
});
