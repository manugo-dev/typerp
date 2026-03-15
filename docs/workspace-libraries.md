# Monorepo Workspace Libraries

Workspace libraries live inside `packages/` and contain code intended to be consumed by the framework core or individual modules. **They are strictly source dependencies and are never emitted independently as FiveM runtime resources.**

## Base Packages

- `@trp/contracts`: The single source of truth for shared contracts/types with domain subpaths such as `@trp/contracts/identity/types` and `@trp/contracts/identity/schemas`.
- `@trp/config`: JSONC-first config loading via `jsonc-parser`, validated with Zod 4, with environment variables limited to infrastructure overrides.
- `@trp/shared`: Pure helpers and domain-agnostic generic functions that can safely run anywhere.

## Infrastructure Foundations

- `@trp/database`: Internal DB implementation package exposing schema and Drizzle primitives/factories; runtime ownership remains with the kernel.
- `@trp/redis`: Internal Redis/BullMQ connection/factory package consumed by kernel-owned infrastructure bootstrapping.
- `@trp/observability`: Contains `pino` logger bindings, set up to enforce structured, standard logging across all internal and runtime components.

## Core Services

- `@trp/i18n`: Internationalization framework implementing active server locale resolution and dictionary fallback handling.
- `@trp/sdk`: The developer-facing API package structuring module metadata (definitions, dependencies).

## Strict Typing Contexts

Internal packages are subject to multi-context TS targeting. See `packages/tsconfig`. For example, `packages/redis` targets `@citizenfx/server` and Node types exclusively via `packages/tsconfig/server.json`, assuring it cannot be mistakenly compiled into NUI or Client bundles.
