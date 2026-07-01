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
