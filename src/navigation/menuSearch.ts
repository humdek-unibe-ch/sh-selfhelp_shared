/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { INavigationMenuItem, INavigationPayload } from './navigationPayload';
import { flattenMenuItems } from './menuVisibility';
import { getNavigationItemHref, getNavigationItemLabel } from './navLinks';

export interface IMenuSearchHit {
    page_id: number;
    keyword: string;
    url: string | null;
    title: string;
}

function haystacksForItem(item: INavigationMenuItem): string[] {
    const page = item.page;
    const label = getNavigationItemLabel(item);
    const values = [label];
    if (page) {
        values.push(page.title ?? '', page.keyword ?? '', page.url ?? '');
    }
    return values.map((value) => value.trim().toLowerCase()).filter((value) => value !== '');
}

/**
 * Client-side search over resolved menu trees (`menu_pages` search mode).
 */
export function searchMenuPagesInPayload(
    payload: INavigationPayload,
    query: string,
    limit = 8,
): IMenuSearchHit[] {
    const needle = query.trim().toLowerCase();
    if (needle === '') {
        return [];
    }

    const hits: IMenuSearchHit[] = [];
    const seen = new Set<number>();

    for (const menu of Object.values(payload.menus)) {
        if (!menu?.items?.length) {
            continue;
        }
        for (const item of flattenMenuItems(menu.items)) {
            if (!item.page || seen.has(item.page.id)) {
                continue;
            }
            const matched = haystacksForItem(item).some((haystack) => haystack.includes(needle));
            if (!matched) {
                continue;
            }
            seen.add(item.page.id);
            hits.push({
                page_id: item.page.id,
                keyword: item.page.keyword,
                url: getNavigationItemHref(item),
                title: getNavigationItemLabel(item),
            });
            if (hits.length >= limit) {
                return hits;
            }
        }
    }

    return hits;
}
