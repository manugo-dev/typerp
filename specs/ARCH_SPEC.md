# TRP Framework — ARCH_SPEC

## 1. Purpose of This Document

This document is the primary source of truth for the technical architecture, implementation constraints, repository structure, runtime model, coding standards, and phased delivery rules of **TRP Framework**.

Any AI agent or human contributor working on this repository must read and follow this document before making changes.

This specification is intentionally strict. It exists to keep the project:

- maintainable
- scalable
- type-safe
- performance-aware
- modular
- deterministic in runtime behavior
- practical to implement without overengineering

This document is focused on **framework architecture and implementation**.
Future higher-level gameplay and systems design lives in `GAME_DESIGN_SPEC.md` and must not be treated as mandatory implementation scope for early phases unless explicitly requested.

---

## 2. Project Identity

- **Project name:** `typerp`
- **Repository root:** `server-data/typerp/`
- **FiveM runtime output target:** `server-data/resources/[typerp]/`
- **Source runtime resources root:** `server-data/typerp/resources-src/`

The source repository must not live inside FiveM's runtime `resources/` directory.
The repository lives beside it, and build/runtime targets emit compiled resources into the final runtime location.

---

## 3. High-Level Goals

TRP Framework is a TypeScript-first, modular, server-authoritative FiveM roleplay framework built from scratch.

The framework must:

- be original and not use ESX, QBCore, or any other RP framework as its base
- support long-term extensibility for internal and third-party modules/plugins
- be architected for serious scalability targets, including OneSync Infinity servers aiming toward high concurrency
- provide a clean kernel/core foundation
- make runtime resources deterministic and easy to operate in FiveM
- support safe upgrades for framework consumers
- support compatibility layers for legacy ESX/QBCore-oriented Lua scripts in later phases
- avoid overengineering and avoid reinventing the wheel

The target of 2048 concurrent players is an architectural ambition, not a guarantee from software alone.
The framework must be designed to make such scale realistic through good architecture, not through unrealistic promises.

---

## 4. Non-Goals for Early Phases

The early phases must not try to implement the entire game.
They must build a strong platform foundation first.

Out of scope for early phases unless explicitly requested:

- full economy system
- full inventory system
- full housing system
- full territory control system
- complete crime/justice systems
- complete character creator
- complete moderation/toxicity systems
- complete compatibility with every ESX/QBCore script
- final administration panel implementation

The initial priority is the framework foundation, build pipeline, runtime structure, typing strategy, core services, example modules, and future compatibility paths.

---

## 5. Physical Repository Model

The required disk structure is:

```txt
server-data/
  resources/
    [typerp]/
      ...compiled runtime resources only...
  typerp/
    ...source monorepo...
```

Rules:

- `server-data/typerp/` is the source repository that goes to Git.
- `server-data/resources/[typerp]/` is the compiled runtime output consumed by FiveM.
- Source and runtime must remain strictly separated.
- The build must emit directly into `../resources/[typerp]/<resource-name>` from inside the source repo.
- No manual copying of compiled output should be required after build.

---

## 6. FiveM Runtime Model

FiveM discovers resources inside `server-data/resources/`.
A resource is expected to have a valid `fxmanifest.lua` in its root.

### 6.1 Runtime output rules

Only real runtime resources may be emitted into:

```txt
../resources/[typerp]/
```

Do not emit:

- workspace libraries
- tooling packages
- tsconfig packages
- eslint/prettier packages
- docs
- test helpers
- placeholder folders
- empty resources

### 6.2 Runtime resources must be independently restartable

Each emitted runtime resource must be isolated and restartable individually using FiveM commands such as:

- `refresh`
- `ensure [typerp]`
- `restart typerp-identity`

### 6.3 Runtime source location

All source resources must live under:

```txt
resources-src/
```

Never use the source repo's own `resources/` as if it were the real FiveM runtime directory.

---

## 7. Runtime Manifest Contract

The framework must generate `fxmanifest.lua` automatically during runtime build.

### 7.1 General manifest rules

Each emitted runtime resource must:

