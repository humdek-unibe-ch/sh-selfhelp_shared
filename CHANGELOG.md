<!--
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
-->

# Changelog

All notable changes to `@selfhelp/shared` will be documented in this file.

This project follows semantic versioning.

## [1.2.3] - 2026-06-04

### Added

- Registration-lifecycle CMS label fields on the auth styles so the
  previously hardcoded frontend UI text becomes admin-managed. All are
  optional `IContentField<string>` (additive, no consumer break):
  `IRegisterStyle` gains `label_code`, `code_placeholder`,
  `label_go_home`, `label_go_to_login`; `ILoginStyle` gains
  `label_register`; `IValidateStyle` gains the activation status text
  `loading_title`, `loading_text`, `error_title`, `error_heading`,
  `error_text`, `success_title`, and `redirect_text` (use `{seconds}`
  as the countdown placeholder). Defaults + en-GB/de-CH translations are
  seeded backend-side by `Version20260604111011`.
- Blocking Vitest coverage gate (ecosystem testing strategy, Slice 10).
  Added `@vitest/coverage-istanbul`, a `vitest.config.ts` with a coverage
  threshold (>= 60% lines/functions/statements/branches) scoped to the
  framework-free runtime-helper bundle (interpolation, condition,
  asset-URL, CMS-class classifier, page transform), and a `test:coverage`
  script. `shared-tests.yml` now runs `npm run test:coverage`, so a
  coverage regression on those shared contracts fails CI (currently ~97%
  lines). Implements canonical Testing Rule 20 (warning -> blocking). The
  istanbul provider is used instead of v8 because v8 double-counts files on
  Windows (phantom 0% entries) and would fail the gate locally.
- New public subpath export `@selfhelp/shared/testing` — the plugin
  certification kit (`CERTIFICATION_KIT_VERSION` `1.0.0`).
  `definePluginCertification(config).run(manifest)` now performs the real
  **static manifest certification** and returns a typed
  `IPluginCertificationReport`: ordered checks `manifest-valid`,
  `capabilities-vs-trust-level`, `compatibility-shape`,
  `lookup-ownership`, `db-naming` (also exported individually as
  `checkManifestValid`, `checkCapabilitiesVsTrustLevel`,
  `checkCompatibilityShape`, `checkLookupOwnership`, `checkDbNaming`, and
  `runCertificationChecks`). Built on the existing plugin SDK
  (`IPluginManifest` + semver helpers) so manifest typing/range parsing is
  not re-implemented. Runtime install/lifecycle remains the backend host
  certification's responsibility — the kit gates the manifest before
  publishing; the host gates the actual install. Also ships the
  fully-working in-memory `mockMercureHub` (Mercure recorder, no polling)
  and `seedFromLockFile`.
- `IPluginManifestDataAccess` now mirrors the manifest schema's
  `ownedTables` and `ownedDataTablePrefix` fields (previously only
  `read`/`write`/`delete` were typed), so the `db-naming` certification
  check is fully typed against the real manifest.
- Vitest unit tests for the runtime helpers (`replaceCalcedValues`,
  `evaluateCondition`/`buildConditionContext`, `resolveAssetUrl`/
  `resolveAssetSources`, `classifyClass`/`classifyClassString`,
  `transformPageData`/`transformPagesData`) and the testing kit.

### Changed

- `scripts/check-schema-parity.mjs` now also checks API response
  contracts (`config/schemas/api/v1`: response envelope, auth login,
  form submit) against the shared TS types, not only the plugin SDK
  schemas. The form-submit data shape is flagged as a tracked
  `knownDrift` warning pending cross-repo reconciliation
  (`submitted_at` / `user_authenticated` are in the backend schema but
  not in `IFormSubmitData`).

## [1.2.1] - 2026-05-28

### Fixed

