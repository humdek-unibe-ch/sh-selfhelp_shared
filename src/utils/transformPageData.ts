/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Backend → frontend page-shape transformer.
 *
 * Menu membership is no longer projected on pages. Use `GET /navigation` for menus.
 */

import type { IPageItem } from '../types/pages';

interface IRawPage {
    id?: number;
    id_pages?: number;
    keyword?: string;
    url?: string | null;
    id_parent_page?: number | null;
    parent_page_id?: number | null;
    is_headless?: number | boolean | null;
    is_system?: number | boolean | null;
    is_open_access?: number | boolean | null;
    title?: string | null;
    description?: string | null;
    icon?: string | null;
    mobile_icon?: string | null;
    id_users?: number;
    acl_select?: 0 | 1;
    acl_insert?: 0 | 1;
    acl_update?: 0 | 1;
    acl_delete?: 0 | 1;
    id_page_types?: number;
    id_page_access_types?: number;
    children?: IRawPage[];
    [key: string]: unknown;
}

function toBool(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return value === '1' || value === 'true';
    return false;
}

export function transformPageData(apiPage: IRawPage): IPageItem {
    const id = apiPage.id ?? apiPage.id_pages ?? 0;
    const parentPageId = apiPage.parent_page_id ?? apiPage.id_parent_page ?? null;
    return {
        id,
        keyword: apiPage.keyword ?? '',
        url: apiPage.url ?? null,
        parent_page_id: parentPageId,
        is_headless: toBool(apiPage.is_headless),
        is_system: apiPage.is_system !== undefined ? toBool(apiPage.is_system) : undefined,
        title: apiPage.title ?? null,
        description: apiPage.description ?? null,
        icon: apiPage.icon ?? null,
        mobile_icon: apiPage.mobile_icon ?? null,
        children: apiPage.children?.map(transformPageData) ?? [],

        id_users: apiPage.id_users,
        id_pages: apiPage.id_pages ?? id,
        acl_select: apiPage.acl_select,
        acl_insert: apiPage.acl_insert,
        acl_update: apiPage.acl_update,
        acl_delete: apiPage.acl_delete,
        id_page_types: apiPage.id_page_types,
        id_page_access_types: apiPage.id_page_access_types,
    };
}

/**
 * Same as `transformPageData` but for an array. Convenience helper
 * because almost every consumer fetches a list of pages.
 */
export function transformPagesData(pages: IRawPage[] | null | undefined): IPageItem[] {
    if (!pages) return [];
    return pages.map(transformPageData);
}
