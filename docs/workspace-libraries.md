# Monorepo Workspace Libraries

Workspace libraries live inside `packages/` and contain code intended to be consumed by the framework core or individual modules. **They are strictly source dependencies and are never emitted independently as FiveM runtime resources.**

## Base Packages

- `@trp/contracts`: The single source of truth for base shapes, identifiers, and cross-cutting Zod schemas.
- `@trp/config`: A typed environment and config parsing foundation using Zod. Extracts defaults and merges them with `.env`.
- `@trp/shared`: Pure helpers and domain-agnostic generic functions that can safely run anywhere.

## Infrastructure Foundations

- `@trp/database`: Base abstraction setting up Postgres connections via drizzle-orm. Downstream packages define their schemas, but this holds the driver implementation.
- `@trp/redis`: Connection logic for Redis caching and BullMQ queues. Contains factories for job processors.
- `@trp/observability`: Contains `pino` logger bindings, set up to enforce structured, standard logging across all internal and runtime components.

## Core Services

- `@trp/i18n`: Internationalization framework implementing active server locale resolution and dictionary fallback handling.
- `@trp/sdk`: The developer-facing API package structuring module metadata (definitions, dependencies).

## Strict Typing Contexts

Internal packages are subject to multi-context TS targeting. See `packages/tsconfig`. For example, `packages/redis` targets `@citizenfx/server` and Node types exclusively via `packages/tsconfig/server.json`, assuring it cannot be mistakenly compiled into NUI or Client bundles.
