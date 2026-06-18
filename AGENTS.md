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
- Vitest is configured; runtime-helper + testing-kit tests live under `src/**/__tests__/`
- ESLint 9 flat config (`eslint.config.mjs`) with `typescript-eslint` (type-aware) + `eslint-plugin-unused-imports`; type-aware linting uses the lint-only `tsconfig.eslint.json`
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

## Documentation Rules

These rules apply to every documentation change in active SelfHelp2 repositories. Copy this section unchanged across repository `AGENTS.md` files so agents get the same documentation contract without following a central link.

- Organize documentation by audience and purpose, not by implementation history: `docs/developer/` for technical architecture/workflow docs, `docs/user/` for non-technical feature/admin/operator guides, `docs/reference/` for exact contracts/tables/schemas/API details, `docs/cookbook/` for task recipes, `docs/operations/` for install/deploy/publish/runbooks, and `docs/archive/` for historical notes.
- Every docs root should have `docs/README.md` as the navigation entrypoint. Tiny repos may keep documentation in the root `README.md` until they need more than one doc. Preserve canonical exceptions such as backend `docs/plugins/` when moving files would break important links; add indexes/status notes first, migrate only after references are updated.
- New or substantially rewritten docs must begin with this metadata block: `Audience`, `Status`, `Applies to`, `Last verified`, `Source of truth`.
- Documentation filenames should use lowercase kebab-case, one `#` title, ASCII punctuation, no emoji headings, repo-relative links, concrete dates instead of "latest/current" when time-sensitive, and no local absolute paths.
- Write developer docs for engineers/technical operators with architecture, contracts, commands, and tradeoffs. Write user docs for non-technical users/operators as task-based steps with expected results and minimal implementation jargon.
- Update documentation in the same change when behavior changes affect user-visible behavior, API contracts, schemas/types, permissions/auth, database/migrations, config/env vars, build/deploy/publish flow, plugin capabilities, or testing commands.
- Do not expose secrets, tokens, private keys, database URLs, Mercure/JWT secrets, or real credentials in docs, examples, logs, or screenshots. Use redacted examples and documented env var names only.
- When docs conflict with runtime behavior, treat runtime behavior as source of truth, flag the stale doc, and update or archive it instead of copying the conflict.

## Architecture Rules

- Treat source files as shared contracts for multiple consumers.
- Keep backend wire names intact, especially snake_case field names. Style names follow kebab-case (the legacy camelCase forms were renamed in v1.8.0); coordinate any further style rename across backend, frontend, and mobile in lockstep.
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
- Style names are **kebab-case** (e.g. `reset-password`, `two-factor-auth`, `entry-list`, `entry-record`, `entry-record-delete`, `no-access`, `not-found`, `show-user-input`). The legacy camelCase forms (`resetPassword`, `twoFactorAuth`, `entryList`, `entryRecord`, `entryRecordDelete`, …) were renamed to kebab-case in v1.8.0; new styles must be registered kebab-case and the backend seeds/DB, this package, the frontend, and the mobile renderers must stay in lockstep.
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
- Run `npm run lint` and `npm run typecheck` before finishing changes, and fix any lint failures with behavior-preserving fixes (see "Linting & Quality Gates").
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
- `npm run test` runs Vitest; the runtime-helper tests (`replaceCalcedValues`, `evaluateCondition`/`buildConditionContext`, `resolveAssetUrl`, `classifyClass`/`classifyClassString`, `transformPageData`) and the testing-kit stability test pass.
- Add Vitest tests for changed runtime helpers such as condition evaluation, interpolation, asset URL handling, class classification, spacing, and page transforms.
- `npm run lint` runs the ESLint 9 flat config (`eslint.config.mjs`) and currently passes with zero errors/warnings (`--max-warnings=0`); `npm run lint:fix` applies the safe auto-fixes. Lint is a required gate — see "Linting & Quality Gates".
- `npm run headers:check` currently passes (all source carries the SPDX header).
- `npm run test` now passes both with and without a sibling `sh-manager` checkout. The cross-repo `distribution.test.ts` parity check (`describe.runIf(hasManager)`) was previously red against the manager `instance-manifest.json` fixture because the shared `distribution.ts` type did not model the manifest's `backupSchedule` key; the type now mirrors the manager's authoritative contract (`BackupSchedulePolicy` + `BackupRetentionPolicy`, plus the optional `envOverrides`), so the parity test is green. Both additions are optional fields — additive and non-breaking to the published type. Keep this type in sync with `sh-manager/packages/schemas/src/types.ts` when the manifest contract changes.
- Avoid running `npm run build` unless generated `dist` changes are intended.

