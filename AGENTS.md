<!--
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
-->

# AGENTS.md

Before returning anything print in chat `❤️AGENTS.md` so that we know the rules are used

## Project Overview

`@selfhelp/shared` is the shared TypeScript package for the SelfHelp ecosystem. It is consumed by the web frontend and mobile app as the source of truth for CMS page contracts, style contracts, API DTOs, endpoint constants, theme tokens, class filtering, condition evaluation, interpolation, assets, and small page transformation helpers.

This repository is not a backend application. It does not contain controllers, entities, repositories, migrations, or server routing. Several types and helpers mirror behavior from the Symfony backend, so backend contracts must be checked before changing public shapes.

## Tech Stack

- TypeScript, strict mode
- Node.js `>=18`
- `tsup` for CJS, ESM, and declaration builds
- `json-logic-js` for condition evaluation
- Vitest is configured but no tests currently exist
- ESLint is listed, but no ESLint v9 config is currently present
- License headers are managed with `license-check-and-add`
- Package output is generated into `dist/`

## Repository Structure

- `src/index.ts`: root public export surface.
- `src/types`: shared types for styles, pages, auth, API DTOs, and Mantine-like scalar values.
- `src/types/styles`: per-style CMS section interfaces grouped by domain.
- `src/registry`: `STYLE_REGISTRY`, registry helpers, and renderer implementation-map types.
- `src/api`: `/cms-api/v1` endpoint constants and client type header constants.
- `src/theme`: Mantine-derived token tables and shared Tailwind/Uniwind preset exports.
- `src/condition`: client-side JSON-Logic condition evaluation mirroring backend `ConditionService`.
- `src/interpolation`: placeholder replacement mirroring backend `PageDb::replace_calced_values()`.
- `src/cms-classes`: mobile `css_mobile` class allow-list, remaps, and classification.
- `src/assets`: CMS asset URL normalization helpers.
- `src/utils`: spacing parsing and backend-to-client page list transformation.
- `dist`: generated build output; do not edit manually.

## Architecture Rules

- Treat source files as shared contracts for multiple consumers.
- Keep backend wire names intact, especially snake_case fields and legacy style names.
- `style_name` is the discriminator for CMS styles.
- Every user-facing style must be represented in both `TStyle` and `STYLE_REGISTRY`.
- `STYLE_REGISTRY` is the runtime style registry; `TStyle` is the compile-time style union.
- Keep root exports and package subpath exports intentional.
- Existing public subpaths are `.`, `./registry`, `./theme`, and `./tailwind`.
- Runtime helpers should stay small and deterministic.
- Prefer mirroring backend behavior over inventing new client behavior.

## Coding Style

- Keep the existing TypeScript style: 4-space indentation, semicolons, single quotes.
- Use `I...` names for interfaces and `T...` names for type aliases.
- Use `IContentField<T>` for CMS field values.
- Use literal `style_name` values in style interfaces.
- Preserve existing style-name formats, including kebab-case names and legacy camelCase names such as `resetPassword`, `twoFactorAuth`, `entryList`, `entryRecord`, and `entryRecordDelete`.
- Use `mantine_...` field names when matching CMS/Mantine-backed fields.
- Use `'0' | '1'` string unions where existing CMS boolean-like fields use strings.
- Keep optional backend fields optional unless the backend guarantees them.
- Add the SPDX header to TS/JS source files in the same format already used in `src`.

## AI Agent Rules

- Inspect existing code, README, package scripts, and source comments before changing behavior.
- Follow existing contracts and backend mirror behavior first.
- Keep changes small and focused.
- Do not rewrite broad parts of the package for style preferences.
- Do not rename public types, fields, endpoints, or style names without documenting consumer impact.
- Do not introduce runtime dependencies without a clear need; the only current runtime dependency is `json-logic-js`.
- Do not edit `dist` manually.
- Update exports when adding public modules.
- Update README/CHANGELOG when public API or package behavior changes.
- Run `npm run typecheck` before finishing changes.
- Add or update tests for runtime helpers when changing behavior.

## Security Rules

- This package defines client-side contracts and helpers; it does not enforce backend security.
- Do not treat `PERMISSIONS` as a security boundary. The full permission authority lives in the backend.
- Do not log or expose `access_token`, `refresh_token`, 2FA codes, validation tokens, or user secrets.
- Keep token fields typed as DTO fields only; token storage belongs to consumers.
- `css_mobile` must pass through the class classifier before use on mobile.
- Do not broaden the mobile class allow-list unless Uniwind/mobile support is confirmed.
- Do not replace JSON-Logic condition evaluation with arbitrary code execution.
- Invalid conditions currently resolve to `visible: false`; preserve that unless backend behavior changes.
- Unknown interpolation placeholders are intentionally left intact.

