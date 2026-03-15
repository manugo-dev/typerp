# FiveM Runtime Model

## Source vs Runtime

The physical structure is isolated to avoid accidentally serving development files.

```txt
server-data/
  resources/
    [trp-framework]/
      ...compiled runtime resources...
  trp-framework/
    ...source monorepo...
```

The monorepo source directory (`server-data/trp-framework/`) must **never** be interpreted or treated as a FiveM resource.
The FiveM server must only consume what is emitted into: `../resources/[trp-framework]/`

## Execution Output Contract

Runtime resources emitted by TRP Framework must generally have exactly one `fxmanifest.lua` at their root.
Default rules:

- `fx_version 'cerulean'`
- `game 'gta5'`

All JavaScript running on the server requires `node_version '22'` to be automatically added to the manifest.

## Game Design Spec

The `GAME_DESIGN_SPEC.md` file contains future gameplay/system design context and is not wholly implemented in the foundational phase. The architecture remains extensible enough to sustain its vision (for example multicharacter identity, systemic evidence, and territorial control).

Kernel ownership rule:

- `@trp/core-kernel` owns DB/Redis/BullMQ initialization.
- Gameplay resources should not initialize those infrastructure clients directly.
- Stateful cross-resource capabilities are consumed through runtime exports/public APIs.
