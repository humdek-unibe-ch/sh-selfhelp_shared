# Release and Versioning

Audience: Maintainers of the shared package.
Status: active.
Applies to: `@selfhelp/shared`.
Last verified: 2026-06-03.
Source of truth: `package.json` (`version`, `scripts`, `publishConfig`), `LICENSE`, `header.txt`, and `license-check-and-add-config.json`.

`@selfhelp/shared` is published to npm under public access. The first stable release was `1.0.0`; the package is currently at `1.2.3`. The `@selfhelp/shared` semver is the anchor for cross-repo compatibility (see the backend `docs/developer/cross-repo-compatibility-matrix.md`).

## Versioning policy

Semantic versioning:

- `major`: breaking type or runtime changes.
- `minor`: backward-compatible new exports, styles, helpers, or fields.
- `patch`: fixes, clarifications, or non-breaking internal improvements.

When a contract changes, bump the version and update the consumers (`sh-selfhelp_frontend`, `sh-selfhelp_mobile`) plus any plugin that depends on the changed export.

## Publish a new version

```bash
cd sh-selfhelp_shared
npm version <patch|minor|major>
npm publish
```

Notes:

- `prepublishOnly` runs `npm run build` automatically during `npm publish`, so `dist/` is always rebuilt from source before upload.
- `publishConfig.access` is `public`, so no extra flag is needed for the scoped package.
- Release notes live in [../../CHANGELOG.md](../../CHANGELOG.md).

## Pre-publish checks

```bash
npm run typecheck
npm run build
npm pack --dry-run
```

For a full release gate, `npm run test:release` runs `headers:check`, `typecheck`, `check:schemas`, `test:coverage`, and `build` in sequence (see [testing.md](testing.md)).

## SPDX headers

Every TS/JS source file carries a two-line SPDX header. The header text lives in `header.txt`; insertion, verification, and removal are automated with `license-check-and-add` via `license-check-and-add-config.json`:

```bash
npm run headers:add
npm run headers:check
npm run headers:remove
```

The tool reads `.gitignore`, so `node_modules/`, `dist/`, and other ignored paths are skipped. The package is licensed under MPL-2.0 (`LICENSE`).