### Canonical Testing Rules (all SelfHelp repos)

These are the canonical SelfHelp testing policy, shared verbatim across the backend, frontend, shared package, mobile app, and every plugin repo. They describe the target conventions; this package runs Vitest (configured) plus a schema-parity checker, with the plugin certification kit (`src/testing/`) added in later slices. A rule applies as soon as the tooling it references exists in this repo.

1. Every new feature ships with at least one automated test at the appropriate layer (unit / integration / contract / E2E).
2. Every bug fix ships with a regression test that fails before the fix and passes after.
3. Every new API endpoint ships with a JSON-schema contract test **and** a permission-matrix test (admin/editor/user/guest + at least one negative cross-scope case).
4. Every new CMS style, action type, scheduled-job type, plugin event subscriber, or plugin realtime topic ships with an integration test for registration → use → cleanup.
5. Every new business workflow extends a golden-workflow test in `tests/Golden/` (backend) and, where a UI is involved, `e2e/golden/` (frontend / mobile).
6. Before writing or changing a test, perform a short **test impact analysis**: which workflow can break, which services/controllers/screens/plugin contracts are touched, which existing tests should fail, which new regression test is needed. Tests existing only to inflate coverage are rejected.
7. Tests do not depend on developer credentials. Use the seeded `qa.admin/editor/user/guest@selfhelp.test` personas.
8. QA fixtures use the production permission model. Seed test users through the same `Lookup userStatus/userTypes`, `Group`, `Role`, and `rel_groups_users` entities that production `src/Command/CreateAdminUserCommand.php` uses. Special permissions go through normal admin/domain services, never raw SQL.
9. All test data writes use the `qa.` / `qa-` / `qa_` prefix. Tests never create/update/delete non-QA business records. Read-only access to system baselines (languages, permissions, styles, lookups, plugin metadata, role/group/page-type) is allowed.
10. Tests self-clean (DAMA transaction rollback or an explicit `afterEach`). Integration/golden tests pass the `QaCleanupVerifier` (or the per-repo equivalent).
11. Do not mock domain behaviour in integration/golden tests. Unit tests may use deterministic test doubles but must not hide real business logic. Mock external dependencies (network, time, filesystem) at the boundary only.
12. Date/time tests use `Symfony\Bridge\PhpUnit\ClockMock` (PHP), `vi.useFakeTimers()` (Vitest), or `page.clock.install()` (Playwright).
13. Mercure events are verified via `MercureTestRecorder` (backend) or `mockMercureHub` (shared); never by polling.
14. Anti-flakiness: no `sleep()`, no external internet, no random IDs in fixtures or assertions, no order-dependent tests, no developer-machine absolute paths.
15. The full suite passes in random order. `composer test:random` (or the per-repo equivalent) runs nightly.
16. Test names describe business behaviour, not the method under test (e.g. `testFinishedFormSubmissionSchedulesAndExecutesActionEmailJob`, not `testSubmit`).
17. Prefer asserting public/domain-visible effects (API response, admin API view of scheduled jobs, Mercure event, rendered page) before internal implementation details. DB/queue assertions are secondary or a fallback.
18. Snapshot updates (Vitest, Playwright screenshots, response fixtures) must be intentional: the change is expected, the PR explains why, and a reviewer can compare before/after. Never run `--update-snapshots` just to make CI green.
19. Performance: any test slower than 10s is `@group golden` under `tests/Golden/` (or the per-repo golden area). PR-tier suites complete in under 10 minutes per repo.
20. Coverage gates: ≥ 70% line on `src/Service/**` + `src/Controller/**` (backend); ≥ 60% on new files (other repos). PRs dropping coverage by > 1% on changed files are blocked.
21. Use the standard test commands defined in this repo's Build / Dev Commands section. Never invent new test command names.
22. Tests assert **meaningful behaviour**, not just status codes. At minimum: status + envelope shape + key returned fields + one public side effect.
23. **Do not change production logic to make tests pass.** If a test reveals a production issue, fix the production code and explain in the PR. If the test expectation is wrong, fix the test.
24. **Smallest runnable proof**: after every 1–3 file changes, run `test:changed` (or the single new test file). Do not extend a slice while its current state is red for an unknown reason.
25. **Contract tests for FE/mobile/plugin-consumed responses**: every API response field consumed by frontend, mobile, or plugin code must exist in a JSON Schema under `config/schemas/api/v1/` plus a TypeScript type in `@selfhelp/shared`. Schema drift fails CI. Consumers must not depend on undocumented response fields.
26. **Negative-permission tests are mandatory** for every permission-sensitive endpoint: allowed user → success; lower-privileged user → 403; unauthenticated user → 401; cross-scope/group user → 403 or 404 per the established access rule.
27. **Security regression tests** are required for any change to authentication, authorization, CSRF, JWT issuance/refresh/revocation, logout/session invalidation, plugin trust level or capabilities, or ACL cache invalidation. Security tests assert failure behaviour, not only success.
28. **API backward compatibility**: do not remove or rename a response field without (a) a schema version bump, (b) a shared TS type update, (c) frontend/mobile/plugin adaptation in the same PR, and (d) a changelog entry.
29. **Performance budgets** for critical APIs are asserted in smoke/golden tests: login < 500 ms, admin pages list < 1000 ms, form submit < 1000 ms in the test env. Regressions above 2× the budget block PRs; 1.5×–2× warns.
30. **No real outbound** in tests: tests never send real email/SMS/push/webhooks/external HTTP. Use `RecordingNotifier`, MSW, or a mocked HTTP client, and assert the content of the captured message.
31. **Environment isolation**: test reset commands refuse to run unless `APP_ENV=test`, the database name contains `_test`, the host is in the allow-list, and `--force` is provided. Reset prints the target database name before destroying it.
32. **Fixture version**: `QaBaselineFixture` exposes `QA_FIXTURE_VERSION`; smoke tests print and assert it. Stale fixtures fail fast with a clear message.
33. **CI failure artifacts**: CI uploads PHPUnit logs, coverage report, Playwright traces/videos/screenshots, docker container logs, and a sanitized test DB dump for failed golden tests.
34. **Accessibility checks** for Playwright golden specs use axe-core on the login page, admin page editor, public form page, and plugin admin page.