## API Rules

- API routes use `API_VERSION_PREFIX = '/cms-api/v1'`.
- Add frontend/mobile-consumed endpoints to `src/api/endpoints.ts`.
- Keep admin-only web frontend endpoints out of this shared endpoint catalog unless they become shared.
- Use endpoint helper functions for dynamic paths.
- Encode user-controlled string path segments, as done for page keywords.
- API responses use `IBaseApiResponse<TData>` with `status`, `message`, `error`, optional `error_type`, `logged_in`, `meta`, and `data`.
- API errors use `IApiError`.
- Auth DTOs use backend field names such as `access_token`, `refresh_token`, and `id_users`.
- Form DTOs use `section_id`, optional `page_id`, optional `record_id`, and `form_data`.
- `HEADER_CLIENT_TYPE` and `TClientType` control backend page-access/platform behavior.

## Database Rules

- No database schema, migrations, entities, or repositories live in this package.
- Backend schema changes should be made in the backend repository first.
- After backend contract changes, update the matching shared types here.
- Preserve backend field names in shared DTOs and CMS style contracts.
- Use helpers such as `transformPageData()` only where the package already normalizes backend shapes for consumers.

## Testing Rules

- `npm run typecheck` currently passes and should be run for all changes.
- `npm run test` is configured with Vitest, but currently fails because no tests exist.
- Add Vitest tests for changed runtime helpers such as condition evaluation, interpolation, asset URL handling, class classification, spacing, and page transforms.
- `npm run lint` currently fails until an ESLint v9 flat config is added.
- `npm run headers:check` currently fails on `README.md` and `CHANGELOG.md`; confirm/fix license config before treating it as a required gate.
- Avoid running `npm run build` unless generated `dist` changes are intended.

## Build / Dev Commands

- `npm install`: install dependencies.
- `npm run typecheck`: run TypeScript strict checks.
- `npm run build`: build CJS, ESM, and declaration files into `dist`.
- `npm run dev`: run `tsup` in watch mode.
- `npm run test`: run Vitest.
- `npm run lint`: run ESLint once config is fixed.
- `npm run headers:add`: add SPDX headers.
- `npm run headers:check`: check SPDX headers.
- `npm run headers:remove`: remove SPDX headers.
- `npm pack --dry-run`: inspect npm package contents before publishing.
- `npm version patch` / `npm publish`: release flow described in README.

## Common Tasks

### Add a New Style

1. Add or update the style interface in `src/types/styles/<group>.ts`.
2. Use a literal `style_name` matching the backend/CMS style name.
3. Use `IStyleWithSpacing` only if the style supports spacing fields.
4. Add the interface to the `TStyle` union in `src/types/styles/unknown.ts`.
5. Add the style to `STYLE_REGISTRY` with category, `frontendOnly`, and `canHaveChildren`.
6. Re-export from the relevant index file if a new file/group was added.
7. Update consuming renderers in the web/mobile apps.
8. Run `npm run typecheck`.

### Add an API DTO or Endpoint

1. Add endpoint constants/helpers in `src/api/endpoints.ts`.
2. Add DTO types under `src/types/api`.
3. Use `IBaseApiResponse<T>` for successful response types.
4. Re-export DTOs from `src/types/api/index.ts`.
5. Update README if the endpoint becomes part of the documented public API.

### Add a Helper

1. Place the helper in the closest existing domain folder.
2. Export it from that folder’s `index.ts`.
3. Export it from `src/index.ts` only if it is public package API.
4. Add Vitest coverage for behavior and edge cases.

### Update Theme or Classes

1. Update canonical tokens in `src/theme/tokens.ts`.
2. Update Tailwind/Uniwind preset output in `src/theme/tailwind.ts` when needed.
3. Update mobile allow-list/remaps in `src/cms-classes` only for supported classes.
4. Check downstream web/mobile renderers for required token mapping changes.

### Add a Migration

Do not add migrations here. This package has no database layer. Add backend migrations in the backend repository, then update shared contracts in this package.

## Do Not Do

- Do not invent generic architecture rules that are not present in this repo.
- Do not change public exports casually.
- Do not rename backend wire fields to make them prettier.
- Do not remove legacy style names without coordinating backend and both consumers.
- Do not manually edit generated `dist` files.
- Do not add backend controllers, services, entities, migrations, or secrets.
- Do not broaden mobile class support without checking mobile renderer support.
- Do not rely on client-side permissions for security decisions.
- Do not make `replaceCalcedValues()` render `undefined` for unknown placeholders.
- Do not make condition evaluation throw for invalid CMS condition strings.

## Plugin Ecosystem Rules (shared package side)

