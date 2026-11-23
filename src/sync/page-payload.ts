/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Unwrap a page API response so the live-sync block travels with the page.
 *
 * The backend answers `{ data: { page, sync } }`: the sync block (contract C6)
 * sits next to the page, not inside it. Clients that cache the page read
 * `page.sync` for tag matching and `valid_until`, so every unwrap goes through
 * {@link pageFromPayload}.
 */
import type { IPageContent } from '../types/pages';
import type { ISyncBlock } from './types';

/** The `data` of a page response (`/pages/by-keyword`, `/pages/resolve`). */
export interface IPagePayload {
    page?: IPageContent | null;
    sync?: ISyncBlock | null;
}

/**
 * The page of a response's `data`, carrying the response's `sync` block.
 * Prefers `payload.sync`, falls back to `page.sync`. Returns `null` when there
 * is no page. With no sync at all, returns the page unchanged.
 */
export function pageFromPayload(payload: IPagePayload | null | undefined): IPageContent | null {
    const page = payload?.page;
    if (!page) {
        return null;
    }
    // An older server (or a payload built elsewhere) may have put the block on the page already.
    const sync = payload.sync ?? page.sync;
    return sync ? { ...page, sync } : page;
}