### Shared-specific testing additions

- Every public helper requires a Vitest test under `src/**/__tests__/`. The README marks a helper "stable" only after Vitest coverage exists.
- Plugin SDK helpers (`definePlugin`, `usePluginRealtime`, schema mirrors) require a Vitest test plus a schema-parity assertion.
- Every new admin response schema added in the backend expands `scripts/check-schema-parity.mjs` to cover it (rule 25). Schema drift between backend JSON Schemas and shared TS types must fail `npm run check:schemas`.
- The plugin certification kit is exported from the `src/testing/` subpath (`@selfhelp/shared/testing`: `definePluginCertification`, the individual `check*`/`runCertificationChecks` helpers, `mockMercureHub`, `seedFromLockFile`, `CERTIFICATION_CHECKS`, `CERTIFICATION_KIT_VERSION`) and is consumed by every plugin's certification suite. It performs the **static manifest certification** (`definePluginCertification(config).run(manifest)` → typed `IPluginCertificationReport` over the ordered checks `manifest-valid`, `capabilities-vs-trust-level`, `compatibility-shape`, `lookup-ownership`, `db-naming`). It is built on the plugin SDK (`IPluginManifest` + semver helpers) and is deliberately scoped to static manifest checks: the **runtime** install/update/rollback/uninstall lifecycle is enforced by the backend host certification (`tests/Certification/*` + `PluginCapabilityValidator`/`PluginApiRouteSynchronizer`), not by this TS kit. The two layers are complementary — the kit gates the manifest before publishing; the host gates the actual install.
- `scripts/check-schema-parity.mjs` checks the plugin SDK schemas (`docs/plugins/*.schema.json`) AND the API response contracts (`config/schemas/api/v1`: response envelope, auth login, user-data, CMS page, form submit + update). It is a **name/presence-level** guard: it strips TS comments first (so a field surviving only in a stale comment is not counted) and asserts every `required` schema field name appears in the mapped TS type. It does **not** validate optionality, value types, or nested object/array shapes — that structural drift (e.g. user-data `roles`/`groups` are object arrays in the schema but `string[]` in `IUserData`) is caught by the cross-repo `ecosystem-compat.yml` gate, which builds `@selfhelp/shared` and type-checks the frontend + mobile against it. There are currently **no** `knownDrift` entries (the former form-submit drift was resolved); any new missing-field drift fails CI.
- **Coverage gate state (rule 20):** `@selfhelp/shared` owns the **only blocking** coverage gate in the ecosystem. `vitest.config.ts` enforces `thresholds` (istanbul provider, ≥ 60% lines/functions/statements/branches on the framework-free runtime-helper bundle); `shared-tests.yml` runs `npm run test:coverage` and the job **fails below threshold** (currently ~97%). `npm test` alone does **not** run the gate. The backend/frontend/mobile/plugin "rule 20" targets are advisory/staged or planned — see each repo's note and the host `docs/developer/15-testing-guidelines.md` "Coverage gates". Istanbul (not v8) is deliberate: the v8 provider double-counts files on Windows and would fail the gate locally.
- Standard shared test commands: `npm test`, `npm run test:coverage` (the blocking gate), `npm run check:schemas`, `npm run typecheck`, `npm run build`, `npm run test:release` (headers + typecheck + schemas + coverage + build). Do not invent new names.

