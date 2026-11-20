/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
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
        FORGOT_PASSWORD: `${API_VERSION_PREFIX}/auth/forgot-password`,
        RESET_PASSWORD: `${API_VERSION_PREFIX}/auth/reset-password`,
        SET_LANGUAGE: `${API_VERSION_PREFIX}/auth/set-language`,
        USER_DATA: `${API_VERSION_PREFIX}/auth/user-data`,
        EVENTS: `${API_VERSION_PREFIX}/auth/events`,
    },
    USER: {
        UPDATE_USERNAME: `${API_VERSION_PREFIX}/auth/user/username`,
        UPDATE_NAME: `${API_VERSION_PREFIX}/auth/user/name`,
        UPDATE_PASSWORD: `${API_VERSION_PREFIX}/auth/user/password`,
        UPDATE_TIMEZONE: `${API_VERSION_PREFIX}/auth/user/timezone`,
        UPDATE_COMMUNICATION_PREFERENCES: `${API_VERSION_PREFIX}/auth/user/communication-preferences`,
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
        /**
         * Static resolve route (no query). Always pair with
         * {@link buildPagesResolveUrl} / {@link buildPagesResolvePath} so
         * `path`, `language_id`, and `preview` are encoded identically across
         * SSR, browser, and mobile.
         */
        RESOLVE_ROUTE: `${API_VERSION_PREFIX}/pages/resolve`,
    },
    NAVIGATION: {
        GET: `${API_VERSION_PREFIX}/navigation`,
        LAST_VISITED: `${API_VERSION_PREFIX}/navigation/last-visited`,
    },
    SEARCH: {
        CONTENT: `${API_VERSION_PREFIX}/search`,
        PAGES: `${API_VERSION_PREFIX}/search/pages`,
    },
    LANGUAGES: `${API_VERSION_PREFIX}/languages`,
    FORMS: {
        SUBMIT: `${API_VERSION_PREFIX}/forms/submit`,
        UPDATE: `${API_VERSION_PREFIX}/forms/update`,
        DELETE: `${API_VERSION_PREFIX}/forms/delete`,
    },
    /**
     * `entry-form-list` / `data-view` lists. A list never has its own create,
     * update or delete route: writes go through {@link ENDPOINTS.FORMS}. The
     * first paint reads `list_state` from the page payload; these routes serve
     * the interactions after it. Path segments are numeric ids, except the
     * action id and the field key, which are encoded.
     */
    LISTS: {
        STATE: (sectionId: number): string => `${API_VERSION_PREFIX}/lists/${sectionId}/state`,
        QUICK_ACTION: (sectionId: number, recordId: number, actionId: string): string =>
            `${API_VERSION_PREFIX}/lists/${sectionId}/records/${recordId}/actions/${encodeURIComponent(actionId)}`,
        HISTORY: (sectionId: number, recordId: number): string =>
            `${API_VERSION_PREFIX}/lists/${sectionId}/records/${recordId}/history`,
        VERSION: (sectionId: number, recordId: number, version: number): string =>
            `${API_VERSION_PREFIX}/lists/${sectionId}/records/${recordId}/versions/${version}`,
        COMPARE: (sectionId: number, recordId: number): string =>
            `${API_VERSION_PREFIX}/lists/${sectionId}/records/${recordId}/compare`,
        RESTORE: (sectionId: number, recordId: number): string =>
            `${API_VERSION_PREFIX}/lists/${sectionId}/records/${recordId}/restore`,
        VERSION_FILE: (sectionId: number, recordId: number, version: number, fieldKey: string): string =>
            `${API_VERSION_PREFIX}/lists/${sectionId}/records/${recordId}/versions/${version}/files/${encodeURIComponent(fieldKey)}`,
        /** Current file of a record shown by a list / data-view / entry-record (F165). */
        CURRENT_FILE: (sectionId: number, recordId: number, fieldKey: string): string =>
            `${API_VERSION_PREFIX}/lists/${sectionId}/records/${recordId}/files/${encodeURIComponent(fieldKey)}`,
    },
    /**
     * Admin data-browser record history (contract 6). Route permission
     * `admin.data.read`; the controller also requires table UPDATE.
     */
    ADMIN_DATA_HISTORY: {
        HISTORY: (tableName: string, recordId: number): string =>
            `${API_VERSION_PREFIX}/admin/data/tables/${encodeURIComponent(tableName)}/records/${recordId}/history`,
        VERSION: (tableName: string, recordId: number, version: number): string =>
            `${API_VERSION_PREFIX}/admin/data/tables/${encodeURIComponent(tableName)}/records/${recordId}/versions/${version}`,
        COMPARE: (tableName: string, recordId: number): string =>
            `${API_VERSION_PREFIX}/admin/data/tables/${encodeURIComponent(tableName)}/records/${recordId}/compare`,
        RESTORE: (tableName: string, recordId: number): string =>
            `${API_VERSION_PREFIX}/admin/data/tables/${encodeURIComponent(tableName)}/records/${recordId}/restore`,
        VERSION_FILE: (tableName: string, recordId: number, version: number, fieldKey: string): string =>
            `${API_VERSION_PREFIX}/admin/data/tables/${encodeURIComponent(tableName)}/records/${recordId}/versions/${version}/files/${encodeURIComponent(fieldKey)}`,
    },
    /**
     * Page edit lock (live sync, C9). Route permission `admin.page.update` plus
     * the update grant on the page. `LOCK` serves three methods: GET (status),
     * POST (acquire or renew) and DELETE (release); `TAKE_OVER` is POST only.
     * Every route answers an `IPageLockStatus`.
     */
    ADMIN_PAGE_LOCK: {
        LOCK: (pageId: number): string => `${API_VERSION_PREFIX}/admin/pages/${pageId}/lock`,
        TAKE_OVER: (pageId: number): string =>
            `${API_VERSION_PREFIX}/admin/pages/${pageId}/lock/take-over`,
    },
} as const;

/** Header on every response to a signed-in caller: the access stamp (live sync, C5). */
export const HEADER_ACL_STAMP = 'X-Acl-Stamp';

/** Request header `X-Page-View: 1`: the only page fetch per visit that counts as a view (C7, F135). */
export const HEADER_PAGE_VIEW = 'X-Page-View';

/** Draft-version header: sent with every page draft write, returned on page reads and writes (C8). */
export const HEADER_PAGE_VERSION = 'X-Page-Version';

/** Header set the backend reads to switch page-access mode + condition platform var. */
export const HEADER_CLIENT_TYPE = 'X-Client-Type';
export const CLIENT_TYPE_WEB = 'web';
export const CLIENT_TYPE_MOBILE = 'mobile';
export const CLIENT_TYPE_MOBILE_AND_WEB = 'mobile_and_web';

export type TClientType =
    | typeof CLIENT_TYPE_WEB
    | typeof CLIENT_TYPE_MOBILE
    | typeof CLIENT_TYPE_MOBILE_AND_WEB;
