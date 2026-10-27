/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, expect, it } from 'vitest';
import { DEFAULT_RATE_LIMIT_MESSAGE, formatRateLimitMessage, getRateLimitRetryAfter } from '../rateLimit';

const rateLimited = (data: unknown, headers: Record<string, unknown> = {}) => ({
    response: { status: 429, data, headers },
});

describe('getRateLimitRetryAfter', () => {
    it('reads the wait from the 429 envelope', () => {
        expect(getRateLimitRetryAfter(rateLimited({ data: { retry_after: 896 } }))).toBe(896);
    });

    it('falls back to the Retry-After header when the body has no wait (mobile hits the backend directly)', () => {
        expect(getRateLimitRetryAfter(rateLimited({ data: null }, { 'retry-after': '120' }))).toBe(120);
    });

    it('still reports a rate limit with an unknown wait', () => {
        expect(getRateLimitRetryAfter(rateLimited(null))).toBe(0);
    });

    it('ignores every error that is not a 429', () => {
        expect(getRateLimitRetryAfter({ response: { status: 401, data: {} } })).toBeNull();
        expect(getRateLimitRetryAfter(new Error('Network Error'))).toBeNull();
        expect(getRateLimitRetryAfter(undefined)).toBeNull();
    });
});

describe('formatRateLimitMessage', () => {
    it('fills the CMS text with the wait in minutes, rounded up', () => {
        expect(formatRateLimitMessage('Bitte in {minutes} Min. erneut versuchen.', 896)).toBe(
            'Bitte in 15 Min. erneut versuchen.',
        );
    });

    it('never shows zero minutes', () => {
        expect(formatRateLimitMessage('Wait {minutes} min', 0)).toBe('Wait 1 min');
        expect(formatRateLimitMessage('Wait {minutes} min', 30)).toBe('Wait 1 min');
    });

    it('uses the default message when the section has no content', () => {
        expect(formatRateLimitMessage('', 120)).toBe(DEFAULT_RATE_LIMIT_MESSAGE.replace('{minutes}', '2'));
        expect(formatRateLimitMessage(undefined, 120)).toBe(DEFAULT_RATE_LIMIT_MESSAGE.replace('{minutes}', '2'));
    });

    it('keeps text without a placeholder unchanged', () => {
        expect(formatRateLimitMessage('Please try again later.', 600)).toBe('Please try again later.');
    });
});
