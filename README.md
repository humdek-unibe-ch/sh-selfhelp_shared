# @selfhelp/shared

`@selfhelp/shared` is the shared TypeScript foundation for the SelfHelp ecosystem.
It provides the common contracts, registries, theme tokens, and small runtime helpers
that keep the web frontend and mobile app aligned.

This package exists so both clients can depend on one source of truth for:

- CMS-driven page and style types
- API request and response contracts
- shared theme tokens and Tailwind preset values
- condition and interpolation helpers that mirror backend behavior
- CMS class allow-listing and asset URL utilities

It is used by:

- `sh-selfhelp_frontend`
- `sh-selfhelp_mobile`

## Why this library exists

Without a shared package, the web and mobile apps would each need to duplicate
critical domain knowledge such as page schemas, auth payloads, style definitions,
and runtime formatting rules. That tends to drift over time.

`@selfhelp/shared` keeps those definitions in one place so both apps can:

- compile against the same TypeScript interfaces
- render CMS content with the same structural assumptions
- use the same naming and registry model for styles
- share stable helper logic for interpolation, conditions, spacing, and assets

## What is in this library

### Core exports

The root package export re-exports the main public API:

- `types`: page content, style contracts, auth models, API DTOs, shared Mantine-like scalar types
- `registry`: the typed `STYLE_REGISTRY`
- `api`: CMS endpoint constants
- `theme`: token tables used across clients
- `interpolation`: text replacement helpers
- `condition`: JSON-Logic condition evaluation
- `cms-classes`: allow-listing, remapping, and classification helpers
- `assets`: asset URL normalization helpers
- `utils`: shared parsing and page transformation helpers

### Folder guide

| Folder | Purpose |
| --- | --- |
| `src/types/styles` | Per-style interfaces such as layout, typography, interactive, form, auth, and media styles. |
| `src/types/pages` | CMS page structures like `IPageContent`, `IPageItem`, and section field models. |
| `src/types/auth` | User/auth payloads such as `IUserDataResponse`, `IJwtPayload`, and permission constants. |
| `src/types/api` | Request/response DTOs and envelope types for auth, pages, forms, and language endpoints. |
| `src/types/mantine` | Shared semantic size, radius, spacing, and color-related type definitions. |
| `src/registry` | Typed style registry mapping `style_name` to schema metadata. |
| `src/api` | Frontend-facing `/cms-api/v1/*` endpoint catalog. |
| `src/theme` | Theme token tables and Tailwind preset exports used by both apps. |
| `src/interpolation` | `replaceCalcedValues()` placeholder replacement logic for CMS text. |
| `src/condition` | Condition evaluator that mirrors backend condition handling. |
| `src/cms-classes` | Tailwind class allow-list, remap table, and class classification logic. |
| `src/assets` | `resolveAssetUrl()` helper for absolute and relative asset paths. |
| `src/utils` | Shared helpers such as spacing parsing and page-data transformation. |

## Main capabilities

### Typed style registry

The library centralizes style definitions used by CMS-driven rendering. This makes
style handling explicit and compile-time checked instead of scattered across apps.

```ts
import { STYLE_REGISTRY } from '@selfhelp/shared/registry';
```

### Shared page and API contracts

All consumers can use the same TypeScript definitions for pages, forms, auth, and
language payloads.

```ts
import type { IPageContent, IUserDataResponse } from '@selfhelp/shared';
```

### Shared theme surface

The package exposes a common theme layer so web and mobile can stay visually aligned.

```ts
import { THEME_TOKENS } from '@selfhelp/shared/theme';
import tailwindPreset from '@selfhelp/shared/tailwind';
```

### Runtime helpers

The package includes a few focused runtime helpers that mirror backend behavior and
reduce duplicated edge-case handling in clients.

```ts
import {
  evaluateCondition,
  replaceCalcedValues,
  resolveAssetUrl,
  parseSpacing,
} from '@selfhelp/shared';
```

## Installation

Install from npm:

```bash
npm install @selfhelp/shared
```

Install a specific version:

