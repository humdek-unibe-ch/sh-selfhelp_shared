/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
 */
import type { INavigationMenuItem, INavigationPayload } from './navigationPayload';
import { collectPageIdsFromMenuItems } from './menuMembership';
import { pageUrlToMobileRoute } from './mobileRoute';

export interface IBranchNavSegment {
    pageId: number;
    keyword: string;
    url: string | null;
    label: string;
    icon?: string | null;
    mobile_icon?: string | null;
}

function itemLabel(item: INavigationMenuItem): string {
    return item.label || item.page?.title || item.page?.keyword || '';
}

function toSegment(item: INavigationMenuItem): IBranchNavSegment | null {
    if (!item.page) {
        return null;
    }
    return {
        pageId: item.page.id,
        keyword: item.page.keyword,
        url: item.page.url,
        label: itemLabel(item),
        icon: item.icon ?? item.page.icon,
        mobile_icon: item.page.mobile_icon,
    };
}

function findParentItem(
    items: INavigationMenuItem[],
    pageId: number,
    parent: INavigationMenuItem | null = null,
): { parent: INavigationMenuItem | null; siblings: INavigationMenuItem[] } | null {
    for (const item of items) {
        if (item.page?.id === pageId) {
            return { parent, siblings: items };
        }
        if (item.children?.length) {
            const found = findParentItem(item.children, pageId, item);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

function menuVisibleChildItems(item: INavigationMenuItem): INavigationMenuItem[] {
    return (item.children ?? []).filter((child) => child.page != null && child.is_active !== false);
}

function findMenuItemByPageId(
    items: INavigationMenuItem[],
    pageId: number,
): INavigationMenuItem | null {
    for (const item of items) {
        if (item.page?.id === pageId) {
            return item;
        }
        if (item.children?.length) {
            const nested = findMenuItemByPageId(item.children, pageId);
            if (nested) {
                return nested;
            }
        }
    }
    return null;
}

function selfSegment(item: INavigationMenuItem): IBranchNavSegment | null {
    return toSegment(item);
}

/**
 * Resolve the sibling/child segment group for in-page branch navigation.
 *
 * 1. If current page has menu-visible children in resolved menus → show children.
 * 2. Else if parent has menu-visible siblings → show sibling group.
 * 3. Else null.
 */
export function resolveBranchNavGroup(
    payload: INavigationPayload,
    currentPageId: number,
    menuKeys: Array<keyof INavigationPayload['menus']>,
): IBranchNavSegment[] | null {
    const allItems: INavigationMenuItem[] = [];
    for (const key of menuKeys) {
        const menu = payload.menus[key];
        if (menu?.items) {
            allItems.push(...menu.items);
        }
    }

    for (const root of allItems) {
        const selfChildren = menuVisibleChildItems(root);
        if (root.page?.id === currentPageId && selfChildren.length > 0) {
            const segments = selfChildren.map(toSegment).filter((s): s is IBranchNavSegment => s != null);
            return segments.length > 0 ? segments : null;
        }
        const located = findParentItem([root], currentPageId);
        if (located) {
            const directChildren = menuVisibleChildItems(
                located.parent ?? { id: 0, item_type: 'group', label: '', position: 0, children: located.siblings },
            );
            if (located.parent && located.parent.page?.id === currentPageId && directChildren.length > 0) {
                const segments = directChildren.map(toSegment).filter((s): s is IBranchNavSegment => s != null);
                return segments.length > 0 ? segments : null;
            }
            const siblings = located.siblings.filter((s) => s.page != null && s.is_active !== false);
            if (siblings.length > 1) {
                const segments = siblings.map(toSegment).filter((s): s is IBranchNavSegment => s != null);
                return segments.length > 0 ? segments : null;
            }
        }
    }

    return null;
}

export function resolveMobileSegmentGroup(
    payload: INavigationPayload,
    currentPageId: number,
): IBranchNavSegment[] | null {
    const allItems: INavigationMenuItem[] = [];
    for (const key of ['mobile_drawer', 'mobile_bottom_tabs'] as const) {
        const menu = payload.menus[key];
        if (menu?.items) {
            allItems.push(...menu.items);
        }
    }

    const currentItem = findMenuItemByPageId(allItems, currentPageId);
    if (currentItem) {
        const selfChildren = menuVisibleChildItems(currentItem);
        if (selfChildren.length > 0) {
            const childSegments = selfChildren
                .map(toSegment)
                .filter((segment): segment is IBranchNavSegment => segment != null);
            if (childSegments.length > 0) {
                if (currentItem.page?.has_content) {
                    const self = selfSegment(currentItem);
                    return self ? [self, ...childSegments] : childSegments;
                }
                return childSegments;
            }
        }
    }

    return resolveBranchNavGroup(payload, currentPageId, ['mobile_drawer', 'mobile_bottom_tabs']);
}

export function resolveWebBranchNavGroup(
    payload: INavigationPayload,
    currentPageId: number,
): IBranchNavSegment[] | null {
    return resolveBranchNavGroup(payload, currentPageId, ['web_header', 'web_footer']);
}

export type TMobilePagePresentation = 'route' | 'modal';

export function resolveMobilePagePresentation(
    payload: INavigationPayload,
    pageId: number,
): TMobilePagePresentation {
    return isOnAnyMobileMenuFromPayload(payload, pageId) ? 'route' : 'modal';
}

export function isOnAnyMobileMenuFromPayload(payload: INavigationPayload, pageId: number): boolean {
    const drawerIds = collectPageIdsFromMenuItems(payload.menus.mobile_drawer?.items ?? []);
    const tabIds = collectPageIdsFromMenuItems(payload.menus.mobile_bottom_tabs?.items ?? []);
    return drawerIds.has(pageId) || tabIds.has(pageId);
}

/**
 * When a page is a holder (no authored content) but has menu-visible children,
 * return the first child route to auto-select.
 */
export function resolveHolderRedirectPath(
    payload: INavigationPayload,
    currentPageId: number,
    platform: 'web' | 'mobile',
    hasContent: boolean,
): string | null {
    if (hasContent) {
        return null;
    }

    const segments = platform === 'mobile'
        ? resolveMobileSegmentGroup(payload, currentPageId)
        : resolveWebBranchNavGroup(payload, currentPageId);
    if (!segments || segments.length === 0) {
        return null;
    }

    const target = segments.find((segment) => segment.pageId !== currentPageId) ?? segments[0];
    if (target.pageId === currentPageId) {
        return null;
    }

    if (platform === 'mobile') {
        return pageUrlToMobileRoute(target.url, target.keyword);
    }

    if (target.url && target.url !== '') {
        return target.url.startsWith('/') ? target.url : `/${target.url}`;
    }

    return target.keyword === 'home' ? '/' : `/${target.keyword}`;
}

/**
 * Returns the top-level bottom-tab item that owns a nested page, if any.
 */
export function findNearestBottomTabMenuItemForPage(
    tabs: INavigationMenuItem[],
    pageId: number,
): INavigationMenuItem | null {
    for (const tab of tabs) {
        if (tab.page?.id === pageId) {
            return tab;
        }
        if (findMenuItemByPageId(tab.children ?? [], pageId)) {
            return tab;
        }
    }

    return null;
}

function navigationPathMatches(item: INavigationMenuItem, pathname: string): boolean {
    const href = pageUrlToMobileRoute(item.page?.url ?? null, item.page?.keyword ?? '');
    if (pathname === href) {
        return true;
    }
    if (href !== '/' && pathname.startsWith(`${href}/`)) {
        return true;
    }

    return false;
}

/**
 * Active state for a flat bottom-tab item, including descendants on the current path.
 */
export function isBottomTabMenuItemActive(item: INavigationMenuItem, pathname: string): boolean {
    if (navigationPathMatches(item, pathname)) {
        return true;
    }

    return (item.children ?? []).some(
        (child) => navigationPathMatches(child, pathname)
            || isBottomTabMenuItemActive(child, pathname),
    );
}
