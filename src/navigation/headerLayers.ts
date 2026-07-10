/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Web header layer helpers for double-header presets.
 *
 * `web_header` root items carry `layer: 'top' | null` (`null` = main row).
 * Double presets render two rows; single presets ignore the layer and merge
 * every root item into one row. Layer assignments are data, never destroyed by
 * switching presets — switching back to a double preset restores the split.
 */
import type { INavigationMenuItem, TNavigationHeaderLayer } from './navigationPayload';

export const NAVIGATION_HEADER_LAYER_TOP: TNavigationHeaderLayer = 'top';

export interface IHeaderLayerSplit {
    /** Flat links for the top utility row (double presets only). */
    top: INavigationMenuItem[];
    /** Main navigation row items (preset-specific children rendering). */
    main: INavigationMenuItem[];
}

function byPosition(a: INavigationMenuItem, b: INavigationMenuItem): number {
    return a.position - b.position || a.id - b.id;
}

/**
 * Split root header items into top and main rows for double presets.
 * Top-row items are rendered as flat links; their children are ignored by design.
 */
export function splitHeaderLayers(items: INavigationMenuItem[]): IHeaderLayerSplit {
    const top: INavigationMenuItem[] = [];
    const main: INavigationMenuItem[] = [];
    for (const item of items) {
        if (item.layer === NAVIGATION_HEADER_LAYER_TOP) {
            top.push(item);
        } else {
            main.push(item);
        }
    }
    top.sort(byPosition);
    main.sort(byPosition);
    return { top, main };
}

/**
 * Merge root header items into one ordered row for single-layer presets:
 * main-row items first (position order), then top-row items appended
 * (position order). Deterministic and non-destructive — `layer` values stay
 * on the items so switching back to a double preset restores the split.
 */
export function mergeHeaderLayers(items: INavigationMenuItem[]): INavigationMenuItem[] {
    const { top, main } = splitHeaderLayers(items);
    return [...main, ...top];
}
