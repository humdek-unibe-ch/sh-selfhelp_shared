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
