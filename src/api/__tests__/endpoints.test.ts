/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import { API_VERSION_PREFIX, ENDPOINTS } from '../endpoints';
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
 * Contract coverage for the DB-driven public path resolver (issue #30). The web
 * frontend SSR layer and the mobile app both build the resolve request from
 * `ENDPOINTS.PAGES.RESOLVE`, so a wrong/missing path silently breaks every
 * parameterized public URL (`/reset/{user_id}/{token}`, `/team/{record_id}`).
 */
describe('ENDPOINTS.PAGES.RESOLVE (DB-driven routing)', () => {
    it('builds the resolve endpoint with the path as a URL-encoded query param', () => {
        expect(ENDPOINTS.PAGES.RESOLVE('/team/7')).toBe(
            `${API_VERSION_PREFIX}/pages/resolve?path=%2Fteam%2F7`,
        );
    });

    it('encodes reset/validate token paths so slashes survive transport', () => {
        expect(ENDPOINTS.PAGES.RESOLVE('/reset/42/abc.def~1')).toBe(
            `${API_VERSION_PREFIX}/pages/resolve?path=%2Freset%2F42%2Fabc.def~1`,
        );
        expect(ENDPOINTS.PAGES.RESOLVE('/')).toBe(
            `${API_VERSION_PREFIX}/pages/resolve?path=%2F`,
        );
    });
});
