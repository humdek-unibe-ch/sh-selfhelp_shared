<!--
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
-->

# Changelog

All notable changes to `@selfhelp/shared` will be documented in this file.

This project follows semantic versioning.

## v1.12.0

Style-field cleanup slice 1 — the type surface now matches backend migration
`Version20260619090609`. No mapper/registry/runtime code consumed any of these
fields, so this is a type-only change (pre-stable: shipped as a minor).

### Removed

- **`use_web_style` removed from every style interface (RF-01).** The
  Mantine/raw toggle is retired — the web renderer always renders Mantine. The
  optional `use_web_style` field is dropped from all 59 style interfaces across
  `forms`, `interactive`, `composite`, `layout`, `typography`, `media`, and
  `unknown`.
- **`is_log` removed from `IFormStyle` (RF-04/05).** Record vs log is decided by
  the style (`form-record` / `form-log`), never a content field — separate form
  styles already encode it.
- **Stale auth fields removed:** `type` from `ILoginStyle` and
  `IResetPasswordStyle` (RF-02; never existed in the DB) and the legacy
  email-send leftovers `subject_user` + `is_html` from `IResetPasswordStyle`
  (RF-06; reset email now goes through the mail templates).
- **`close_button_label` removed from `IAlertStyle`** (stale; not in the DB).

### Changed

- **`IAlertStyle.web_alert_title` → `alert_title` (RF-10).** The alert heading is
  translatable content shared by web and mobile, so it loses the `web_` prefix.

## v1.11.0

### Added

- **Mobile UI adapter contract is now a single public source
  (`IMobileUiAdapters` + the `IMobile*Props` capability interfaces).** Mobile
  rendering plan sections 8.3 / 9: both mobile tiers (the public app's
  open-source adapters and the private `@selfhelp/mobile-pro-ui` overrides) now
  consume one contract from `@selfhelp/shared` instead of each repo keeping a
  hand-synced copy. The module is type-only (it imports `react` types and the
  shared semantic scales `THeroUiSize`/`THeroUiButtonVariant`; it pulls in no
  React Native runtime dependency), which is why it lives here rather than in a
  separate contract package. The milestone-one capability set is
  `MobileButton`, `MobileText`, `MobileContainer`, `MobileCard`, `MobileInput`,
  `MobileTextarea`, `MobileSwitch`, `MobileCheckbox`, `MobileSelect`, and
  `MobileModal`. Covered by a contract test (`src/types/__tests__`) that locks
  the exact set; consumers enforce the shape at compile time
  (`ossAdapters`/`proAdapters: IMobileUiAdapters`).

## v1.10.0

### Changed

- **Style catalog reconciled to the established 90-style backend catalog
  (mobile rendering plan, milestone one).** The experimental registry/union had
  drifted to 98 entries: it included 16 speculative styles and omitted 8
  established ones. Removed the 16 speculative styles (`dialog`, `popover`,
  `menu`, `menu-item`, `bottom-sheet`, `skeleton`, `skeleton-group`, `spinner`,
  `toast`, `tag-group`, `tag`, `input-group`, `input-otp`, `search-field`,
  `fab-button`, `biometric-login-button`) from `BASE_STYLE_REGISTRY`, the
  `TStyle` union, and the type files (deleted `src/types/styles/catalog.ts`).
  Added the 8 established styles that were missing from the registry/union:
  `no-access`, `missing`, `not-found`, `version`, `ref-container`,
  `data-container`, `show-user-input`, `timeline-item`. The applications may
  still use dialogs/menus/etc. internally — they are simply not author-selectable
  CMS styles.
- **Field naming taxonomy aligned with the backend re-prefix migration.** The
  11 portable visual-semantic fields are now `shared_*` (was the experimental
  `web_*`): `shared_align`, `shared_justify`, `shared_gap`, `shared_direction`,
  `shared_wrap`, `shared_orientation`, `shared_full_width`, `shared_size`,
  `shared_radius`, `shared_text_align`, and `shared_spacing` (was
  `web_spacing_margin_padding`). Genuinely web-specific fields keep `web_*`; the
  margin-only `web_spacing_margin` stays `web_` (not consolidated). This matches
  backend migration `Version20260618143216`.
- Documented that the registry `platforms`/`TStylePlatform` value mirrors the
  backend `renderTarget` (`styleRenderTargets` lookup); page render target is
  the existing `pageAccessTypes` value, never a duplicate page-platform field.
