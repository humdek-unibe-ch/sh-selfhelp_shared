/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { INavigationResolvedPageRef, INavigationStartupConfig } from './navigationPayload';
import { pageUrlToMobileRoute } from './mobileRoute';

function pickStartPage(
    startup: INavigationStartupConfig,
    isLoggedIn: boolean,
    platform: 'web' | 'mobile',
): INavigationResolvedPageRef | null {
    const useMobileCustom = startup.mobile_start_page_source === 'custom_mobile_pages';

    if (isLoggedIn) {
        const lastVisited = platform === 'mobile'
            ? startup.mobile_user_last_visited_page
            : startup.web_user_last_visited_page;
        const startMode = platform === 'mobile'
            ? startup.mobile_user_start_mode
            : startup.web_user_start_mode;

        if (startMode === 'last_visited_then_fixed_page' && lastVisited) {
            return lastVisited;
        }

        if (platform === 'mobile' && useMobileCustom) {
            return startup.mobile_user_start_page;
        }
        if (platform === 'mobile') {
            return startup.mobile_user_start_page ?? startup.web_user_start_page;
        }

        return startup.web_user_start_page;
    }

    if (platform === 'mobile' && useMobileCustom) {
        return startup.mobile_guest_start_page;
    }
    if (platform === 'mobile') {
        return startup.mobile_guest_start_page ?? startup.web_guest_start_page;
    }

    return startup.web_guest_start_page;
}

/** Resolve the mobile Expo Router path for cold start / index redirect. */
export function resolveMobileStartupRoute(
    startup: INavigationStartupConfig,
    isLoggedIn: boolean,
): string {
    const page = pickStartPage(startup, isLoggedIn, 'mobile');
    if (!page) {
        return '/index';
    }

    return pageUrlToMobileRoute(page.url, page.keyword);
}

/** Keyword for the CMS page rendered on `/index` when startup maps to home. */
export function resolveMobileStartupKeyword(
    startup: INavigationStartupConfig,
    isLoggedIn: boolean,
): string {
    const page = pickStartPage(startup, isLoggedIn, 'mobile');

    return page?.keyword ?? 'home';
}

/** Resolve a public web path for guest/user startup (leading slash). */
export function resolveWebStartupPath(
    startup: INavigationStartupConfig,
    isLoggedIn: boolean,
): string | null {
    const page = pickStartPage(startup, isLoggedIn, 'web');
    if (!page) {
        return null;
    }
    if (page.url && page.url !== '') {
        return page.url.startsWith('/') ? page.url : `/${page.url}`;
    }
    if (page.keyword === 'home') {
        return '/';
    }

    return `/${page.keyword}`;
}
