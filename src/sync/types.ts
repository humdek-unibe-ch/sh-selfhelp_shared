/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Live-sync contract (task `2026-11-20-live-sync-and-edit-lock`, contracts C1 to C9).
 *
 * The backend publishes a `changed` Mercure event that carries names and ids
 * only, never content. Clients match the tags against the `sync.depends_on`
 * list the server put into each page payload and refetch what matches. The
 * server decides who gets a message; a client never decides who may see a
 * change.
 */

/** Mercure event name of a change message (C1). */
export const SYNC_EVENT_NAME = 'changed' as const;

/** Highest change-message version this package understands (C1). Clients ignore a higher `v`. */
export const SYNC_MESSAGE_VERSION = 1 as const;

/**
 * Tags a change message may carry (C1). A client ignores tags it does not know.
 *
 * | Tag | Meaning |
 * | --- | --- |
 * | `acl` | Access of this audience changed (re-bootstrap the stream, refetch user data) |
 * | `navigation` | A menu or the visible page set changed |
 * | `global_values` | Global values changed |
 * | `page:<id>` | The published page changed |
 * | `page_draft:<id>` | The draft of the page changed (editors) |
 * | `page_lock:<id>` | The edit lock of the page changed (editors) |
 * | `table:<id>` | A record of the data table changed |
 * | `section:<id>` | A section was saved in the admin |
 * | `asset:<id>` | An asset changed |
 */
export type TSyncTag =
    | 'acl'
    | 'navigation'
    | 'global_values'
    | `page:${number}`
    | `page_draft:${number}`
    | `page_lock:${number}`
    | `table:${number}`
    | `section:${number}`
    | `asset:${number}`;

/** Mirror of the backend tag pattern (C1). Anchored, so the whole tag must match. */
export const SYNC_TAG_PATTERN =
    /^(acl|navigation|global_values|page:\d+|page_draft:\d+|page_lock:\d+|table:\d+|section:\d+|asset:\d+)$/;

/** Data of one `changed` event (C1). */
export interface ISyncChangeMessage {
    /** Message version. Always 1 for this package. */
    v: typeof SYNC_MESSAGE_VERSION;
    /** Unique, non-empty list of known tags. */
    tags: TSyncTag[];
}

/**
 * The `sync` block of every page payload, published and draft (C6).
 *
 * `depends_on` lists `page:<id>` (`page_draft:<id>` for a draft), `table:<id>`
 * for every data table the page reads, and `global_values`. `valid_until` is
 * the earliest moment (UTC, ISO 8601) the result can change because time
 * passes, or `null`. The client refetches once at `valid_until` plus a random
 * delay while the page is open.
 */
export interface ISyncBlock {
    depends_on: string[];
    valid_until: string | null;
}

/**
 * Data of `GET /auth/events` (C4). For a guest `topic`, `impersonationTopic`
 * and `systemUpdateTopic` are `null` and `syncTopics` is the public topic only.
 * The token covers exactly the listed topics (plus plugin topics).
 */
export interface IAuthEventsBootstrap {
    hubUrl: string;
    topic: string | null;
    impersonationTopic: string | null;
    systemUpdateTopic: string | null;
    /** Sync topics to subscribe to: `[user, each group, each role, public]`, or `[public]` for a guest. */
    syncTopics: string[];
    pluginTopics: string[];
    /** `null` when `transport=cookie` was requested. */
    token: string | null;
    expiresIn: number;
}

/** Error codes of the page draft version and lock checks (C8, C9). */
export const PAGE_VERSION_REQUIRED_ERROR = 'page_version_required' as const;
export const STALE_PAGE_VERSION_ERROR = 'stale_page_version' as const;
export const PAGE_LOCKED_ERROR = 'page_locked' as const;
/**
 * `409` when the caller's own page edit lock ended by idle expiry and they try
 * to renew (`POST .../lock`). Data is {@link IPageLockStatus}. Resume through
 * take-over (`POST .../lock/take-over`), not a plain acquire.
 */
export const LOCK_IDLE_ENDED_ERROR = 'lock_idle_ended' as const;

/**
 * Draft version of a page (C8). `GET /admin/pages/{page_id}` returns it in its
 * data (and in the `X-Page-Version` header); admin page types extend this so
 * the editor can send it back with every draft write.
 */
export interface IPageDraftVersioned {
    /** Integer from 1; raised by one on every successful draft write. */
    draft_version: number;
}

/** Data of `409 stale_page_version` (C8). */
export interface IStalePageVersionData {
    page_id: number;
    current_version: number;
}

/** Holder of a page edit lock (C9). */
export interface IPageLockHolder {
    id: number;
    name: string;
}

/**
 * Status of a page edit lock (C9). Per caller (`mine`) and never cached.
 * `holder`, `expires_at` and `idle_expires_at` are `null` when `held` is false.
 * The data of `409 page_locked` is this object.
 */
export interface IPageLockStatus {
    page_id: number;
    held: boolean;
    mine: boolean;
    holder: IPageLockHolder | null;
    /** The lease ends here unless renewed (120 s after the last renewal). */
    expires_at: string | null;
    /** The lock ends here unless the holder writes (15 minutes after the last draft write). */
    idle_expires_at: string | null;
}
