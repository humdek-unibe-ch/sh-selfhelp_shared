/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { TWebHeaderPreset } from './headerPreset';

export type TNavigationMenuKey =
    | 'web_header'
    | 'web_footer'
    | 'mobile_drawer'
    | 'mobile_bottom_tabs';

export type TNavigationMenuItemType = 'page' | 'external_url' | 'group';

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

export interface INavigationMenuItem {
    id: number;
    item_type: TNavigationMenuItemType;
    label: string;
    icon?: string | null;
    mobile_icon?: string | null;
    position: number;
    external_url?: string | null;
    page?: INavigationResolvedPageRef | null;
    is_active?: boolean;
    children?: INavigationMenuItem[];
}

export interface INavigationMenu {
    key: TNavigationMenuKey;
    platform: 'web' | 'mobile';
    surface: 'header' | 'footer' | 'drawer' | 'bottom_tabs';
    preset?: TWebHeaderPreset | string | null;
    max_depth?: number | null;
    item_limit?: number | null;
    config?: Record<string, unknown> | null;
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
