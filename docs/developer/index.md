# @selfhelp/shared Developer Documentation

Audience: Maintainers of the shared package.
Status: active.
Applies to: `@selfhelp/shared`.
Last verified: 2026-06-03.
Source of truth: `package.json` scripts, `tsup` build config, `vitest.config.ts`, `scripts/`, and `src/`.

Maintainer workflow for the shared package. See [../README.md](../README.md) for the docs map and [../reference/exports.md](../reference/exports.md) for the public surface.

- [release-and-versioning.md](release-and-versioning.md) - Building, publishing, the versioning policy, and SPDX headers.
- [testing.md](testing.md) - Test commands, the blocking coverage gate, and schema parity.
- [extending.md](extending.md) - Adding a new style and extending the public surface.

## Build

```bash
cd sh-selfhelp_shared
npm install
npm run build
```

`npm run build` runs `tsup` over the six entry points (root, `registry`, `theme`, `theme/tailwind`, `plugin-sdk`, `testing`) emitting CJS + ESM + type declarations into `dist/`. `npm run dev` runs the same build in watch mode.
