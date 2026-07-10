/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
 */
import type {
    INavigationMenu,
    INavigationMenuItem,
    INavigationPayload,
    TNavigationChildrenNavMode,
} from './navigationPayload';
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
        icon: item.icon ?? null,
        mobile_icon: item.mobile_icon ?? null,
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
            const directChildren = located.parent
                ? menuVisibleChildItems(located.parent)
                : located.siblings.filter((sibling) => sibling.page != null && sibling.is_active !== false);
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

/** One breadcrumb step; group items produce unlinked crumbs (`pageId === null`). */
export interface IBreadcrumbEntry {
    label: string;
    pageId: number | null;
    keyword: string | null;
    url: string | null;
}

/**
 * Everything a web renderer needs to present the branch of the current page:
 * resolved presentation mode, the sidebar group, breadcrumbs, and the
 * prev/next pager. `null` when the page is a top-level leaf (no branch UI).
 */
export interface IBranchNavContext {
    /** `sidebar` | `pills` | `none` — parent-item override, else menu default, else `sidebar`. */
    mode: TNavigationChildrenNavMode;
    /** Menu-level toggle for the breadcrumb trail. */
    showBreadcrumbs: boolean;
    /** Prev/next pager — parent-item override, else menu default, else on. */
    showPager: boolean;
    /** Label of the branch parent (page or group), used as the sidebar heading. */
    heading: string | null;
    /** Branch parent as a navigable segment when the parent is a page. */
    parent: IBranchNavSegment | null;
    /** Ordered current-level group: children of the branch parent. */
    segments: IBranchNavSegment[];
    /** Menu path root → current page (current page is the last entry). */
    breadcrumbs: IBreadcrumbEntry[];
    /** Neighbours of the current page inside `segments`. */
    pager: { prev: IBranchNavSegment | null; next: IBranchNavSegment | null };
}

function findMenuItemPath(
    items: INavigationMenuItem[],
    pageId: number,
    trail: INavigationMenuItem[] = [],
): INavigationMenuItem[] | null {
    for (const item of items) {
        const nextTrail = [...trail, item];
        if (item.page?.id === pageId) {
            return nextTrail;
        }
        if (item.children?.length) {
            const found = findMenuItemPath(item.children, pageId, nextTrail);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

function toBreadcrumb(item: INavigationMenuItem): IBreadcrumbEntry {
    return {
        label: itemLabel(item),
        pageId: item.page?.id ?? null,
        keyword: item.page?.keyword ?? null,
        url: item.page?.url ?? null,
    };
}

function resolveModeForBranch(
    branchParent: INavigationMenuItem | null,
    menu: INavigationMenu,
): TNavigationChildrenNavMode {
    return branchParent?.children_nav ?? menu.children_nav ?? 'sidebar';
}

function resolvePagerForBranch(
    branchParent: INavigationMenuItem | null,
    menu: INavigationMenu,
): boolean {
    return branchParent?.show_pager ?? menu.show_pager ?? true;
}

/**
 * Resolve the full branch-navigation context of a web page: which presentation
 * to use (menu default + per-parent override), the sidebar group, breadcrumbs,
 * and prev/next neighbours.
 *
 * - Page with menu-visible children → the page is the branch parent, its
 *   children are the group (no pager: the parent is the overview).
 * - Nested page → the parent item owns the branch, the siblings are the group,
 *   the pager walks the group.
 * - Top-level leaf → `null` (no generated branch UI).
 */
export function resolveWebBranchNavContext(
    payload: INavigationPayload,
    currentPageId: number,
): IBranchNavContext | null {
    for (const key of ['web_header', 'web_footer'] as const) {
        const menu = payload.menus[key];
        if (!menu?.items?.length) {
            continue;
        }
        const path = findMenuItemPath(menu.items, currentPageId);
        if (!path) {
            continue;
        }

        const currentItem = path[path.length - 1];
        const ownChildren = menuVisibleChildItems(currentItem);

        let branchParent: INavigationMenuItem | null = null;
        let group: INavigationMenuItem[];
        if (ownChildren.length > 0) {
            branchParent = currentItem;
            group = ownChildren;
        } else if (path.length >= 2) {
            branchParent = path[path.length - 2];
            group = menuVisibleChildItems(branchParent);
        } else {
            // Top-level leaf: the header already covers this level.
            return null;
        }

        const segments = group
            .map(toSegment)
            .filter((segment): segment is IBranchNavSegment => segment != null);
        if (segments.length === 0) {
            return null;
        }

        const currentIndex = segments.findIndex((segment) => segment.pageId === currentPageId);
        const pager = {
            prev: currentIndex > 0 ? segments[currentIndex - 1] : null,
            next: currentIndex >= 0 && currentIndex < segments.length - 1 ? segments[currentIndex + 1] : null,
        };

        return {
            mode: resolveModeForBranch(branchParent, menu),
            showBreadcrumbs: menu.show_breadcrumbs ?? false,
            showPager: resolvePagerForBranch(branchParent, menu),
            heading: branchParent ? itemLabel(branchParent) : null,
            parent: branchParent ? toSegment(branchParent) : null,
            segments,
            breadcrumbs: path.map(toBreadcrumb),
            pager,
        };
    }

    return null;
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
