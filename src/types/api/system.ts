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
    HEALTH: `${SYSTEM_PREFIX}/health`,
    ADVISORIES: `${SYSTEM_PREFIX}/advisories`,
    MAINTENANCE: `${SYSTEM_PREFIX}/maintenance`,
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

/** Overall verdict for the aggregated system health endpoint. */
export type TSystemHealthOverall = 'healthy' | 'degraded' | 'down';

/** Per-subsystem health status. `not_configured`/`unknown` are informational. */
export type TSystemComponentStatus =
    | 'ok'
    | 'down'
    | 'degraded'
    | 'configured'
    | 'not_configured'
    | 'unknown';

export interface ISystemHealthComponent {
    name: string;
    status: TSystemComponentStatus;
    detail: string;
}

/**
 * GET /admin/system/health — aggregated, instance-scoped health/status.
 * Never contains secrets: connection strings are reduced to configured/not.
 */
export interface ISystemHealth {
    instance_id: string;
    overall: TSystemHealthOverall;
    checked_at: string;
    safe_mode: boolean;
    maintenance_mode: boolean;
    version: {
        selfhelp: string;
        backend: string;
        frontend: string;
        plugin_api: string;
        database_migration: string;
    };
    update: {
        operation_id: string;
        status: string;
        progress_percent: number;
    };
    components: ISystemHealthComponent[];
}
export type ISystemHealthResponse = IBaseApiResponse<ISystemHealth>;

/** Advisory severity, matching the registry advisory feed. */
export type TSystemAdvisorySeverity = 'low' | 'medium' | 'high' | 'critical';

/** An installed component (core/frontend/plugin) an advisory affects. */
export interface ISystemAdvisoryAffected {
    kind: 'core' | 'frontend' | 'plugin';
    id: string;
    installed_version: string;
}

export interface ISystemAdvisory {
    id: string;
    severity: TSystemAdvisorySeverity;
    recommended_action: string;
    /** Whether the manager blocks updates while an affected version is installed. */
    blocked: boolean;
    details_url: string | null;
    affected: ISystemAdvisoryAffected[];
    fixed_versions: string[];
}

/**
 * GET /admin/system/advisories — security advisories from the registry feed,
 * filtered to the components installed on THIS instance. `available: false`
 * means the registry could not be reached (the UI shows "could not check").
 */
export interface ISystemAdvisories {
    available: boolean;
    advisories: ISystemAdvisory[];
}
export type ISystemAdvisoriesResponse = IBaseApiResponse<ISystemAdvisories>;

/**
 * GET /admin/system/maintenance — current maintenance-mode state for THIS
 * instance. `forced_by_env` means the env hard switch
 * (SELFHELP_MAINTENANCE_MODE) is on and the CMS cannot disable it. Never
 * contains secrets — only an operator note + the acting user id.
 */
export interface ISystemMaintenance {
    enabled: boolean;
    forced_by_env: boolean;
    message: string;
    since: string;
    updated_by: string;
    safe_mode: boolean;
}
export type ISystemMaintenanceResponse = IBaseApiResponse<ISystemMaintenance>;

/**
 * PUT /admin/system/maintenance — enable/disable maintenance for THIS instance.
 * No `instance_id`: the backend derives + verifies it server-side.
 */
export interface IMaintenanceSetRequest {
    enabled: boolean;
    message?: string;
}

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
