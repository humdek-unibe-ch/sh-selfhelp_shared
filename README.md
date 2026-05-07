/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
# @selfhelp/shared

Shared TypeScript package consumed by both [`sh-selfhelp_frontend`](../sh-selfhelp_frontend) (web) and [`sh-selfhelp_mobile`](../sh-selfhelp_mobile) (Expo).

## What lives here

| Folder              | Purpose                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `src/types/styles`  | Per-style interfaces (`IContainerStyle`, `ITextStyle`, …) + `TStyle` union + `IBaseStyle`.     |
| `src/types/pages`   | `IPageContent`, `IPageItem`, `IPageSectionWithFields`.                                         |
| `src/types/auth`    | `IUserDataResponse`, `IJwtPayload`, `PERMISSIONS`.                                             |
| `src/types/api`     | Request/response envelopes, login/refresh/form/language DTOs.                                  |
| `src/types/mantine` | Mantine semantic types (`TMantineSize`, `TMantineColor`, …) shared by web + mobile renderers.  |
| `src/registry`      | Typed `STYLE_REGISTRY` map of `style_name -> { schema, frontendOnly }` for compile-time exhaustiveness. |
| `src/api`           | `/cms-api/v1/*` endpoint catalog (frontend-only subset).                                       |
| `src/theme`         | Mantine token tables + a Tailwind preset extended by both apps.                                |
| `src/interpolation` | `replaceCalcedValues({{field}})`, mirrors `PageDb::replace_calced_values`.                     |
| `src/condition`     | JSON-Logic evaluator with `platform`, `language`, `current_date` context — mirrors backend `ConditionService`. |
| `src/cms-classes`   | Tailwind class allow-list + remap table + `classifyClass()`.                                   |
| `src/assets`        | `resolveAssetUrl(url, baseUrl)` — absolute pass-through, relative prefix.                      |
| `src/utils`         | `parseSpacing()` — parses `mantine_spacing_margin_padding` JSON.                               |

## Consumption

Both apps depend on this package via `package.json`:

```jsonc
{
  "dependencies": {
    "@selfhelp/shared": "file:../sh-selfhelp_shared"
  }
}
```

After cloning:

```bash
cd sh-selfhelp_shared
npm install
npm run build
```

Then in the consuming app:

```bash
npm install
```

## Adding a new style

1. Add the per-style interface in `src/types/styles/<group>.ts`.
2. Add the entry to `STYLE_REGISTRY` in `src/registry/styles.registry.ts`.
3. Export from `src/index.ts`.
4. Build: `npm run build`.
5. In **both** apps, register an implementation. TypeScript will error until both are present.

See `docs/cookbook/add-style.md` in the mobile repo for the full walkthrough.

## Versioning

- Currently consumed via `file:` dep. Any change is picked up immediately on the next install / restart.
- When promoted to a private npm registry, follow semver: minor for new styles / fields, major for breaking type changes.

## License

Licensed under the [Mozilla Public License 2.0](LICENSE). Copyright (c) 2026 Humdek, University of Bern.

### SPDX headers

Every TS/JS source file should carry a two-line SPDX header:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */
```

The header text lives in [`header.txt`](header.txt) (single source of truth). Header insertion / verification / removal is automated with [`license-check-and-add`](https://www.npmjs.com/package/license-check-and-add) using [`license-check-and-add-config.json`](license-check-and-add-config.json).

```bash
# One-time install (already in devDependencies):
npm install

# Add the header to every .ts/.tsx/.js/.jsx/.mjs/.cjs file under src/.
npm run headers:add

# Verify (CI-friendly, exits 1 if any file is missing the header).
npm run headers:check

# Strip the header (rarely needed; e.g. before re-licensing).
npm run headers:remove
```

The tool reads `.gitignore` so `node_modules/`, `dist/`, etc. are skipped automatically. Extra paths are listed in the `exact_paths` section of the config.