## Linting & Quality Gates

Linting and package quality checks are **mandatory** whenever code is changed. These checks are not optional polish; they protect the published contract that the web frontend and mobile app depend on.

### When to run what

- After changing **any** TypeScript source, test, script, or package export, the agent **must** run `npm run lint`. If lint fails, the agent **must** fix the issues before finishing the task. `npm run lint:fix` applies the safe auto-fixes (unused-import removal, unnecessary-assertion removal, type-import normalization); resolve the rest by hand.
- For **source or public API changes**, the agent must also run `npm run typecheck` and `npm run build` (the build verifies CJS + ESM + declaration output for all six entry points: `.`, `./registry`, `./theme`, `./tailwind`, `./plugin-sdk`, `./testing`).
- For **schema / API contract changes**, the agent must run `npm run check:schemas`.
- Before **release-related changes**, the agent must run `npm run test:release` (`headers:check` + `typecheck` + `test:coverage` + `build`).
- The final response must mention the commands that were run and their result.
- **CI enforces lint as a blocking, zero-warning gate.** `npm run lint -- --max-warnings=0` runs on every PR/push to `main` (`plugin-sdk-check.yml`, alongside headers → typecheck → build → schema parity → tests) and again before the npm publish (`publish.yml` runs headers → lint → typecheck → build → test before `npm publish`). Generated output (`dist/**`, `coverage/**`) is ignored by the flat config so the run is deterministic. Never merge or publish on a red gate, and do not weaken these workflows to go green.

### How fixes must be made

- All lint fixes must be **behavior-preserving and mechanical**: remove truly-unused imports/variables, prefix intentionally-unused identifiers with `_`, replace `any` with `unknown`/generics/existing types, add `void`/type-only imports, drop unnecessary assertions, etc.
- Do **not** change functionality, runtime behavior, or control flow only to satisfy lint.
- Do **not** change public exports, package entry points (`main`/`module`/`types`/`exports`), or declaration semantics only to satisfy lint. Preserving the public API wins over silencing a lint error.
- If a lint issue cannot be fixed without a possible functionality or compatibility change, do **not** guess: add a **narrow, inline** `eslint-disable-next-line` with a comment explaining why, keep it minimal, and report it.

### Rules that must stay enforced

- Unused imports are not allowed.
- Unused variables are not allowed unless prefixed with `_`.
- Explicit `any` is not allowed unless there is a narrow, documented inline exception. The `no-unsafe-*` family (assignment/member-access/call/return) keeps `any` from propagating through the type system; it is relaxed only in test fixtures.
- Unhandled / floating promises (`no-floating-promises`) and misused promises (`no-misused-promises`) are not allowed (mark intentional fire-and-forget with `void`).
- Consistent, side-effect-free type imports (`consistent-type-imports`) and no duplicate imports.
- ESLint rules must **not** be disabled globally (file-level or whole-rule) to hide problems; use narrow inline exceptions only.
- SPDX / license headers must be preserved on every source file (`npm run headers:check` must pass).

## Build / Dev Commands

- `npm install`: install dependencies.
- `npm run typecheck`: run TypeScript strict checks.
- `npm run build`: build CJS, ESM, and declaration files into `dist`.
- `npm run dev`: run `tsup` in watch mode.
- `npm run test`: run Vitest.
- `npm run lint`: run ESLint 9 (type-aware flat config).
- `npm run lint:fix`: run ESLint with `--fix` (applies only the safe, behavior-preserving auto-fixes).
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
