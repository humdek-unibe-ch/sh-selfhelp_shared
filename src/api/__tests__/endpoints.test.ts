/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import { API_VERSION_PREFIX, ENDPOINTS } from '../endpoints';
import {
    buildPagesResolvePath,
    buildPagesResolveQuery,
    buildPagesResolveUrl,
    normalizePagesResolvePath,
} from '../pagesResolve';
import type {
    IForgotPasswordRequest,
    IResetPasswordRequest,
} from '../../types/api/auth';

/**
 * Contract coverage for the public auth endpoint catalog. The frontend and the
 * mobile app both build their password-recovery requests from these constants,
 * so a wrong/missing path silently breaks the cross-repo flow (issue #31). The
 * backend serves these under `/cms-api/v1/auth/...`.
 */
describe('ENDPOINTS.AUTH password recovery', () => {
    it('exposes the forgot-password endpoint at the backend path', () => {
        expect(ENDPOINTS.AUTH.FORGOT_PASSWORD).toBe(
            `${API_VERSION_PREFIX}/auth/forgot-password`,
        );
    });

    it('exposes the reset-password endpoint at the backend path', () => {
        expect(ENDPOINTS.AUTH.RESET_PASSWORD).toBe(
            `${API_VERSION_PREFIX}/auth/reset-password`,
        );
    });

    it('models the request DTOs with the backend-required fields', () => {
        const forgot: IForgotPasswordRequest = { email: 'qa.user@selfhelp.test' };
        const reset: IResetPasswordRequest = {
            id_users: 1,
            token: 'qa-token',
            password: 'qa-password-123',
        };

        expect(Object.keys(forgot)).toEqual(['email']);
        expect(Object.keys(reset).sort()).toEqual(
            ['id_users', 'password', 'token'],
        );
    });
});

/**
 * Canonical resolve contract: SSR, browser, and mobile must produce the same
 * query encoding for path / language_id / preview.
 */
describe('buildPagesResolve* (DB-driven routing)', () => {
    it('exposes the static resolve route constant', () => {
        expect(ENDPOINTS.PAGES.RESOLVE_ROUTE).toBe(`${API_VERSION_PREFIX}/pages/resolve`);
    });

    it('normalizes paths before encoding', () => {
        expect(normalizePagesResolvePath('/team/7/')).toBe('/team/7');
        expect(normalizePagesResolvePath('team/7')).toBe('/team/7');
        expect(normalizePagesResolvePath('/')).toBe('/');
        expect(normalizePagesResolvePath('/reset/42/abc?x=1#y')).toBe('/reset/42/abc');
    });

    it('builds identical BFF and full URLs for path-only resolve', () => {
        const params = { path: '/team/7' };
        expect(buildPagesResolveQuery(params)).toBe('path=%2Fteam%2F7');
        expect(buildPagesResolvePath(params)).toBe('/pages/resolve?path=%2Fteam%2F7');
        expect(buildPagesResolveUrl(params)).toBe(
            `${API_VERSION_PREFIX}/pages/resolve?path=%2Fteam%2F7`,
        );
    });

    it('includes language_id and preview=true when requested', () => {
        const params = { path: '/reset/42/abc.def~1', languageId: 2, preview: true };
        expect(buildPagesResolveQuery(params)).toBe(
            'path=%2Freset%2F42%2Fabc.def%7E1&language_id=2&preview=true',
        );
        expect(buildPagesResolveUrl(params)).toBe(
            `${API_VERSION_PREFIX}/pages/resolve?path=%2Freset%2F42%2Fabc.def%7E1&language_id=2&preview=true`,
        );
    });

    it('omits language_id when absent or non-positive', () => {
        expect(buildPagesResolveQuery({ path: '/', languageId: null })).toBe('path=%2F');
        expect(buildPagesResolveQuery({ path: '/', languageId: 0 })).toBe('path=%2F');
        expect(buildPagesResolveQuery({ path: '/', preview: false })).toBe('path=%2F');
    });
});
