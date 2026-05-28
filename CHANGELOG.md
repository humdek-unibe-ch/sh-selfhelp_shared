# Changelog

All notable changes to `@selfhelp/shared` will be documented in this file.

This project follows semantic versioning.

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