- `IPluginRegistry` in `@selfhelp/shared/plugin-sdk` is now back in
  sync with the canonical `plugin-registry.schema.json` shipped by
  `sh-selfhelp_backend`. The root version field is the schema's
  `schemaVersion: '1.0'` again (the `registryVersion: number` rename
  introduced in `1.0.4` mis-described the wire format). Added the two
  other canonical root fields, `baseUrl` and `publisher`, as optional
  so the type matches what `scripts/publish-to-registry.mjs` actually
  emits. The pre-existing `name` / `homepage` / `trustKey` /
  `channels` properties are kept as optional legacy helpers and
  flagged in the JSDoc as not part of the canonical schema; they will
  be removed in the next major release once the deeper drift in
  `IPluginRegistryEntry` / `IPluginRegistryVersionEntry` is rewritten
  to match the canonical schema.
- `npm run check:schemas` is green again — previously failed because
  `schemaVersion` was missing from the TS mirror after the `1.0.4`
  rename.

### Migration notes

```ts
// before (1.2.0, broken)
const registry: IPluginRegistry = {
    registryVersion: 1,
    name: 'my-registry',
    plugins: [],
};

// after (1.2.1, matches plugin-registry.schema.json)
const registry: IPluginRegistry = {
    schemaVersion: '1.0',
    publisher: { name: 'my-registry' },
    plugins: [],
};
```

No runtime/installation behaviour changed — this only corrects the
shape of the published TS contract that plugin authors compile
against. The backend's `RegistryClient` already reads the canonical
wire format, so installed registries keep working.

## [1.2.0] - 2026-05-28

### Added

- Canonical plugin runtime-shim contract exported from
  `@selfhelp/shared/plugin-sdk`. This is the single source of truth
  every consumer (host import map, host `globalThis` stash, host
  `/api/plugins/runtime-shim/*` BFF route, plugin Vite build, plugin
  dev-runtime server) now reads from, so the three pieces cannot
  drift apart again:
  - `PLUGIN_RUNTIME_SHIM_SPECIFIERS` — readonly list of every bare
    specifier the host shims to plugins. Includes the previously
    missing `react/jsx-dev-runtime` (needed by Vite's React plugin in
    dev mode) and `@mantine/notifications` (consumed by plugins that
    show toast notifications), so dev-server bundles can resolve them
    instead of bundling a second copy of React or Mantine.
  - `PLUGIN_RUNTIME_SHIM_BASE_PATH` — `/api/plugins/runtime-shim/`
    constant; the host frontend owns this route.
  - `PLUGIN_RUNTIME_GLOBAL_KEY` — `__SELFHELP_RUNTIME__` constant.
  - `PLUGIN_RUNTIME_IMPORT_MAP` — frozen `Record` derived from the
    specifier list, ready to be `JSON.stringify`ed into the host's
    `<script type="importmap">` tag.
  - `buildPluginRuntimeShimPath(specifier)` — string builder for a
    single specifier.
  - `isPluginRuntimeShimSpecifier(value)` — runtime type guard.
  - `TPluginRuntimeShimSpecifier` — string-literal type union of the
    supported specifiers.
- The plugin SDK contract version bumps from `1.1` to `1.2` to
  reflect the additive surface. Hosts on SDK `1.2+` still accept
  plugins declaring `pluginApiVersion: "1.1"`, so existing plugins
  remain compatible.

### Changed

- `PLUGIN_API_VERSION` constant: `1.1` → `1.2`. No behavioural
  change for plugins that do not consume the runtime-shim contract
  directly; this only signals which optional SDK surface the host
  exposes.

## [1.1.0] - 2026-05-25

### Added

- Plugin SDK field-renderer contracts:
  `IFieldRendererDefinition`, `IPluginFieldRendererProps`, and
  `fieldRenderers` on `IPluginRegistration`, so plugins can contribute
  custom CMS section-field editor controls for plugin-owned field types.

### Changed

- Bumped `PLUGIN_API_VERSION` from `1.0` to `1.1` to reflect the new
  additive plugin SDK surface.
- Re-exported the new field-renderer types from `@selfhelp/shared/plugin-sdk`.

## [1.0.4] - 2026-05-22

### Added

- New `plugin-sdk` surface for the SelfHelp plugin ecosystem:
  - `definePlugin()` / `defineMobilePlugin()` helpers for typed plugin
    manifests.
  - `definePluginRealtimeTopic()` topic helpers with template expansion.
  - `usePluginRealtime()` React hook for Mercure topic subscription. The
    hook accepts a `transportFactory` so frontend hosts can inject
    `EventSource` and mobile hosts can inject `react-native-sse` without
    forcing the SDK to depend on either runtime.
