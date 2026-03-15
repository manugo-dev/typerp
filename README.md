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

- Server execution entry belongs in `src/server/main.server.ts` (or another clear `*.server.ts` entrypoint)
- Client execution entry belongs in `src/client/main.client.ts` (or another clear `*.client.ts` entrypoint)
- Resource-local shared runtime code belongs in `src/shared/*.shared.ts`

Resource-local `shared/` is only for small code reused by the same resource's client and server contexts. Reuse across multiple resources must live in `packages/*`.

### Build Pipeline

Execute `pnpm build:runtime` from the monorepo root.
This utilizes `esbuild` to transpile and bundle your source projects independently. It will automatically inline your internal `@trp/*` workspace packages so FiveM gets flat execution files.

The bundler also automatically constructs `fxmanifest.lua` based on the found source files, emitting everything directly to the deployed `../resources/[trp-framework]/<resource_name>` folder.

Infrastructure ownership rule: runtime DB/Redis/BullMQ initialization is centralized in `@trp/core-kernel`. Gameplay resources consume stateful capabilities through runtime exports/public APIs.
