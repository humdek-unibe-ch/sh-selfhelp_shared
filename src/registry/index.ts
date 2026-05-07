/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { TStyleName } from '../types/styles/unknown';
import { STYLE_REGISTRY } from './styles.registry';

export * from './styles.registry';

/**
 * Helper for renderers: produces a typed map shape that requires every
 * registry key to be implemented. Pass this to your dispatcher and let
 * TypeScript enforce 100% style coverage.
 *
 *   type IStyleImpls = TStyleImplMap<React.FC<{ style: TStyle }>>;
 *
 * `keyof TStyleImplMap<...>` is exactly the union of style names.
 */
export type TStyleImplMap<TImpl> = {
    readonly [K in TStyleName]: TImpl;
};

/**
 * Get an entry from the registry safely. Returns undefined if the
 * style_name isn't registered (the renderer should fall back to
 * UnknownStyle).
 */
export function getRegistryEntry(name: string): (typeof STYLE_REGISTRY)[TStyleName] | undefined {
    return (STYLE_REGISTRY as Record<string, (typeof STYLE_REGISTRY)[TStyleName]>)[name];
}

/**
 * Type guard to narrow a string to TStyleName.
 */
export function isKnownStyleName(name: string): name is TStyleName {
    return Object.prototype.hasOwnProperty.call(STYLE_REGISTRY, name);
}
