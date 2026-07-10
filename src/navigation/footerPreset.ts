/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Global web footer presentation presets (menu-builder `web_footer` menu).
 *
 * Footer layout uses the same preset mechanism as the web header: the value is
 * stored on `navigation_menus.id_preset` and switching presets never mutates
 * menu items — `inline` flattens groups at render time only, so switching back
 * to `columns` restores the exact same groups.
 */
import type { INavigationMenuItem } from './navigationPayload';

export type TWebFooterPreset = 'columns' | 'inline';

export const WEB_FOOTER_PRESET_VALUES: readonly TWebFooterPreset[] = [
    'columns',
    'inline',
] as const;

export const DEFAULT_WEB_FOOTER_PRESET: TWebFooterPreset = 'columns';

export interface IWebFooterPresetOption {
    value: TWebFooterPreset;
    label: string;
    description: string;
}

export const WEB_FOOTER_PRESET_OPTIONS: readonly IWebFooterPresetOption[] = [
    {
        value: 'columns',
        label: 'Columns (grouped)',
        description: 'Group headings become footer columns with their links below.',
    },
    {
        value: 'inline',
        label: 'Inline links',
        description: 'One flat centered link row; group links are shown inline, headings hidden. Groups are kept and restored when switching back.',
    },
] as const;

export function isWebFooterPreset(value: unknown): value is TWebFooterPreset {
    return typeof value === 'string' && (WEB_FOOTER_PRESET_VALUES as readonly string[]).includes(value);
}

export function resolveWebFooterPreset(
    value: unknown,
    fallback: TWebFooterPreset = DEFAULT_WEB_FOOTER_PRESET,
): TWebFooterPreset {
    return isWebFooterPreset(value) ? value : fallback;
}

function isRenderableFooterLeaf(item: INavigationMenuItem): boolean {
    if (!item.is_active) {
        return false;
    }
    if (item.item_type === 'external_url') {
        return item.external_url != null && item.external_url !== '';
    }
    return item.item_type === 'page' && item.page != null;
}

/**
 * Flatten a footer tree for the `inline` preset: active page/external links are
 * kept in order, group children are promoted in place of their heading, and
 * inactive items or empty groups are dropped. Data is never mutated.
 */
export function flattenFooterItems(items: INavigationMenuItem[]): INavigationMenuItem[] {
    const out: INavigationMenuItem[] = [];
    for (const item of items) {
        if (!item.is_active) {
            continue;
        }
        if (item.item_type === 'group') {
            out.push(...flattenFooterItems(item.children));
            continue;
        }
        if (isRenderableFooterLeaf(item)) {
            out.push(item);
            // Non-group items may still carry nested links; promote them too.
            out.push(...flattenFooterItems(item.children));
        }
    }
    return out;
}

/**
 * Footer columns for the `columns` preset: top-level groups that contain at
 * least one renderable link. Standalone (non-group) top-level links are not
 * columns — render them separately via {@link footerStandaloneItems}.
 */
export function footerColumnItems(items: INavigationMenuItem[]): INavigationMenuItem[] {
    return items.filter(
        (item) => item.is_active
            && item.item_type === 'group'
            && item.children.some(isRenderableFooterLeaf),
    );
}

/** Active top-level non-group links (rendered as a trailing meta row in `columns` mode). */
export function footerStandaloneItems(items: INavigationMenuItem[]): INavigationMenuItem[] {
    return items.filter((item) => item.item_type !== 'group' && isRenderableFooterLeaf(item));
}

/** Renderable links inside one footer column/group. */
export function footerGroupLinks(group: INavigationMenuItem): INavigationMenuItem[] {
    return group.children.filter(isRenderableFooterLeaf);
}