- **Semantic mapper reworked to a non-clamping common scale (plan §6.2/§8.2).**
  `shared_size` is now `sm | md | lg` and `shared_radius` is `none | sm | md |
  lg | full` — the true cross-platform common denominator (HeroUI Native has no
  `xs`/`xl`). New `TSharedSize`/`TSharedRadius` types
  (`src/types/mantine/common.ts`) back the `shared_size`/`shared_radius` catalog
  fields across `layout`, `composite`, `interactive`, `forms`, and `error`.
  `src/theme/semantic.ts` no longer clamps unsupported sizes (out-of-domain
  values are ignored, not silently coerced) and exposes the plan's pure
  functions `resolveSharedStyleProps`, `toMantineSemanticProps`,
  `toHeroUiSemanticProps`, and `toReactNativeSemanticStyle(props, theme)`; the
  earlier `resolveSharedStyleForWeb` / `resolveSharedStyleForMobile` names remain
  as deprecated aliases. The backend enforces the same narrowed domain (migration
  `Version20260618195450`).

### Notes / follow-ups

- Consumer dependency-range updates and `release-manifest.json` compatibility
  floors land with the coordinated cross-repo release (plan section 16 / Phase 6)
  as the frontend and mobile consumers adopt `@selfhelp/shared@1.10.0`.

## v1.8.0

### Changed

- **BREAKING (shipped as a minor by request): CMS style names are now
  kebab-case.** The `style_name` discriminator on the core style contracts was
  renamed from camelCase to kebab-case so the cross-repo style catalog uses one
  casing everywhere (backend `styles` seeds/DB, this package, the frontend
  `BasicStyle` dispatcher, and the mobile renderers). Renamed: `resetPassword` →
  `reset-password`, `twoFactorAuth` → `two-factor-auth`, `noAccess` →
  `no-access`, `notFound` → `not-found`, `entryList` → `entry-list`,
  `entryRecord` → `entry-record`, `entryRecordDelete` → `entry-record-delete`,
  `showUserInput` → `show-user-input`. The TypeScript interface names
  (`IResetPasswordStyle`, `IEntryListStyle`, …) are unchanged — only the
  `style_name` string literal moved.
- Because this is a breaking contract change released as a **minor** (1.8.0),
  consumers on a `^1.7.x` range pick it up on their next install. It must land in
  lockstep: the backend renames the matching `styles.name` rows (sections
  reference styles by FK id, so it is a metadata rename, not a content
  migration), and the frontend/mobile update their local style-name unions +
  dispatcher keys in the same release.
- `AGENTS.md` now mandates kebab-case style names; the previous "preserve legacy
  camelCase names" guidance was reversed.

## v1.7.2

### Added

- `InstanceManifest` now models the optional `backupSchedule`
  (`BackupSchedulePolicy` + `BackupRetentionPolicy`) and `envOverrides` fields,
  mirroring the manager's authoritative manifest contract
  (`sh-manager/packages/schemas/src/types.ts`). Both are optional — additive and
  backward compatible. This restores the cross-repo `distribution.test.ts`
  parity check, which was red against the manager's `instance-manifest.json`
  example fixture.

### Changed

- **Lint is now a blocking CI gate.** `npm run lint -- --max-warnings=0` runs on
  every PR/push to `main` (`plugin-sdk-check.yml`) and before npm publish
  (`publish.yml` now runs headers → lint → typecheck → build → test before
  `npm publish`). The strict, type-aware ESLint flat config already existed but
  was not enforced by any workflow; no lint rules were changed and no runtime
  behavior changed.

## v1.7.1

### Changed

- Documented the `frontend_compatibility` preflight check code in the
  system-maintenance contract (`types/api/system.ts`). The frontend-only update
  preflight (`IFrontendUpdatePreflight`) now carries the standardized
  `ICompatibilityError` fields under a `frontend_compatibility` check when the
  running core forbids the target frontend, or the target frontend needs a
  different core — the bidirectional frontend ⇄ core rule the SelfHelp Manager
  enforces, now mirrored by the CMS so its verdict matches the manager's instead
  of always reporting "OK". No shape change: `IUpdatePreflightCheck` already
  carries `code` plus the compatibility fields, so this is a documentation /
  contract-clarification release (additive, backward compatible).

## v1.7.0

### Added

- Error-page style contracts in a new `styles/error.ts` (re-exported from the
  package root): `INoAccessStyle` (the 403 `no-access` / `no-access-guest`
  pages), `INotFoundStyle` (the 404 page) and `IMissingStyle`. Each carries the
  shared `title` / `message` / `button_label` (plus `login_label` /
  `show_login` for the access-denied variants) copy fields and the
  `mantine_color` / `mantine_radius` / `mantine_shadow` /
  `mantine_button_variant` / `show_icon` presentation fields that the new
  styled system error pages render.
