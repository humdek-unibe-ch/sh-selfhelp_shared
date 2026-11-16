# Public Exports and Contracts

Audience: Developers consuming the shared package.
Status: active.
Applies to: `@selfhelp/shared`.
Last verified: 2026-11-13.
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

The root export (`src/index.ts`) re-exports: `types`, `registry`, `api`, `theme`, `interpolation`, `condition`, `cms-classes`, `assets`, `content`, `navigation`, and `utils`.

## Source folder guide

| Path | Purpose |
| --- | --- |
| `src/types/styles/` | Per-style interfaces (layout, typography, interactive, form, auth, media). |
| `src/types/pages.ts` | CMS page structures such as `IPageContent`, `IPageItem`, and section field models. |
| `src/types/auth.ts` | User/auth payloads such as `IUserDataResponse`, `IJwtPayload`, and permission constants. |
| `src/types/api/` | Request/response DTOs and envelope types for auth, pages, forms, lists (`form-lists.ts`), and language endpoints. |
| `src/content/` | Content helpers both clients share: inline formatting, option labels, form-record prefill, and the URL state of entry lists (`formListState.ts`). |
| `src/types/mantine/` | Shared semantic size, radius, spacing, and color type definitions. |
| `src/registry/` | Typed style registry (`styles.registry.ts`) mapping `style_name` to schema metadata. |
| `src/api/` | Frontend-facing `/cms-api/v1/*` endpoint catalog, and the readers of the structured form and list refusals (`formListErrors.ts`: stale version, blocked restore, invalid form data, any refusal by `data.reason`). |
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

## Entry lists and data views

The `entry-form-list` and `data-view` styles render a list the **server** prepared
for the current visitor and URL: the page payload carries `list_state` (or
`list_error`) on the section, and `ENDPOINTS.LISTS.STATE(sectionId)` serves the same
state for the interactions after the first paint. Clients draw it and never
evaluate access, conditions or filters themselves. Writes keep using
`ENDPOINTS.FORMS` (create, update, delete) with the record `version` as
`expected_version`; a stale write answers 409 with `IFormStaleVersionData` and
writes nothing.

A `data-view` with the layout `custom` draws every record with the sections its
author placed inside it: the server renders that template once per record into
`IFormListRow.sections` (`TStyle[]`) and `IFormListInfo.row_css` holds the classes
of the element around the records (web only). Render the sections like any other
sections; when `IFormListInfo.has_template` is false, draw cards.

```ts
import {
  applyFormListUrlChange,
  emptyFormListUrlState,
  formListQueryString,
  parseFormListQuery,
  pickFormListQuery,
} from '@selfhelp/shared';

// The visitor's URL state of the list "tasks", refused early when it is malformed.
const parsed = parseFormListQuery(window.location.search, 'tasks', {
  sortable: ['title', 'entry_date'],
  controls: ['state'],
});

// A link to page 2 that keeps the language, other lists and any other parameter.
const next = formListQueryString(
  window.location.search,
  'tasks',
  applyFormListUrlChange(parsed.ok ? parsed.state : emptyFormListUrlState(), { type: 'page', page: 2 }),
);

// Forward the raw list parameters to the page endpoint so the server renders the lists.
const forwarded = pickFormListQuery(window.location.search);
```

The URL helpers mirror the backend parser rule for rule (strict: unknown, repeated,
array-style and malformed list parameters are refused, not ignored). Cache keys of
list state must include the API base, the account (or guest), the language, the
platform and the declared route of the page (`formListCacheKey`), because the same
URL shows different records to different people and a record template can read
`{{route.record_id}}`. A client repeats the route of the page it shows in the state
request with `formListRouteQuery(page.route_params)` (`route[record_id]=3`); the server
checks it against the routes of that page and does not believe it otherwise.

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
