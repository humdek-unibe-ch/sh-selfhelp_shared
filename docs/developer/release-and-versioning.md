# Release and Versioning

Audience: Maintainers of the shared package.
Status: active.
Applies to: `@selfhelp/shared`.
Last verified: 2026-11-14.
Source of truth: `package.json` (`version`, `scripts`, `publishConfig`), `.github/workflows/publish.yml`, `LICENSE`, `header.txt`, and `license-check-and-add-config.json`.

`@selfhelp/shared` is published to npm under public access. The `@selfhelp/shared` semver is the anchor for typed contracts across frontend/mobile (see the backend `docs/developer/cross-repo-compatibility-matrix.md`). Registry pairing of core ↔ frontend ↔ mobile-preview uses each repo's `release-manifest.json` `supports.*` ranges — not shared SemVer alone.

## Current wave pin

Supported unreleased wave (entry lists with a form, data views and the global data query engine), allocated after the about-the-platform wave (`1.23.0` / core `0.1.43` / frontend `0.1.70` / mobile `0.1.34`):

| Package | Version / floor |
| --- | --- |
| `@selfhelp/shared` | `1.24.0` (list styles, list DTOs and URL helpers, `ENDPOINTS.LISTS`, record `version` on form results) |
| core (backend) | `0.1.44` |
| frontend | `0.1.71` (`supports.core >=0.1.44`) |
| mobile | `0.1.35` (`supports.core >=0.1.44`) |

The consumers already name `1.24.0`: the `@selfhelp/shared` dependency in the frontend and mobile `package.json` (and the mobile `overrides` entry), both lockfiles and the mobile `config/appLibraries.generated.json`. Until `1.24.0` is on npm, a registry-backed `npm ci` in them fails with a 404 for that version, and the consumers are verified against the local packed artifact described in [Verify an unreleased build in the consumers](#verify-an-unreleased-build-in-the-consumers-local-packed-artifact). Order of the release: publish shared (steps 1–5 below), then commit the consumers, then tag them.

### Do not use staged 2.x / 3.x tags

Feature-branch history briefly staged shared as `2.0.0`–`3.0.1` before republishing on `1.21.x`. Those `v2.*` / `v3.*` tags must **not** be used for this release. Review and delete them manually if they exist locally or on the remote; do not automate tag deletion from CI or agent runs.

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

## Verify an unreleased build in the consumers (local packed artifact)

Use this whenever a consumer needs a shared build that is not on npm yet (a contract wave in preparation). Never copy files into a consumer's `node_modules` by hand: that cannot be reproduced and records nothing. CI does the same in the backend `ecosystem-compat.yml` (`npm pack`, then `npm install --no-save <tarball>` in the consumer).

1. Build and pack the shared repository into a directory **outside** the repositories (`ARTIFACTS` below), so no tarball is committed by accident:
   ```bash
   cd sh-selfhelp_shared
   npm ci                      # only when node_modules is missing or out of date
   npm run build
   npm pack --json --pack-destination "$ARTIFACTS" > "$ARTIFACTS/pack.json"
   ```
   Record `filename`, `integrity` and `shasum` of `pack.json` with the verification result. The same source, built and packed again, gives the same `integrity`.
2. Install the tarball into each consumer without touching its checked-in metadata:
   ```bash
   cd sh-selfhelp_frontend      # and again in sh-selfhelp_mobile
   npm install --no-save --no-audit --no-fund "$ARTIFACTS/selfhelp-shared-1.24.0.tgz"
   ```
   `--no-save` leaves `package.json` and `package-lock.json` as they are (they already pin the version). In a checkout without `node_modules` the same command installs every other dependency from the lockfile. The mobile `overrides` entry for shared is `"$@selfhelp/shared"` (it follows the direct dependency): a literal version there makes npm refuse the tarball with `EOVERRIDE`. npm records the tarball (path and `integrity`) in `node_modules/.package-lock.json`; check that its `node_modules/@selfhelp/shared` entry carries the `integrity` of step 1 and that `npm ls @selfhelp/shared` shows the version.
3. In the mobile app, regenerate the app-library inventory after the install: `npm run generate:app-libraries` (it names the installed version; `npm run check:app-libraries` and `appLibraries.test.mjs` fail while the committed list names another one).
4. Run the consumer checks of the change (type-check, lint, the focused tests).

Registry prerequisite: the pins name the new version, so `npm ci` (CI of the consumers, Docker builds, a fresh clone) fails with a 404 until the version is published. That is expected before the release; it is not a defect of the pins. The `ecosystem-compat.yml` consumer jobs run `npm ci` before they override shared with the tarball, so they cannot test a consumer ref that already pins an unpublished version: publish first, or run the steps above locally. After the publication, `npm install --save-exact @selfhelp/shared@1.24.0` in each consumer is expected to change nothing but the registry `integrity` of the lock entry (the entry of the previous version has none either).

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
