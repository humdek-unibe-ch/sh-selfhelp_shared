/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Map a CMS page canonical URL + keyword to an Expo Router path.
 *
 * Wave 1 uses keyword-based routes (`[keyword].tsx`), not file `[...slug]`
 * segments. Nested public URLs (`/parent/child`) still navigate by keyword.
 */
/**
 * Substitute `{param}` placeholders in a CMS page URL template using route
 * params (snake_case keys). Returns null when the template or params are
 * incomplete.
 */
export function buildPublicPathFromRoute(
    urlTemplate: string | null | undefined,
    routeParams: Record<string, string | undefined>,
): string | null {
    if (!urlTemplate || !urlTemplate.includes('{')) {
        return null;
    }
    let path = urlTemplate;
    for (const [key, value] of Object.entries(routeParams)) {
        if (value === undefined || value === '') {
            continue;
        }
        path = path.replaceAll(`{${key}}`, value);
    }
    if (path.includes('{')) {
        return null;
    }
    return path.replace(/\/+$/, '') || '/';
}

export function pageUrlToMobileRoute(url: string | null | undefined, keyword: string): string {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (normalizedKeyword === 'profile') {
        return '/profile';
    }
    if (normalizedKeyword === 'home' || url === '/' || url === '' || url == null) {
        return '/index';
    }
    return `/${normalizedKeyword}`;
}
