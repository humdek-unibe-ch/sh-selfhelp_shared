/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, it, expect } from 'vitest';
import type { INavigationMenuItem, INavigationPayload } from '../navigationPayload';
import {
    getNavigationItemHref,
    getNavigationItemLabel,
    flattenNavigationMenuItems,
} from '../navLinks';
import { pageUrlToMobileRoute } from '../mobileRoute';
import {
    DEFAULT_WEB_HEADER_PRESET,
    isWebHeaderPreset,
    resolveWebHeaderPreset,
    WEB_HEADER_PRESET_VALUES,
} from '../headerPreset';
import { DEFAULT_MOBILE_ICON, isMobileIconName, MOBILE_ICON_SET, resolveMobileIcon } from '../mobileIcons';
import {
    flattenMenuItems,
    isPageOnMobileMenu,
    isPageOnWebMenu,
} from '../menuVisibility';
import { findPageRefInNavigationPayload } from '../menuMembership';
import {
    findNearestBottomTabMenuItemForPage,
    isBottomTabMenuItemActive,
    resolveHolderRedirectPath,
    resolveMobileSegmentGroup,
    resolveWebBranchNavGroup,
} from '../branchNav';
import { searchMenuPagesInPayload } from '../menuSearch';

function menuItem(partial: Partial<INavigationMenuItem>): INavigationMenuItem {
    return {
        id: 1,
        item_type: 'page',
        label: 'Team',
        position: 10,
        page: {
            id: 9,
            keyword: 'team',
            url: '/team',
            title: 'Team',
        },
        ...partial,
    };
}

describe('navLinks', () => {
    it('builds href from page url', () => {
        expect(getNavigationItemHref(menuItem({}))).toBe('/team');
        expect(getNavigationItemHref(menuItem({ page: { id: 1, keyword: 'home', url: '/', title: 'Home' } }))).toBe('/');
    });

    it('flattens nested menu items', () => {
        const root = menuItem({
            children: [menuItem({ id: 2, label: 'Child' })],
        });
        expect(flattenNavigationMenuItems([root])).toHaveLength(2);
        expect(getNavigationItemLabel(menuItem({ label: '', page: { id: 1, keyword: 'x', url: null, title: 'T' } }))).toBe('T');
    });
});

describe('mobileRoute', () => {
    it('maps canonical urls to expo keyword routes', () => {
        expect(pageUrlToMobileRoute('/', 'home')).toBe('/index');
        expect(pageUrlToMobileRoute('/about', 'about')).toBe('/about');
        expect(pageUrlToMobileRoute('/parent/child', 'child')).toBe('/child');
        expect(pageUrlToMobileRoute(null, 'profile')).toBe('/profile');
    });
});

describe('headerPreset', () => {
    it('validates and resolves web header presets', () => {
        expect(isWebHeaderPreset('dropdown')).toBe(true);
        expect(isWebHeaderPreset('nope')).toBe(false);
        expect(resolveWebHeaderPreset('mega-menu')).toBe('mega-menu');
        expect(resolveWebHeaderPreset(null)).toBe(DEFAULT_WEB_HEADER_PRESET);
        expect(WEB_HEADER_PRESET_VALUES).toContain('double-dropdown');
    });
});

describe('mobileIcons', () => {
    it('exposes a non-empty curated set with unique names', () => {
        expect(MOBILE_ICON_SET.length).toBeGreaterThan(10);
        const names = MOBILE_ICON_SET.map((entry) => entry.name);
        expect(new Set(names).size).toBe(names.length);
    });

    it('validates and resolves icon names with a default fallback', () => {
        expect(isMobileIconName('House')).toBe(true);
        expect(isMobileIconName('NotAnIcon')).toBe(false);
        expect(resolveMobileIcon('Users')).toBe('Users');
        expect(resolveMobileIcon('NotAnIcon')).toBe(DEFAULT_MOBILE_ICON);
        expect(resolveMobileIcon(null)).toBe(DEFAULT_MOBILE_ICON);
    });
});

function navigationPayload(items: INavigationMenuItem[]): INavigationPayload {
    return {
        menus: {
            web_header: { key: 'web_header', platform: 'web', surface: 'header', items },
            web_footer: { key: 'web_footer', platform: 'web', surface: 'footer', items: [] },
            mobile_drawer: { key: 'mobile_drawer', platform: 'mobile', surface: 'drawer', items },
            mobile_bottom_tabs: { key: 'mobile_bottom_tabs', platform: 'mobile', surface: 'bottom_tabs', items: [] },
        },
        startup: {
            web_guest_start_page: { keyword: 'home', url: '/', title: 'Home' },
            web_user_start_page: { keyword: 'home', url: '/', title: 'Home' },
            web_user_start_mode: 'fixed_page',
            mobile_guest_start_page: { keyword: 'home', url: '/', title: 'Home' },
            mobile_user_start_page: { keyword: 'home', url: '/', title: 'Home' },
            mobile_user_start_mode: 'fixed_page',
            mobile_start_page_source: 'same_as_web',
        },
        search: {
            mode: 'content_index',
            min_chars: 2,
            result_limit: 8,
            default_visibility: 'all_accessible_pages',
            field_policy: 'all_display_text',
        },
    };
}

