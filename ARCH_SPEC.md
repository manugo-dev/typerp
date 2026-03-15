# ARCH_SPEC_EN.md

## TRP Framework — Operational Master Specification for Claude Code

Status: single source of truth  
Project: `trp-framework`  
Source repository: `server-data/trp-framework/`  
Final FiveM runtime output: `server-data/resources/[trp-framework]/<resource-name>`

---

## 1. Purpose of this document

This file defines the architecture, rules, constraints, frozen decisions, phase sequencing, runtime contract, TypeScript context strategy, bundling strategy, validation strategy, public API rules, and expected behavior for any implementation agent working on TRP Framework.

Claude Code must treat this file as the **primary operational specification** of the project.

Mandatory agent rules:

- Before modifying the repository, the agent must read this file in full.
- If a later instruction conflicts with a frozen decision in this file, the agent must stop and ask for confirmation before breaking that decision.
- The agent must not improvise stack changes, runtime layout changes, bundling changes, manifest changes, or API philosophy changes.
- The agent must prefer real, minimal, coherent implementations per phase over architecture theater or pseudocode.
- The agent must keep the repository functional at the end of each phase.
- The agent must not reinvent the wheel when mature tools already solve the problem well enough.

---

## 2. Project vision

TRP Framework is a long-term, modular, type-safe, extensible, update-friendly roleplay framework for FiveM built from scratch.

Strategic goals:

- build a small, stable kernel/core
- support decoupled gameplay modules
- make third-party plugin/module development first-class
- provide a modern, pragmatic developer experience
- generate clean, correct, runtime-ready FiveM resources
- allow framework updates without easily breaking custom scripts built on top of it
- include an explicit compatibility strategy for ESX/QBCore-oriented Lua scripts
- stay architecturally oriented toward OneSync Infinity and high-concurrency servers, including the design goal of supporting up to 2048 concurrent players, without making unrealistic guarantees independent of infrastructure, profiling, and gameplay design

TRP Framework must not use ESX, QBCore, or any other roleplay framework as a direct base. Conceptual inspiration is allowed, but implementation must be original.

---

## 3. Non-negotiable principles

### 3.1 Do not reinvent the wheel

TRP Framework must avoid reinventing the wheel.

The project should prefer mature, well-maintained, widely adopted libraries and tools whenever they solve the problem well enough and fit the architecture.

General rule:

- use proven tools by default
- integrate them cleanly
- build custom internal solutions only when there is a clear and justified need

The framework must not waste significant time rebuilding infrastructure that already exists in mature form unless there is a strong reason, such as:

- the problem is highly specific to FiveM/TRP Framework
- existing tools do not support the required use case
- performance requirements make the existing solution unsuitable
- a stable framework-specific integration boundary is required

### 3.2 Server-authoritative gameplay

Sensitive gameplay state must be decided on the server.

Clients and NUI may handle UX and presentation, but must not be trusted as the source of truth for core gameplay/business state such as:

- money
- identity
- job state
- inventory
- permissions
- ownership
- core progression

### 3.3 Small kernel, modular domains

The framework must not become a giant monolith.

The kernel should remain relatively small and provide:

- module registration/lifecycle
- service access patterns
- event bus foundations
- config access
- observability hooks
- public capability boundaries

Gameplay domains must live in dedicated modules/resources.

### 3.4 Clear public vs internal boundaries

The framework must distinguish clearly between:

- public APIs and contracts intended for third-party module authors
- internal implementation details that may change

Custom server code built on TRP Framework must depend on public packages and public runtime APIs only.

### 3.5 Deterministic runtime output

The final runtime output must be deterministic, clean, independently restartable per resource, and free of ghost resources.

### 3.6 Performance without overengineering

The framework must care about performance, but not by overengineering everything.

Performance should be achieved through:

- good boundaries
- correct runtime placement of logic
- sensible dependency design
- minimal hot-path overhead
- profiling before deep optimization
- avoiding pathological scaling patterns

---

## 4. Frozen stack decisions

These decisions are frozen unless explicitly changed later.

### 4.1 Monorepo and orchestration

- `pnpm workspaces`
- `Nx`

### 4.2 Language and typing

- `TypeScript`
- `strict mode`
- `TypeScript project references` where they add clarity and incremental build value

### 4.3 Validation and contracts

- `Zod 4` only

