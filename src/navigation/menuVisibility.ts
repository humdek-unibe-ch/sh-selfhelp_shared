/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Menu visibility helpers for the menu-builder model.
 */

import type { INavigationMenuItem, INavigationPayload, TNavigationMenuKey } from './navigationPayload';
import { isPageInResolvedMenus } from './menuMembership';

const WEB_MENU_KEYS: TNavigationMenuKey[] = ['web_header', 'web_footer'];
const MOBILE_MENU_KEYS: TNavigationMenuKey[] = ['mobile_drawer', 'mobile_bottom_tabs'];
const ALL_MENU_KEYS: TNavigationMenuKey[] = [...WEB_MENU_KEYS, ...MOBILE_MENU_KEYS];

export function isPageOnAnyMenu(payload: INavigationPayload, pageId: number): boolean {
    return isPageInResolvedMenus(payload.menus, ALL_MENU_KEYS, pageId);
}

export function isPageOnWebMenu(payload: INavigationPayload, pageId: number): boolean {
    return isPageInResolvedMenus(payload.menus, WEB_MENU_KEYS, pageId);
}

export function isPageOnMobileMenu(payload: INavigationPayload, pageId: number): boolean {
    return isPageInResolvedMenus(payload.menus, MOBILE_MENU_KEYS, pageId);
}

export function flattenMenuItems(items: INavigationMenuItem[]): INavigationMenuItem[] {
    const out: INavigationMenuItem[] = [];
    for (const item of items) {
        out.push(item);
        if (item.children?.length) {
            out.push(...flattenMenuItems(item.children));
        }
    }
    return out;
}
