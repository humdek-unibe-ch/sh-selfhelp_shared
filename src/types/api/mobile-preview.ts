/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Mobile preview session contracts (CMS admin <-> backend <-> mobile-preview
 * web image).
 *
 * Flow: the CMS admin mints a SHORT-LIVED, SINGLE-USE preview code (bound to the
 * admin user + an optional scope). The `selfhelp-mobile-preview` web image
 * exchanges that one-time code for an in-memory, scoped JWT
 * (`purpose: 'mobile_preview'`) used for read-only `/cms-api` calls. The admin
 * JWT is never exposed to the preview iframe.
 *
 * Snake_case is the wire contract (these mirror the backend JSON schemas under
 * `config/schemas/api/v1/{requests,responses}/`).
 */
import type { IBaseApiResponse } from './envelope';
import type { IUserData } from '../auth';

const MOBILE_PREVIEW_PREFIX = '/cms-api/v1';

/** Mobile preview session endpoints. */
export const MOBILE_PREVIEW_ENDPOINTS = {
    /** Admin-only: mint a one-time preview session code. */
    SESSION: `${MOBILE_PREVIEW_PREFIX}/admin/mobile-preview/session`,
    /** Public: exchange a one-time code for a scoped preview JWT. */
    EXCHANGE: `${MOBILE_PREVIEW_PREFIX}/mobile-preview/session/exchange`,
} as const;

/**
 * POST /admin/mobile-preview/session — mint a one-time preview code. No
 * `instance_id`: the backend derives + verifies the admin server-side. The
 * optional scope is bound into the code and enforced on exchange.
 */
export interface IMobilePreviewSessionRequest {
    /** Page keyword to preview. */
    keyword?: string;
    /** Page id to preview (alternative to `keyword`). */
    page_id?: number;
    /** Language id to render in. */
    language_id?: number;
    /** Whether to preview the unpublished draft version. */
    draft?: boolean;
}

export interface IMobilePreviewSessionData {
    /** Opaque one-time code (safe in the iframe URL; invalid after exchange). */
    code: string;
    /** ISO-8601 expiry of the one-time code. */
    expires_at: string;
}
export type IMobilePreviewSessionResponse = IBaseApiResponse<IMobilePreviewSessionData>;

/**
 * POST /mobile-preview/session/exchange — public route; the one-time code IS the
 * credential. Consumes (deletes) the code and mints a scoped preview JWT.
 */
export interface IMobilePreviewExchangeRequest {
    code: string;
}

export interface IMobilePreviewExchangeData {
    /** Short-lived scoped JWT (`purpose: 'mobile_preview'`); held in memory only. */
    access_token: string;
    /** Seconds until the scoped token expires. */
    expires_in: number;
    /** The previewed user (the minting admin), for the preview UI. */
    user: IUserData;
}
export type IMobilePreviewExchangeResponse = IBaseApiResponse<IMobilePreviewExchangeData>;
