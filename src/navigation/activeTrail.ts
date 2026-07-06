/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Single active-state/active-trail implementation for every menu renderer:
 * web burger drawer, mobile drawer, and mobile bottom tabs all resolve
 * "is this item (or one of its descendants) the current page?" here.
 */
import type { INavigationMenuItem } from './navigationPayload';
import { getNavigationItemHref } from './navLinks';
import { pageUrlToMobileRoute } from './mobileRoute';

/** Expo Router href for a resolved menu item (mobile keyword routes). */
export function getNavigationItemMobileHref(item: INavigationMenuItem): string {
    if (item.item_type === 'external_url' && item.external_url) {
        return item.external_url;
    }
    if (!item.page) {
        return '/index';
    }
    return pageUrlToMobileRoute(item.page.url, item.page.keyword);
}

/** Web pathname match: exact or a nested path under the item href. */
export function matchesWebPath(href: string, pathname: string): boolean {
    if (href === '' || href === '#') {
        return false;
    }
    if (pathname === href) {
        return true;
    }
    return href !== '/' && pathname.startsWith(`${href}/`);
}

/** Mobile pathname match: exact, `/index` root aliases, or nested path. */
export function matchesMobilePath(href: string, pathname: string): boolean {
    if (pathname === href) {
        return true;
    }
    if (href === '/index' && (pathname === '' || pathname === '/' || pathname === '/index')) {
        return true;
    }
    return href !== '/' && pathname.startsWith(`${href}/`);
}

function isActive(
    item: INavigationMenuItem,
    pathname: string,
    getHref: (item: INavigationMenuItem) => string,
    matches: (href: string, pathname: string) => boolean,
): boolean {
    if (matches(getHref(item), pathname)) {
        return true;
    }
    return item.children.some((child) => isActive(child, pathname, getHref, matches));
}

/** True when the item or any descendant matches the current web pathname. */
export function isMenuItemActiveOnWeb(item: INavigationMenuItem, pathname: string): boolean {
    return isActive(item, pathname, getNavigationItemHref, matchesWebPath);
}

/** True when the item or any descendant matches the current mobile pathname. */
export function isMenuItemActiveOnMobile(item: INavigationMenuItem, pathname: string): boolean {
    return isActive(item, pathname, getNavigationItemMobileHref, matchesMobilePath);
}

/**
 * Ids of every item whose subtree contains the active page — the set of
 * parents a collapsible drawer should auto-expand for the current route.
 */
export function expandedIdsForActiveTrail(
    items: INavigationMenuItem[],
    pathname: string,
    platform: 'web' | 'mobile',
): Set<number> {
    const getHref = platform === 'mobile' ? getNavigationItemMobileHref : getNavigationItemHref;
    const matches = platform === 'mobile' ? matchesMobilePath : matchesWebPath;
    const expanded = new Set<number>();

    const visit = (item: INavigationMenuItem): boolean => {
        let childActive = false;
        for (const child of item.children) {
            if (visit(child)) {
                childActive = true;
            }
        }
        if (childActive) {
            expanded.add(item.id);
        }
        return childActive || matches(getHref(item), pathname);
    };

    for (const item of items) {
        visit(item);
    }
    return expanded;
}
