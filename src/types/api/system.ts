/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * System maintenance / update contracts (SelfHelp Manager <-> CMS <-> admin UI).
 *
 * Hard rule: the CMS admin update flow is scoped to the CURRENT instance only.
 * The browser MUST NOT send an arbitrary `instance_id` for update execution; the
 * backend derives and verifies the instance identity server-side. That is why
 * {@link IUpdateRequest} intentionally has no `instance_id` field.
 *
 * These mirror the manager's `@shm/schemas` shapes and the backend JSON schemas
 * under `config/schemas/api/v1/{responses,requests}/admin/`.
 */
import type { IBaseApiResponse } from './envelope';

const SYSTEM_PREFIX = '/cms-api/v1/admin/system';

/** Admin system maintenance endpoints (web admin; not part of the mobile subset). */
export const SYSTEM_ENDPOINTS = {
    VERSION: `${SYSTEM_PREFIX}/version`,
    UPDATE_PREFLIGHT: `${SYSTEM_PREFIX}/update/preflight`,
    UPDATE_REQUEST: `${SYSTEM_PREFIX}/update/request`,
    UPDATE_STATUS: `${SYSTEM_PREFIX}/update/status`,
} as const;

export interface ISystemInstalledPlugin {
    id: string;
    version: string;
    compatible: boolean;
}

/** GET /admin/system/version — current instance version summary. */
export interface ISystemVersion {
    instance_id: string;
    selfhelp_version: string;
    backend_version: string;
    frontend_version: string;
    plugin_api_version: string;
    database_migration_version: string;
    safe_mode: boolean;
    maintenance_mode: boolean;
    installed_plugins: ISystemInstalledPlugin[];
}
export type ISystemVersionResponse = IBaseApiResponse<ISystemVersion>;

export type TUpdatePreflightStatus = 'ok' | 'warning' | 'blocked';
export type TUpdateCheckSeverity = 'info' | 'warning' | 'error';

export interface IUpdatePreflightCheck {
    code: string;
    severity: TUpdateCheckSeverity;
    message: string;
}

export interface IUpdatePreflightOption {
    type: string;
    version?: string;
    label: string;
}

/** GET /admin/system/update/preflight — latest preflight for THIS instance. */
export interface IUpdatePreflight {
    preflight_id: string;
    status: TUpdatePreflightStatus;
    instance_id: string;
    current_version: string;
    target_version: string;
    checks: IUpdatePreflightCheck[];
    options: IUpdatePreflightOption[];
    database: {
        destructive: boolean;
        requires_backup: boolean;
        manual_confirmation_required: boolean;
    };
    rollback: {
        automatic_before_migrations: boolean;
        automatic_after_destructive_migrations: boolean;
    };
}
export type IUpdatePreflightResponse = IBaseApiResponse<IUpdatePreflight>;

/**
 * POST /admin/system/update/request — request an update for THIS instance.
 * No `instance_id`: the backend derives + verifies it. A destructive migration
 * requires `accepted_migration_risk: true` (and the typed confirmation).
 */
export interface IUpdateRequest {
    target_version: string;
    preflight_id: string;
    accepted_migration_risk: boolean;
    typed_confirmation?: string;
}

/**
 * Update operation lifecycle. The CMS records `requested`; the SelfHelp Manager
 * writes the granular execution states back through the manager loop. `approved`
 * and `running` are kept as coarse legacy states for backward compatibility.
 */
export type TUpdateOperationStatus =
    | 'requested'
    | 'approved'
    | 'accepted'
    | 'running'
    | 'preflight_running'
    | 'preflight_failed'
    | 'backup_running'
    | 'update_running'
    | 'migration_running'
    | 'health_check_running'
    | 'succeeded'
    | 'failed'
    | 'rollback_running'
    | 'rolled_back'
    | 'rollback_failed'
    | 'rejected';

export interface IUpdateStep {
    name: string;
    status: string;
    detail?: string;
}

/** GET /admin/system/update/status — status/progress for THIS instance. */
export interface IUpdateStatus {
    instance_id: string;
    operation_id: string;
    status: TUpdateOperationStatus;
    target_version: string;
    progress_percent: number;
    steps: IUpdateStep[];
    requested_at: string;
    updated_at: string;
    message?: string;
}
export type IUpdateStatusResponse = IBaseApiResponse<IUpdateStatus>;

export type IUpdateRequestResponse = IBaseApiResponse<{
    operation_id: string;
    instance_id: string;
    status: TUpdateOperationStatus;
}>;
