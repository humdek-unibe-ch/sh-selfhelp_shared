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
 * frame keeps the other frame on the same page. The same channel also carries
 * the shared colour-scheme + language preferences both ways (SET_PREFERENCES
 * down, PREFERENCES_CHANGED up) so the two panes stay in the same theme/locale.
 * The shell prevents sync loops with a per-frame "expected value" guard (it
 * ignores the echo of a command it just sent). See the frontend `LivePreview`
 * shell + `PreviewShellBridge` and the mobile `PreviewSyncBridge`.
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
 * Three-way colour-scheme choice, shared VERBATIM across both panes — it maps
 * 1:1 onto the web's Mantine `useMantineColorScheme` and the mobile theme store
 * (`'auto'` = follow the OS on both).
 */
export type TPreviewColorScheme = 'light' | 'dark' | 'auto';

/**
 * The shared, cross-pane preview preferences. `locale` (e.g. `de-CH`) is the
 * cross-platform language key — each pane maps it to its own language id from
 * its languages list; `null` means "unknown / leave as-is". Carried by both the
 * shell→frame {@link IPreviewSetPreferencesCommand} and the frame→shell
 * {@link IPreviewPreferencesChangedMessage} so theme + language stay in sync.
 */
export interface IPreviewPreferences {
    colorScheme: TPreviewColorScheme;
    locale: string | null;
}

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
    /**
     * shell → frame: apply the shared colour-scheme + language preferences (no
     * reload), so the web pane and the mobile frame stay in the same theme/locale.
     */
    SET_PREFERENCES: 'selfhelp-preview:set-preferences',
    /** frame → shell: the user changed the colour scheme / language in the frame. */
    PREFERENCES_CHANGED: 'selfhelp-preview:preferences-changed',
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
 * non-CMS location. `locale` is the frame's active locale when known (a toolbar
 * indicator); active cross-pane language sync rides {@link PREVIEW_BRIDGE_MESSAGE.PREFERENCES_CHANGED}.
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

/**
 * shell → frame: apply the shared colour-scheme + language {@link IPreviewPreferences}
 * with NO reload, so a theme/language change in one pane (or the toolbar) is
 * mirrored in the other. Idempotent — re-applying the current values is a no-op.
 */
export interface IPreviewSetPreferencesCommand {
    type: typeof PREVIEW_BRIDGE_MESSAGE.SET_PREFERENCES;
    preferences: IPreviewPreferences;
}

/**
 * frame → shell: the user changed the colour scheme and/or language inside the
 * frame; the shell applies it to the other pane. The shell guards against the
 * echo of a value it just pushed so the two panes never ping-pong.
 */
export interface IPreviewPreferencesChangedMessage {
    type: typeof PREVIEW_BRIDGE_MESSAGE.PREFERENCES_CHANGED;
    source: TPreviewFrameSource;
    preferences: IPreviewPreferences;
}

/** Every message that can cross the preview bridge, in either direction. */
export type TPreviewBridgeMessage =
    | IPreviewReadyMessage
    | IPreviewNavigatedMessage
    | IPreviewNavigateCommand
    | IPreviewSetPreferencesCommand
    | IPreviewPreferencesChangedMessage;

/** Runtime guard for the shared preferences payload. */
function isPreviewPreferences(value: unknown): value is IPreviewPreferences {
    if (typeof value !== 'object' || value === null) return false;
    const record = value as Record<string, unknown>;
    return (
        (record.colorScheme === 'light' ||
            record.colorScheme === 'dark' ||
            record.colorScheme === 'auto') &&
        (typeof record.locale === 'string' || record.locale === null)
    );
}

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
        case PREVIEW_BRIDGE_MESSAGE.SET_PREFERENCES:
            return isPreviewPreferences(record.preferences);
        case PREVIEW_BRIDGE_MESSAGE.PREFERENCES_CHANGED:
            return (
                (record.source === 'web' || record.source === 'mobile') &&
                isPreviewPreferences(record.preferences)
            );
        default:
            return false;
    }
}

/**
 * Loop-guard equality for the shared preferences. Both bridges keep the last
 * value they pushed to / received from the other pane and skip re-emitting (or
 * re-applying) an equal one, so a theme/language change never ping-pongs. Shared
 * so the two panes compare preferences identically.
 */
export function arePreviewPreferencesEqual(
    a: IPreviewPreferences | null | undefined,
    b: IPreviewPreferences | null | undefined,
): boolean {
    if (!a || !b) return false;
    return a.colorScheme === b.colorScheme && a.locale === b.locale;
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
