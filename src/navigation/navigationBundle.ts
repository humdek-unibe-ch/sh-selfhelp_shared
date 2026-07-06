/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * `selfhelp/navigation-bundle` v2.0 — the only supported navigation bundle
 * schema. Bundles are an authoring/transfer format: optional keys mean "not
 * set" (unlike the strict runtime payload where every key is present).
 *
 * v2.0 replaces v1.0 entirely: menu `config` is gone (footer layout is a
 * preset), items carry `layer`, and translations use `aria_label` (the legacy
 * `n` key is not accepted). Imports reject any other version.
 */
import type {
    TNavigationHeaderLayer,
    TNavigationMenuItemType,
    TNavigationMenuKey,
} from './navigationPayload';

export const NAVIGATION_BUNDLE_FORMAT = 'selfhelp/navigation-bundle';
export const NAVIGATION_BUNDLE_VERSION = '2.0';

export interface INavigationBundleItemTranslation {
    locale: string;
    label: string;
    description?: string | null;
    aria_label?: string | null;
}

export interface INavigationBundleItem {
    /** Stable in-bundle reference used by children via `parent_ref`. */
    ref: string;
    parent_ref: string | null;
    item_type: TNavigationMenuItemType;
    position: number;
    is_active?: boolean;
    /** Top header row assignment (`web_header` root items only). */
    layer?: TNavigationHeaderLayer | null;
    /** Page items: target page keyword (resolved on import). */
    page_keyword?: string | null;
    /** External items: absolute URL. */
    external_url?: string | null;
    icon?: string | null;
    mobile_icon?: string | null;
    /** Default-language label cache for group/external items. */
    label?: string | null;
    translations?: INavigationBundleItemTranslation[];
}

export interface INavigationBundleMenu {
    preset?: string | null;
    max_depth?: number | null;
    item_limit?: number | null;
    items: INavigationBundleItem[];
}

export type TNavigationBundleExportMode = 'full_snapshot' | 'branch';

export interface INavigationBundleImportHints {
    default_keyword_prefix?: string;
    default_route_prefix?: string;
}

export interface INavigationBundle {
    format: typeof NAVIGATION_BUNDLE_FORMAT;
    version: string;
    title?: string;
    description?: string;
    min_core_version?: string;
    exported_at?: string;
    core_version?: string;
    export_mode?: TNavigationBundleExportMode;
    import_hints?: INavigationBundleImportHints;
    menus: Partial<Record<TNavigationMenuKey, INavigationBundleMenu>>;
    /** Optional embedded `selfhelp/page-bundle` pages payload. */
    pages?: unknown[];
}

export function isNavigationBundleVersionSupported(version: unknown): boolean {
    return version === NAVIGATION_BUNDLE_VERSION;
}