This package is the **single contract** between the SelfHelp core and plugins. It exposes both the existing CMS contracts (style registry, types, theme, etc.) and a dedicated plugin SDK consumed by every plugin's frontend and mobile package.

### Multi-Repository AGENTS.md Rule

This project is multi-repository. The AI agent must always obey the `AGENTS.md` of the repository whose files it is editing, regardless of where the agent was started. Plugin-related work also touches the sibling repositories `sh-selfhelp_backend`, `sh-selfhelp_frontend`, `sh-selfhelp_mobile`, and the affected plugin repo under `plugins/<plugin-id>/`. The canonical rule lives at `sh-selfhelp_backend/docs/plugins/multi-repo-agents-md.md`. Use repository-relative paths; never hard-code an absolute path for your local machine.

### Plugin SDK contract (`@selfhelp/shared/plugin-sdk`)

- The plugin SDK lives under `src/plugin-sdk/` and is exposed via the package subpath export `./plugin-sdk`.
- Public surface includes `definePlugin`, `defineMobilePlugin`, `definePluginRealtimeTopic`, `IStyleDefinition`, `IAdminPageDefinition`, `IMenuItemDefinition`, `IPluginApi`, `IPluginRegistration`, `IMobilePluginRegistration`, `IPluginHealthCheck`, `IPluginFeatureFlag`, `IRichTextEditorAdapter`, semver helpers (`assertCmsCompatibility`, `assertPluginApiVersion`), and TypeScript schemas mirroring the JSON Schemas for the plugin manifest, registry, and lock file.
- The SDK has its own `pluginApiVersion` (currently `1.0`) that is independent of this package's npm version. Bumping it follows the host's plugin version semantics: patch = no breaking surface change; minor = additive; major = breaking.

### Open style registry (`STYLE_REGISTRY` + `extendStyleRegistry`)

- `STYLE_REGISTRY` becomes a *closed* `BASE_STYLE_REGISTRY` for core styles plus a runtime `extendStyleRegistry(entries)` mutator used by plugin SDKs to register additional styles at boot.
- `TStyleName` accepts core styles strictly (`keyof typeof BASE_STYLE_REGISTRY`) plus an open `string & {}` for plugin styles so plugin keys do not break the type while keeping autocomplete on core names.
- Adding a plugin style does NOT require editing this package; plugins extend the registry through the SDK.

### Schemas mirror, not duplicate

- The JSON Schemas for `plugin.json`, `registry.json`, and `selfhelp.plugins.lock.json` live in the sibling backend repo at `sh-selfhelp_backend/docs/plugins/` (`plugin-manifest.schema.json`, `plugin-registry.schema.json`, `plugin-lock.schema.json`). The shared package ships TypeScript types derived from those schemas (`IPluginManifest`, `IPluginRegistry`, `IPluginLock`).
- Keep the TypeScript types and JSON Schemas in sync. When the JSON Schema changes, regenerate the TS types (or update them manually) and bump the package minor version.

### Realtime contract

- `usePluginRealtime(pluginId, topic, topicParams)` is exposed by the SDK as a `react` hook (web) and `react-native` hook (mobile). Plugins never talk to Mercure directly.
- Payload typing: plugins declare a TypeScript type per topic; the SDK validates payloads through `definePluginRealtimeTopic({ payloadSchema })` at runtime.

### Lookup-driven enums

Do not invent client-side enum string unions for values that live in the central `lookups` table. The SDK exposes `useLookupGroup(typeCode)` and `getLookupGroupSync(typeCode)` so plugin components branch on lookup codes rather than hardcoded strings.

### Plugin version semantics

The SDK ships helpers that codify the rule:

- **patch** (`1.0.0 → 1.0.1`) — code change without DB change. No migration.
- **minor** (`1.0.x → 1.1.0`) — always carries a DB change.
- **major** (`1.x → 2.0`) — breaking change.

`assertPluginVersionSemantics(prev, next, hasMigration)` is exposed for CI and the host installer.

### Plugin file paths (this repo)

- `src/plugin-sdk/index.ts` and submodules — public SDK.
- `src/registry/styles.registry.ts` — open style registry with `BASE_STYLE_REGISTRY` + `extendStyleRegistry`.
- `src/types/plugin.ts`, `src/types/plugin-lock.ts`, `src/types/plugin-registry.ts` — manifest/lock/registry TS schemas.
- `src/condition`, `src/interpolation` — unchanged; plugins reuse these.

### Do not (plugin layer)

- Do not allow plugin packages to import deep into `src/` paths that are not in the public export map.
- Do not break the SDK without bumping `pluginApiVersion`.
- Do not duplicate JSON Schema definitions in this package; mirror, do not redefine.
- Do not export server-only helpers from the plugin SDK.
