/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IContentField } from './styles/base';
import type { TStyleName } from './styles/unknown';

/**
 * Comprehensive page type system, single source of truth for both apps.
 */

export interface IBasePageSection {
    id: number;
    section_name: string;
    id_styles: number;
    style_name: TStyleName;
    position: number;
    level: number | { content: string; meta: string | null };
    path: string;
    children: IBasePageSection[];
}

export interface IPageSectionWithFields extends IBasePageSection {
    can_have_children: number | null;
    condition: string | null;
    css: string | null;
    css_mobile: string | null;
    debug: number | null;
    data_config: string | number | null;
    section_data: unknown[];
    fields: Record<string, IContentField<unknown>>;
    children: IPageSectionWithFields[];
}

export interface IBasePageInfo {
    id: number;
    keyword: string;
    url: string | null;
    parent_page_id: number | null;
    is_headless: boolean;
    is_system?: boolean;
}

export interface IPageAccessTypeInfo {
    id: number;
    typeCode: string;
    lookupCode: string;
    lookupValue: string;
    lookupDescription: string | null;
}

export interface IPageItem extends IBasePageInfo {
    id_users?: number;
    id_pages?: number;
    acl_select?: 0 | 1;
    acl_insert?: 0 | 1;
    acl_update?: 0 | 1;
    acl_delete?: 0 | 1;
    id_page_types?: number;
    id_page_access_types?: number;
    title?: string | null;
    description?: string | null;
    /** Web menu icon (Tabler component name, e.g. `IconHome`). Page property field `icon`. */
    icon?: string | null;
    /** Mobile menu icon (curated lucide name, e.g. `Home`). Page property field `mobile_icon`. */
    mobile_icon?: string | null;
    children?: IPageItem[];
}

export interface IPageContent {
    id: number;
    keyword: string;
    url: string | null;
    parent_page_id: number | null;
    is_headless: boolean;
    /**
     * When true, the web frontend renders this page's content inside a modal
     * overlay (the page title becomes the modal header, with a close button)
     * instead of a full page. Used to open CMS-in-CMS create/edit/detail pages
     * from a list. Web-only — the mobile app renders the page as a normal
     * screen. Mirrors the `open_in_modal` page property field.
     */
    open_in_modal?: boolean;
    /**
     * Optional modal width applied when `open_in_modal` is true (web only). A CSS
     * length (e.g. `'80%'`, `'640px'`) or `'auto'` (fit content, capped at 90% of
     * the viewport). `null`/absent means the frontend default (80%). Mirrors the
     * `modal_width` page property field.
     */
    modal_width?: string | null;
    /**
     * Optional modal height applied when `open_in_modal` is true (web only). A CSS
     * length (e.g. `'80%'`, `'600px'`) or `'auto'` (fit content, capped at 90% of
     * the viewport). `null`/absent means the frontend default (80%). Mirrors the
     * `modal_height` page property field.
     */
    modal_height?: string | null;
    title?: string | null;
    description?: string | null;
    /** Web menu icon (Tabler component name). Mirrors the `icon` page property field. */
    icon?: string | null;
    /** Mobile menu icon (curated lucide name). Mirrors the `mobile_icon` page property field. */
    mobile_icon?: string | null;
    /**
     * Snake_case route params extracted from the matched public URL pattern
     * (e.g. `{ user_id: '42', token: 'abc' }` or `{ record_id: '7' }`). Present
     * only when the page was resolved via `GET /pages/resolve`. Backend also
     * exposes these to interpolation as `{{route.<name>}}`.
     */
    route_params?: Record<string, string>;
    /** The `page_routes` pattern that matched (e.g. `/reset/{user_id}/{token}`). Resolve responses only. */
    matched_url_pattern?: string | null;
    /** The canonical active route pattern for the page, for canonical-link generation. Resolve responses only. */
    canonical_url?: string | null;
    sections: IPageSectionWithFields[];
}

/**
 * A public, parameterized route contract for a CMS page (issue #30). Mirrors a
 * backend `page_routes` row. `path_pattern` uses Symfony route syntax
 * (`/team/{record_id}`) and `requirements` maps each placeholder to a regex
 * (`{ record_id: '\\d+' }`). Param names are snake_case and are NEVER remapped
 * on export/import. Used by the admin page-routes editor and page export/import.
 */
export interface IPageRoute {
    id?: number;
    path_pattern: string;
    requirements?: Record<string, string> | null;
    is_canonical: boolean;
    is_active: boolean;
    priority: number;
}

export interface IPageFieldTranslation {
    language_id: number;
    language_code: string;
    content: string;
}

export interface IPageField {
    id: number;
    name: string;
    title: string | null;
    type: string;
    default_value: string | null;
    help: string;
    display: boolean;
    translations: IPageFieldTranslation[];
    config?: unknown;
}

export interface IPageFieldsData {
    page: unknown;
    fields: IPageField[];
}

export interface IPageSectionsData {
    page_keyword: string;
    sections: IPageSectionWithFields[];
}
