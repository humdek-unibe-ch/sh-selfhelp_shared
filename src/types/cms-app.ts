/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * First-class CMS app contract (Host Admin product unit).
 * Mirrors backend CmsAppRole + CmsAppService response shapes.
 */

export type TCmsAppRole =
    | 'form'
    | 'cms_list'
    | 'cms_detail'
    | 'public_list'
    | 'public_detail'
    | 'other';

export const CMS_APP_ROLES: readonly TCmsAppRole[] = [
    'form',
    'cms_list',
    'cms_detail',
    'public_list',
    'public_detail',
    'other',
] as const;

export const CMS_APP_PRIMARY_ROLES: readonly TCmsAppRole[] = [
    'form',
    'cms_list',
    'cms_detail',
    'public_list',
    'public_detail',
] as const;

/** Assigned page row inside a CMS app detail payload. */
export interface ICmsAppPage {
    page_id: number;
    keyword: string;
    url: string | null;
    page_surface: string;
    cms_app_role: TCmsAppRole | null;
}

/** @deprecated Prefer {@link ICmsAppPage} — kept for existing imports. */
export type ICmsAppAssignedPage = ICmsAppPage;

/** List/summary row for GET /admin/cms-apps. */
export interface ICmsAppSummary {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    page_count: number;
    id_form_section: number | null;
    id_cms_list_page: number | null;
    cms_list_keyword: string | null;
    cms_list_url: string | null;
    id_cms_detail_page: number | null;
    id_public_list_page: number | null;
    public_list_keyword: string | null;
    public_list_url: string | null;
    id_public_detail_page: number | null;
    created_at: string;
    updated_at: string | null;
}

/** Detail payload (summary + assigned pages). Canonical alias: {@link ICmsApp}. */
export interface ICmsAppDetail extends ICmsAppSummary {
    pages: ICmsAppPage[];
}

/** Canonical CMS app detail contract. */
export type ICmsApp = ICmsAppDetail;
