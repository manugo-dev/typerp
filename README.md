# TRP Framework

This is the source monorepo for TRP Framework.

## Structure

- `apps/` - Non-FiveM applications (e.g. admin panel)
- `packages/` - Workspace libraries (framework core components)
- `resources-src/` - FiveM runtime resources source code
- `tooling/` - Build and scaffolding scripts
- `infra/` - Docker, Compose, environments
- `tests/` - Testing structure

## Note on Runtime

This directory must _not_ be placed within the FiveM `resources/` directly.
Runtime output will be generated into `../resources/[trp-framework]/`.

### Developing Context Safe Runtime Resources

Real runtime features belong in `resources-src/<category>/<resource_name>`.
When building runtime projects, abide by these explicit contexts:

- Server execution logic belongs in `src/server/server.ts`
- Client execution logic belongs in `src/client/client.ts`
- Shared utilities & types belong in `src/shared/index.ts`

### Build Pipeline

Execute `pnpm build:runtime` from the monorepo root.
This utilizes `esbuild` to transpile and bundle your source projects independently. It will automatically inline your internal `@trp/*` workspace packages so FiveM gets flat execution files.

The bundler also automatically constructs `fxmanifest.lua` based on the found source files, emitting everything directly to the deployed `../resources/[trp-framework]/<resource_name>` folder.
