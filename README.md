<!--
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
-->

# @selfhelp/shared

The shared TypeScript foundation for the SelfHelp ecosystem. It is the single source of truth that keeps the web frontend (`sh-selfhelp_frontend`) and mobile app (`sh-selfhelp_mobile`) aligned on:

- CMS page and style types
- API request/response contracts
- shared theme tokens and a Tailwind preset
- condition and interpolation helpers that mirror backend behavior
- CMS class allow-listing and asset URL utilities

## Install

```bash
npm install @selfhelp/shared
```

For local development against sibling repositories you can use a file dependency:

```json
{ "dependencies": { "@selfhelp/shared": "file:../sh-selfhelp_shared" } }
```

## Quick usage

```ts
import { ENDPOINTS, replaceCalcedValues, resolveAssetUrl } from '@selfhelp/shared';
import type { IPageContent, IUserDataResponse } from '@selfhelp/shared';

import { STYLE_REGISTRY } from '@selfhelp/shared/registry';
import { THEME_TOKENS } from '@selfhelp/shared/theme';
import tailwindPreset from '@selfhelp/shared/tailwind';
```

The package exposes a root export plus the `registry`, `theme`, `tailwind`, `plugin-sdk`, and `testing` subpaths.

## Build

```bash
npm install
npm run build
```

## Documentation

Full documentation lives in [docs/](docs/README.md):

- Public exports, types, and contracts: [docs/reference/exports.md](docs/reference/exports.md)
- Release and versioning: [docs/developer/release-and-versioning.md](docs/developer/release-and-versioning.md)
- Testing and the coverage gate: [docs/developer/testing.md](docs/developer/testing.md)
- Extending the package: [docs/developer/extending.md](docs/developer/extending.md)

Release notes are in [CHANGELOG.md](CHANGELOG.md). Licensed under [MPL-2.0](LICENSE).
