/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { INavigationMenuItem } from './navigationPayload';

export function getNavigationItemLabel(item: INavigationMenuItem): string {
    return item.label || item.page?.title || item.page?.keyword || '';
}

export function getNavigationItemAriaLabel(item: INavigationMenuItem): string | undefined {
    const label = getNavigationItemLabel(item);
    return label || undefined;
}

export function getNavigationItemHref(item: INavigationMenuItem): string {
    if (item.item_type === 'external_url' && item.external_url) {
        return item.external_url;
    }
    const page = item.page;
    if (!page) {
        return '#';
    }
    if (page.url) {
        return page.url;
    }
    return page.keyword === 'home' ? '/' : `/${page.keyword}`;
}

export function flattenNavigationMenuItems(items: INavigationMenuItem[]): INavigationMenuItem[] {
    const out: INavigationMenuItem[] = [];
    for (const item of items) {
        out.push(item);
        if (item.children?.length) {
            out.push(...flattenNavigationMenuItems(item.children));
        }
    }
    return out;
}

export function getNavigationItemKeyword(item: INavigationMenuItem): string | null {
    return item.page?.keyword ?? null;
}
