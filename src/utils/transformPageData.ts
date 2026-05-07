/**
 * Backend → frontend page-shape transformer.
 *
 * The Symfony repositories project pages with snake_case keys
 * (`nav_position`, `footer_position`, `id_pages`, `parent`) for legacy
 * reasons. Both the web and the mobile app prefer camelCase
 * (`navPosition`, `footerPosition`) at the type-system level. This
 * helper bridges the two so consumers don't have to know about the
 * snake-case wire format.
 *
 * It is the single source of truth for the conversion. Web frontend
 * and mobile both import it from `@selfhelp/shared`.
 */

import type { IPageItem } from '../types/pages';

interface IRawPage {
    id?: number;
    id_pages?: number;
    keyword?: string;
    url?: string | null;
    parent?: number | null;
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
    id_users?: number;
    acl_select?: 0 | 1;
    acl_insert?: 0 | 1;
    acl_update?: 0 | 1;
    acl_delete?: 0 | 1;
    id_type?: number;
    id_pageAccessTypes?: number;
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
    return {
        id,
        keyword: apiPage.keyword ?? '',
        url: apiPage.url ?? null,
        parent_page_id: apiPage.parent_page_id ?? apiPage.parent ?? null,
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
        children: apiPage.children?.map(transformPageData) ?? [],

        id_users: apiPage.id_users,
        id_pages: apiPage.id_pages ?? id,
        acl_select: apiPage.acl_select,
        acl_insert: apiPage.acl_insert,
        acl_update: apiPage.acl_update,
        acl_delete: apiPage.acl_delete,
        id_type: apiPage.id_type,
        id_pageAccessTypes: apiPage.id_pageAccessTypes,
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