- contain exactly one `fxmanifest.lua`
- contain only files referenced by that manifest
- not reference missing files
- not be empty

### 7.2 Default manifest values

Unless a resource has a justified reason otherwise, generated runtime manifests must use:

- `fx_version 'cerulean'`
- `game 'gta5'`

### 7.3 Server JS runtime

For server-side JavaScript resources, the generated manifest must use:

- `node_version '22'`

### 7.4 Server-only resources

If a resource has no client runtime code, no NUI, and no client packfile needs, the manifest should include:

- `server_only 'yes'`

### 7.5 NUI resources

If a resource includes NUI, the build system must generate correct:

- `ui_page`
- `files { ... }`

and ensure all assets referenced by the manifest actually exist.

### 7.6 Dependencies

Generated manifests must support `dependencies` when a resource requires another resource to be loaded first.

### 7.7 Exports policy

Prefer exports defined in runtime code, such as:

```ts
exports('name', fn);
```

Do not rely on manifest `export` / `server_export` declarations unless a very specific compatibility reason exists.

### 7.8 Future compatibility support

The architecture must preserve the future possibility of using `provide` for compatibility resources such as:

- `typerp-compat-esx`
- `typerp-compat-qbcore`

### 7.9 Validation

The runtime build must fail if:

- a resource has no generated manifest
- a manifest references missing files
- a resource output is empty
- runtime output structure is broken

---

## 8. Technology Decisions (Frozen)

These decisions are frozen unless explicitly changed by a later architecture decision.

### 8.1 Monorepo

- `pnpm workspaces`
- `Nx`

### 8.2 Language

- `TypeScript`

### 8.3 Validation

- `Zod 4` only

No secondary validation library is allowed as a co-equal framework standard.

### 8.4 Database

- `PostgreSQL`
- `Drizzle ORM`

### 8.5 Queueing / background processing

- `Redis`
- `BullMQ`

### 8.6 Runtime bundler

- `esbuild`

### 8.7 NUI stack

- `Vue 3`
- `Vite`
- `Pinia`
- `Tailwind CSS v4`
- `Base UI`

### 8.8 Config format

- `JSONC`
- `jsonc-parser` is the primary JSONC parser/manipulation library

### 8.9 Source package strategy

- `ESM-first`

### 8.10 Future admin panel direction

- `Fastify + React`

This is future-facing only and must not be implemented in the early foundation phases unless explicitly requested.

---

## 9. Engineering Principle: Do Not Reinvent the Wheel

TRP Framework must avoid reinventing the wheel.

Rules:

- prefer mature, well-maintained, widely adopted tools and libraries when they solve the problem adequately
- do not create custom infrastructure packages for problems already solved well by the chosen stack
- only build custom solutions when there is a clear and justified need

A custom solution is justified only if:

- the problem is highly specific to FiveM/TRP
- the chosen library/tool cannot support the needed use case
- performance constraints make the library unsuitable
- a stable framework-specific public boundary is required

Examples of accepted tools:

- Zod 4
- Drizzle ORM
- BullMQ
- Redis
- esbuild
- Nx
- pnpm workspaces
- Vue 3 / Vite / Pinia / Tailwind / Base UI
- Vitest
- GitHub Actions
- jsonc-parser

Avoid unnecessary wrappers and abstractions.
Use thin integration layers only where they clearly improve consistency, reduce coupling, or protect public APIs.

---

## 10. Clean Code, Naming, and Comments Policy

TRP Framework must enforce strict clean code standards.

### 10.1 General code rules

- code must be self-explanatory
- naming must make intent obvious
- functions, variables, types, files, and folders must use descriptive names
- keep units cohesive and focused
- avoid god files and god modules
- avoid vague names like `data`, `temp`, `value`, `item`, `helper`, `manager`, `misc`, or `utils` unless context makes them truly correct

### 10.2 Comments policy

Comments must be minimized.
The code itself should explain what it is doing through naming and structure.

Comments are only acceptable when they explain one of the following:

