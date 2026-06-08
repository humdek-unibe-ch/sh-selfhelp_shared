/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseApiResponse } from './envelope';
import type { IUserData } from '../auth';

export interface ILoginRequest {
    email: string;
    password: string;
    remember?: boolean;
}

export interface ITwoFactorVerifyRequest {
    id_users: number;
    code: string;
}

export interface IRefreshRequest {
    refresh_token: string;
}

/** POST /auth/forgot-password — request a recovery email. */
export interface IForgotPasswordRequest {
    email: string;
}

/** POST /auth/reset-password — set a new password from the one-time token. */
export interface IResetPasswordRequest {
    id_users: number;
    token: string;
    password: string;
}

export interface ILoginSuccessData {
    access_token: string;
    refresh_token: string;
    user: IUserData;
}

export interface ITwoFactorRequiredData {
    requires_2fa: true;
    id_users: number;
    expires_in_seconds?: number;
}

export type ILoginSuccessResponse = IBaseApiResponse<ILoginSuccessData>;
export type ITwoFactorRequiredResponse = IBaseApiResponse<ITwoFactorRequiredData>;
export type ITwoFactorVerifySuccessResponse = IBaseApiResponse<ILoginSuccessData>;
export type ILogoutSuccessResponse = IBaseApiResponse<{ message: string }>;
export type IRefreshSuccessResponse = IBaseApiResponse<{
    access_token: string;
    refresh_token?: string;
}>;
export type ILanguagePreferenceUpdateResponse = IBaseApiResponse<{
    access_token?: string;
    language_id: number;
}>;

/**
 * Generic success for the forgot-password request. The backend always returns
 * `requested: true` regardless of whether the email matched an account, so the
 * endpoint cannot be used to enumerate registered users.
 */
export type IForgotPasswordResponse = IBaseApiResponse<{ requested: boolean }>;

/** Success when the recovery token was valid and the password was changed. */
export type IResetPasswordResponse = IBaseApiResponse<{ reset: boolean }>;
