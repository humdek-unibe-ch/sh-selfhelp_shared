/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Live Preview bridge contract — the `postMessage` protocol between the CMS
 * **Live Preview** shell (the admin page that embeds the previews) and the two
 * embedded preview frames (the web frontend and the `selfhelp-mobile-preview`
 * web image).
 *
 * The shell owns the canonical preview page. Each frame runs a small bridge that
 * (a) reports its in-app navigations up to the shell and (b) accepts a
 * "navigate to keyword" command down from the shell, so clicking a link in one
 * frame keeps the other frame on the same page. The shell prevents sync loops
 * with a per-frame "expected keyword" guard (it ignores the echo of a command it
 * just sent). See the frontend `LivePreview` shell + `PreviewShellBridge` and the
 * mobile `PreviewSyncBridge`.
 *
 * This module is the SINGLE SOURCE OF TRUTH for the message `type` strings, the
 * activation/origin query-param names, the payload shapes, and the runtime type
 * guard, so the shell and both bridges cannot drift. It is a pure contract: no
 * DOM / window access lives here (each app reads `window`/`postMessage` itself).
 *
 * Security: messages are validated by `event.origin` on both ends (the shell
 * allow-lists its own origin for the web frame and the mobile origin for the
 * mobile frame; each frame trusts only the shell origin it was handed via
 * {@link PREVIEW_PARENT_ORIGIN_PARAM}). Never post these with `'*'`.
 */

/** Which embedded preview frame a bridge message refers to. */
export type TPreviewFrameSource = 'web' | 'mobile';

/**
 * Query param the shell appends to a frame URL to ACTIVATE its bridge
 * (`previewShell=1`). Absent (normal public browsing) → the bridge stays dormant
 * so a real visitor never posts navigation messages.
 */
export const PREVIEW_SHELL_PARAM = 'previewShell';

/**
 * Query param carrying the shell's `window.location.origin` so a (possibly
 * cross-origin) frame can target its `postMessage` precisely instead of `'*'`.
 */
export const PREVIEW_PARENT_ORIGIN_PARAM = 'parentOrigin';

/**
 * Message `type` discriminators. Namespaced (`selfhelp-preview:`) so they never
 * collide with other `postMessage` traffic (HMR, analytics, embeds).
 */
export const PREVIEW_BRIDGE_MESSAGE = {
    /** frame → shell: the bridge mounted and is ready to sync. */
    READY: 'selfhelp-preview:ready',
    /** frame → shell: the frame navigated to a new in-app location. */
    NAVIGATED: 'selfhelp-preview:navigated',
    /** shell → frame: navigate the frame to a CMS keyword (soft, no reload). */
    NAVIGATE: 'selfhelp-preview:navigate',
} as const;

export type TPreviewBridgeMessageType =
    (typeof PREVIEW_BRIDGE_MESSAGE)[keyof typeof PREVIEW_BRIDGE_MESSAGE];

/** frame → shell: emitted once when the bridge mounts. */
export interface IPreviewReadyMessage {
    type: typeof PREVIEW_BRIDGE_MESSAGE.READY;
    source: TPreviewFrameSource;
}

/**
 * frame → shell: the frame moved to a new page. `keyword` is the CMS keyword of
 * the current page (the cross-platform sync unit), or `null` for home / a
 * non-CMS location. `locale` is the frame's active locale when known — a
 * read-only toolbar indicator; locales are NOT cross-synced.
 */
export interface IPreviewNavigatedMessage {
    type: typeof PREVIEW_BRIDGE_MESSAGE.NAVIGATED;
    source: TPreviewFrameSource;
    keyword: string | null;
    /** Full in-frame href, for diagnostics / the toolbar URL display. */
    href: string;
    locale?: string | null;
}

/**
 * shell → frame: navigate to `keyword` (the canonical page). `null`/empty =
 * home. The frame performs a SOFT client-side navigation (no reload), so app
 * state and the embedded dev client are preserved.
 */
export interface IPreviewNavigateCommand {
    type: typeof PREVIEW_BRIDGE_MESSAGE.NAVIGATE;
    keyword: string | null;
}

/** Every message that can cross the preview bridge, in either direction. */
export type TPreviewBridgeMessage =
    | IPreviewReadyMessage
    | IPreviewNavigatedMessage
    | IPreviewNavigateCommand;

/**
 * Runtime guard: is `value` a well-formed preview-bridge message? Use it on the
 * receiving end of a `message` event (AFTER the `event.origin` allow-list check)
 * to safely narrow `event.data`. Defensive against arbitrary cross-frame noise.
 */
export function isPreviewBridgeMessage(value: unknown): value is TPreviewBridgeMessage {
    if (typeof value !== 'object' || value === null) return false;
    const record = value as Record<string, unknown>;
    switch (record.type) {
        case PREVIEW_BRIDGE_MESSAGE.READY:
            return record.source === 'web' || record.source === 'mobile';
        case PREVIEW_BRIDGE_MESSAGE.NAVIGATED:
            return (
                (record.source === 'web' || record.source === 'mobile') &&
                (typeof record.keyword === 'string' || record.keyword === null) &&
                typeof record.href === 'string'
            );
        case PREVIEW_BRIDGE_MESSAGE.NAVIGATE:
            return typeof record.keyword === 'string' || record.keyword === null;
        default:
            return false;
    }
}

/**
 * Normalize an in-app path to its CMS keyword (the sync unit): strip the leading
 * slash and any query/hash, decode segments; an empty path (home) → `null`.
 * Shared so the web and mobile bridges derive identical keywords from their
 * respective routers.
 */
export function previewKeywordFromPath(path: string | null | undefined): string | null {
    if (!path) return null;
    const withoutQuery = path.split(/[?#]/, 1)[0] ?? '';
    const trimmed = withoutQuery.replace(/^\/+/, '').replace(/\/+$/, '');
    if (trimmed === '') return null;
    try {
        return decodeURIComponent(trimmed);
    } catch {
        return trimmed;
    }
}
