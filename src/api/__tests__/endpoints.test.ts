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
