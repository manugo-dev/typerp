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
