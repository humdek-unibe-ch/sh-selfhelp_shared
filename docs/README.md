<!--
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
-->

# @selfhelp/shared Documentation

Audience: Developers consuming or maintaining the shared package.
Status: active.
Applies to: `@selfhelp/shared` (SelfHelp2 shared TypeScript package).
Last verified: 2026-06-03.
Source of truth: `src/`, `package.json` exports, `tsup` build config, `vitest.config.ts`, and `scripts/`.

Navigation entrypoint for the shared-package docs, organized by audience and purpose per the Documentation Rules in `AGENTS.md`. The root [../README.md](../README.md) is the short overview; detailed material lives here.

## Start here

| Need | Read |
| --- | --- |
| Public exports, types, and contracts | [reference/exports.md](reference/exports.md) |
| Release and versioning workflow | [developer/release-and-versioning.md](developer/release-and-versioning.md) |
| Testing and the coverage gate | [developer/testing.md](developer/testing.md) |
| Adding a new style / extending the package | [developer/extending.md](developer/extending.md) |

## Documentation map

| Folder | Use for |
| --- | --- |
| [reference/](reference/index.md) | The public API surface: root and subpath exports, the `src/` folder guide, and the type/contract catalog. |
| [developer/](developer/index.md) | Maintainer workflow: building, testing, the coverage gate, release/versioning, SPDX headers, and extending the package. |

## Conventions

- Every active doc starts with the metadata block (`Audience`, `Status`, `Applies to`, `Last verified`, `Source of truth`).
- Filenames use lowercase kebab-case; this file (`README.md`) is the only uppercase docs entrypoint, and subfolder indexes are `index.md`.
- `src/`, `package.json`, and the build/test config are the source of truth. When a doc conflicts with the code, the code wins and the doc is corrected.
