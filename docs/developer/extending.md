# Extending the Package

Audience: Maintainers of the shared package.
Status: active.
Applies to: `@selfhelp/shared`.
Last verified: 2026-06-03.
Source of truth: `src/registry/styles.registry.ts`, `src/types/styles/`, and `src/index.ts`.

## Adding a new style

1. Add the per-style interface in `src/types/styles/<group>.ts`.
2. Add the style entry to `src/registry/styles.registry.ts`.
3. Re-export any new public surface from `src/index.ts` if needed.
4. Run `npm run build`.
5. Update both consumers (`sh-selfhelp_frontend`, `sh-selfhelp_mobile`) so the new style has a real implementation.

The registry is intentionally strict: TypeScript should catch missing wiring when a new style is introduced.

## Adding other exports

- New helpers go in the matching `src/<module>/` folder and are re-exported through that module's `index.ts` (and `src/index.ts` for the root surface).
- New deterministic runtime helpers consumed by both clients should be added to the coverage gate scope in `vitest.config.ts` with a test in the same change (see [testing.md](testing.md)).
- A new contract or changed field is a `minor` or `major` change; follow [release-and-versioning.md](release-and-versioning.md) and update consumers.
