/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Backend → frontend page-shape transformer.
 *
 * The Symfony backend projects pages with canonical `snake_case` keys
 * (`nav_position`, `footer_position`, `id_pages`, `id_parent_page`,
 * `id_page_types`, `id_page_access_types`). The web and mobile apps
 * prefer camelCase (`navPosition`, `footerPosition`) at the type-system
 * level. This helper bridges the two so consumers don't have to know
 * about the snake-case wire format.
 *
 * It is the single source of truth for the conversion. Web frontend
 * and mobile both import it from `@selfhelp/shared`.
 *
 * NOTE: Pre-release breaking-change cutover (`db_naming_cutover_*`)
 * removed all legacy aliases (`parent`, `id_type`,
 * `id_pageAccessTypes`). The backend is the single source of canonical
 * keys; the transformer no longer accepts the legacy shapes.
 *
 * ROUTE METADATA (issue #30): this transformer deliberately does NOT carry
 * `route_params` / `matched_url_pattern` / `canonical_url`. Those are
 * resolve-time fields of a single page's full content (`IPageContent`, returned
 * by `GET /pages/resolve`) and are consumed directly off that type. `IPageItem`
 * is the navigation/menu projection of the page tree (keyword, url,
 * nav/footer position, parent/children) and never participates in URL
 * resolution, so adding a route passthrough here would be dead weight.
 */

import type { IPageItem } from '../types/pages';
import type { TWebNavRender, TMobileNavRender } from '../navigation/navRender';

interface IRawPage {
    id?: number;
    id_pages?: number;
    keyword?: string;
    url?: string | null;
    id_parent_page?: number | null;
    parent_page_id?: number | null;
    is_headless?: number | boolean | null;
    nav_position?: number | null;
    navPosition?: number | null;
    footer_position?: number | null;
    footerPosition?: number | null;
    is_system?: number | boolean | null;
    is_open_access?: number | boolean | null;
    title?: string | null;
    description?: string | null;
    icon?: string | null;
    mobile_icon?: string | null;
    web_nav_render?: TWebNavRender | string | null;
    mobile_nav_render?: TMobileNavRender | string | null;
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
        navPosition:
            apiPage.navPosition !== undefined ? apiPage.navPosition : (apiPage.nav_position ?? null),
        footerPosition:
            apiPage.footerPosition !== undefined
                ? apiPage.footerPosition
                : (apiPage.footer_position ?? null),
        is_system: apiPage.is_system !== undefined ? toBool(apiPage.is_system) : undefined,
        title: apiPage.title ?? null,
        description: apiPage.description ?? null,
        icon: apiPage.icon ?? null,
        mobile_icon: apiPage.mobile_icon ?? null,
        web_nav_render: (apiPage.web_nav_render as TWebNavRender | null) ?? null,
        mobile_nav_render: (apiPage.mobile_nav_render as TMobileNavRender | null) ?? null,
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
