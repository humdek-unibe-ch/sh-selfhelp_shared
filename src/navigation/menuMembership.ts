/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { INavigationMenu, INavigationMenuItem, INavigationPayload, INavigationResolvedPageRef, TNavigationMenuKey } from './navigationPayload';

function flattenItems(items: INavigationMenuItem[]): INavigationMenuItem[] {
    const out: INavigationMenuItem[] = [];
    for (const item of items) {
        out.push(item);
        if (item.children?.length) {
            out.push(...flattenItems(item.children));
        }
    }
    return out;
}

export function collectPageIdsFromMenuItems(items: INavigationMenuItem[]): Set<number> {
    const ids = new Set<number>();
    for (const item of flattenItems(items)) {
        if (item.page?.id != null) {
            ids.add(item.page.id);
        }
    }
    return ids;
}

export function isPageInMenuTree(items: INavigationMenuItem[], pageId: number): boolean {
    return collectPageIdsFromMenuItems(items).has(pageId);
}

export function isPageInResolvedMenus(
    menus: Partial<Record<TNavigationMenuKey, INavigationMenu>>,
    menuKeys: TNavigationMenuKey[],
    pageId: number,
): boolean {
    for (const key of menuKeys) {
        const menu = menus[key];
        if (menu && isPageInMenuTree(menu.items, pageId)) {
            return true;
        }
    }
    return false;
}

export function isOnAnyMobileMenu(
    menus: Partial<Record<TNavigationMenuKey, INavigationMenu>>,
    pageId: number,
): boolean {
    return isPageInResolvedMenus(menus, ['mobile_drawer', 'mobile_bottom_tabs'], pageId);
}

export function findMenuItemByPageId(
    items: INavigationMenuItem[],
    pageId: number,
): INavigationMenuItem | null {
    for (const item of flattenItems(items)) {
        if (item.page?.id === pageId) {
            return item;
        }
    }
    return null;
}

/** Resolved page metadata from any public menu tree (for holder redirects, etc.). */
export function findPageRefInNavigationPayload(
    payload: INavigationPayload,
    pageId: number,
): INavigationResolvedPageRef | null {
    const menuKeys: TNavigationMenuKey[] = [
        'web_header',
        'web_footer',
        'mobile_drawer',
        'mobile_bottom_tabs',
    ];

    for (const key of menuKeys) {
        const menu = payload.menus[key];
        if (!menu?.items?.length) {
            continue;
        }
        const item = findMenuItemByPageId(menu.items, pageId);
        if (item?.page) {
            return item.page;
        }
    }

    return null;
}
