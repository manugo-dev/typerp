# ARCH_SPEC.md

## TRP Framework — Operational Master Specification for the AI agent

Status: single source of truth  
Project: `trp-framework`  
Source repository: `server-data/trp-framework/`  
Final FiveM runtime output: `server-data/resources/[trp-framework]/<resource-name>`

---

## 1. Purpose of this document

This file defines the architecture, constraints, frozen decisions, quality rules, runtime rules, build strategy, phase plan, and acceptance criteria for any AI agent working on TRP Framework.

Mandatory rules:

- Before changing the repository, the AI agent must read this file completely.
- If a future instruction conflicts with a frozen decision in this file, the AI agent must stop and ask for confirmation before breaking that decision.
- The AI agent must not improvise major stack changes, runtime layout changes, manifest strategy changes, or public API changes unless explicitly instructed.
- The AI agent must prefer real, minimal, coherent implementations over pseudocode or empty architecture.
- The AI agent must keep the repository healthy after each phase: linting, typechecking, and building must remain functional where applicable.
- All project-facing documents and files intended for AI implementation workflows should be written in English.

---

## 2. Project vision

TRP Framework is a long-term, TypeScript-first, modular, type-safe FiveM roleplay framework built from scratch.

Strategic goals:

- build a small, stable kernel/core
- support decoupled gameplay modules
- make third-party plugin/module development straightforward
- produce clean, correct, deterministic FiveM runtime output
- provide a modern, fast, pragmatic developer experience
- make framework upgrades safe for framework consumers
- include a realistic compatibility strategy for ESX/QBCore-oriented Lua resources
- remain architecturally capable of scaling toward OneSync Infinity high-concurrency targets, including the goal of up to 2048 concurrent players, without pretending that software alone guarantees that outcome

TRP Framework must not use ESX, QBCore, or any other RP framework as a direct base. Conceptual inspiration is allowed, but the implementation must be original.

---

## 3. Non-negotiable principles

### 3.1 Do not reinvent the wheel

TRP Framework must avoid reinventing the wheel.

The project should prefer mature, well-maintained, widely adopted tools and libraries when they solve the problem well enough and fit the architecture.

General rule:

- use proven external tooling by default
- integrate it cleanly
- create custom internal solutions only when there is a clear and justified reason

Approved and preferred tools in this project:

- Zod 4 for validation
- Drizzle ORM for database access
- BullMQ for queues
- Redis for cache/queue backend
- esbuild for runtime bundling
- Nx for monorepo orchestration
- pnpm workspaces for package management
- Vue 3 + Vite + Pinia + Tailwind CSS v4 + Base UI for NUI
- Vitest for testing
- GitHub Actions for CI/CD
- jsonc-parser for JSONC parsing/manipulation

Custom wrappers or internal abstractions are only justified when they:

- improve consistency
- protect public APIs
- reduce real coupling
- improve DX without hiding essential behavior
- solve a specifically FiveM/TRP problem that general tooling does not solve well

### 3.2 No overengineering

This is a large project. Do not spend months rebuilding infrastructure that already exists and works well.

Prioritize:

- delivery
- maintainability
- clarity
- performance where it actually matters
- clean public boundaries
- pragmatic integration of proven tooling

### 3.3 Server-authoritative gameplay

Sensitive gameplay logic must be decided on the server.

This especially applies to:

- money
- identity
- permissions
- inventory
- progression
- jobs
- critical gameplay state

Client and NUI may handle UX, presentation, input, and visual feedback, but they are not the source of truth for business logic.

### 3.4 Small kernel, modular domains

The framework must not become a monolith.

It must have:

- a small, stable kernel
- decoupled gameplay/domain modules
- typed public boundaries
- third-party extensibility without modifying kernel internals

### 3.5 Clear public APIs

The project must distinguish clearly between:

- public APIs intended for framework consumers and third-party modules
- internal implementation details

Framework consumers must depend only on documented public packages and runtime public APIs.

### 3.6 Clean, deterministic FiveM runtime

The runtime output must be:

- deterministic
- clean
- free of ghost resources
- independently restartable by resource
- ready to run inside real FiveM `resources/`

### 3.7 Internationalization from the start

The framework must be internationalization-ready from the beginning.

It must support:

- one active server-selected language at a time
- future module-local translation assets
- fallback language behavior
- localization across server, client, runtime modules, compatibility layers, and NUI