No Typia.  
No Valibot.  
No second validation system.

### 4.4 Runtime bundling

- `esbuild`

`esbuild` is the official bundler for FiveM runtime resources.

### 4.5 Database and data access

- `PostgreSQL`
- `Drizzle ORM`

Drizzle is the official relational data access layer for the framework foundation.

### 4.6 Queueing and async work

- `Redis`
- `BullMQ`

### 4.7 NUI

- `Vue 3`
- `Vite`
- `Pinia`
- `Tailwind CSS v4`
- `Base UI`

### 4.8 Testing

- `Vitest`
- repository structure ready for future `Playwright` UI/e2e work

### 4.9 Code quality

- `ESLint`
- `Prettier`

### 4.10 Versioning and changelog

- `Changesets`

### 4.11 Local infra

- `Docker`
- `Docker Compose`

### 4.12 CI/CD

- `GitHub Actions`

### 4.13 Future admin panel

- `Fastify + React`
- future phase only
- not part of the early runtime architecture
- must not shape the kernel/runtime design of v1

---

## 5. Physical repository model

This structure is mandatory:

```txt
server-data/
  cache/
  resources/
    [trp-framework]/
      ...compiled runtime resources...
  server.cfg
  trp-framework/
    ...source monorepo...
```

Meaning:

- `server-data/trp-framework/` is the source repository that goes to GitHub
- `server-data/resources/[trp-framework]/` is the final runtime output consumed by FiveM
- the source monorepo must never itself be treated as a FiveM resource

### 5.1 Source/runtime separation

Inside the source repo, runtime resource source code must live under:

- `resources-src/`

This name is frozen.

Do not use `resources/` inside the source monorepo for runtime resource source code, as it is too easy to confuse with actual FiveM runtime `resources/`.

---

## 6. Runtime contract for FiveM

### 6.1 Only real runtime resources may be emitted

Only projects explicitly intended to become FiveM runtime resources may be emitted into:

- `../resources/[trp-framework]/<resource-name>`

Internal workspace packages must never be emitted there as standalone resources.

Examples of packages that must remain workspace-only:

- `contracts`
- `config`
- `shared`
- `database`
- `i18n`
- `observability`
- `sdk`
- `tooling`
- `eslint-config`
- `tsconfig`

### 6.2 No ghost resources

The runtime output must not contain:

- fake resources
- empty resources
- placeholder runtime folders
- helper libraries emitted as if they were FiveM resources

### 6.3 Independent runtime resources

Each emitted runtime resource must remain independently restartable in FiveM.

### 6.4 Runtime output path

The runtime build must emit directly to:

- `../resources/[trp-framework]/<resource-name>`

No manual copy/move steps should be required after build.

---

## 7. Resource manifest (`fxmanifest.lua`) contract

This section is mandatory and must follow current FiveM documentation.

### 7.1 Manifest defaults

All runtime resources generated by TRP Framework must default to:

- `fx_version 'cerulean'`
- `game 'gta5'`

unless a future explicit reason requires something different.

### 7.2 Deprecated entries

Do not use deprecated manifest entries by default.

Avoid:

- `resource_manifest_version`
- `lua54`

unless an exceptional future migration case explicitly requires them.

### 7.3 Manifest generation

`fxmanifest.lua` must be generated automatically during the runtime build pipeline.

The project must not rely on manually writing every final emitted manifest by hand.

The generator may be based on:

- declarative resource metadata in source
- templates plus emitted artifact inspection
- build metadata produced by Nx/esbuild
- controlled tooling under `tooling/`

But the final result must be deterministic.

### 7.4 Manifest validation

The build must fail if:

- a runtime resource has no manifest
- a manifest references files that do not exist
- a resource is emitted empty
- a resource has NUI but does not include correct `files`
- a resource declares wrong side/runtime entries for the artifacts that were emitted

### 7.5 `node_version '22'`

Any runtime resource that contains server-side JavaScript must declare:

- `node_version '22'`

Client-only or NUI-only resources do not need this entry.

### 7.6 `server_only 'yes'`

If a resource has no client code, no NUI, and no files that must be downloaded by clients, it should be marked:

- `server_only 'yes'`

### 7.7 NUI-related manifest rules

If a resource uses NUI, the manifest must correctly generate:

- `ui_page`
- `files { ... }`

All local NUI files and built assets required by the page must be included in `files`.

