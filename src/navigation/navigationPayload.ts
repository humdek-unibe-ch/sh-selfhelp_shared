/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { TWebHeaderPreset } from './headerPreset';
import type { TWebFooterPreset } from './footerPreset';

export type TNavigationMenuKey =
    | 'web_header'
    | 'web_footer'
    | 'mobile_drawer'
    | 'mobile_bottom_tabs';

export type TNavigationMenuItemType = 'page' | 'external_url' | 'group';

/** Header row assignment for `web_header` root items (`null` = main row). */
export type TNavigationHeaderLayer = 'top';

/**
 * How a web page presents its menu branch (children/siblings):
 * `sidebar` = left sidebar + prev/next pager, `pills` = compact pill strip,
 * `none` = only the page content. Menu-level default (NULL resolves to
 * `sidebar`), overridable per parent item. Mobile menus have native
 * presentation and always carry `null`.
 */
export type TNavigationChildrenNavMode = 'sidebar' | 'pills' | 'none';

export type TNavigationSearchMode = 'off' | 'menu_pages' | 'searchable_pages' | 'content_index';

export type TNavigationStartMode = 'fixed_page' | 'last_visited_then_fixed_page';

export type TNavigationMobileStartSource = 'same_as_web' | 'custom_mobile_pages';

export interface INavigationResolvedPageRef {
    id: number;
    keyword: string;
    url: string | null;
    title: string | null;
    has_content?: boolean;
    section_count?: number;
}

/**
 * Resolved public menu item (`GET /navigation`). Strict contract: every key is
 * always present; absence of a value is expressed as `null`, never a missing key.
 */
export interface INavigationMenuItem {
    id: number;
    item_type: TNavigationMenuItemType;
    label: string;
    description: string | null;
    aria_label: string | null;
    icon: string | null;
    mobile_icon: string | null;
    position: number;
    /** Only meaningful on `web_header` root items; `null` everywhere else. */
    layer: TNavigationHeaderLayer | null;
    /** Per-parent-item override of the menu's `children_nav` default (web menus only). */
    children_nav: TNavigationChildrenNavMode | null;
    external_url: string | null;
    page: INavigationResolvedPageRef | null;
    is_active: boolean;
    children: INavigationMenuItem[];
}

export interface INavigationMenu {
    key: TNavigationMenuKey;
    platform: 'web' | 'mobile';
    surface: 'header' | 'footer' | 'drawer' | 'bottom_tabs';
    /** Header presets for `web_header`, footer presets for `web_footer`, `null` for mobile menus. */
    preset: TWebHeaderPreset | TWebFooterPreset | null;
    max_depth: number | null;
    item_limit: number | null;
    /** Resolved branch presentation default; `sidebar`/`pills`/`none` on web menus, `null` on mobile menus. */
    children_nav: TNavigationChildrenNavMode | null;
    /** Breadcrumb trail above nested web pages; always `false` on mobile menus. */
    show_breadcrumbs: boolean;
    items: INavigationMenuItem[];
}

export interface INavigationStartupConfig {
    web_guest_start_page: INavigationResolvedPageRef | null;
    web_user_start_page: INavigationResolvedPageRef | null;
    web_user_start_mode: TNavigationStartMode;
    web_user_last_visited_page?: INavigationResolvedPageRef | null;
    mobile_guest_start_page: INavigationResolvedPageRef | null;
    mobile_user_start_page: INavigationResolvedPageRef | null;
    mobile_user_start_mode: TNavigationStartMode;
    mobile_user_last_visited_page?: INavigationResolvedPageRef | null;
    mobile_start_page_source: TNavigationMobileStartSource;
}

export interface INavigationSearchConfig {
    mode: TNavigationSearchMode;
    min_chars: number;
    result_limit: number;
    default_visibility: string;
    field_policy: string;
}

export interface INavigationPayload {
    menus: Record<TNavigationMenuKey, INavigationMenu>;
    startup: INavigationStartupConfig;
    search: INavigationSearchConfig;
}