Per-player live runtime language switching is not required in v1.

### 3.8 Clean code first

TRP Framework must follow strict clean-code standards.

Rules:

- code should be self-explanatory whenever possible
- naming must be descriptive enough to make the flow understandable without comments
- functions, variables, files, types, and modules must use clear, explicit names
- avoid vague names like `data`, `item`, `obj`, `temp`, `helper`, `manager`, `util`, `misc`, `stuff`, unless the abstraction is truly generic and clearly scoped
- avoid overly large files and overly large functions
- prefer composition over giant multi-purpose units
- keep modules cohesive
- keep imports explicit and intentional

### 3.9 Minimal comments policy

Comments must be minimized.

Rules:

- do not comment what the code already says clearly
- do not use comments as a substitute for good naming
- only use comments when truly necessary, such as:
  - a non-obvious FiveM/runtime limitation
  - a cross-runtime constraint
  - a subtle performance tradeoff
  - a business-rule reason that is not obvious from code alone
  - a workaround that future maintainers must understand

The default expectation is code that explains itself through naming and structure.

---

## 4. Frozen stack decisions

### 4.1 Monorepo and project base

Frozen decisions:

- monorepo with `pnpm workspaces`
- task/project orchestration with `Nx`
- source repository root: `server-data/trp-framework/`
- runtime source projects under `resources-src/`
- final FiveM runtime output under `../resources/[trp-framework]/`

### 4.2 Validation

Frozen decision:

- use **Zod 4 only** for runtime validation and schema-based contracts

No Typia. No Valibot as a primary validation strategy. No custom validation framework.

### 4.3 Persistence and data

Frozen decisions:

- PostgreSQL as the primary database
- Drizzle ORM as the primary DB access layer
- Redis as cache/queue backend
- BullMQ for queueing and async jobs

### 4.4 NUI

Frozen stack:

- Vue 3
- Vite
- Pinia
- Tailwind CSS v4
- Base UI

### 4.5 Development tooling

Frozen decisions:

- TypeScript
- ESLint
- Prettier
- Vitest
- Changesets
- Docker + Docker Compose
- GitHub Actions

### 4.6 Runtime bundling

Frozen decision:

- use **esbuild** as the runtime bundler for FiveM resources

### 4.7 JavaScript runtime on FiveM server

Frozen decision:

- server-side JS resources must use `node_version '22'` in generated manifests where applicable

### 4.8 Configuration format

Frozen decisions:

- framework configuration is **JSONC-based**
- `.env` is not the primary framework configuration model
- `jsonc-parser` is the primary library for parsing/manipulating JSONC configuration
- configuration objects must still be validated with Zod after parsing

### 4.9 Future admin panel

Future direction only, not for v1 foundation:

- Fastify + React

Do not implement the admin panel in early phases unless explicitly requested.

---

## 5. Physical repository and runtime model

### 5.1 Mandatory physical structure

Required layout:

```txt
server-data/
  resources/
    [trp-framework]/
      ...compiled runtime resources only...
  trp-framework/
    ...source monorepo...
```

### 5.2 Critical rule

The source monorepo must **not** live inside FiveM `resources/`.

### 5.3 Absolute source vs runtime separation

- Source code lives in `server-data/trp-framework/`
- Final runtime output lives in `server-data/resources/[trp-framework]/`
- Source and runtime must never be mixed
- Workspace packages must never accidentally become runtime resources

---

## 6. Logical monorepo structure

The source repository must have a clear logical structure including at minimum:

- `apps/`
- `packages/`
- `resources-src/`
- `tooling/`
- `infra/`
- `tests/`
- `docs/`

### 6.1 `resources-src/`

Holds source code for actual runtime resources that will be emitted into FiveM `resources/`.

### 6.2 `packages/`

Holds workspace libraries. These are **not** runtime resources.

Examples:

- contracts
- shared
- config
- database
- observability
- tooling
- i18n
- sdk
- tsconfig
- eslint-config

### 6.3 `apps/`

Holds non-FiveM applications. Early phases may leave these minimal.

### 6.4 `tooling/`

Holds build/runtime/tooling scripts.

### 6.5 `infra/`

Holds Docker, Compose, and local infrastructure support.

### 6.6 `tests/`

Holds integration, e2e, and performance-oriented tests.

### 6.7 `docs/`

Holds developer documentation and implementation guidance.