### 7.8 `dependencies`

The manifest generator must support `dependencies` when a resource needs another resource to load first.

This includes runtime resource dependencies within TRP Framework.

It may also support runtime constraints such as `/onesync` where relevant, but must not spam unnecessary constraints by default.

### 7.9 `provide` for compatibility direction

The architecture must keep open the possibility that future compatibility resources may use:

- `provide 'es_extended'`
- `provide 'qb-core'`

or similar replacement patterns where strategically useful for migration/compatibility.

This does not need to be implemented immediately, but the spec must allow for it.

### 7.10 Export declarations

Prefer runtime code-based exports using:

- `exports("name", fn)`

Do not rely on manifest `export` / `server_export` unless there is a specific compatibility reason.

---

## 8. Bundling strategy and dependency policy

### 8.1 Bundle per runtime resource

Each FiveM runtime resource must be bundled independently.

Typical outcome:

- `server.js`
- `client.js`
- NUI assets where applicable

per resource.

### 8.2 Source is ESM-first

The source monorepo is ESM-first.

Relevant `package.json` files should use:

- `"type": "module"`

where appropriate.

### 8.3 Runtime bundle output must be FiveM-compatible

The final runtime bundle format must be compatible with actual FiveM runtime behavior and must be validated with real smoke testing.

Do not blindly force pure ESM output to runtime if it is not proven compatible in real FiveM usage.

Rule:

- source/workspace: ESM-first
- runtime output: FiveM-compatible and tested

### 8.4 Bundle duplication is acceptable in moderation

Because runtime resources are bundled independently, some shared code may be duplicated across bundles.

This is acceptable **as long as** shared packages remain:

- small
- cohesive
- granular
- side-effect free where possible
- tree-shaking friendly

### 8.5 Avoid god packages

Do not build giant packages that import everything.

Examples of bad patterns:

- `config` importing database, queues, NUI, observability, and runtime modules
- a giant `shared` package that drags half the framework transitively
- broad barrel exports that defeat tree-shaking

### 8.6 Tree-shaking friendliness is a requirement

Shared packages should be designed for bundling efficiency:

- granular exports
- minimal side effects
- avoid broad `export * from "./everything"` patterns in critical packages
- mark packages `sideEffects: false` where correct
- avoid expensive work at import time

### 8.7 Public runtime APIs for domain logic

Small pure helper code may be bundled into multiple resources.

However, domain logic representing a unique capability or source of truth should live in a dedicated runtime resource and be consumed through public runtime APIs/exports rather than copied into many bundles.

Examples where dedicated runtime resources/public APIs make sense:

- identity
- economy
- inventory
- permissions
- compatibility bridges

Examples where runtime exports do **not** make sense:

- trivial helpers
- tiny pure utility functions
- generic formatting helpers
- basic collection helpers

### 8.8 Do not turn utility packages into exported runtime resources

Do not create generic utility resources that exist only to export tiny helper functions to everyone else.

That increases runtime coupling and hurts ergonomics more than it helps.

### 8.9 Runtime dependency philosophy

Use runtime resource APIs/exports for:

- stateful domain services
- unique capabilities
- source-of-truth systems
- integration boundaries between resources

Use shared bundled workspace packages for:

- types
- schemas
- small pure helpers
- lightweight config helpers
- i18n helpers
- stateless utilities

---

## 9. TypeScript runtime-context strategy

This is one of the most important implementation constraints in the project.

TRP Framework must enforce a clear separation between runtime contexts.

The architecture must explicitly support at least these contexts:

1. root/base
2. tooling/node
3. FiveM server runtime
4. FiveM client runtime
5. shared/isomorphic
6. NUI/browser
7. tests

### 9.1 Core rule

Do not mix incompatible runtime APIs in one TS context.

Examples:

- browser/NUI globals must not leak into FiveM server or client runtime code
- server-only Node APIs must not leak into FiveM client or shared code
- client-specific natives/runtime types must not leak into generic shared packages
- FiveM runtime assumptions must not infect generic tooling packages unless explicitly separated

### 9.2 Required tsconfig layout direction

The repository must have a deliberate tsconfig strategy including at minimum:

- `tsconfig.base.json`
- root `tsconfig.json`
- `tsconfig.server.json`
- `tsconfig.client.json`
- `tsconfig.shared.json`
- `tsconfig.nui.json`
- optional `tsconfig.tooling.json`
- optional `tsconfig.test.json`

