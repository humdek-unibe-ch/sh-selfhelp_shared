# Public Exports and Contracts

Audience: Developers consuming the shared package.
Status: active.
Applies to: `@selfhelp/shared`.
Last verified: 2026-06-03.
Source of truth: `package.json` `exports`, `src/index.ts`, and the modules under `src/`.

`@selfhelp/shared` is the single source of truth shared by `sh-selfhelp_frontend` and `sh-selfhelp_mobile` for CMS/page/style types, API contracts, theme tokens, and small runtime helpers that mirror backend behavior.

## Entry points

The package exposes one root export plus typed subpath exports (from `package.json`):

| Import specifier | Provides |
| --- | --- |
| `@selfhelp/shared` | Aggregated root surface (re-exports every module below). |
| `@selfhelp/shared/registry` | The typed `STYLE_REGISTRY`. |
| `@selfhelp/shared/theme` | Theme token tables. |
| `@selfhelp/shared/tailwind` | Tailwind preset export. |
| `@selfhelp/shared/plugin-sdk` | Plugin runtime-shim specifier contract. |
| `@selfhelp/shared/testing` | Shared test helpers. |

The root export (`src/index.ts`) re-exports: `types`, `registry`, `api`, `theme`, `interpolation`, `condition`, `cms-classes`, `assets`, and `utils`.

## Source folder guide

| Path | Purpose |
| --- | --- |
| `src/types/styles/` | Per-style interfaces (layout, typography, interactive, form, auth, media). |
| `src/types/pages.ts` | CMS page structures such as `IPageContent`, `IPageItem`, and section field models. |
| `src/types/auth.ts` | User/auth payloads such as `IUserDataResponse`, `IJwtPayload`, and permission constants. |
| `src/types/api/` | Request/response DTOs and envelope types for auth, pages, forms, and language endpoints. |
| `src/types/mantine/` | Shared semantic size, radius, spacing, and color type definitions. |
| `src/registry/` | Typed style registry (`styles.registry.ts`) mapping `style_name` to schema metadata. |
| `src/api/` | Frontend-facing `/cms-api/v1/*` endpoint catalog. |
| `src/theme/` | Theme token tables and the Tailwind preset used by both apps. |
| `src/interpolation/` | `replaceCalcedValues()` placeholder replacement for CMS text. |
| `src/condition/` | JSON-Logic condition evaluator mirroring backend condition handling. |
| `src/cms-classes/` | Tailwind class allow-list, remap table, and classifier. |
| `src/assets/` | `resolveAssetUrl()` for absolute and relative asset paths. |
| `src/utils/` | Shared helpers such as spacing parsing and page-data transformation. |
| `src/plugin-sdk/` | Plugin runtime-shim specifier contract. |
| `src/testing/` | Shared test helpers. |

## Usage examples

Root imports:

```ts
import {
  ENDPOINTS,
  PERMISSIONS,
  replaceCalcedValues,
  resolveAssetUrl,
  transformPageData,
} from '@selfhelp/shared';

import type { IPageContent, IUserDataResponse } from '@selfhelp/shared';
```

Subpath imports:

```ts
import { STYLE_REGISTRY } from '@selfhelp/shared/registry';
import { THEME_TOKENS } from '@selfhelp/shared/theme';
import tailwindPreset from '@selfhelp/shared/tailwind';
```

## Plugin runtime-shim contract

Plugin builds and the host frontend share one list of bare specifiers that resolve through the host's runtime-shim BFF route. Read the contract from `@selfhelp/shared/plugin-sdk` instead of duplicating the list in plugin `vite.config.ts` files or the host `runtime-globals.ts`:

```ts
import {
  PLUGIN_RUNTIME_SHIM_SPECIFIERS,
  PLUGIN_RUNTIME_IMPORT_MAP,
  buildPluginRuntimeShimPath,
} from '@selfhelp/shared/plugin-sdk';
```

This contract guarantees `react`, `@mantine/core`, `@tanstack/react-query`, and `@selfhelp/shared` (plus their documented subpaths) stay single-instance across the host shell and every loaded plugin.
