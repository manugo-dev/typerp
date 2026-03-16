# Monorepo Workspace Libraries

Workspace libraries live inside `packages/` and contain code intended to be consumed by the framework core or individual modules. **They are strictly source dependencies and are never emitted independently as FiveM runtime resources.**

## Base Packages

- `@typerp/contracts`: The single source of truth for shared contracts/types with domain subpaths such as `@typerp/contracts/identity/types` and `@typerp/contracts/identity/schemas`.
- `@typerp/config`: JSONC-first config loading via `jsonc-parser`, validated with Zod 4, with environment variables limited to infrastructure overrides.
- `@typerp/shared`: Pure helpers and domain-agnostic generic functions that can safely run anywhere.

## Infrastructure Foundations

- `@typerp/database`: Internal DB implementation package exposing schema and Drizzle primitives/factories; runtime ownership remains with the kernel.
- `@typerp/redis`: Internal Redis/BullMQ connection/factory package consumed by kernel-owned infrastructure bootstrapping.
- `@typerp/observability`: Contains `pino` logger bindings, set up to enforce structured, standard logging across all internal and runtime components.

## Core Services

- `@typerp/i18n`: Internationalization framework implementing active server locale resolution and dictionary fallback handling.
- `@typerp/sdk`: The developer-facing API package structuring module metadata (definitions, dependencies).

## Strict Typing Contexts

Internal packages are subject to multi-context TS targeting. See `packages/tsconfig`. For example, `packages/redis` targets `@citizenfx/server` and Node types exclusively via `packages/tsconfig/server.json`, assuring it cannot be mistakenly compiled into NUI or Client bundles.