The exact file names can vary slightly if needed, but the context separation must remain explicit and documented.

### 9.3 Folder and file conventions

The project must use clear conventions to help maintain runtime separation.

Acceptable approach:

- folder-based separation first
- optional suffix-based conventions where helpful, such as:
  - `.server.ts`
  - `.client.ts`
  - `.shared.ts`

The project should not depend only on filename suffixes; folder/context boundaries should remain clear as well.

### 9.4 Shared code rules

`shared` means code that is safe to use from both FiveM client and FiveM server contexts.

Shared code must remain limited to things such as:

- shared types
- schemas
- pure utilities
- constants
- config shapes
- translation helpers
- logic that does not rely on browser APIs or server-only APIs

Shared code must not secretly depend on:

- Node-only modules
- browser-only globals
- FiveM runtime-specific side effects that only exist on one side

### 9.5 NUI rules

NUI/browser code must live in its own context and tsconfig.

It may use browser/Vite/Vue APIs, but those must not leak into FiveM client/server runtime packages.

### 9.6 Tooling rules

Build scripts, generators, validation scripts, manifest generators, and other Node-based tooling must live in tooling/node contexts, not inside runtime resource contexts.

### 9.7 Tests

Tests must follow the correct runtime assumptions of the code they are testing.

Do not silently test browser code under Node assumptions or vice versa without explicit setup.

---

## 10. Public API vs internal API

### 10.1 Public surface

The public surface of TRP Framework should primarily live in:

- `packages/contracts`
- `packages/sdk`
- selected documented runtime exports/capabilities
- selected documented config/module contracts

### 10.2 Internal surface

Everything else is internal unless explicitly documented as public.

### 10.3 Third-party rule

Third-party modules/plugins must not depend on private internals of the kernel or private file paths.

### 10.4 Agent rule

Claude Code must:

- avoid exposing internals accidentally
- document new public APIs intentionally
- preserve compatibility for public APIs
- prefer additive evolution and deprecations over careless breaking changes

---

## 11. Type-safety requirements

### 11.1 Strict TypeScript

The project must use strict TypeScript.

### 11.2 No unnecessary `any`

Avoid `any` in:

- contracts
- SDK
- config
- public services
- event payloads
- NUI bridges
- compatibility bridges

### 11.3 Zod at important boundaries

Use Zod 4 for:

- config
- contracts
- module metadata/manifests
- event payloads
- NUI bridge payloads
- external inputs
- important subsystem boundaries

### 11.4 Shared contracts package

There must be a clear shared contracts package so the core, modules, and third parties can reuse types and schemas without hacks.

### 11.5 No tsconfig chaos

The design must avoid brittle path aliasing and confusing cross-runtime imports.

---

## 12. Module system requirements

The framework must support real modules from the beginning.

A module must be able to declare at minimum:

- `id`
- `version`
- `metadata`
- `dependencies`
- `capabilities`
- `config schema`
- `lifecycle hooks`
- `public services`
- `runtime metadata`

The kernel must eventually support:

- module registration
- load ordering
- dependency validation
- service access
- config access
- hooks
- logging
- internal event bus access

An SDK helper such as `createModule(...)` or equivalent is mandatory.

Modules must not communicate via arbitrary private imports and folder hacks.

---

## 13. Configuration system

The framework must have a centralized, typed, scalable configuration system.

### 13.1 Primary source of truth: JSONC

The primary configuration model of TRP Framework must be based on JSONC files, not on `.env` files.

This means:
- the framework runtime must not depend on `.env` as its main configuration source
- the source of truth for framework configuration must be versionable JSONC files
- configuration must remain easy to read, edit, diff, review, and maintain

The expected direction is:
- one global framework config JSONC file
- optional module-specific JSONC config files
- a typed config loader that reads, merges, validates, and exposes configuration safely

Suggested layout direction:
- `config/framework.config.jsonc`
- `config/modules/<module-name>.config.jsonc`

Environment variables may still be allowed in a limited and clearly documented way for infrastructure/runtime override scenarios, secrets injection, or host-level deployment concerns, but they must not be the primary framework configuration model.

### 13.2 Covered configuration domains

The configuration system must cover at least:
- framework/global config
- runtime/server config
- DB config
- Redis config
- BullMQ config
- logging config
- i18n config
- module-specific config