- TypeScript mirrors for `IPluginManifest`, `IPluginRegistry`, and
  `IPluginLock` plus the `scripts/check-schema-parity.mjs` script that
  verifies the JSON schemas stay in lockstep with the TS types.
- React is now declared as an **optional peer dependency**
  (`react ^18 || ^19`). Non-React consumers can keep using the package
  without installing React; the `usePluginRealtime` hook is only required
  if you opt into realtime updates.

### Changed (breaking type contracts)

These changes broaden the schema-mirroring types so they actually match
the canonical JSON Schemas the backend publishes. Plugin authors
upgrading from `1.0.3` need to update any code that constructed these
shapes literally:

- `IPluginRegistry`
  - Renamed `schemaVersion` (string `'1.0'`) to **`registryVersion`**
    (`number`, currently `1`).
  - Added required field `name: string`.
  - Added optional `homepage`, `publishedAt`, `trustKey`, and `channels`
    fields to align with `plugin-registry.schema.json`.
- `IPluginLock`
  - Added required field **`lockfileVersion: number`** (currently `1`).
  - Added required nested object **`sdk: { version: string; pluginApiVersion: string }`**
    so lockfiles always advertise which SDK version they were generated
    against.
  - `plugins` is now `Record<string, IPluginLockEntry>` instead of an
    array — keyed by plugin id, which matches the schema and removes
    the need for clients to do an extra lookup.
  - `installMode` is now optional at the top level (per-entry
    `installMode` already exists inside each plugin entry).
- `IPluginManifest`
  - `dataAccess` gained `ownedTables: string[]` and
    `ownedDataTablePrefix?: string` so plugins can declare their owned
    tables for the install-time validator and the purger.

### Migration notes for plugin authors

```ts
// before (1.0.3)
const registry: IPluginRegistry = {
    schemaVersion: '1.0',
    plugins: [],
};

// after (1.0.4)
const registry: IPluginRegistry = {
    registryVersion: 1,
    name: 'my-registry',
    plugins: [],
};
```

```ts
// before (1.0.3)
const lock: IPluginLock = {
    generatedAt: '...',
    plugins: [],
    installMode: 'managed',
};

// after (1.0.4)
const lock: IPluginLock = {
    lockfileVersion: 1,
    generatedAt: '...',
    sdk: { version: '1.0.4', pluginApiVersion: '1.0' },
    plugins: {},
};
```

Run `npm run check:schemas` (from `sh-selfhelp_shared`) to verify your
TypeScript matches the canonical JSON schemas after the upgrade.

## [1.0.3] - 2026-05-19

 - Adjust types after the DB refactoring

## [1.0.0] - 2026-05-08

First stable release of `@selfhelp/shared`.

### Added

- Shared TypeScript contracts for pages, styles, auth models, and API payloads.
- A typed `STYLE_REGISTRY` for CMS-driven rendering.
- Common theme token exports and a shared Tailwind preset surface.
- Runtime helpers for:
  - interpolation via `replaceCalcedValues()`
  - condition evaluation via `evaluateCondition()`
  - asset URL normalization via `resolveAssetUrl()`
  - spacing parsing and page-data transformation utilities
- CMS class allow-listing, remapping, and classification helpers.
- Public npm packaging setup for reuse across multiple projects.

### Included in this release

- Root package exports for the main shared API.
- Subpath exports for:
  - `@selfhelp/shared/registry`
  - `@selfhelp/shared/theme`
  - `@selfhelp/shared/tailwind`
- Generated CJS, ESM, and TypeScript declaration output in `dist/`.
- README publishing instructions and package documentation.

### Purpose of the 1.0.0 release

This release establishes `@selfhelp/shared` as the source of truth for shared
frontend and mobile contracts in the SelfHelp ecosystem. The goal of `1.0.0` is
to provide a stable base that other applications can install, build against, and
upgrade using normal npm versioning.
