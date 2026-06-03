# Testing and Coverage Gate

Audience: Maintainers of the shared package.
Status: active.
Applies to: `@selfhelp/shared`.
Last verified: 2026-06-03.
Source of truth: `package.json` scripts, `vitest.config.ts`, and `scripts/check-schema-parity.mjs`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Run the Vitest suite (`vitest run --passWithNoTests`). |
| `npm run test:changed` | Run only tests affected by changed files. |
| `npm run test:coverage` | Run the suite with the blocking coverage gate. |
| `npm run check:schemas` | Run `scripts/check-schema-parity.mjs` (TS-mirror parity check). |
| `npm run test:release` | Full gate: `headers:check`, `typecheck`, `check:schemas`, `test:coverage`, `build`. |

## Coverage gate (blocking)

`npm run test:coverage` enforces a blocking coverage gate (canonical Testing Rule 20). Per `vitest.config.ts`:

- Provider: `istanbul` (the `v8` provider double-counts files on Windows by drive-letter casing, which halves the reported number).
- Thresholds: `>= 60%` lines, functions, statements, and branches.
- Scope (`include`): the deterministic, framework-free runtime helpers both clients consume:
  - `src/interpolation/**/*.ts`
  - `src/condition/**/*.ts`
  - `src/assets/**/*.ts`
  - `src/cms-classes/classify.ts`
  - `src/utils/transformPageData.ts`
- Excluded: `**/__tests__/**` and `**/index.ts`. Type-only and data/registry modules are intentionally out of scope because line coverage on declarations is noise.

Every helper in the `include` list is imported by a test in this repo. When you add a new runtime helper to that scope, add its test in the same change so the bundle stays at or above the threshold.

## Schema parity

`scripts/check-schema-parity.mjs` keeps the TypeScript mirror aligned with the backend JSON schemas. It runs as part of `test:release` and is the parity check referenced by the backend plugin lock-file documentation.
