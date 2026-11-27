/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Mobile host-services bridge (mobile renderer contract, `MOBILE_RENDERER_VERSION`).
 *
 * A plugin's mobile package renders its UI (commonly inside an isolated
 * WebView), but it MUST NOT own authenticated backend access. Instead the
 * native mobile host registers an `IMobileHostServices` implementation at
 * boot, and the plugin performs every protected API call through it. This
 * keeps the access token, the 401-refresh round-trip, session-expiry, the
 * API base URL, and client headers (`X-Client-Type: mobile`, locale) in the
 * host — never inside plugin/WebView code.
 *
 * Design constraints:
 *   - Framework-agnostic: no `react` / `react-native` / `axios` imports here.
 *     The host wires its own HTTP client (e.g. the shared axios singleton)
 *     into `request`.
 *   - Singleton: the host calls {@link setMobileHostServices} once during
 *     boot; the plugin calls {@link getMobileHostServices} at runtime.
 *   - The token is intentionally NOT a required input to plugin calls. A
 *     plugin may read {@link IMobileHostServices.getAccessToken} only for
 *     non-sensitive bootstrapping; it must never implement its own refresh.
 */

/** HTTP method accepted by the host request bridge. */
export type TMobileHostMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * A protected backend request the plugin asks the host to perform. The
 * host prepends {@link IMobileHostServices.apiBaseUrl}, attaches the bearer
 * token + client headers, and handles a single 401-refresh retry.
 */
export interface IMobileHostRequest {
    /**
     * Path relative to the host API base, e.g.
     * `/cms-api/v1/plugins/<id>/published/<key>`. Absolute URLs are rejected
     * by the host so a plugin cannot redirect protected calls off-origin.
     */
    path: string;
    /** HTTP method. Defaults to `GET`. */
    method?: TMobileHostMethod;
    /** JSON-serialisable request body (sent as `application/json`). */
    body?: unknown;
    /** Extra request headers (e.g. a plugin runtime-config echo header). */
    headers?: Record<string, string>;
    /** Query parameters appended to the path. */
    query?: Record<string, string | number | boolean>;
}

/**
 * Result of a host request. `data` is the parsed response body (the SelfHelp
 * API envelope `{ status, message, data, ... }` for API routes), so the
 * plugin reads `response.data.data` for the inner payload. `reason` mirrors
 * the backend error discriminator (e.g. `already_submitted_once`) so the
 * plugin can branch on lifecycle errors without re-parsing the body.
 */
export interface IMobileHostResponse<TData = unknown> {
    /** True for 2xx responses. */
    ok: boolean;
    /** HTTP status code (0 when the request never reached the server). */
    status: number;
    /** Parsed response body, or `null` when there is no JSON body. */
    data: TData | null;
    /** Backend error `reason` discriminator, when present. */
    reason?: string;
    /** Human-readable error message for non-ok responses. */
    error?: string;
    /**
     * True when the call failed because the session could not be
     * authenticated even after the host's refresh attempt (a 401 the host
     * could not recover). The plugin should surface a "session expired"
     * state rather than a generic error.
     */
    sessionExpired?: boolean;
}

/**
 * One file part of a multipart upload the plugin asks the host to send
 * (renderer 0.4.0, C27). Give exactly one of {@link uri} or {@link base64}.
 */
export interface IMobileHostUploadFile {
    /** Multipart part name (the field name the plugin's route reads). */
    field: string;
    /** File name sent to the server. */
    name: string;
    /** MIME type, e.g. `audio/m4a`. */
    type: string;
    /**
     * `file://` or `content://` (native), `blob:` or `data:` (web preview).
     * Exclusive with {@link base64}.
     */
    uri?: string;
    /** Raw base64 without a `data:` prefix. Exclusive with {@link uri}. */
    base64?: string;
}

/**
 * A protected multipart upload (renderer 0.4.0, C27). Same path rules as
 * {@link IMobileHostRequest}: relative to the host API base, absolute URLs are
 * refused.
 */
export interface IMobileHostUploadRequest {
    /** Path relative to the host API base, like {@link IMobileHostRequest.path}. */
    path: string;
    /** HTTP method. Defaults to `POST`. */
    method?: 'POST' | 'PUT';
    /** Text parts of the multipart body. */
    fields?: Record<string, string>;
    /** File parts. At least one is required. */
    files: IMobileHostUploadFile[];
    /** Extra request headers. */
    headers?: Record<string, string>;
    /** Query parameters appended to the path. */
    query?: Record<string, string | number | boolean>;
}

/** What a plugin may ask the host to request from the system (C28). */
export type TMobileHostPermission = 'microphone' | 'camera';

/**
 * Answer to {@link IMobileHostServices.requestPermission}: `granted`, `denied`
 * (the user said no and the app may ask again) or `blocked` (the system will
 * not show the prompt again; send the user to {@link IMobileHostServices.openAppSettings}).
 */
export type TMobileHostPermissionState = 'granted' | 'denied' | 'blocked';

