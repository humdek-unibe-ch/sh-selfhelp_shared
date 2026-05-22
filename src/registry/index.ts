/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { TStyleName } from '../types/styles/unknown';
import {
    BASE_STYLE_REGISTRY,
    getMergedStyleRegistry,
    getPluginStyleRegistry,
    type IPluginStyleRegistryEntry,
    type IStyleRegistryEntry,
} from './styles.registry';

export * from './styles.registry';

/**
 * Open style-name type: a core `TStyleName` literal OR any plugin style
 * name. The `string & {}` keeps autocomplete for core names while still
 * accepting plugin keys at type level.
 */
export type TAnyStyleName = TStyleName | (string & {});

/**
 * Helper for renderers: produces a typed map shape that requires every
 * core registry key to be implemented. Pass this to your dispatcher and
 * let TypeScript enforce 100% style coverage for core styles. Plugin
 * styles are dispatched through a separate `IPluginStyleImplMap`.
 *
 *   type IStyleImpls = TStyleImplMap<React.FC<{ style: TStyle }>>;
 *
 * `keyof TStyleImplMap<...>` is exactly the union of *core* style names.
 */
export type TStyleImplMap<TImpl> = {
    readonly [K in TStyleName]: TImpl;
};

/**
 * Runtime-extensible map: plugin-contributed style implementations
 * keyed by plugin style name. Renderers merge this with their
 * `TStyleImplMap<TImpl>` at boot.
 */
export type TPluginStyleImplMap<TImpl> = Record<string, TImpl>;

/**
 * Get an entry from the **core** registry. Returns undefined if the
 * `style_name` is not a known core style. Use `getRegistryEntryAny()`
 * to also resolve plugin styles.
 */
export function getRegistryEntry(name: string): IStyleRegistryEntry | undefined {
    if (Object.prototype.hasOwnProperty.call(BASE_STYLE_REGISTRY, name)) {
        return (BASE_STYLE_REGISTRY as Record<string, IStyleRegistryEntry>)[name];
    }
    return undefined;
}

/**
 * Get an entry from either the core or the plugin registry. Returns
 * undefined if the `style_name` is not registered (the renderer should
 * fall back to `UnknownStyle`).
 */
export function getRegistryEntryAny(
    name: string,
): IStyleRegistryEntry | IPluginStyleRegistryEntry | undefined {
    const merged = getMergedStyleRegistry();
    return merged[name];
}

/**
 * Type guard to narrow a string to `TStyleName` (core styles only).
 */
export function isKnownStyleName(name: string): name is TStyleName {
    return Object.prototype.hasOwnProperty.call(BASE_STYLE_REGISTRY, name);
}

/**
 * Type guard for any registered style — core or plugin.
 */
export function isRegisteredStyleName(name: string): boolean {
    if (Object.prototype.hasOwnProperty.call(BASE_STYLE_REGISTRY, name)) {
        return true;
    }
    return Object.prototype.hasOwnProperty.call(getPluginStyleRegistry(), name);
}

/**
 * For a known plugin style, return the owning `pluginId`. Useful for
 * mobile to construct the "Open on web" fallback link when the plugin
 * style is not bundled in the current build.
 */
export function getStylePluginId(name: string): string | undefined {
    const plugin = getPluginStyleRegistry()[name];
    return plugin?.pluginId;
}

