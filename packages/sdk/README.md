# TypeRP Framework - SDK

This package provides the **public SDK integration helpers** for developers building modules and
plugins for the TypeRP Framework.

It exposes core functions like `createModule()` and module lifecycle interfaces. Code in this
package establishes a stable interface boundary for server owners.

Current runtime helpers include:

- `loadResourceConfig()` for typed config loading through the shared config package
- `getGlobalConfig()` and `callRpc()` for framework-wide access patterns, including kernel-owned
  DB-backed procedures

**Rules for this package:**

- Keep side-effects to an absolute minimum.
- Expose clear, typed boundaries.
- Adhere strictly to Zod 4 specifications for schema parsing.