/**
 * Small device key-value store for one plugin, one user and one server (C29).
 * Meant for drafts and view state. It is not encrypted: never keep secrets or
 * tokens in it. The server still decides everything on submit.
 */
export interface IMobilePluginStorage {
    /** The stored value, or `null` when the key is not set. */
    getItem(key: string): Promise<string | null>;
    /** Stores a value; rejects with `Error('plugin_storage_full')` over the size cap and changes nothing. */
    setItem(key: string, value: string): Promise<void>;
    /** Removes one key. */
    removeItem(key: string): Promise<void>;
    /** Removes everything of this plugin, this user and this server only. */
    clear(): Promise<void>;
}

/**
 * Authenticated host services exposed to a plugin's mobile package. The
 * host owns the token + refresh; the plugin only describes the request.
 */
export interface IMobileHostServices {
    /** Resolved API base URL the host calls (e.g. `https://cms.example.com`). */
    apiBaseUrl(): string;
    /**
     * Current access token, or `null` when unauthenticated. Exposed only for
     * non-sensitive bootstrapping (e.g. deciding whether to show a login
     * prompt). Plugins must route protected calls through {@link request},
     * which attaches the token host-side, instead of injecting this value.
     */
    getAccessToken(): string | null;
    /** Perform an authenticated request with host-managed 401 refresh. */
    request<TData = unknown>(req: IMobileHostRequest): Promise<IMobileHostResponse<TData>>;
    /**
     * Navigate the host app on the user's behalf to honour an in-content
     * redirect (e.g. a survey's "redirect on completion") WITHOUT the plugin
     * touching `window.location`. The host owns the router, so it routes an
     * internal CMS page keyword / in-app path through its own navigation stack
     * and only leaves the app for an explicit external URL. This keeps redirects
     * correct in EVERY host surface — the native app AND the CMS web preview,
     * where a raw `location` assignment would navigate (and break) the embedded
     * iframe instead of the app.
     *
     * @param target   CMS page keyword / in-app path, or an absolute URL when
     *                 `external` is true.
     * @param external When true the target is a full off-app URL the host opens
     *                 in the system browser (native) / a new tab (web) instead of
     *                 routing inside the app. Defaults to false.
     *
     * Optional: a host registered by an older app binary (renderer < 0.3.0) may
     * omit it, so a plugin MUST feature-detect (`if (host.navigate)`) and degrade
     * gracefully rather than assume it exists.
     */
    navigate?(target: string, external?: boolean): void;
    /**
     * Send a `multipart/form-data` request through the host (renderer 0.4.0).
     * The host attaches the token and client headers, makes one 401 refresh
     * retry and answers in the {@link IMobileHostResponse} shape, like
     * {@link request}. An absolute path is refused. Nothing is sent, and the
     * answer is `{ ok: false, status: 0, reason }`, when `reason` is
     * `invalid_upload` (no file, or a file with both or neither of `uri` and
     * `base64`) or `file_too_large` (one total size limit per request). The
     * host removes any temporary file it wrote for a `base64` input.
     *
     * Optional: an older host omits it, so a plugin MUST feature-detect
     * (`if (host.upload)`) and degrade gracefully.
     */
    upload?<TData = unknown>(req: IMobileHostUploadRequest): Promise<IMobileHostResponse<TData>>;
    /**
     * Ask the system for microphone or camera access (renderer 0.4.0). Only the
     * app asks; a plugin in a WebView cannot. Resolves to `granted`, `denied`
     * or `blocked` ({@link TMobileHostPermissionState}); on `blocked` the plugin
     * should explain why it needs the permission and offer
     * {@link openAppSettings}.
     *
     * Optional: feature-detect (`if (host.requestPermission)`).
     */
    requestPermission?(kind: TMobileHostPermission): Promise<TMobileHostPermissionState>;
    /**
     * Open the app's system settings page so the user can change a `blocked`
     * permission (renderer 0.4.0). Does nothing in the web preview.
     *
     * Optional: feature-detect (`if (host.openAppSettings)`).
     */
    openAppSettings?(): void;
    /**
     * Device storage for the given plugin id, scoped to the current server and
     * user (guest = 0), emptied on logout, server switch and a rejected token
     * refresh (renderer 0.4.0, C29). Throws when `pluginId` does not match the
     * manifest id pattern. Not for secrets.
     *
     * Optional: feature-detect (`if (host.getPluginStorage)`).
     */
    getPluginStorage?(pluginId: string): IMobilePluginStorage;
}

let registeredHostServices: IMobileHostServices | null = null;

/**
 * Register the host services implementation. Called once by the native
 * mobile host during boot (before any plugin renders). Re-registering
 * replaces the previous implementation (e.g. on a server switch).
 */
export function setMobileHostServices(services: IMobileHostServices | null): void {
    registeredHostServices = services;
}

/**
 * Read the registered host services. Returns `null` when no host has
 * registered yet — a plugin must treat that as "host too old / not ready"
 * and degrade gracefully (it must never fall back to its own token logic).
 */
export function getMobileHostServices(): IMobileHostServices | null {
    return registeredHostServices;
}
