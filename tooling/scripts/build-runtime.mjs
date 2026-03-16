// tooling/scripts/build-runtime.mjs
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as esbuild from 'esbuild';

const ROOT_DIR = path.resolve(process.cwd());
const RESOURCES_SRC = path.join(ROOT_DIR, 'resources-src');
const OUTPUT_DIR = path.join(ROOT_DIR, '../resources/[typerp]');

/**
 * Recursively find all resource directories that contain a package.json.
 */
function findResources(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const fullPath = path.join(dir, entry.name);
    const pkgPath = path.join(fullPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      results.push(fullPath);
    } else {
      // Recurse deeper (category directories like gameplay/, core/)
      results.push(...findResources(fullPath));
    }
  }
  return results;
}

function findEntrypoint(contextDir, suffix) {
  if (!fs.existsSync(contextDir)) return null;

  const candidates = [];
  const stack = [contextDir];
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
      `Multiple entrypoints found in ${contextDir} for ${suffix}. Add main${suffix} to disambiguate.`,
    );
  }

  return null;
}

/**
 * Builds a specific FiveM resource using esbuild and generates its fxmanifest.lua.
 *
 * @param {string} sourcePath Path to the resource's source folder
 */
async function buildResource(sourcePath) {
  const pkgPath = path.join(sourcePath, 'package.json');
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const rawName = pkg.name; // e.g., @typerp/core-kernel
  const resourceName = rawName.startsWith('@typerp/') ? rawName.replace('@typerp/', '') : rawName;

  const srcServer = findEntrypoint(path.join(sourcePath, 'src', 'server'), '.server.ts');
  const srcClient = findEntrypoint(path.join(sourcePath, 'src', 'client'), '.client.ts');

  const hasServer = srcServer !== null;
  const hasClient = srcClient !== null;

  if (!hasServer && !hasClient) {
    console.warn(`[WARN] Skipping ${resourceName}: No valid entry points found.`);
    return;
  }

  const outDir = path.join(OUTPUT_DIR, resourceName);
  const distDir = path.join(outDir, 'dist');
  fs.mkdirSync(distDir, { recursive: true });

  const buildManifest = {
    server: false,
    client: false,
    dependencies: pkg.fxmanifest?.dependencies ?? [],
  };

  try {
    // Custom plugin to resolve pnpm workspace packages directly to their source
    const workspaceResolverPlugin = {
      name: 'workspace-resolver',
      setup(build) {
        build.onResolve({ filter: /^@typerp\// }, (args) => {
          const [, packageName, ...subpathParts] = args.path.split('/');
          const packageRoot = path.join(ROOT_DIR, 'packages', packageName, 'src');
          const entryPath =
            subpathParts.length === 0
              ? path.join(packageRoot, 'index.ts')
              : path.join(packageRoot, ...subpathParts) + '.ts';

          if (fs.existsSync(entryPath)) {
            return { path: entryPath };
          }

          // Not a workspace package — let esbuild handle it normally
          return undefined;
        });
      },
    };

    // 1. Build Server
    if (hasServer) {
      await esbuild.build({
        entryPoints: [srcServer],
        outfile: path.join(distDir, 'server.js'),
        bundle: true,
        target: 'node22',
        platform: 'node',
        format: 'cjs',
        treeShaking: true,
        minify: true,
        metafile: true,
        plugins: [workspaceResolverPlugin],
        external: ['node:*'],
      });
      buildManifest.server = true;
    }

    // 2. Build Client
    if (hasClient) {
      await esbuild.build({
        entryPoints: [srcClient],
        outfile: path.join(distDir, 'client.js'),
        bundle: true,
        target: 'es2022',
        platform: 'browser',
        format: 'iife',
        treeShaking: true,
        minify: true,
        metafile: true,
        plugins: [workspaceResolverPlugin],
      });
      buildManifest.client = true;
    }

    // 3. Generate Manifest
    generateManifest(outDir, buildManifest);

    console.log(`[SUCCESS] Built ${resourceName} -> ${outDir}`);
  } catch (err) {
    console.error(`[ERROR] Failed to build ${resourceName}`, err);
    process.exit(1);
  }
}

/**
 * Generates fxmanifest.lua based on architectural constraints.
 */
function generateManifest(outDir, manifestData) {
  const lines = [
    `-- TRP Framework: Generated by build-runtime.mjs`,
    `fx_version 'cerulean'`,
    `game 'gta5'`,
    ``,
  ];

  if (manifestData.server && !manifestData.client) {
    lines.push(`server_only 'yes'`);
    lines.push(``);
  }

  if (manifestData.server) {
    lines.push(`node_version '22'`);
    lines.push(`server_scripts {`);
    lines.push(`  'dist/server.js'`);
    lines.push(`}`);
    lines.push(``);
  }

  if (manifestData.client) {
    lines.push(`client_scripts {`);
    lines.push(`  'dist/client.js'`);
    lines.push(`}`);
    lines.push(``);
  }

  // Dependencies
  if (manifestData.dependencies && manifestData.dependencies.length > 0) {
    lines.push(`dependencies {`);
    for (const dep of manifestData.dependencies) {
      lines.push(`  '${dep}',`);
    }
    lines.push(`}`);
    lines.push(``);
  }

  const manifestContent = lines.join('\n');
  const manifestPath = path.join(outDir, 'fxmanifest.lua');
  fs.writeFileSync(manifestPath, manifestContent);

  // Validation
  if (!fs.existsSync(manifestPath) || fs.statSync(manifestPath).size === 0) {
    console.error(`[VALIDATION ERROR] Manifest missing or empty at ${manifestPath}`);
    process.exit(1);
  }
}

async function run() {
  console.log('🚀 Starting TRP Framework Runtime Build...');

  const resources = findResources(RESOURCES_SRC);

  if (resources.length === 0) {
    console.warn('[WARN] No runtime resources found under resources-src/');
    return;
  }

  for (const resourcePath of resources) {
    await buildResource(resourcePath);
  }

  console.log(`✅ TRP Framework Build Complete (${resources.length} resource(s)).`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
