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
 * The list routes are served by `FormListController`; the paths are the ones
 * `api_routes` seeds (`docs/reference/api/22-form-lists.md`).
 */
describe('ENDPOINTS.LISTS', () => {
    it('builds the state, history, comparison and restore routes of a record', () => {
        expect(ENDPOINTS.LISTS.STATE(311)).toBe(`${API_VERSION_PREFIX}/lists/311/state`);
        expect(ENDPOINTS.LISTS.HISTORY(311, 41)).toBe(`${API_VERSION_PREFIX}/lists/311/records/41/history`);
        expect(ENDPOINTS.LISTS.VERSION(311, 41, 3)).toBe(`${API_VERSION_PREFIX}/lists/311/records/41/versions/3`);
        expect(ENDPOINTS.LISTS.COMPARE(311, 41)).toBe(`${API_VERSION_PREFIX}/lists/311/records/41/compare`);
        expect(ENDPOINTS.LISTS.RESTORE(311, 41)).toBe(`${API_VERSION_PREFIX}/lists/311/records/41/restore`);
    });

    it('encodes the action id and the field key, the only free-text segments', () => {
        expect(ENDPOINTS.LISTS.QUICK_ACTION(311, 41, 'mark_done')).toBe(`${API_VERSION_PREFIX}/lists/311/records/41/actions/mark_done`);
        expect(ENDPOINTS.LISTS.QUICK_ACTION(311, 41, 'a/b?c')).toBe(`${API_VERSION_PREFIX}/lists/311/records/41/actions/a%2Fb%3Fc`);
        expect(ENDPOINTS.LISTS.VERSION_FILE(311, 41, 2, 'section_9/..')).toBe(
            `${API_VERSION_PREFIX}/lists/311/records/41/versions/2/files/section_9%2F..`,
        );
        expect(ENDPOINTS.LISTS.CURRENT_FILE(311, 41, 'portrait')).toBe(
            `${API_VERSION_PREFIX}/lists/311/records/41/files/portrait`,
        );
    });
});

describe('ENDPOINTS.ADMIN_DATA_HISTORY', () => {
    it('builds the data-browser history routes under admin.data', () => {
        expect(ENDPOINTS.ADMIN_DATA_HISTORY.HISTORY('news', 9)).toBe(
            `${API_VERSION_PREFIX}/admin/data/tables/news/records/9/history`,
        );
        expect(ENDPOINTS.ADMIN_DATA_HISTORY.VERSION('news', 9, 2)).toBe(
            `${API_VERSION_PREFIX}/admin/data/tables/news/records/9/versions/2`,
        );
        expect(ENDPOINTS.ADMIN_DATA_HISTORY.COMPARE('a/b', 1)).toBe(
            `${API_VERSION_PREFIX}/admin/data/tables/a%2Fb/records/1/compare`,
        );
        expect(ENDPOINTS.ADMIN_DATA_HISTORY.RESTORE('news', 9)).toBe(
            `${API_VERSION_PREFIX}/admin/data/tables/news/records/9/restore`,
        );
        expect(ENDPOINTS.ADMIN_DATA_HISTORY.VERSION_FILE('news', 9, 2, 'doc')).toBe(
            `${API_VERSION_PREFIX}/admin/data/tables/news/records/9/versions/2/files/doc`,
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
