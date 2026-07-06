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
    isDoubleWebHeaderPreset,
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
    resolveWebBranchNavContext,
    resolveWebBranchNavGroup,
} from '../branchNav';
import { searchMenuPagesInPayload } from '../menuSearch';
import { clampMenuItemsAtDepth, resolveMenuMaxDepth } from '../menuDepth';
import { mergeHeaderLayers, splitHeaderLayers } from '../headerLayers';
import {
    DEFAULT_WEB_FOOTER_PRESET,
    flattenFooterItems,
    footerColumnItems,
    footerGroupLinks,
    footerStandaloneItems,
    isWebFooterPreset,
    resolveWebFooterPreset,
} from '../footerPreset';
import {
    expandedIdsForActiveTrail,
    getNavigationItemMobileHref,
    isMenuItemActiveOnMobile,
    isMenuItemActiveOnWeb,
} from '../activeTrail';
import {
    NAVIGATION_BUNDLE_VERSION,
    isNavigationBundleVersionSupported,
} from '../navigationBundle';

function menuItem(partial: Partial<INavigationMenuItem>): INavigationMenuItem {
    return {
        id: 1,
        item_type: 'page',
        label: 'Team',
        description: null,
        aria_label: null,
        icon: null,
        mobile_icon: null,
        position: 10,
        layer: null,
        children_nav: null,
        external_url: null,
        page: {
            id: 9,
            keyword: 'team',
            url: '/team',
            title: 'Team',
        },
        is_active: true,
        children: [],
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
            web_header: { key: 'web_header', platform: 'web', surface: 'header', preset: 'dropdown', max_depth: 2, item_limit: null, children_nav: 'sidebar', show_breadcrumbs: true, items },
            web_footer: { key: 'web_footer', platform: 'web', surface: 'footer', preset: 'columns', max_depth: 2, item_limit: null, children_nav: 'sidebar', show_breadcrumbs: true, items: [] },
            mobile_drawer: { key: 'mobile_drawer', platform: 'mobile', surface: 'drawer', preset: null, max_depth: 2, item_limit: null, children_nav: null, show_breadcrumbs: false, items },
            mobile_bottom_tabs: { key: 'mobile_bottom_tabs', platform: 'mobile', surface: 'bottom_tabs', preset: null, max_depth: 2, item_limit: 5, children_nav: null, show_breadcrumbs: false, items: [] },
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

describe('web branch nav context (sidebar + breadcrumbs + pager)', () => {
    const branchParent = menuItem({
        id: 10,
        label: 'Modules',
        page: { id: 100, keyword: 'parent', url: '/parent', title: 'Modules' },
        children: [
            menuItem({ id: 11, label: 'Module 1', page: { id: 101, keyword: 'child-a', url: '/parent/child-a', title: 'Module 1' } }),
            menuItem({ id: 12, label: 'Module 2', page: { id: 102, keyword: 'child-b', url: '/parent/child-b', title: 'Module 2' } }),
        ],
    });
    const topLevelLeaf = menuItem({
        id: 20,
        page: { id: 200, keyword: 'contact', url: '/contact', title: 'Contact' },
    });

    it('builds sibling group, breadcrumbs and pager for a nested page', () => {
        const payload = navigationPayload([branchParent, topLevelLeaf]);
        const context = resolveWebBranchNavContext(payload, 101);
        expect(context).not.toBeNull();
        expect(context?.mode).toBe('sidebar');
        expect(context?.showBreadcrumbs).toBe(true);
        expect(context?.heading).toBe('Modules');
        expect(context?.parent?.pageId).toBe(100);
        expect(context?.segments.map((s) => s.keyword)).toEqual(['child-a', 'child-b']);
        expect(context?.breadcrumbs.map((b) => b.label)).toEqual(['Modules', 'Module 1']);
        expect(context?.pager.prev).toBeNull();
        expect(context?.pager.next?.keyword).toBe('child-b');
    });

    it('walks the pager from the middle of the group', () => {
        const payload = navigationPayload([branchParent]);
        const context = resolveWebBranchNavContext(payload, 102);
        expect(context?.pager.prev?.keyword).toBe('child-a');
        expect(context?.pager.next).toBeNull();
    });

    it('treats a page with children as the branch parent (overview, no pager)', () => {
        const payload = navigationPayload([branchParent]);
        const context = resolveWebBranchNavContext(payload, 100);
        expect(context?.heading).toBe('Modules');
        expect(context?.segments.map((s) => s.keyword)).toEqual(['child-a', 'child-b']);
        expect(context?.breadcrumbs.map((b) => b.label)).toEqual(['Modules']);
        expect(context?.pager.prev).toBeNull();
        expect(context?.pager.next).toBeNull();
    });

    it('returns null for a top-level leaf (header already covers it)', () => {
        const payload = navigationPayload([branchParent, topLevelLeaf]);
        expect(resolveWebBranchNavContext(payload, 200)).toBeNull();
    });

    it('honours the per-parent children_nav override above the menu default', () => {
        const overridden = { ...branchParent, children_nav: 'none' as const };
        const payload = navigationPayload([overridden]);
        const context = resolveWebBranchNavContext(payload, 101);
        expect(context?.mode).toBe('none');

        // Menu default applies when the parent has no override.
        const fallbackPayload = navigationPayload([branchParent]);
        fallbackPayload.menus.web_header.children_nav = 'pills';
        const fallback = resolveWebBranchNavContext(fallbackPayload, 101);
        expect(fallback?.mode).toBe('pills');
    });

    it('surfaces grandchild breadcrumbs through the full path', () => {
        const deepTree = menuItem({
            id: 30,
            label: 'Modules',
            page: { id: 300, keyword: 'modules', url: '/modules', title: 'Modules' },
            children: [
                menuItem({
                    id: 31,
                    label: 'Module 1',
                    page: { id: 301, keyword: 'module-1', url: '/modules/module-1', title: 'Module 1' },
                    children: [
                        menuItem({
                            id: 32,
                            label: 'Lesson A',
                            page: { id: 302, keyword: 'lesson-a', url: '/modules/module-1/lesson-a', title: 'Lesson A' },
                        }),
                    ],
                }),
            ],
        });
        const payload = navigationPayload([deepTree]);
        const context = resolveWebBranchNavContext(payload, 302);
        expect(context?.breadcrumbs.map((b) => b.label)).toEqual(['Modules', 'Module 1', 'Lesson A']);
        expect(context?.heading).toBe('Module 1');
        expect(context?.segments.map((s) => s.keyword)).toEqual(['lesson-a']);
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

describe('menu depth helpers', () => {
    it('treats null/zero max depth as unlimited', () => {
        expect(resolveMenuMaxDepth(null)).toBeNull();
        expect(resolveMenuMaxDepth(0)).toBeNull();
        expect(resolveMenuMaxDepth(2)).toBe(2);
    });

    it('strips nested children beyond max depth', () => {
        const nested = menuItem({
            id: 1,
            children: [
                menuItem({
                    id: 2,
                    children: [menuItem({ id: 3 })],
                }),
            ],
        });
        const clamped = clampMenuItemsAtDepth([nested], 1);
        expect(clamped[0]?.children?.length).toBe(1);
        expect(clamped[0]?.children?.[0]?.children?.length).toBe(0);
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

describe('header layers', () => {
    const topContact = menuItem({
        id: 1,
        layer: 'top',
        position: 20,
        page: { id: 101, keyword: 'contact', url: '/contact', title: 'Contact' },
    });
    const topAbout = menuItem({
        id: 2,
        layer: 'top',
        position: 10,
        page: { id: 102, keyword: 'about', url: '/about', title: 'About' },
    });
    const mainHome = menuItem({
        id: 3,
        position: 10,
        page: { id: 103, keyword: 'home', url: '/', title: 'Home' },
    });
    const mainServices = menuItem({
        id: 4,
        position: 20,
        page: { id: 104, keyword: 'services', url: '/services', title: 'Services' },
    });

    it('splits root items into position-ordered top and main rows', () => {
        const { top, main } = splitHeaderLayers([topContact, mainServices, topAbout, mainHome]);
        expect(top.map((i) => i.id)).toEqual([2, 1]);
        expect(main.map((i) => i.id)).toEqual([3, 4]);
    });

    it('merges for single presets: main row first, then top row appended', () => {
        const merged = mergeHeaderLayers([topContact, mainServices, topAbout, mainHome]);
        expect(merged.map((i) => i.id)).toEqual([3, 4, 2, 1]);
    });

    it('detects double header presets', () => {
        expect(isDoubleWebHeaderPreset('double-dropdown')).toBe(true);
        expect(isDoubleWebHeaderPreset('double-mega-menu')).toBe(true);
        expect(isDoubleWebHeaderPreset('dropdown')).toBe(false);
        expect(isDoubleWebHeaderPreset(null)).toBe(false);
    });
});

describe('footer presets', () => {
    const group = menuItem({
        id: 1,
        item_type: 'group',
        label: 'Company',
        page: null,
        children: [
            menuItem({ id: 2, page: { id: 201, keyword: 'about', url: '/about', title: 'About' } }),
            menuItem({ id: 3, is_active: false, page: { id: 202, keyword: 'hidden', url: '/hidden', title: 'Hidden' } }),
            menuItem({ id: 4, item_type: 'external_url', page: null, external_url: 'https://example.org' }),
        ],
    });
    const emptyGroup = menuItem({ id: 5, item_type: 'group', label: 'Empty', page: null, children: [] });
    const standalone = menuItem({ id: 6, page: { id: 203, keyword: 'imprint', url: '/imprint', title: 'Imprint' } });

    it('validates and resolves footer presets', () => {
        expect(isWebFooterPreset('columns')).toBe(true);
        expect(isWebFooterPreset('inline')).toBe(true);
        expect(isWebFooterPreset('grid')).toBe(false);
        expect(resolveWebFooterPreset(null)).toBe(DEFAULT_WEB_FOOTER_PRESET);
        expect(resolveWebFooterPreset('inline')).toBe('inline');
    });

    it('selects renderable columns and standalone links for the columns preset', () => {
        const items = [group, emptyGroup, standalone];
        expect(footerColumnItems(items).map((i) => i.id)).toEqual([1]);
        expect(footerStandaloneItems(items).map((i) => i.id)).toEqual([6]);
        expect(footerGroupLinks(group).map((i) => i.id)).toEqual([2, 4]);
    });

    it('flattens groups for the inline preset without mutating data', () => {
        const items = [group, emptyGroup, standalone];
        const flat = flattenFooterItems(items);
        expect(flat.map((i) => i.id)).toEqual([2, 4, 6]);
        expect(group.children).toHaveLength(3);
    });
});

describe('active trail', () => {
    const drawer = [
        menuItem({
            id: 1,
            page: { id: 301, keyword: 'services', url: '/services', title: 'Services' },
            children: [
                menuItem({ id: 2, page: { id: 302, keyword: 'consulting', url: '/services/consulting', title: 'Consulting' } }),
            ],
        }),
        menuItem({ id: 3, page: { id: 303, keyword: 'contact', url: '/contact', title: 'Contact' } }),
    ];

    it('resolves mobile hrefs including root aliases', () => {
        expect(getNavigationItemMobileHref(menuItem({ page: { id: 1, keyword: 'home', url: '/', title: 'Home' } }))).toBe('/index');
        expect(getNavigationItemMobileHref(menuItem({ page: { id: 2, keyword: 'consulting', url: '/services/consulting', title: 'C' } }))).toBe('/consulting');
        expect(getNavigationItemMobileHref(menuItem({ item_type: 'external_url', page: null, external_url: 'https://x.org' }))).toBe('https://x.org');
    });

    it('marks ancestors active when a descendant matches (web + mobile)', () => {
        expect(isMenuItemActiveOnWeb(drawer[0], '/services/consulting')).toBe(true);
        expect(isMenuItemActiveOnWeb(drawer[1], '/services/consulting')).toBe(false);
        expect(isMenuItemActiveOnMobile(drawer[0], '/consulting')).toBe(true);
        expect(isMenuItemActiveOnMobile(drawer[1], '/consulting')).toBe(false);
    });

    it('collects the expanded id set for the active trail only', () => {
        expect([...expandedIdsForActiveTrail(drawer, '/consulting', 'mobile')]).toEqual([1]);
        expect([...expandedIdsForActiveTrail(drawer, '/contact', 'mobile')]).toEqual([]);
    });
});

describe('navigation bundle contract', () => {
    it('accepts only the current bundle version', () => {
        expect(isNavigationBundleVersionSupported(NAVIGATION_BUNDLE_VERSION)).toBe(true);
        expect(isNavigationBundleVersionSupported('1.0')).toBe(false);
        expect(isNavigationBundleVersionSupported(null)).toBe(false);
    });
});