- a non-obvious FiveM limitation
- a runtime boundary caveat
- a subtle performance tradeoff
- a business-rule reason
- a non-obvious architectural decision

Do not use comments to explain code that should already be understandable from naming and structure.

---

## 11. AI Agent Working Rule

All implementation guidance, prompts, docs, and workflow references should use the generic term:

- `AI agent`

Do not hardcode architectural process documentation to one vendor-specific implementation agent.

---

## 12. Source Tree Model

The source repo should contain at minimum:

```txt
apps/
packages/
resources-src/
tooling/
infra/
tests/
docs/
```

### 12.1 `apps/`

Non-FiveM applications and future apps.
Examples:

- future admin panel
- future workers or support tools if they become app-shaped

### 12.2 `packages/`

Workspace libraries only.
Never runtime FiveM resources.

### 12.3 `resources-src/`

Source runtime resources that will eventually compile into real FiveM resources.

### 12.4 `tooling/`

Internal build scripts, manifest generation, validation, code generation, and helper tooling.

### 12.5 `infra/`

Docker, Compose, infrastructure scaffolding, and environment/dev support.

### 12.6 `tests/`

Integration, performance, end-to-end, and framework-level test support.

### 12.7 `docs/`

Architecture docs, contribution docs, module authoring docs, runtime docs.

---

## 13. TypeScript Context Strategy

The framework must clearly separate TypeScript by runtime context.

Required contexts:

- server runtime
- client runtime
- shared/isomorphic runtime-safe code
- NUI/browser
- tooling/node
- tests

### 13.1 Root ownership

The TypeScript strategy must have one root source of truth.
All tsconfig files must be centrally defined and rooted in the repository root.

### 13.2 Contexts

The repo must support explicit tsconfig strategies for at least:

- base/root
- tooling/node
- FiveM server runtime
- FiveM client runtime
- shared/isomorphic
- NUI/browser
- tests

### 13.3 Boundary rules

- server code must not leak into client/shared/browser contexts
- browser/NUI code must not leak into runtime server/client contexts
- Node-only APIs must not leak into shared or client contexts
- shared code must be truly safe for both intended consumers

### 13.4 File conventions

The project should use these file suffix conventions:

- `*.server.ts`
- `*.client.ts`
- `*.shared.ts`

### 13.5 Resource-local source layout

Each runtime resource may contain:

- `client/`
- `server/`
- optional `shared/`

Rules:

- `client/` contains `*.client.ts`
- `server/` contains `*.server.ts`
- `shared/` contains `*.shared.ts`

`shared/` is only for small runtime code shared by the client and server of that same resource.

### 13.6 Shared folder policy

- direct imports from `shared/` into `client/` and `server/` are allowed
- small duplication caused by bundling `shared/` code into both runtime bundles is acceptable
- do not introduce a dedicated `shared_script` optimization strategy at this stage
- do not overengineer resource-local shared runtime code yet

If code needs to be reused across multiple resources, it must live in `packages/*`, not in a resource-local `shared/` folder.

---

## 14. ESM Strategy and Runtime Compatibility

The source repository must be ESM-first.

Rules:

- source/workspace packages participating in bundling must be authored in an ESM-friendly way
- internal packages must avoid CommonJS unless clearly justified
- runtime output must be compatible with FiveM, even if the source repo is ESM-first

Important:

- do not force runtime artifacts to be “ESM for its own sake” if that conflicts with proven FiveM runtime compatibility
- source is ESM-first
- runtime output must be FiveM-compatible and validated in practice

---

## 15. Single Source of Truth for Root Configs

TRP Framework must maintain one root source of truth for:

- ESLint
- Prettier
- TypeScript strategy

Rules:

- root configuration files are authoritative
- packages and resources must extend/reference the root strategy
- avoid duplicated local configs that conflict with the root model
- keep context-specific tsconfig files, but root them in the centralized strategy
- modules must not invent ad-hoc local linting/formatting/tsconfig setups

---

## 16. Configuration Model

### 16.1 Primary config format

TRP Framework uses **JSONC** as the primary configuration format.

### 16.2 Primary parser

