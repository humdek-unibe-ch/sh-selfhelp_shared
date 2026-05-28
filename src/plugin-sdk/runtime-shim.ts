/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Plugin runtime-shim contract.
 *
 * Plugins ship as native ESM bundles that import bare specifiers like
 * `react`, `@mantine/core`, `@tanstack/react-query`, and
 * `@selfhelp/shared/plugin-sdk`. The browser cannot resolve those
 * without help, and the host explicitly does NOT want each plugin to
 * bundle its own copy of those packages — a duplicate React breaks
 * hooks, a duplicate `@tanstack/react-query` shadows the host's
 * `QueryClient`, a duplicate `STYLE_REGISTRY` desynchronises the
 * style dispatcher.
 *
 * Resolution strategy is a single contract shared across:
 *
 *   1. The host frontend (`sh-selfhelp_frontend`) which:
 *      - renders `<script type="importmap">` with the entries from
 *        {@link PLUGIN_RUNTIME_IMPORT_MAP},
 *      - serves a tiny per-module shim at
 *        {@link PLUGIN_RUNTIME_SHIM_BASE_PATH}`<specifier>`,
 *      - populates {@link PLUGIN_RUNTIME_GLOBAL_KEY} on `globalThis`
 *        with the singleton module objects the host already loaded.
 *   2. Every plugin's frontend Vite build, which externalises the
 *      same specifiers and rewrites them to the matching shim URL so
 *      the published bundle's imports resolve through the host.
 *   3. Every plugin's local dev-runtime server (Vite middleware),
 *      which inlines the shim payload fetched from the host so
 *      on-demand transforms still consume host singletons.
 *
 * Adding or removing a singleton is a single edit to
 * {@link PLUGIN_RUNTIME_SHIM_SPECIFIERS}. The host shell, plugin
 * builds, and plugin dev runtimes all derive their behaviour from
 * that list, so they stay in lockstep automatically.
 */

/**
 * Bare ESM specifier the host exposes to plugins as a runtime
 * singleton. The order here is documentation-only; consumers should
 * treat the list as a set.
 */
export type TPluginRuntimeShimSpecifier =
    | 'react'
    | 'react/jsx-runtime'
    | 'react/jsx-dev-runtime'
    | 'react-dom'
    | 'react-dom/client'
    | '@mantine/core'
    | '@mantine/hooks'
    | '@mantine/notifications'
    | '@tanstack/react-query'
    | '@selfhelp/shared'
    | '@selfhelp/shared/plugin-sdk'
    | '@selfhelp/shared/registry';

/**
 * Canonical list of bare specifiers the host supports for plugin
 * runtimes. Every entry MUST be:
 *
 *   1. Stashed on `globalThis[PLUGIN_RUNTIME_GLOBAL_KEY]` by the host
 *      (so the shim has something to re-export);
 *   2. Listed in {@link PLUGIN_RUNTIME_IMPORT_MAP} (so the browser
 *      can rewrite the bare specifier to the shim URL); and
 *   3. Allowed by the host's `/api/plugins/runtime-shim/*` route
 *      handler (so the shim payload is actually generated).
 *
 * The host frontend asserts (1)–(3) cover the same set at build
 * time; drift between them is a contract bug.
 */
export const PLUGIN_RUNTIME_SHIM_SPECIFIERS: readonly TPluginRuntimeShimSpecifier[] = [
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'react-dom',
    'react-dom/client',
    '@mantine/core',
    '@mantine/hooks',
    '@mantine/notifications',
    '@tanstack/react-query',
    '@selfhelp/shared',
    '@selfhelp/shared/plugin-sdk',
    '@selfhelp/shared/registry',
] as const;

/**
 * Host-relative path prefix for the per-module shim endpoint. The
 * full URL for a given specifier is built by appending the specifier
 * as-is (it already includes any `@scope/` segment and any
 * `/subpath`). Use {@link buildPluginRuntimeShimPath} so consumers
 * never reconstruct the join logic locally.
 */
export const PLUGIN_RUNTIME_SHIM_BASE_PATH = '/api/plugins/runtime-shim/' as const;

/**
 * `globalThis` key the host populates with the singleton module
 * instances. The shim payload reads from this key at module-load
 * time, so identity is preserved between the host shell and every
 * plugin without any extra serialization.
 */
export const PLUGIN_RUNTIME_GLOBAL_KEY = '__SELFHELP_RUNTIME__' as const;

/**
 * Build the host-relative URL the import map (and the plugin's Vite
 * config) should point a given specifier at. The returned string is
 * always same-origin with the host shell — the entire shim contract
 * relies on browsers loading the bundle from a URL whose imports
 * resolve to the host's origin.
 */
export function buildPluginRuntimeShimPath(specifier: TPluginRuntimeShimSpecifier): string {
    return `${PLUGIN_RUNTIME_SHIM_BASE_PATH}${specifier}`;
}

/**
 * Type-guarded check that a runtime-supplied string is one of the
 * specifiers the host knows how to shim. Consumers that take user
 * input (route segments, manifest values) should always validate
 * through this helper before falling through to dynamic resolution.
 */
export function isPluginRuntimeShimSpecifier(value: unknown): value is TPluginRuntimeShimSpecifier {
    return typeof value === 'string'
        && (PLUGIN_RUNTIME_SHIM_SPECIFIERS as readonly string[]).includes(value);
}

/**
 * Bare-specifier → shim URL map. Rendered as the body of the
 * `<script type="importmap">` tag in the host's root layout. Plugins
 * also consume the same map at build time to keep externalisation
 * symmetric with the browser-side import map.
 *
 * Frozen so consumers can pass it directly to `JSON.stringify`
 * without worrying about accidental mutation.
 */
export const PLUGIN_RUNTIME_IMPORT_MAP: Readonly<Record<TPluginRuntimeShimSpecifier, string>>
    = Object.freeze(
        Object.fromEntries(
            PLUGIN_RUNTIME_SHIM_SPECIFIERS.map((s) => [s, buildPluginRuntimeShimPath(s)]),
        ) as Record<TPluginRuntimeShimSpecifier, string>,
    );