- `IShowUserInputStyle` + `IShowUserInputEntry` (`styles/forms.ts`): the
  contract for the new **showUserInput** style, which renders a form's
  collected entries as a table. It covers the data-table feature flags
  (`dt_sortable` / `dt_searching` / `dt_paginate` / `dt_info` /
  `dt_default_order_column` / `dt_default_order_dir`), `csv_export`,
  `delete_entry` with translatable `delete_modal_title` / `delete_modal_body`,
  column remapping via `fields_map`, `own_entries_only` / `show_timestamp`, the
  full `mantine_table_*` styling set, and the `entries` array — where each row
  exposes `record_id`, `id_users` and the per-row `_can_delete` flag the
  renderer uses to show a trash icon only for rows the current user may delete.

## v1.6.1

### Added

- Frontend-only update contracts (the frontend ships independently of the core,
  so an instance on the newest core can still move to a newer compatible
  frontend): the `SYSTEM_ENDPOINTS.UPDATE_FRONTEND_RELEASES` /
  `UPDATE_FRONTEND_PREFLIGHT` / `UPDATE_FRONTEND_REQUEST` path constants, the
  `TUpdateKind = 'core' | 'frontend'` discriminator, `IFrontendUpdateRequest`
  (`target_version` + `preflight_id` — no `accepted_migration_risk`, a frontend
  swap is stateless), `IFrontendUpdateRequestResponse` (carries
  `kind: 'frontend'` + `target_frontend_version`), and the
  `IFrontendUpdateReleases(Response)` / `IFrontendUpdatePreflight(Response)`
  aliases (the frontend reuses the core releases/preflight shapes).

### Changed

- `IUpdateStatus` gains two **required** fields: `kind` (`TUpdateKind`) and
  `target_frontend_version` (`string | null`), so the status UI can label a
  frontend-only operation correctly. Additive but required in the response (the
  backend schema `responses/admin/update_status.json` requires both); consumers'
  fixtures/mocks must add them (`kind: 'core'`, `target_frontend_version: null`
  for a core/idle status).

## v1.6.0

### Added

- `IUpdateStatus.manager` (`IUpdateStatusManager`): manager-loop visibility on
  the update status — `configured` (instance has a manager token),
  `last_seen_at` (last authenticated manager poll, null = never), and
  `requested_stale` (the latest operation sat in `requested` too long without
  the manager claiming it). Additive but **required** in the response — the
  backend schema `responses/admin/update_status.json` requires it; consumers'
  fixtures/mocks must add the block.

## [Unreleased]

## [1.5.0]

### Added

- `ISystemVersion.deployment` (`TSystemDeployment = 'docker' | 'source'`): the
  backend now reports how it is deployed so the admin maintenance UI can
  distinguish a managed Docker-image install from a source/dev checkout.
  Additive but **required** in the response — consumers' fixtures/mocks must
  add the field (the backend schema `responses/admin/system_version.json`
  requires it).
- Update-picker contracts for `GET /admin/system/update/releases`:
  `IUpdateRelease`, `IUpdateReleases`, `IUpdateReleasesResponse`, and the
  `SYSTEM_ENDPOINTS.UPDATE_RELEASES` path constant. The endpoint lists
  registry-published core versions (newest first) and fails soft to
  `available: false` when the registry is unreachable.
- `check-schema-parity.mjs` now also guards
  `responses/admin/update_releases.json` against `IUpdateReleases`.

## [1.4.0]

### Added

- `TUpdateOperationStatus` gains the `idle` member: the honest state the backend
  returns for an instance that has never run an update (instead of a misleading
  `succeeded`/100%). Additive contract change — exhaustive consumers (e.g. a
  `Record<TUpdateOperationStatus, …>`) must add an `idle` branch. Ship as the
  next minor (`1.5.0`); the frontend mirror in
  `sh-selfhelp_frontend/src/types/responses/admin/system.types.ts` already
  tracks it.

- Instance-scoped **system maintenance / update** contracts under
  `src/types/api/system.ts` for the SelfHelp Manager (`sh-manager`) ↔ CMS ↔
  admin-UI flow (SelfHelp Manager / Docker Distribution MVP): `ISystemVersion`
  / `ISystemVersionResponse`, `IUpdatePreflight` / `IUpdatePreflightResponse`,
  `IUpdateRequest`, `IUpdateStatus` / `IUpdateStatusResponse`,
  `IUpdateRequestResponse`, plus the `SYSTEM_ENDPOINTS` path constants and the
  supporting unions (`TUpdatePreflightStatus`, `TUpdateOperationStatus`, …).
