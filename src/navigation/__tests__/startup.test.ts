/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, expect, it } from 'vitest';
import type { INavigationStartupConfig } from '../navigationPayload';
import { resolveMobileStartupKeyword, resolveMobileStartupRoute } from '../startup';

const baseStartup: INavigationStartupConfig = {
    web_guest_start_page: { id: 1, keyword: 'home', url: '/', title: 'Home' },
    web_user_start_page: { id: 2, keyword: 'dashboard', url: '/dashboard', title: 'Dashboard' },
    web_user_start_mode: 'fixed_page',
    mobile_guest_start_page: { id: 3, keyword: 'welcome', url: '/welcome', title: 'Welcome' },
    mobile_user_start_page: { id: 4, keyword: 'app-home', url: '/app-home', title: 'App home' },
    mobile_user_start_mode: 'fixed_page',
    mobile_start_page_source: 'custom_mobile_pages',
};

describe('startup helpers', () => {
    it('resolveMobileStartupRoute uses custom mobile guest page', () => {
        expect(resolveMobileStartupRoute(baseStartup, false)).toBe('/welcome');
    });

    it('resolveMobileStartupRoute prefers last visited for logged-in users', () => {
        const startup: INavigationStartupConfig = {
            ...baseStartup,
            mobile_user_start_mode: 'last_visited_then_fixed_page',
            mobile_user_last_visited_page: { id: 9, keyword: 'resume', url: '/resume', title: 'Resume' },
        };
        expect(resolveMobileStartupRoute(startup, true)).toBe('/resume');
        expect(resolveMobileStartupKeyword(startup, true)).toBe('resume');
    });
});