---

## 7. Suggested runtime areas inside `resources-src/`

Suggested direction:

```txt
resources-src/
  core/
    kernel/
    nui-bridge/
    session/
    permissions/
  gameplay/
    identity/
    jobs/
      simple-job/
  ui/
    nui-shell/
  compat/
    esx/
    qbcore/
```

This is a direction, not a rigid template. The architectural intent must remain.

---

## 8. Strict FiveM runtime contract

### 8.1 Only real runtime resources in runtime output

Only real runtime resources may be emitted into:
`../resources/[trp-framework]/`

Workspace libraries, docs, tooling, configs, and internal helpers must never be emitted as standalone resources.

### 8.2 Exactly one `fxmanifest.lua` per resource

Each emitted runtime resource must contain exactly one `fxmanifest.lua` at its root.

### 8.3 No ghost resources

Do not emit:

- empty runtime resources
- placeholder-only resources
- folders that look like resources but are not real resources

### 8.4 Isolated, restartable runtime resources

Each runtime resource must be independently restartable via FiveM.

### 8.5 Stable, deterministic naming

Runtime resources must use stable, documented, deterministic names.

Examples:

- `trp-core-kernel`
- `trp-core-session`
- `trp-identity`
- `trp-job-simple`
- `trp-compat-esx`
- `trp-compat-qbcore`

Do not use ambiguous or inconsistent names.

---

## 9. Bundling, ESM, dependency strategy, and build rules

### 9.1 Official bundler

Use **esbuild** for runtime bundling.

### 9.2 Expected output per resource

Each resource should typically emit only what it needs, for example:

- `server.js`
- `client.js`
- NUI assets where applicable
- `fxmanifest.lua`

### 9.3 ESM-first source

The monorepo source should be ESM-first.

Rules:

- source packages that should be ESM must declare `"type": "module"`
- TypeScript and build strategy must support ESM-first development cleanly

### 9.4 FiveM-compatible runtime output

The final runtime bundle must be **compatible with FiveM**, not blindly forced into a format that has not been validated in real runtime usage.

### 9.5 Automatic `fxmanifest.lua` generation

`fxmanifest.lua` must be generated automatically during runtime build.

It must not be left implicit or manually assumed.

### 9.6 Runtime output validation

The build must fail if:

- a resource is emitted without a manifest
- a manifest references missing files
- a resource output is empty or invalid
- runtime structure is broken

### 9.7 Old output cleanup

The build must handle stale runtime output safely to avoid leftover files corrupting emitted resources.

### 9.8 Bundle-per-resource rule

Each runtime resource must be bundled independently.

### 9.9 Shared bundled code is acceptable in moderation

Small, pure, side-effect-free shared code may be bundled into multiple resources.

### 9.10 Avoid god packages

Do not create giant shared packages that pull in large dependency trees.

### 9.11 Tree-shaking friendliness is a requirement

Shared packages should be designed so bundlers can eliminate unused code effectively.

### 9.12 Public runtime APIs for stateful domain logic

Stateful or unique domain logic should live in dedicated runtime resources and be consumed via public runtime APIs/exports.

### 9.13 Do not turn generic utility packages into exported runtime resources

Do not create runtime resources just to expose tiny generic helpers.

### 9.14 Infrastructure ownership rule

PostgreSQL, Redis, and BullMQ must be owned by a very small number of dedicated server-side runtime resources, ideally one core infrastructure owner unless there is a strong reason not to.

Rules:

- gameplay/runtime modules must not initialize their own DB/Redis/BullMQ clients or pools by default
- `packages/database` and related packages are internal implementation packages, not packages every runtime resource should initialize directly
- stateful infrastructure access should be centralized and exposed through public runtime APIs/exports where appropriate
- heavy infrastructure initialization must not be duplicated across many resources

### 9.15 Runtime dependency philosophy

Use the following split:

- bundle small pure shared code where appropriate
- keep unique/stateful/domain/infrastructure ownership inside dedicated runtime resources
- use public runtime APIs/exports for cross-resource domain behavior

---

## 10. Runtime manifest (`fxmanifest.lua`) contract

### 10.1 Manifest defaults

All generated runtime manifests should default to:

- `fx_version 'cerulean'`
- `game 'gta5'`

### 10.2 Deprecated entries

Do not use deprecated entries unless there is a very strong reason.

In particular:

- do not use `resource_manifest_version`
- do not use `lua54`

### 10.3 Manifest generation

The manifest generator must determine, per resource, whether to include:

- `server_script`
- `client_script`
- `shared_script` only when truly applicable
- `ui_page`
- `files`
- `dependencies`
- `server_only 'yes'`
- `node_version '22'`
- future `provide` entries where compatibility resources need them

### 10.4 Manifest validation

Manifest generation and validation must be part of runtime build.

### 10.5 `node_version '22'`

Use `node_version '22'` for server-side JS resources where applicable.

### 10.6 `server_only 'yes'`

If a resource is truly server-only and should not be downloaded by clients, mark it accordingly.

### 10.7 NUI rules

If a resource uses NUI:

- `ui_page` must be correct
- required assets must be listed in `files`
- generated manifest entries must be consistent with emitted assets

### 10.8 `dependencies`

Use `dependencies` where resource startup order or runtime capability ordering matters.

### 10.9 `provide`

Keep future support in mind for compatibility resources that may need to `provide` legacy framework names.

### 10.10 Export declarations

Prefer exports defined in code with runtime APIs over manifest `export` / `server_export` declarations.

---

## 11. TypeScript and tsconfig strategy by execution context

A strict context-aware TS strategy is mandatory.

Required execution contexts:

- server runtime
- client runtime
- shared/isomorphic
- NUI/browser
- tooling/node
- tests

### 11.1 General rules

- Strict TypeScript
- Context-specific tsconfig files
- Clear inheritance strategy
- Future support for project references
- No leaking browser APIs into server/client runtime
- No leaking Node-only/server-only APIs into shared/NUI

### 11.2 File selection conventions

The project may use folder boundaries and, where useful, file suffix conventions such as:

- `.server.ts`
- `.client.ts`
- `.shared.ts`

These conventions must support clarity, not complexity for its own sake.

### 11.3 Required tsconfig direction

The repository should maintain a rooted tsconfig strategy, typically including:

- `tsconfig.base.json`
- `tsconfig.server.json`
- `tsconfig.client.json`
- `tsconfig.shared.json`
- `tsconfig.nui.json`
- `tsconfig.tooling.json`
- root `tsconfig.json`

All of these must remain centrally managed from the root.

### 11.4 Shared code rules

Shared code must be safe to consume from both client and server.

### 11.5 NUI rules

NUI code must remain strictly browser-focused.

### 11.6 Tooling rules

Tooling code may assume Node/tooling environment explicitly, but must not leak that assumption into runtime bundles.

### 11.7 Root config ownership

ESLint, Prettier, and TypeScript strategy must have a single source of truth at the project root.

Projects may extend/reference root strategy, but must not invent conflicting local config islands without strong justification.

---

## 12. Type-safety and validation strategy

### 12.1 Official decision

Use **Zod 4 only**.

### 12.2 Required Zod usage areas

Zod must be used at important runtime boundaries, including at minimum:

- framework config
- module config
- SDK/public contracts
- event payloads
- NUI bridge payloads
- module manifests where applicable
- sensitive client/server inputs

### 12.3 Architectural rule

Modules must depend on TRP contracts and Zod-backed schemas as defined by the framework, not invent ad-hoc validation patterns.

### 12.4 Internal rule

Do not revalidate the same data unnecessarily at every layer. Validate at meaningful boundaries.

---

## 13. Kernel/core

The kernel must remain small but real.

It should eventually provide:

- runtime bootstrap/init
- module registration direction
- metadata/capability direction
- access to config
- access to logging/observability
- access to infrastructure owners where appropriate
- future-friendly public runtime API direction

Do not turn the kernel into a giant god-resource.

---

## 14. Module system and SDK

### 14.1 Module system requirements

The framework must support modules that can declare:

- id
- version
- dependencies
- capabilities
- config schema
- lifecycle hooks
- public services/APIs

### 14.2 SDK

There must be a developer-facing SDK direction for module/plugin authors.

### 14.3 Restrictions

Third-party modules must not depend on framework internals.

### 14.4 Safe upgrades

Public APIs must be designed so framework consumers can update without rewriting their custom scripts unless they depended on internals.

---

## 15. Public API vs internal API policy

### 15.1 Public

Public surface should be limited and intentional.

Candidates include:

- `packages/sdk`
- `packages/contracts`
- selected public runtime APIs/exports
- documented config shape/contracts where relevant