### 13.3 Requirements

Requirements:
- strong typing
- Zod validation
- JSONC as the primary persisted config format
- no secrets committed in clear text
- clean access pattern
- support for module-defined config schemas
- deterministic merge/override behavior
- good developer ergonomics

### 13.4 Module-level configuration

Each runtime module should be able to define and validate its own configuration schema.

The framework must support:
- global config shared across the framework
- per-module JSONC config where needed
- clear ownership of config keys
- schema validation per module
- future compatibility with third-party plugins

### 13.5 Root source of truth for repository config files

The repository must keep a single source of truth at the root for:
- ESLint strategy
- Prettier strategy
- TypeScript strategy

This means:
- root config files own the canonical lint/format/tsconfig behavior
- modules and packages must extend/reference the root strategy rather than inventing ad hoc local configurations
- context-specific tsconfigs may exist, but they must be rooted in a central strategy and remain documented
- duplicated conflicting local configs should be avoided unless there is a very strong reason

### 13.6 Rule for implementation agents

Do not allow ad hoc config scattering across the repo.
Do not reintroduce `.env` as the primary framework configuration model.
Keep framework config JSONC-based and root tooling config centralized.

---

## 14. Internationalization (i18n)

TRP Framework must be internationalization-ready from the first version.

Requirements:

- support multiple languages across core, modules, plugins, compatibility layers, and NUI
- the server selects one active locale at startup
- per-player runtime live language switching is not required in v1
- each module/plugin must be able to provide its own locale files or locale definitions
- fallback locale behavior must exist
- translation keys should be namespaced by module
- localization must work for:
  - server-side messages
  - client-side messages
  - NUI text
  - plugin/module text

Initial direction:

- create a shared i18n foundation package
- allow module-local locale assets
- define a global default locale in framework config
- support fallback locale resolution

---

## 15. Data, integrity, and concurrency principles

These principles guide the architecture even if not all of them are fully implemented in the earliest phases.

The framework must be designed so that sensitive data paths can support robust, concurrency-safe behavior.

Important principles:

- use transactions where required
- support idempotency for sensitive operations
- avoid duplicate processing for actions such as payments or purchases
- keep room for append-only ledger patterns for money/accounting
- keep room for journaling/event-style tracking for inventory-like state
- support pragmatic locking/concurrency patterns where needed
- avoid over-validating or re-processing state in every layer

The framework should be performance-conscious, but not prematurely overbuilt.

---

## 16. PostgreSQL, Drizzle, Redis, BullMQ

### 16.1 PostgreSQL

PostgreSQL is the main persistent datastore.

### 16.2 Drizzle ORM

Drizzle is the official relational layer for the framework foundation.

Use it pragmatically.  
Do not build a custom ORM framework around it.

### 16.3 Redis

Redis is used for cache/queue-related needs and fast ephemeral infrastructure support.

### 16.4 BullMQ

BullMQ is used for queued/asynchronous jobs.

Do not build a custom queue system.

### 16.5 Boilerplate expectations

The repository must include a real foundation for:

- DB connection
- Drizzle config/schema organization
- migration structure
- Redis connection
- BullMQ initialization
- future queue/job structure
- healthcheck-friendly wiring

---

## 17. NUI strategy

The framework must provide one reusable `nui-shell` architecture rather than an unstructured collection of unrelated UI resources.

Requirements:

- Vue 3
- Vite
- Pinia
- Tailwind CSS v4
- Base UI
- typed bridge contracts
- shared UI/component direction
- minimal example screen in early implementation phases
- example open-flow from core
- example open-flow from a module

In dev, the NUI workflow should be optimized for fast iteration.

In runtime build mode, assets must be emitted into the correct resource output and referenced by the generated manifest.

---

## 18. Compatibility layer (ESX/QBCore bridge)

TRP Framework must include an explicit compatibility subsystem for migration/interoperability with ESX/QBCore-oriented Lua scripts.

Goals:

- expose selected ESX-like/QBCore-like APIs where feasible
- translate legacy expectations into TRP operations
- help with migration of existing third-party resources

Important rule:

- this is a dedicated subsystem
- it must not pollute the kernel with scattered hacks
- it is not expected to provide total compatibility with every community script on day one

Suggested runtime source layout:

- `resources-src/compat/esx`
- `resources-src/compat/qbcore`

