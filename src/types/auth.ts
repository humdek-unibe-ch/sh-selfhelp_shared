/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Auth + permission types shared by both apps.
 */

export interface ILanguagePreference {
    id: number;
    locale: string;
    language: string;
    csvSeparator?: string;
}

export type ILanguage = ILanguagePreference;

export interface IUserData {
    id: number;
    email: string | null;
    user_name: string | null;
    name: string | null;
    last_login: string | null;
    created: string | null;
    timezone_id: number | null;
    timezone: string | null;
    blocked: boolean;
    user_type: string | null;
    language: ILanguagePreference | null;
    languages?: ILanguagePreference[];
    permissions?: string[];
    roles?: string[];
    groups?: string[];
    acl_version?: string | number | null;
}

export interface IJwtPayload {
    sub: number;
    email?: string;
    iat: number;
    exp: number;
    permissions?: string[];
    roles?: string[];
}

export interface IUserDataResponse {
    status: number;
    message: string;
    error: null | string;
    logged_in: boolean;
    meta: { version: string; timestamp: string };
    data: IUserData | null;
}

/**
 * Permission constants. The full list lives in the backend; these are
 * the most commonly checked client-side. Add to this list as new
 * permissions are introduced.
 */
export const PERMISSIONS = {
    ADMIN_ACCESS: 'admin.access',
    ADMIN_PAGE_READ: 'admin.page.read',
    ADMIN_PAGE_CREATE: 'admin.page.create',
    ADMIN_PAGE_UPDATE: 'admin.page.update',
    ADMIN_PAGE_DELETE: 'admin.page.delete',
    ADMIN_PAGE_EXPORT: 'admin.page.export',
    ADMIN_PAGE_VERSION_PUBLISH: 'admin.page.version.publish',
    ADMIN_PAGE_VERSION_READ: 'admin.page.version.read',
    ADMIN_PAGE_VERSION_COMPARE: 'admin.page.version.compare',
    ADMIN_USER_READ: 'admin.user.read',
    ADMIN_USER_CREATE: 'admin.user.create',
    ADMIN_USER_UPDATE: 'admin.user.update',
    ADMIN_USER_DELETE: 'admin.user.delete',
    ADMIN_USER_BLOCK: 'admin.user.block',
    ADMIN_USER_IMPERSONATE: 'admin.user.impersonate',
    ADMIN_GROUP_READ: 'admin.group.read',
    ADMIN_GROUP_CREATE: 'admin.group.create',
    ADMIN_GROUP_UPDATE: 'admin.group.update',
    ADMIN_GROUP_DELETE: 'admin.group.delete',
    ADMIN_GROUP_ACL: 'admin.group.acl',
    ADMIN_ROLE_READ: 'admin.role.read',
    ADMIN_ROLE_CREATE: 'admin.role.create',
    ADMIN_ROLE_UPDATE: 'admin.role.update',
    ADMIN_ROLE_DELETE: 'admin.role.delete',
    ADMIN_ROLE_PERMISSIONS: 'admin.role.permissions',
    ADMIN_PERMISSION_READ: 'admin.permission.read',
    ADMIN_ASSET_READ: 'admin.asset.read',
    ADMIN_ASSET_CREATE: 'admin.asset.create',
    ADMIN_ASSET_DELETE: 'admin.asset.delete',
    ADMIN_ACTION_READ: 'admin.action.read',
    ADMIN_ACTION_UPDATE: 'admin.action.update',
    ADMIN_ACTION_DELETE: 'admin.action.delete',
    ADMIN_ACTION_TRANSLATION_READ: 'admin.action.translation.read',
    ADMIN_DATA_READ: 'admin.data.read',
    ADMIN_DATA_DELETE: 'admin.data.delete',
    ADMIN_DATA_DELETE_COLUMNS: 'admin.data.delete_columns',
    ADMIN_SCHEDULED_JOB_READ: 'admin.scheduled_job.read',
    ADMIN_SCHEDULED_JOB_EXECUTE: 'admin.scheduled_job.execute',
    ADMIN_SCHEDULED_JOB_DELETE: 'admin.scheduled_job.delete',
    ADMIN_SECTION_DELETE: 'admin.section.delete',
    ADMIN_SETTINGS: 'admin.settings',
    ADMIN_CMS_PREFERENCES_READ: 'admin.cms_preferences.read',
    ADMIN_CMS_PREFERENCES_UPDATE: 'admin.cms_preferences.update',
    ADMIN_CACHE_READ: 'admin.cache.read',
    ADMIN_CACHE_CLEAR: 'admin.cache.clear',
    ADMIN_CACHE_MANAGE: 'admin.cache.manage',
    ADMIN_AUDIT_VIEW: 'admin.audit.view',
} as const;

export type TPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