The primary JSONC parser/manipulation library is:

- `jsonc-parser`

### 16.3 Validation

All parsed configuration must be validated with:

- `Zod 4`

### 16.4 Configuration sources

The framework must support:

- one global framework config
- optional module-specific config files

Suggested model:

```txt
config/
  framework.config.jsonc
  modules/
    identity.config.jsonc
    simple-job.config.jsonc
```

### 16.5 Rules

- `.env` must not be the primary framework configuration model
- global config is the primary source of truth
- module config is additive and scoped
- configuration loading/merging must be predictable and documented
- environment variables may exist only as limited infrastructure overrides when clearly justified

---

## 17. Shared Types and Contracts Strategy

The primary source of shared framework types and contracts must be:

- `packages/contracts`

Rules:

- repeated types across runtime resources must be moved into `packages/contracts`
- shared framework contracts, DTOs, payloads, public cross-module types, and validation boundaries must live in `packages/contracts`
- module-local internal types may remain inside the module if they are not reused elsewhere
- avoid duplicating shared type definitions across resources and packages

`packages/contracts` must not become a broad god-package.
It must be structured by domain and subpath exports, for example:

- `@typerp/contracts/core`
- `@typerp/contracts/identity`
- `@typerp/contracts/simple-job`

Do not create one giant barrel reexporting everything.
Use granular exports and imports.

---

## 18. Zod 4 Usage and Strict Tree-Shaking Rules

Zod 4 is the only validation library used by TRP Framework.

However, Zod runtime code must not be pulled unnecessarily into every runtime resource.

Rules:

- only import Zod schemas in places that truly require runtime validation
- when only types are needed, use `import type`
- schemas and types should be split where appropriate so runtime consumers do not pull Zod unnecessarily
- `packages/contracts` must be designed for tree-shaking friendliness
- avoid broad barrel exports that force unnecessary runtime imports

Required practices:

- source packages participating in bundling must remain ESM-first
- CommonJS must be avoided in internal source packages unless clearly justified
- use `sideEffects: false` where correct
- use granular imports and subpath exports
- maximize tree-shaking while keeping the system functional and maintainable

Build requirements:

- runtime builds must enable tree-shaking
- bundle analysis must be possible through esbuild metafile or equivalent
- transitive dependency growth is an architectural concern and must be monitored

Do not accept passive growth where every runtime resource ends up carrying unnecessary validation runtime.

---

## 19. Runtime Infrastructure Ownership

TRP Framework must avoid duplicating heavy infrastructure initialization across runtime resources.

Rules:

- `packages/database` is an internal implementation package, not a package that every runtime resource should initialize directly
- `packages/database` may expose:
  - Drizzle schema
  - query helpers
  - repository/factory primitives
  - DB-related type-safe utilities
- `packages/database` must not encourage every runtime resource to create its own DB client or pool

The primary runtime infrastructure owner must be:

- `typerp-core-kernel`

`typerp-core-kernel` is responsible for owning and initializing:

- PostgreSQL / Drizzle
- Redis
- BullMQ
- other heavy shared infrastructure unless a later architectural decision explicitly separates it

Default rule:

- gameplay/runtime resources must not initialize their own DB/Redis/BullMQ clients or pools
- gameplay/runtime resources should access stateful infrastructure capabilities through:
  - public runtime APIs
  - code-defined exports
  - kernel-owned services/capabilities

This rule exists to avoid:

- duplicated connections
- duplicated pools
- unnecessary memory use
- inconsistent ownership of infrastructure
- runtime fragmentation

---

## 20. Database / Queue / Heavy Dependency Usage Rules

### 20.1 Packages vs owners

- `packages/database` is for schema, helpers, types, and DB implementation support
- `packages/database` is not the place where every runtime resource gets a live `db` singleton by default

### 20.2 Runtime behavior

Runtime resources should not do this by default:

```ts
import { db } from '@typerp/database';
```

if that implies direct independent runtime initialization in many resources.

### 20.3 Kernel-owned access

