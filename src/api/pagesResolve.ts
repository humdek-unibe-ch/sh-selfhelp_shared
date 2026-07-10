/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * Canonical public page resolve contract (issue #30).
 *
 * Frontend SSR, frontend browser client, and mobile MUST build resolve
 * requests through these helpers so path / language_id / preview encoding
 * cannot drift between clients.
 */

import { API_VERSION_PREFIX } from './endpoints';

/** Inputs accepted by `GET /pages/resolve`. */
export interface IPagesResolveParams {
    /** Public URL path, e.g. `/team/7`, `/reset/42/abc`, `/`. */
    path: string;
    /** Optional language id query param. */
    languageId?: number | null;
    /**
     * When true, request unpublished draft content. Backend requires an
     * authenticated caller (`preview=true`).
     */
    preview?: boolean;
}

/**
 * Normalize a public path for the resolve query: strip origin fragments /
 * search, ensure a leading slash, collapse a trailing slash (except root).
 */
export function normalizePagesResolvePath(rawPath: string): string {
    const withoutOrigin = rawPath.includes('://')
        ? (() => {
              try {
                  return new URL(rawPath).pathname;
              } catch {
                  return rawPath;
              }
          })()
        : rawPath;
    const pathOnly = withoutOrigin.split('#')[0].split('?')[0];
    const withSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
    return withSlash.replace(/\/+$/, '') || '/';
}

/**
 * Build the query string for `/pages/resolve` (no leading `?`).
 * Always includes `path`; optionally `language_id` and `preview=true`.
 */
export function buildPagesResolveQuery(params: IPagesResolveParams): string {
    const search = new URLSearchParams();
    search.set('path', normalizePagesResolvePath(params.path));
    if (params.languageId != null && Number.isFinite(params.languageId) && params.languageId > 0) {
        search.set('language_id', String(params.languageId));
    }
    if (params.preview) {
        search.set('preview', 'true');
    }
    return search.toString();
}

/**
 * BFF-relative resolve path used by the Next.js frontend
 * (`/pages/resolve?path=…`).
 */
export function buildPagesResolvePath(params: IPagesResolveParams): string {
    return `/pages/resolve?${buildPagesResolveQuery(params)}`;
}

/**
 * Full Symfony path including `/cms-api/v1` — used by mobile and any
 * direct-to-backend client.
 */
export function buildPagesResolveUrl(params: IPagesResolveParams): string {
    return `${API_VERSION_PREFIX}${buildPagesResolvePath(params)}`;
}
