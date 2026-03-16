# Resources Source

This directory (`resources-src/`) contains the **source code** for real FiveM resources (core runtime, gameplay modules, compatibility layers, NUI).

## Rules

- Everything here must eventually be compiled.
- Source files here MUST NOT be used directly as runtime resources by a FiveM server.
- A build process parses directories, bundles code with `esbuild`, copies static assets, generates `fxmanifest.lua`, and emits everything to `../../resources/[typerp]/<resource-name>`.

Do not manually place `fxmanifest.lua` here. Manifests are created by the `build:runtime` script through configuration metadata or file inspection.
