/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Small, pure helpers both clients use to read a change message and match it
 * to what is on screen (contracts C1 and C6). They hold no state, touch no
 * network and never decide access: they only compare tags the server sent
 * with tags the server put into the page payload.
 */
import {
    SYNC_MESSAGE_VERSION,
    SYNC_TAG_PATTERN,
    type ISyncBlock,
    type ISyncChangeMessage,
    type TSyncTag,
} from './types';

/** Largest random delay before a refetch caused by a `changed` message (decision "instant"). */
export const SYNC_CHANGED_MAX_DELAY_MS = 300;

/** Largest random delay before the one refetch at a page's `valid_until`. */
export const SYNC_VALID_UNTIL_MAX_DELAY_MS = 2000;

/** Why a refetch is scheduled: a pushed change, or the page's own `valid_until`. */
export type TSyncRefetchKind = 'changed' | 'valid_until';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates the data of a `changed` event (C1).
 *
 * Returns `null` when the data is not an object, `v` is not
 * {@link SYNC_MESSAGE_VERSION} (a higher version is ignored by design), `tags`
 * is not a list, or no known tag is left. Unknown tags are dropped and
 * duplicates are removed, so `{ v: 1, tags: ['page:12', 'foo:1'] }` gives
 * `{ v: 1, tags: ['page:12'] }`. A message that carries only unknown tags
 * returns `null` because there is nothing a client could act on.
 */
export function parseSyncMessage(data: unknown): ISyncChangeMessage | null {
    if (!isRecord(data) || data.v !== SYNC_MESSAGE_VERSION || !Array.isArray(data.tags)) {
        return null;
    }

    const tags: TSyncTag[] = [];
    for (const tag of data.tags as unknown[]) {
        if (typeof tag === 'string' && SYNC_TAG_PATTERN.test(tag) && !tags.includes(tag as TSyncTag)) {
            tags.push(tag as TSyncTag);
        }
    }

    return tags.length === 0 ? null : { v: SYNC_MESSAGE_VERSION, tags };
}

/**
 * Same as {@link parseSyncMessage} for the raw `data` string of a server-sent
 * event. Invalid JSON returns `null`.
 */
export function parseSyncMessageJson(raw: string): ISyncChangeMessage | null {
    try {
        return parseSyncMessage(JSON.parse(raw) as unknown);
    } catch {
        return null;
    }
}

/**
 * True when a page payload's `sync.depends_on` names any of the message's tags (C6).
 *
 * Only tags that a page payload can list match here: `page:<id>`,
 * `page_draft:<id>`, `table:<id>` and `global_values`. The other tags are not
 * page dependencies and are handled by the client on their own:
 *
 * - `acl` and `navigation` affect every page the caller may see, so the client
 *   invalidates all page queries and the navigation (it does not ask each page).
 * - `page_lock:<id>`, `section:<id>` and `asset:<id>` are editor-side tags;
 *   the admin screens that show them refetch their own queries.
 *
 * A page without a `sync` block (older server, error payload) never matches.
 */
export function pageDependsOn(
    sync: ISyncBlock | null | undefined,
    tags: readonly string[],
): boolean {
    if (!sync || !Array.isArray(sync.depends_on) || sync.depends_on.length === 0) {
        return false;
    }
    return tags.some((tag) => sync.depends_on.includes(tag));
}

/**
 * Random delay in milliseconds before a refetch: 0 to 300 for a `changed`
 * message, 0 to 2000 for `valid_until`. It spreads many clients over a short
 * time without making a change feel slow. `random` is injectable for tests.
 */
export function syncRefetchDelayMs(
    kind: TSyncRefetchKind,
    random: () => number = Math.random,
): number {
    const max = kind === 'changed' ? SYNC_CHANGED_MAX_DELAY_MS : SYNC_VALID_UNTIL_MAX_DELAY_MS;
    const r = random();
    const unit = Number.isFinite(r) ? Math.min(Math.max(r, 0), 1) : 0;
    return Math.min(max, Math.floor(unit * (max + 1)));
}