- Hard cross-repo invariant encoded in the types and a regression test:
  `IUpdateRequest` has **no** `instance_id` — the browser never targets another
  instance; the backend derives and verifies the instance identity server-side.
- `check-schema-parity.mjs` now also guards the three new admin response schemas
  (`responses/admin/system_version.json`, `update_preflight.json`,
  `update_status.json`) and the `requests/admin/update_request.json` request
  schema against the shared TS mirrors.
- `ICompatibilityError` in `src/types/api/system.ts` — the standardized
  compatibility-error shape (`component`, `component_id`, `current_version`,
  `target_version`, `required_range`, `blocking`, `message`) shared verbatim by
  the backend `CompatibilityError`, the SelfHelp Manager resolver, and the
  frontend Available/preflight UI, with a parity test
  (`compatibility-error-parity.test.ts`).

### Changed

- **Unified registry types** (`src/plugin-sdk/registry.ts`). `IPluginRegistry`
  now mirrors the unified `registry.json`: required `schemaVersion`,
  `requiresManager`, `baseUrl`, and the five release-ref arrays `core` /
  `frontend` / `scheduler` / `worker` / `plugins`. New `IRegistryReleaseRef`
  (`{id, version, channel, releaseUrl, blocked?}`) and `IPluginRelease` (the
  standalone signed plugin release document: `compatibility.{core,pluginApi}`,
  `artifacts.{manifestUrl,archiveUrl,sha256}`, Ed25519 `security`). The legacy
  single-version inline `IPluginRegistryEntry` / `IPluginRegistryVersionEntry`
  were removed (no consumer; replaced by the multi-version release-ref model).
  Mirrors the backend `plugin-registry.schema.json` +
  `config/schemas/registry/plugin-release.schema.json`.

## [1.3.2]

### Changed

- Maintenance release: cut a clean published version for consumers to pin.
  Supersedes the `1.3.1` test publish; no functional or API changes since
  `1.3.0`.

## [1.3.0]

### Added

- `ENDPOINTS.AUTH.FORGOT_PASSWORD` (`/cms-api/v1/auth/forgot-password`) and
  `ENDPOINTS.AUTH.RESET_PASSWORD` (`/cms-api/v1/auth/reset-password`) so the
  password-recovery flow is part of the shared API contract (issue #31). The
  web frontend and the mobile app now build these requests from shared
  constants instead of local/ad-hoc paths.
- Request DTOs `IForgotPasswordRequest` and `IResetPasswordRequest`, and
  response types `IForgotPasswordResponse` / `IResetPasswordResponse`,
  mirroring the backend `requests/auth/forgot_password.json` and
  `reset_password.json` schemas. `scripts/check-schema-parity.mjs` now covers
  these request schemas.

## [1.2.5]

### Changed

- `IResetPasswordStyle` now models the full two-step reset flow instead of
  just the "request a recovery mail" screen. Added optional CMS fields for
  the set-password mode: `reset_title`, `reset_label_pw`,
  `reset_pw_placeholder`, `reset_label_pw_confirm`,
  `reset_pw_confirm_placeholder`, `reset_label_submit`,
  `reset_success_title`, `reset_alert_success`, `reset_redirect_text`,
  `reset_error_invalid_token`, `reset_error_pw_short`, and
  `reset_error_pw_mismatch`.
- Removed the stale legacy `text_md` and `email_user` fields from
  `IResetPasswordStyle` so the shared contract matches the backend
  `resetPassword` style schema.

## [1.2.4] - 2026-06-05

### Added

- Communication preferences support in profile section. `IUserData` gains
  `receives_notifications` and `receives_emails` boolean fields.
- New CMS endpoint `UPDATE_COMMUNICATION_PREFERENCES` for updating user
  communication preferences.
- Communication preferences CMS label fields on `IProfileStyle`: 
  `profile_communication_preferences_title`,
  `profile_communication_preferences_description`,
  `profile_receive_notifications_label`,
  `profile_receive_notifications_description`,
  `profile_receive_emails_label`,
  `profile_receive_emails_description`,
  `profile_communication_preferences_button`,
  `profile_communication_preferences_success`, and
  `profile_communication_preferences_error_general`.
- New permission `ADMIN_SCHEDULED_JOB_MANAGE` for scheduled job management.

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
