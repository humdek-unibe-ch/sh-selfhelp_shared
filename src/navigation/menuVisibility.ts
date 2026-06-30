/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * The single "is this page on the menu?" predicate, shared by web + mobile menu
 * renderers AND by the automatic virtual-navigation decision. A page is on the
 * menu when the author placed it there (`navPosition != null`) and it is not a
 * headless content-only fragment.
 *
 * Footer-only pages (`footerPosition != null && navPosition == null`), headless
 * pages, and ACL-pruned pages (never in the tree to begin with) are NOT menu
 * pages, so they never appear in a navigation block.
 */

import type { IPageItem } from '../types/pages';

export function isMenuVisible(page: Pick<IPageItem, 'is_headless' | 'navPosition'>): boolean {
    if (page.is_headless) return false;
    return page.navPosition !== null && page.navPosition !== undefined;
}

/** Children of `page` that should appear in a navigation block, in nav order. */
export function getMenuVisibleChildren(page: IPageItem): IPageItem[] {
    const children = page.children ?? [];
    return children
        .filter(isMenuVisible)
        .sort((a, b) => (a.navPosition ?? 0) - (b.navPosition ?? 0));
}

/**
 * A "navigation page" is a page whose children act as its menu. The hybrid
 * auto-render rule additionally requires the page to have no visible body
 * sections (decided by the caller, which has the resolved page content).
 */
export function isNavigationPage(page: IPageItem): boolean {
    return getMenuVisibleChildren(page).length > 0;
}
