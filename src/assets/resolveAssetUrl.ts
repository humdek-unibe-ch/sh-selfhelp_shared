/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Resolve a CMS-supplied asset URL.
 *
 *   resolveAssetUrl('/assets/img/foo.png', 'https://api.example.com')
 *     -> 'https://api.example.com/assets/img/foo.png'
 *
 *   resolveAssetUrl('https://cdn.example.com/foo.png', 'https://api.example.com')
 *     -> 'https://cdn.example.com/foo.png'  (already absolute, passes through)
 *
 *   resolveAssetUrl('data:image/png;base64,...', 'https://api.example.com')
 *     -> 'data:image/png;base64,...'  (data URIs pass through)
 *
 *   resolveAssetUrl(null, ...) / resolveAssetUrl(undefined, ...) -> ''
 */

const ABSOLUTE_RE = /^(?:[a-z][a-z0-9+\-.]*:)?\/\//i;
const DATA_OR_BLOB_RE = /^(?:data|blob|file):/i;

export function resolveAssetUrl(url: string | null | undefined, baseUrl: string): string {
    if (!url) return '';
    if (ABSOLUTE_RE.test(url) || DATA_OR_BLOB_RE.test(url)) return url;

    const base = baseUrl.replace(/\/+$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
}

/**
 * Resolve potentially nested `sources` arrays (used by video/audio/carousel).
 */
export interface IAssetSource {
    src: string;
    type?: string;
    [extra: string]: unknown;
}

export function resolveAssetSources<T extends IAssetSource>(sources: T[] | undefined, baseUrl: string): T[] {
    if (!sources) return [];
    return sources.map((s) => ({ ...s, src: resolveAssetUrl(s.src, baseUrl) }));
}
