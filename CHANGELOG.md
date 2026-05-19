# Changelog

All notable changes to `@selfhelp/shared` will be documented in this file.

This project follows semantic versioning.

## [1.0.2] - 2026-05-19

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