```bash
npm install @selfhelp/shared@1.0.0
```

For local development with sibling repositories, you can still use a file dependency:

```json
{
  "dependencies": {
    "@selfhelp/shared": "file:../sh-selfhelp_shared"
  }
}
```

## Usage examples

### Import from the root package

```ts
import {
  ENDPOINTS,
  PERMISSIONS,
  replaceCalcedValues,
  resolveAssetUrl,
  transformPageData,
} from '@selfhelp/shared';
```

### Import typed registries or theme subpaths

```ts
import { STYLE_REGISTRY } from '@selfhelp/shared/registry';
import { THEME_TOKENS } from '@selfhelp/shared/theme';
import tailwindPreset from '@selfhelp/shared/tailwind';
```

### Consume the plugin runtime-shim contract

Plugin builds and the host frontend share a single list of bare
specifiers that resolve through the host's runtime-shim BFF route.
Read the contract from `@selfhelp/shared/plugin-sdk` instead of
duplicating the list in plugin `vite.config.ts` files or in the host
`runtime-globals.ts`:

```ts
import {
  PLUGIN_RUNTIME_SHIM_SPECIFIERS,
  PLUGIN_RUNTIME_IMPORT_MAP,
  buildPluginRuntimeShimPath,
} from '@selfhelp/shared/plugin-sdk';
```

The contract is what guarantees `react`, `@mantine/core`,
`@tanstack/react-query`, and `@selfhelp/shared` (plus their
documented subpaths) stay single-instance across the host shell and
every loaded plugin.

### Build the package locally

```bash
cd sh-selfhelp_shared
npm install
npm run build
```

## Publish and release

Before the first publish:

```bash
cd sh-selfhelp_shared
npm install
npm login
```

Publish a new version:

```bash
npm version patch
npm publish
```

For the first stable release, publish `1.0.0`:

```bash
npm version 1.0.0
npm publish
```

Useful checks before publishing:

```bash
npm run typecheck
npm run build
npm pack --dry-run
```

Notes:

- `prepublishOnly` runs `npm run build` automatically during `npm publish`.
- The package is configured for public npm publication through `publishConfig.access`.
- Release notes for the stable launch live in [CHANGELOG.md](CHANGELOG.md).

## First stable release

Version `1.0.0` marks the first stable public release of `@selfhelp/shared`.

At this point the package provides:

- a stable shared type surface for page content, styles, auth, and API models
- a typed style registry for CMS-rendered components
- reusable theme token exports and Tailwind preset support
- shared helpers for interpolation, conditions, class mapping, assets, and spacing
- a publishable npm package that can be reused outside the local monorepo workflow

See [CHANGELOG.md](CHANGELOG.md) for the `1.0.0` release notes.

## Extending the library

### Adding a new style

1. Add the per-style interface in `src/types/styles/<group>.ts`.
2. Add the style entry to `src/registry/styles.registry.ts`.
3. Re-export the new public surface from `src/index.ts` if needed.
4. Run `npm run build`.
5. Update both consumers so the new style has a real implementation.

The registry is intentionally strict: TypeScript should help catch missing wiring
when a new style is introduced.

## Versioning policy

This package follows semantic versioning:

- `major`: breaking type or runtime changes
- `minor`: backward-compatible new exports, styles, helpers, or fields
- `patch`: fixes, clarifications, or non-breaking internal improvements

## License

Licensed under the [Mozilla Public License 2.0](LICENSE). Copyright (c) 2026
Humdek, University of Bern.

### SPDX headers

Every TS/JS source file should carry a two-line SPDX header:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */
```

The header text lives in [header.txt](header.txt). Header insertion, verification,
and removal are automated with
[`license-check-and-add`](https://www.npmjs.com/package/license-check-and-add)
using [license-check-and-add-config.json](license-check-and-add-config.json).

```bash
npm install
npm run headers:add
npm run headers:check
npm run headers:remove
```

The tool reads `.gitignore`, so `node_modules/`, `dist/`, and other ignored paths
are skipped automatically.
