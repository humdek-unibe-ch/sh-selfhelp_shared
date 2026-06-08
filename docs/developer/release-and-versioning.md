# Release and Versioning

Audience: Maintainers of the shared package.
Status: active.
Applies to: `@selfhelp/shared`.
Last verified: 2026-06-08.
Source of truth: `package.json` (`version`, `scripts`, `publishConfig`), `.github/workflows/publish.yml`, `LICENSE`, `header.txt`, and `license-check-and-add-config.json`.

`@selfhelp/shared` is published to npm under public access. The first stable release was `1.0.0`; the package is currently at `1.3.0`. The `@selfhelp/shared` semver is the anchor for cross-repo compatibility (see the backend `docs/developer/cross-repo-compatibility-matrix.md`).

## Versioning policy

Semantic versioning:

- `major`: breaking type or runtime changes.
- `minor`: backward-compatible new exports, styles, helpers, or fields.
- `patch`: fixes, clarifications, or non-breaking internal improvements.

When a contract changes, bump the version and update the consumers (`sh-selfhelp_frontend`, `sh-selfhelp_mobile`) plus any plugin that depends on the changed export.

## Publish a new version

Publishing is automated through GitHub Actions and npm **Trusted Publishing**
(GitHub OIDC) — no npm token is stored in the repo or in GitHub secrets.
Pushing a `v*` tag triggers [`.github/workflows/publish.yml`](../../.github/workflows/publish.yml),
which installs, builds, tests, and runs `npm publish` using a short-lived OIDC
credential (npm also attaches provenance automatically).

Release steps:

1. Bump the version (updates `package.json` + `package-lock.json`):
   ```bash
   cd sh-selfhelp_shared
   npm version <patch|minor|major>
   ```
2. Commit the version bump together with the [CHANGELOG.md](../../CHANGELOG.md) entry.
3. Create the matching tag, e.g. `v1.3.1` (`npm version` already creates this tag
   locally; otherwise `git tag v1.3.1`). The tag must match `package.json#version`.
4. Push the commit and the tag:
   ```bash
   git push origin main --follow-tags
   ```
5. The `publish` workflow runs on the tag push and publishes to npm.
6. Verify the new version on npm, then update the consumers
   (`sh-selfhelp_frontend`, `sh-selfhelp_mobile`, dependent plugins).

Notes:

- `prepublishOnly` runs `npm run build` automatically during `npm publish`, so `dist/` is always rebuilt from source before upload.
- `publishConfig.access` is `public`, so no extra flag is needed for the scoped package.
- Release notes live in [../../CHANGELOG.md](../../CHANGELOG.md).

### One-time npmjs.com configuration (Trusted Publisher)

Trusted Publishing must be enabled once on npmjs.com by a package owner/admin
before the workflow can publish. On npmjs.com open **@selfhelp/shared ->
Settings -> Trusted Publisher -> GitHub Actions** and set:

| Field         | Value                |
| ------------- | -------------------- |
| Organization  | `humdek-unibe-ch`    |
| Repository    | `sh-selfhelp_shared` |
| Workflow file | `publish.yml`        |
| Environment   | *(leave blank)*      |

No npm tokens are created or stored in the repository or in GitHub secrets.

### Manual fallback

If you must publish from a workstation (for example before Trusted Publishing
is configured), an authenticated maintainer can still run:

```bash
cd sh-selfhelp_shared
npm publish   # prepublishOnly rebuilds dist/ first
```

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