Heavy runtime services must be owned by `typerp-core-kernel` and accessed through public runtime APIs or kernel-owned service access patterns.

---

## 21. Shared Bundled Code vs Runtime Public APIs

TRP Framework must clearly distinguish between:

- small bundled shared code
- unique stateful/domain logic exposed through runtime APIs

Rules:

- small, pure, side-effect-free shared code may be bundled into multiple runtime resources
- unique, stateful, source-of-truth domain logic must live in a dedicated runtime resource
- other runtime resources must consume that domain logic through public runtime APIs/exports instead of bundling/copying it

Use bundled shared code for:

- small helpers
- constants
- contracts
- schemas where runtime validation is actually needed
- pure utility functions
- i18n helpers
- small resource-local shared runtime code

Use runtime public APIs/exports for:

- domain capabilities
- stateful services
- source-of-truth logic
- infrastructure ownership
- identity/account/state access
- other unique runtime services

Do not:

- create utility-only runtime resources just to avoid tiny code duplication
- create giant god packages
- duplicate stateful domain logic across runtime resources

---

## 22. Third-Party Dependency Bundling Policy

Runtime resources must be self-contained and reliable in FiveM.

Rules:

- third-party runtime dependencies used by a runtime resource should be bundled into the final runtime artifact by default
- Node built-ins may remain external for server-side runtime resources where appropriate
- client runtime resources must not rely on runtime resolution of external npm packages
- workspace libraries may be bundled into runtime resources as needed

This means:

- libraries such as `zod` and `jsonc-parser` should normally be bundled into final runtime resources if those resources actually use them
- do not rely on resource-local `node_modules` distribution as the primary runtime strategy
- do not externalize third-party dependencies casually in runtime builds

This policy exists to keep runtime output deterministic, portable, and deployment-friendly.

---

## 23. Monorepo Package Boundaries

The repository should contain at minimum these shared package categories:

- `packages/contracts`
- `packages/shared`
- `packages/config`
- `packages/database`
- `packages/observability`
- `packages/tooling`
- `packages/i18n`
- `packages/sdk`
- `packages/tsconfig`
- `packages/eslint-config`

Rules:

- these are workspace libraries only
- they must not become runtime FiveM resources
- each package must have a focused responsibility
- avoid giant “shared” packages that pull too much transitively

---

## 24. Kernel / Core Direction

The framework must have a small but real kernel/core.

The kernel must eventually support:

- runtime bootstrap/init
- module registration direction
- module/runtime metadata
- dependency declaration direction
- capability declaration direction
- config access
- logging access
- runtime service registration/access
- future-friendly lifecycle hooks
- public runtime API/export direction

Do not overbuild the kernel early.
It should be small, real, and extensible.

---

## 25. Module and Plugin Architecture

The framework must be modular.

### 25.1 Runtime modules

Examples:

- identity
- jobs
- compatibility resources
- future domain systems

### 25.2 Third-party extensibility

Third-party authors must eventually be able to create their own TRP-compatible modules/plugins without modifying kernel internals.

### 25.3 SDK direction

A developer-facing SDK package should eventually exist to make module authoring easier, but must not become a fake abstraction detached from runtime reality.

---

## 26. Runtime Resource Build Strategy

### 26.1 Bundling

Each runtime resource must be bundled independently using:

- `esbuild`

### 26.2 Output shape

Each runtime resource should emit artifacts such as:

- `server.js`
- `client.js`

as applicable.

### 26.3 Internal modularization

Source code inside a resource may be modular and split into many internal files and folders.
The builder is responsible for collapsing those entry trees into final bundled runtime artifacts.

Do not require one giant source file per context.

### 26.4 No ghost resources

Do not emit placeholder runtime resources.
Do not emit empty runtime resources.
Do not emit workspace packages as resources.

---

## 27. Runtime Build Validation

The runtime build must validate:

- emitted resources are real and non-empty
- exactly one manifest exists per resource
- manifest references real files
- build output structure matches runtime expectations
- bundling strategy does not accidentally leave invalid runtime dependencies unresolved

