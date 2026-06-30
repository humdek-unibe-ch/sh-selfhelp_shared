/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, it, expect } from 'vitest';
import type { IPageItem } from '../../types/pages';
import {
    DEFAULT_MOBILE_NAV_RENDER,
    DEFAULT_WEB_NAV_RENDER,
    isMobileNavRender,
    isWebNavRender,
    MOBILE_NAV_RENDER_OPTIONS,
    resolveMobileNavRender,
    resolveWebNavRender,
    WEB_NAV_RENDER_OPTIONS,
} from '../navRender';
import { DEFAULT_MOBILE_ICON, isMobileIconName, MOBILE_ICON_SET, resolveMobileIcon } from '../mobileIcons';
import { getMenuVisibleChildren, isMenuVisible, isNavigationPage } from '../menuVisibility';

function page(partial: Partial<IPageItem>): IPageItem {
    return {
        id: 0,
        keyword: 'k',
        url: null,
        parent_page_id: null,
        is_headless: false,
        navPosition: null,
        footerPosition: null,
        ...partial,
    };
}

describe('navRender', () => {
    it('validates web/mobile render values', () => {
        expect(isWebNavRender('tabs')).toBe(true);
        expect(isWebNavRender('bottom-tabs')).toBe(false); // mobile-only value
        expect(isMobileNavRender('bottom-tabs')).toBe(true);
        expect(isMobileNavRender('header-dropdown')).toBe(false); // web-only value
        expect(isWebNavRender(null)).toBe(false);
    });

    it('resolves to the value when valid and falls back otherwise', () => {
        expect(resolveWebNavRender('hero-cards')).toBe('hero-cards');
        expect(resolveWebNavRender('nope')).toBe(DEFAULT_WEB_NAV_RENDER);
        expect(resolveWebNavRender(null, 'header-dropdown')).toBe('header-dropdown');
        expect(resolveMobileNavRender('drawer')).toBe('drawer');
        expect(resolveMobileNavRender(undefined)).toBe(DEFAULT_MOBILE_NAV_RENDER);
    });

    it('option metadata covers every value with a label + description', () => {
        for (const opt of WEB_NAV_RENDER_OPTIONS) {
            expect(isWebNavRender(opt.value)).toBe(true);
            expect(opt.label.length).toBeGreaterThan(0);
            expect(opt.description.length).toBeGreaterThan(0);
        }
        for (const opt of MOBILE_NAV_RENDER_OPTIONS) {
            expect(isMobileNavRender(opt.value)).toBe(true);
            expect(opt.label.length).toBeGreaterThan(0);
            expect(opt.description.length).toBeGreaterThan(0);
        }
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

describe('menuVisibility', () => {
    it('treats a page with a nav position and not headless as a menu page', () => {
        expect(isMenuVisible(page({ navPosition: 1 }))).toBe(true);
        expect(isMenuVisible(page({ navPosition: null }))).toBe(false);
        expect(isMenuVisible(page({ navPosition: 1, is_headless: true }))).toBe(false);
    });

    it('returns only menu-visible children in nav order', () => {
        const parent = page({
            keyword: 'team',
            navPosition: 1,
            children: [
                page({ keyword: 'b', navPosition: 2 }),
                page({ keyword: 'a', navPosition: 1 }),
                page({ keyword: 'hidden', navPosition: null }),
                page({ keyword: 'headless', navPosition: 3, is_headless: true }),
            ],
        });
        const visible = getMenuVisibleChildren(parent);
        expect(visible.map((child) => child.keyword)).toEqual(['a', 'b']);
        expect(isNavigationPage(parent)).toBe(true);
    });

    it('a leaf page (no menu-visible children) is not a navigation page', () => {
        expect(isNavigationPage(page({ navPosition: 1, children: [] }))).toBe(false);
    });
});