describe('menu membership + branch nav', () => {
    const parent = menuItem({
        id: 10,
        page: { id: 100, keyword: 'parent', url: '/parent', title: 'Parent' },
        children: [
            menuItem({ id: 11, page: { id: 101, keyword: 'child-a', url: '/parent/child-a', title: 'A' } }),
            menuItem({ id: 12, page: { id: 102, keyword: 'child-b', url: '/parent/child-b', title: 'B' } }),
        ],
    });

    it('detects page membership in resolved menus', () => {
        const payload = navigationPayload([parent]);
        expect(isPageOnWebMenu(payload, 100)).toBe(true);
        expect(isPageOnWebMenu(payload, 999)).toBe(false);
        expect(isPageOnMobileMenu(payload, 101)).toBe(true);
    });

    it('resolves child segment group for branch navigation', () => {
        const payload = navigationPayload([parent]);
        const segments = resolveWebBranchNavGroup(payload, 100);
        expect(segments?.map((s) => s.keyword)).toEqual(['child-a', 'child-b']);
    });

    it('redirects holder pages to the first menu-visible child', () => {
        const payload = navigationPayload([parent]);
        expect(resolveHolderRedirectPath(payload, 100, 'web', false)).toBe('/parent/child-a');
        expect(resolveHolderRedirectPath(payload, 100, 'web', true)).toBeNull();
    });

    it('flattens menu items for admin helpers', () => {
        expect(flattenMenuItems([parent])).toHaveLength(3);
    });
});

describe('mobile segment group', () => {
    it('prepends self segment when tab page has content and children', () => {
        const payload = navigationPayload([
            menuItem({
                id: 1,
                page: { id: 5, keyword: 'root', url: '/root', title: 'Root', has_content: true },
                children: [
                    menuItem({
                        id: 2,
                        page: { id: 6, keyword: 'one', url: '/root/one', title: 'One' },
                    }),
                    menuItem({
                        id: 3,
                        page: { id: 7, keyword: 'two', url: '/root/two', title: 'Two' },
                    }),
                ],
            }),
        ]);
        const segments = resolveMobileSegmentGroup(payload, 5);
        expect(segments?.map((s) => s.keyword)).toEqual(['root', 'one', 'two']);
    });
});

describe('menu search', () => {
    it('filters resolved menu pages client-side', () => {
        const payload = navigationPayload([
            menuItem({
                id: 1,
                page: { id: 10, keyword: 'about', url: '/about', title: 'About us' },
            }),
        ]);
        const hits = searchMenuPagesInPayload(payload, 'about');
        expect(hits).toHaveLength(1);
        expect(hits[0]?.keyword).toBe('about');
    });

    it('honours payload.search.min_chars before returning hits', () => {
        const payload = navigationPayload([
            menuItem({
                id: 1,
                page: { id: 10, keyword: 'about', url: '/about', title: 'About us' },
            }),
        ]);
        payload.search.min_chars = 4;

        expect(searchMenuPagesInPayload(payload, 'abo')).toHaveLength(0);
        expect(searchMenuPagesInPayload(payload, 'about')).toHaveLength(1);
    });
});

describe('page ref lookup', () => {
    it('finds resolved page metadata across menu trees', () => {
        const payload = navigationPayload([
            menuItem({
                id: 1,
                page: { id: 42, keyword: 'team', url: '/team', title: 'Team', has_content: false },
            }),
        ]);
        const ref = findPageRefInNavigationPayload(payload, 42);
        expect(ref?.keyword).toBe('team');
        expect(ref?.has_content).toBe(false);
    });
});

describe('legacy nav-render exports', () => {
    it('does not export removed web/mobile nav render option lists', async () => {
        const mod = await import('../../index');
        expect('WEB_NAV_RENDER_OPTIONS' in mod).toBe(false);
        expect('MOBILE_NAV_RENDER_OPTIONS' in mod).toBe(false);
        expect('TWebNavRender' in mod).toBe(false);
        expect('TMobileNavRender' in mod).toBe(false);
    });
});

describe('bottom tab active state', () => {
    it('marks the nearest ancestor tab active for nested paths', () => {
        const tabs = [
            menuItem({
                id: 1,
                page: { id: 10, keyword: 'team', url: '/team', title: 'Team' },
                children: [
                    menuItem({
                        id: 2,
                        page: { id: 11, keyword: 'alice', url: '/team/alice', title: 'Alice' },
                    }),
                ],
            }),
        ];
        expect(findNearestBottomTabMenuItemForPage(tabs, 11)?.page?.keyword).toBe('team');
        expect(isBottomTabMenuItemActive(tabs[0], '/alice')).toBe(true);
        expect(isBottomTabMenuItemActive(tabs[0], '/team')).toBe(true);
        expect(isBottomTabMenuItemActive(tabs[0], '/other')).toBe(false);
    });
});
