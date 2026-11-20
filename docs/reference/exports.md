# Public Exports and Contracts

Audience: Developers consuming the shared package.
Status: active.
Applies to: `@selfhelp/shared` 1.28.0.
Last verified: 2026-11-20.
Source of truth: `package.json` `exports`, `src/index.ts`, and the modules under `src/`.

`@selfhelp/shared` is the single source of truth shared by `sh-selfhelp_frontend` and `sh-selfhelp_mobile` for CMS/page/style types, API contracts, theme tokens, and small runtime helpers that mirror backend behavior.

## Entry points

The package exposes one root export plus typed subpath exports (from `package.json`):

| Import specifier | Provides |
| --- | --- |
| `@selfhelp/shared` | Aggregated root surface (re-exports every module below). |
| `@selfhelp/shared/registry` | The typed `STYLE_REGISTRY` and `FORM_SECTION_STYLE_NAMES`. |
| `@selfhelp/shared/theme` | Theme token tables. |
| `@selfhelp/shared/tailwind` | Tailwind preset export. |
| `@selfhelp/shared/plugin-sdk` | Plugin runtime-shim specifier contract. |
| `@selfhelp/shared/testing` | Shared test helpers. |

The root export (`src/index.ts`) re-exports: `types`, `registry`, `api`, `theme`, `interpolation`, `condition`, `cms-classes`, `assets`, `content`, `navigation`, `sync`, and `utils`.

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
| `src/sync/` | Live-sync contract: change message, tags, page `sync` block, page lock status, helpers (see "Live sync"). |
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
import { FORM_SECTION_STYLE_NAMES, STYLE_REGISTRY } from '@selfhelp/shared/registry';
import { THEME_TOKENS } from '@selfhelp/shared/theme';
import tailwindPreset from '@selfhelp/shared/tailwind';
```

`FORM_SECTION_STYLE_NAMES` is the closed list of styles that act as a form
(`form-record`, `form-log`, `entry-record-form`, `entry-form-list`). The CMS
add-section dialog hides them when the parent is an `entry-form-list` (the list
is already the form). The same constant is available from the package root.

## Entry lists and data views

An `entry-form-list` **is** the form: it carries the form fields (`name`,
submit labels, alerts, button knobs) and its input children are the form body.
`list.form_section_id` is the list's own section id when it owns its table, and
`null` when `data_table` names another table (read-only override: delete and
quick actions only) or for a `data-view`. Nested form styles below a list are
refused by the backend.

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

## Live sync

`src/sync/` is the typed contract of live sync (task `2026-11-20-live-sync-and-edit-lock`). The
backend publishes a Mercure event `changed` with `{ "v": 1, "tags": [...] }`; a message carries names
and ids, never content. Each page payload carries `sync: { depends_on, valid_until }`, so a client
refetches only the pages whose `depends_on` names a tag of the message.

```ts
import { parseSyncMessageJson, pageDependsOn, syncRefetchDelayMs } from '@selfhelp/shared';

const message = parseSyncMessageJson(event.data); // null for a higher version or no known tag
if (message && pageDependsOn(page.sync, message.tags)) {
  setTimeout(refetchPage, syncRefetchDelayMs('changed')); // random 0 to 300 ms
}
```

- `acl` and `navigation` never match `depends_on`: they refresh every page and the navigation.
- Tags: `acl`, `navigation`, `global_values`, `page:<id>`, `page_draft:<id>`, `page_lock:<id>`,
  `table:<id>`, `section:<id>`, `asset:<id>`. Unknown tags are dropped by `parseSyncMessage`.
- Headers: `HEADER_ACL_STAMP` (`X-Acl-Stamp`, response, compare with `IUserData.acl_stamp`),
  `HEADER_PAGE_VIEW` (`X-Page-View: 1`, request, one per visit), `HEADER_PAGE_VERSION`
  (`X-Page-Version`, request and response of page draft writes).
- Page edit lock: `ENDPOINTS.ADMIN_PAGE_LOCK.LOCK(pageId)` (GET status, POST acquire, DELETE release)
  and `.TAKE_OVER(pageId)` (POST); every route answers `IPageLockStatus`. Refusals use
  `PAGE_VERSION_REQUIRED_ERROR`, `STALE_PAGE_VERSION_ERROR` and `PAGE_LOCKED_ERROR`.
- `IAuthEventsBootstrap` is the data of `GET /auth/events`; `syncTopics` lists the topics to
  subscribe to, and the user topics are `null` for a guest.

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