### 15.2 Internal

Everything else should be treated as internal unless explicitly documented as public.

### 15.3 Third-party rule

Third-party code must only depend on documented public surfaces.

### 15.4 Evolution rule

Breaking changes to public APIs must be handled consciously and documented.

---

## 16. Centralized configuration

The framework configuration model is JSONC-based.

Rules:

- no `.env` as the primary framework configuration model
- one global framework config
- module-specific config files where needed
- parse with `jsonc-parser`
- validate with Zod 4
- support a clear load/merge strategy
- keep config easy to edit, version, and document

Suggested structure direction:

```txt
config/
  framework.config.jsonc
  modules/
    identity.config.jsonc
    simple-job.config.jsonc
```

Environment variables may exist for narrow infrastructure overrides if justified, but JSONC is the primary source of truth for framework configuration.

---

## 17. Persistence, queues, and data integrity principles

### 17.1 Technical base

- PostgreSQL
- Drizzle ORM
- Redis
- BullMQ

### 17.2 Concurrency and integrity philosophy

The architecture should remain compatible with disciplined data-integrity patterns such as:

- transactional correctness
- idempotency for sensitive operations
- append-only or auditable strategies where needed
- contention-aware design
- central ownership of infrastructure initialization

### 17.3 Rule

Gameplay resources should not independently initialize heavy infrastructure unless explicitly justified by architecture.

---

## 18. Performance and scaling principles

The framework should be designed to remain compatible with high concurrency and OneSync Infinity, but without overclaiming.

Priorities:

- avoid O(n²) patterns
- avoid excessive event traffic
- avoid unnecessary repeated validation
- keep bundles clean and focused
- centralize heavy infrastructure ownership
- keep stateful domain logic in dedicated runtime resources
- profile before making deep optimizations

Zod 4 is the chosen validation library. Performance must be achieved through sound architecture, careful boundaries, and profiling, not by introducing multiple validation systems.

---

## 19. Internationalization (i18n)

### 19.1 Model

The framework must support multiple languages, with one active server-selected language at a time.

### 19.2 Operational rule

No per-player live language switching is required in v1.

### 19.3 Requirements

- module-namespaced translation keys
- fallback locale behavior
- support across server, client, modules, compatibility layers, and NUI
- easy addition of new languages

### 19.4 Suggested structure

A shared i18n package/foundation should exist, and modules should later be able to add their own locale assets.

### 19.5 Goal

Localization must be easy to extend, maintain, and consume.

---

## 20. NUI and visual layer

### 20.1 Frozen stack

- Vue 3
- Vite
- Pinia
- Tailwind CSS v4
- Base UI

### 20.2 `nui-shell`

The framework should have a reusable `nui-shell` instead of fragmented ad-hoc UIs.

### 20.3 Typed bridge

The bridge between runtime and NUI must be typed and validated with Zod where appropriate.

### 20.4 NUI build requirements

NUI assets must be emitted into the correct runtime resource output and correctly reflected in the generated manifest.

### 20.5 v1 scope

Advanced NUI is not required in early phases, but the architecture must be ready for it.

---

## 21. ESX/QBCore compatibility

### 21.1 Goal

Provide a realistic compatibility subsystem that can help legacy Lua resources interoperate with TRP Framework.

### 21.2 Mandatory pattern

Compatibility logic must remain isolated from kernel internals.

### 21.3 Suggested modules

Suggested direction:

- `resources-src/compat/esx/`
- `resources-src/compat/qbcore/`

### 21.4 Requirements

The compatibility layer should eventually support a realistic subset of:

- player lookup/identity access
- jobs
- money/account direction
- callback/export style compatibility
- common client/server interaction expectations

### 21.5 Realistic initial scope

Do not promise full compatibility with every legacy community script.

### 21.6 Language

Compatibility resources may later need `provide` support when appropriate.

---

## 22. Development workflow and watch mode

### 22.1 Goal

The framework must support fast, incremental development.

### 22.2 Expected root commands

Root command surface should include at minimum:

- `lint`
- `format`
- `typecheck`
- `test`
- `build`
- `build:runtime`
- `dev`
- `dev:watch`
- `clean`

### 22.3 Incremental rebuild

Changing one module/resource should rebuild only what is necessary.

### 22.4 Real runtime flow

Typical runtime flow should support:

- edit source in `server-data/trp-framework/`
- rebuild incrementally
- emit to `../resources/[trp-framework]/...`
- `refresh`
- `restart <resource>` in FiveM where appropriate

### 22.5 NUI in development

NUI should support a clean dev workflow later without corrupting runtime output architecture.

---

## 23. Testing, quality, and validation

The framework should prepare for:

- unit tests
- integration tests
- runtime smoke tests
- NUI/e2e foundations later
- runtime output validation
- manifest validation

Quality gates should include, where applicable:

- lint
- typecheck
- build
- runtime build validation

---

## 24. Docker, Compose, and local environment

The repository should include local infrastructure support for:

- PostgreSQL
- Redis
- related local dependencies when needed

Do not over-center the architecture around running FiveM itself in Docker.

---

## 25. CI/CD and releases

### 25.1 Minimum CI

CI should include at minimum:

- install/cache
- lint
- typecheck
- test
- build
- build:runtime
- artifact publication where appropriate

### 25.2 Versioning

Use Changesets for versioning/changelog.

### 25.3 Goal

Support clean releases for the framework source and runtime artifacts.

---

## 26. Safe upgrades for framework consumers

The architecture must make it practical for framework consumers to update TRP Framework without rewriting all custom modules.

This requires:

- stable public surfaces
- clear public vs internal boundaries
- additive changes where possible
- conscious handling of breaking changes
- documentation of migration paths when needed

---

## 27. Early non-goals

Do not treat the following as early mandatory implementation goals:

- full gameplay economy
- full inventory
- full advanced policing/forensics systems
- advanced systemic world simulation
- full admin panel
- total legacy compatibility

These may exist in separate game design/system design documents.

---

## 28. Implementation phases

### Phase 1 — Monorepo foundation

Monorepo structure, root configs, root scripts, docs, TS context strategy.

### Phase 2 — Shared libraries

Shared packages, config foundation, i18n foundation, database/queue/observability foundations, SDK scaffolding.

### Phase 2.5 — Alignment/refactor pass if needed

Correct drift introduced by earlier phases.

### Phase 3 — Kernel and real runtime build

Kernel foundation, runtime resource source structure, esbuild pipeline, generated manifests, runtime output validation.

### Phase 4 — First domain modules

Identity, first small job module, first clean cross-resource communication example.

### Phase 5 — NUI

NUI shell, typed bridge, first runtime-integrated UI example.

### Phase 6 — Compatibility layer

ESX/QBCore bridge direction.

### Phase 7 — Hardening

Docker/Compose, CI/CD, release hardening, upgrade docs, overall cleanup.

### Phase 8 — Future admin panel

Fastify + React direction, only when explicitly requested.

---

## 29. Mandatory working rules for the AI agent

The AI agent must:

- read this file before each major phase
- preserve frozen decisions unless explicitly instructed otherwise
- keep the repository healthy after each phase
- prefer minimal real implementations over empty abstractions
- avoid inventing new stack decisions
- avoid unnecessary rewrites
- keep docs aligned with implementation
- keep code clean and naming explicit
- minimize comments
- maintain correct runtime/output separation

---

## 30. Final acceptance criteria

The project is acceptable only if all of the following are true by the appropriate phase progression:

- coherent pnpm + Nx monorepo
- strict TypeScript strategy by runtime context
- source/runtime separation respected
- runtime resources emitted under `../resources/[trp-framework]/`
- no ghost resources
- exactly one valid `fxmanifest.lua` per emitted resource
- generated manifests reference real files
- Zod 4 is the only validation system
- PostgreSQL + Drizzle foundation exists
- Redis + BullMQ foundation exists
- JSONC configuration exists as primary framework config
- `jsonc-parser` is used for JSONC parsing/manipulation
- ESLint, Prettier, and tsconfig strategy are rooted centrally
- kernel/core foundation exists
- first domain modules exist
- cross-resource communication pattern exists
- NUI foundation exists later in the correct phase
- compatibility direction exists later in the correct phase
- Docker/Compose support exists
- CI/CD support exists
- upgrade strategy is documented
- public vs internal API boundaries remain clear
- code quality remains aligned with clean-code and minimal-comment rules

---

## 31. Related documents

This file is the primary operational specification.

Higher-level gameplay/system design that should not automatically be implemented in early architecture phases should live in separate documents such as:

- `GAME_DESIGN_SPEC.md`
