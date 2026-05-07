/**
 * Frontend-only subset of /cms-api/v1/* endpoints. The web frontend keeps
 * its admin endpoints local. The mobile app consumes only what's here.
 */

export const API_VERSION_PREFIX = '/cms-api/v1';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_VERSION_PREFIX}/auth/login`,
        TWO_FACTOR_VERIFY: `${API_VERSION_PREFIX}/auth/two-factor-verify`,
        LOGOUT: `${API_VERSION_PREFIX}/auth/logout`,
        REFRESH: `${API_VERSION_PREFIX}/auth/refresh-token`,
        SET_LANGUAGE: `${API_VERSION_PREFIX}/auth/set-language`,
        USER_DATA: `${API_VERSION_PREFIX}/auth/user-data`,
        EVENTS: `${API_VERSION_PREFIX}/auth/events`,
    },
    USER: {
        UPDATE_USERNAME: `${API_VERSION_PREFIX}/auth/user/username`,
        UPDATE_NAME: `${API_VERSION_PREFIX}/auth/user/name`,
        UPDATE_PASSWORD: `${API_VERSION_PREFIX}/auth/user/password`,
        UPDATE_TIMEZONE: `${API_VERSION_PREFIX}/auth/user/timezone`,
        DELETE_ACCOUNT: `${API_VERSION_PREFIX}/auth/user/account`,
        VALIDATE_TOKEN: (userId: number, token: string): string =>
            `${API_VERSION_PREFIX}/validate/${userId}/${token}`,
        COMPLETE_VALIDATION: (userId: number, token: string): string =>
            `${API_VERSION_PREFIX}/validate/${userId}/${token}/complete`,
    },
    PAGES: {
        LIST: `${API_VERSION_PREFIX}/pages`,
        LIST_WITH_LANGUAGE: (languageId: number): string =>
            `${API_VERSION_PREFIX}/pages/language/${languageId}`,
        BY_KEYWORD: (keyword: string): string =>
            `${API_VERSION_PREFIX}/pages/by-keyword/${encodeURIComponent(keyword)}`,
        BY_ID: (pageId: number): string => `${API_VERSION_PREFIX}/pages/${pageId}`,
    },
    LANGUAGES: `${API_VERSION_PREFIX}/languages`,
    FORMS: {
        SUBMIT: `${API_VERSION_PREFIX}/forms/submit`,
        UPDATE: `${API_VERSION_PREFIX}/forms/update`,
        DELETE: `${API_VERSION_PREFIX}/forms/delete`,
    },
} as const;

/** Header set the backend reads to switch page-access mode + condition platform var. */
export const HEADER_CLIENT_TYPE = 'X-Client-Type';
export const CLIENT_TYPE_WEB = 'web';
export const CLIENT_TYPE_MOBILE = 'mobile';
export const CLIENT_TYPE_MOBILE_AND_WEB = 'mobile_and_web';

export type TClientType =
    | typeof CLIENT_TYPE_WEB
    | typeof CLIENT_TYPE_MOBILE
    | typeof CLIENT_TYPE_MOBILE_AND_WEB;