The architecture should preserve the future option of using `provide` strategically where useful.

---

## 19. Developer experience and watch/build flow

The framework must support an efficient daily development loop.

Expected workflow:

1. developer edits source in `server-data/trp-framework/`
2. watch/dev recompiles only what changed and required dependents
3. runtime output updates in `../resources/[trp-framework]/...`
4. developer uses FiveM commands such as:
   - `refresh`
   - `restart <resource-name>`

The framework should also support initial start with:

- `ensure [trp-framework]`

Watch/dev should not rebuild the entire monorepo for every trivial change.

---

## 20. Release and upgrade strategy

The framework must be update-friendly for server owners and third-party module authors.

Requirements:

- stable public packages/APIs
- internal/public boundary clarity
- Changesets-based versioning/changelog
- preference for additive evolution
- avoid forcing custom script authors to rewrite large amounts of code on every framework update

Server owners who build custom TRP-based modules should be able to update the framework with minimal conflict if they stay on public APIs.

---

## 21. Future admin panel

A future admin panel may use:

- Fastify + React

But this is a future concern only.

It must not distort or overcomplicate the early runtime foundation.

---

## 22. Source repository structure direction

The source repository must be structured around this long-term direction:

```txt
trp-framework/
  apps/
  packages/
  resources-src/
    core/
    gameplay/
    ui/
    compat/
  tooling/
  infra/
  tests/
  docs/
```

This is the conceptual direction even if some folders are initially placeholders.

---

## 23. Implementation phases

### Phase 1
Monorepo foundation:
- pnpm workspaces
- Nx
- strict TypeScript base
- ESLint
- Prettier
- Changesets
- root scripts
- docs
- tsconfig context strategy
- JSONC-based primary framework configuration
- root single-source-of-truth strategy for ESLint, Prettier, and tsconfig

### Phase 2
Shared packages and foundations:
- contracts
- shared
- config
- database
- i18n
- observability
- sdk scaffolding
- tooling foundations
- Redis/BullMQ foundations

### Phase 2.5 (alignment/refactor pass if needed)
Architectural correction pass after early bootstrap work:
- reconcile stack decisions
- fix package boundaries
- fix tsconfig/runtime separation
- prepare bundle/dependency hygiene
- align docs and structure with current spec
- correct any drift introduced in Phases 1–2

### Phase 3
Kernel/runtime build foundation:
- first kernel/core resource(s)
- runtime build pipeline to `../resources/[trp-framework]/`
- esbuild resource bundling
- automated manifest generation/validation
- initial runtime dependency structure

### Phase 4
Gameplay proof modules:
- identity
- simple job module
- inter-module communication example

### Phase 5
NUI:
- `nui-shell`
- typed bridge
- example screen
- runtime NUI output integration

### Phase 6
Compatibility subsystem:
- ESX/QBCore bridge foundations
- first compatibility exports/adapters

### Phase 7
Hardening:
- Docker/Compose
- CI/CD
- release/update docs
- runtime validation hardening

### Phase 8
Future admin panel base:
- Fastify + React direction
- separate from FiveM runtime

---

## 24. Acceptance criteria

The project is only acceptable when all of the following are true:

- coherent pnpm + Nx monorepo
- source lives in `server-data/trp-framework/`
- runtime output goes to `server-data/resources/[trp-framework]/`
- no ghost resources
- one valid `fxmanifest.lua` per emitted runtime resource
- manifests reference real files
- strict type-safe architecture
- Zod 4 as the only validation system
- Drizzle ORM + PostgreSQL foundation
- Redis + BullMQ foundation
- kernel/core foundation
- public SDK/module creation path
- identity module
- simple job module
- inter-module communication example
- reusable NUI shell
- i18n foundation
- compatibility subsystem direction
- CI/CD
- Docker/Compose
- update-friendly public API model

---

## 25. Mandatory working rules for Claude Code

Any implementation agent working on this repository must:

1. read this file first
2. keep source/runtime separation strict
3. never emit internal packages as FiveM resources
4. keep runtime output deterministic
5. respect frozen stack decisions
6. avoid reinventing mature tooling already chosen
7. keep public APIs explicit
8. keep the repository functional at the end of each phase
9. stop and ask if a requested change conflicts with a frozen architectural decision
10. prefer small, real, coherent deliverables over speculative overengineering
