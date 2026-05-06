import type { IBaseApiResponse } from './envelope';
import type { IUserData } from '../auth';

export interface ILoginRequest {
    email: string;
    password: string;
    remember?: boolean;
}

export interface ITwoFactorVerifyRequest {
    user_id: number;
    code: string;
}

export interface IRefreshRequest {
    refresh_token: string;
}

export interface ILoginSuccessData {
    access_token: string;
    refresh_token: string;
    user: IUserData;
}

export interface ITwoFactorRequiredData {
    requires_2fa: true;
    user_id: number;
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