Bundle analysis must be possible.
Runtime output correctness is an architectural requirement.

---

## 28. i18n / Localization

TRP Framework must be internationalization-ready from the first version.

Requirements:

- support multiple languages across core, modules, plugins, compatibility layers, and NUI
- the server selects one active locale at startup
- per-player runtime language switching is not required in v1
- each module/plugin should be able to contribute its own locale assets later
- fallback locale behavior must exist
- translation keys should be namespaced by module

Initial direction:

- `packages/i18n` as a shared foundation
- one active server locale model
- module-local locale assets supported later

---

## 29. NUI Architecture

The NUI direction is frozen as:

- Vue 3
- Vite
- Pinia
- Tailwind CSS v4
- Base UI

Rules:

- keep NUI separate from FiveM runtime contexts
- use a typed bridge contract
- NUI assets must be emitted into the correct runtime resource later
- the NUI architecture should remain reusable and modular

Do not build large NUI systems before the framework base is ready.

---

## 30. ESX / QBCore Compatibility Direction

TRP Framework must eventually support compatibility layers for legacy Lua ecosystems.

This compatibility must be explicit and modular.
It must not become scattered hacks inside the kernel.

Future compatibility resources may include:

- `typerp-compat-esx`
- `typerp-compat-qbcore`

Potential future use of `provide` in manifests must remain possible.

This compatibility is future-facing and should be implemented in dedicated phases.

---

## 31. CI / Validation / Health Requirements

The repository must support validation commands such as:

- `lint`
- `format`
- `typecheck`
- `test`
- `build`
- `build:runtime`
- `dev`
- `dev:watch`
- `clean`

Root-level tasks must exist.
Work already implemented must continue to lint, typecheck, and build correctly.

---

## 32. Documentation Requirements

The repository must document at least:

- source vs runtime separation
- runtime output model
- config model
- package boundaries
- resource structure
- how to add a runtime resource/module
- how contracts and shared types are organized
- how the kernel owns infrastructure
- how cross-resource APIs should be used
- how AI agents should work against the spec

---

## 33. Prompt / Implementation Agent Rules

Any AI agent working on this repository must:

1. read `ARCH_SPEC.md` before making changes
2. preserve frozen architecture decisions
3. avoid unnecessary rewrites
4. avoid overengineering
5. not recreate the repo from scratch unless explicitly instructed
6. keep the repository healthy after each phase
7. run validation commands before finishing a phase
8. explain assumptions and technical risks

---

## 34. Phase Model

The framework should be built in phases.

Expected high-level progression:

1. monorepo foundation
2. shared package foundation
3. runtime/kernel/build pipeline foundation
4. first gameplay modules and inter-resource communication
5. NUI foundation
6. compatibility layer foundation
7. CI/CD, Docker, release hardening
8. future admin panel foundation

The repository should remain runnable and aligned after each phase.

---

## 35. Acceptance Criteria

The architecture is only acceptable if all of these are true over time:

- source repo remains separate from runtime output
- runtime output goes to `../resources/[typerp]/`
- no ghost resources are emitted
- each runtime resource has exactly one valid manifest
- manifests reference only real files
- runtime resources are independently restartable
- runtime build is deterministic and validated
- infrastructure ownership is centralized correctly
- heavy infra is not initialized independently by many resources
- contracts/types are shared through `packages/contracts`
- tree-shaking is treated as an architectural concern
- Zod runtime usage is controlled and not pulled everywhere unnecessarily
- runtime resources can use `client/`, `server/`, and optional small `shared/`
- root config files remain the single source of truth for linting/formatting/tsconfig
- config is JSONC-based and validated with Zod after parsing via `jsonc-parser`
- code remains clean, explicit, and minimally commented
- the architecture remains AI-agent-agnostic
- the repo remains compatible with future module/plugin authorship

---

## 36. Final Working Rule

When in doubt, choose:

- clarity over cleverness
- maintainability over novelty
- explicit boundaries over magic
- mature tooling over custom reinvention
- small real implementations over giant speculative abstractions
- performance-aware pragmatism over premature overengineering
