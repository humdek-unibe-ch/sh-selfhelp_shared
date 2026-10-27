/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/

/**
 * Brute-force "too many attempts" handling shared by the web and mobile
 * login / two-factor-auth renderers, so both platforms read the backend 429
 * and render the CMS `alert_rate_limited` message identically.
 */

/** Used when the section has no `alert_rate_limited` content. */
export const DEFAULT_RATE_LIMIT_MESSAGE = 'Too many failed attempts. Please try again in {minutes} min.';

interface IRateLimitErrorShape {
    response?: {
        status?: number;
        headers?: Record<string, unknown>;
        data?: { data?: { retry_after?: unknown } | null } | null;
    };
}

/**
 * Seconds to wait when `error` is a backend 429 from the auth rate limiter,
 * else `null`. Reads the envelope's `data.retry_after` first (the web BFF
 * drops the `Retry-After` header), then the header; `0` when neither is set.
 */
export function getRateLimitRetryAfter(error: unknown): number | null {
    const response = (error as IRateLimitErrorShape | null | undefined)?.response;
    if (response?.status !== 429) {
        return null;
    }

    const fromBody = response.data?.data?.retry_after;
    if (typeof fromBody === 'number' && fromBody > 0) {
        return fromBody;
    }

    const fromHeader = Number(response.headers?.['retry-after']);
    return Number.isFinite(fromHeader) && fromHeader > 0 ? fromHeader : 0;
}

/**
 * The CMS message with `{minutes}` replaced by the remaining wait, rounded up
 * (at least 1). Falls back to {@link DEFAULT_RATE_LIMIT_MESSAGE} when the
 * template is empty.
 */
export function formatRateLimitMessage(template: string | null | undefined, retryAfterSeconds: number): string {
    const text = template?.trim() ? template : DEFAULT_RATE_LIMIT_MESSAGE;
    const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
    return text.split('{minutes}').join(String(minutes));
}
