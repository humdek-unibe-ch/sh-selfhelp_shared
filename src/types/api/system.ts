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
    UPDATE_RELEASES: `${SYSTEM_PREFIX}/update/releases`,
    // Frontend-only update flow. The frontend ships independently of the core,
    // so an instance already on the newest core can still move to a newer
    // compatible frontend. These reuse the core preflight/releases response
    // shapes; the request body omits `accepted_migration_risk` (a frontend swap
    // is stateless — no destructive migration, no backup).
    UPDATE_FRONTEND_RELEASES: `${SYSTEM_PREFIX}/update/frontend/releases`,
    UPDATE_FRONTEND_PREFLIGHT: `${SYSTEM_PREFIX}/update/frontend/preflight`,
    UPDATE_FRONTEND_REQUEST: `${SYSTEM_PREFIX}/update/frontend/request`,
    // Mobile-preview update flow. The `selfhelp-mobile-preview` web image is
    // provisioned with every install and ships independently of the core (like
    // the frontend), so an instance can move it to a newer compatible version on
    // its own. These reuse the core preflight/releases response shapes; the
    // request body omits `accepted_migration_risk` (a preview swap is stateless).
    // Requesting one onto an instance that never had it doubles as the
    // enable/bootstrap path (the SelfHelp Manager provisions it).
    UPDATE_MOBILE_PREVIEW_RELEASES: `${SYSTEM_PREFIX}/update/mobile-preview/releases`,
    UPDATE_MOBILE_PREVIEW_PREFLIGHT: `${SYSTEM_PREFIX}/update/mobile-preview/preflight`,
    UPDATE_MOBILE_PREVIEW_REQUEST: `${SYSTEM_PREFIX}/update/mobile-preview/request`,
} as const;

/**
 * Discriminates a core (full-stack) update from the stateless component-only
 * swaps. `frontend` swaps the Next.js image; `mobile-preview` swaps the
 * `selfhelp-mobile-preview` web image. Both are lightweight (no DB migration,
 * no backup) and performed by the SelfHelp Manager.
 */
export type TUpdateKind = 'core' | 'frontend' | 'mobile-preview';

export interface ISystemInstalledPlugin {
    id: string;
    version: string;
    compatible: boolean;
}

/**
 * How the backend runtime is deployed. `docker` = the production image
 * published by docker-release.yml (SELFHELP_DEPLOYMENT is baked into the
 * image); `source` = composer dev / bare checkout (the default).
 */
export type TSystemDeployment = 'docker' | 'source';

/** GET /admin/system/version — current instance version summary. */
export interface ISystemVersion {
    instance_id: string;
    selfhelp_version: string;
    backend_version: string;
    frontend_version: string;
    /**
     * The provisioned `selfhelp-mobile-preview` web image version reported by the
     * backend (set by the SelfHelp Manager via `SELFHELP_MOBILE_PREVIEW_VERSION`
     * when it provisions/updates the service). `unknown` until the manager stamps
     * it; `not_installed` when no preview service is provisioned for this
     * instance (e.g. an instance that predates default provisioning, or a dev
     * source checkout). The page-editor preview panel additionally probes the
     * running image's `version.json` for the live value.
     */
    mobile_preview_version: string;
    plugin_api_version: string;
    database_migration_version: string;
    deployment: TSystemDeployment;
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
    /**
     * Standardized compatibility-error fields. Version/compatibility checks
     * (`plugin_compatibility` for a core update blocked by an installed plugin;
     * `frontend_compatibility` for a frontend-only update the running core
     * forbids or that needs a different core) populate these so the
     * admin/operator sees exactly which component blocks which target and the
     * range it requires. Absent on non-compatibility checks.
     */
    component?: string;
    component_id?: string;
    current_version?: string;
    target_version?: string;
    required_range?: string;
    /** Whether this compatibility error blocks the update (mirrors `CompatibilityError.blocking`). */
    blocking?: boolean;
    /**
     * For `plugin_compatibility` checks: whether the blocking plugin is pinned and
     * therefore must be unpinned (or removed) before it can be updated to a
     * compatible version. Absent on non-plugin checks.
     */
    pinned?: boolean;
}

/**
 * The single, standardized compatibility-error object used by BOTH the core
 * update preflight AND the plugin install/update flow, so an operator sees the
 * SAME shape regardless of which installer raised it.
 *
 * Canonical cross-repo contract (the field set MUST match on every side):
 *   - backend `App\Plugin\Registry\Unified\CompatibilityError::toArray()`,
 *   - SelfHelp Manager `@shm/resolver` `CompatibilityError`,
 *   - frontend `IPluginCompatibilityError`.
 *
 * The compatibility fields embedded in {@link IUpdatePreflightCheck} mirror this
 * shape (a preflight check additionally carries the generic `code`/`severity`
 * and the plugin-specific `pinned` affordance). Snake_case is the wire contract.
 */
export interface ICompatibilityError {
    component: 'core' | 'frontend' | 'mobile-preview' | 'plugin';
    component_id: string;
    current_version: string | null;
    target_version: string | null;
    required_range: string;
    blocking: boolean;
    message: string;
}

export interface IUpdatePreflightOption {
    type: string;
    version?: string;
    label: string;
}

/** One core version published in the official registry index. */
export interface IUpdateRelease {
    version: string;
    channel: 'stable' | 'beta' | 'nightly' | 'test';
    /** Whether the registry marks this release as blocked (e.g. by a security advisory). */
    blocked: boolean;
}

/**
 * GET /admin/system/update/releases — core versions published in the official
 * registry (newest first) for the "Request an update" version picker.
 * `available: false` means the registry could not be reached; the UI falls
 * back to manual version entry instead of blocking.
 */
export interface IUpdateReleases {
    available: boolean;
    current_version: string;
    releases: IUpdateRelease[];
}
export type IUpdateReleasesResponse = IBaseApiResponse<IUpdateReleases>;

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
 * Update operation lifecycle. `idle` is the synthetic state for an instance that
 * has never run an update (no operation row) — the backend returns it instead of
 * a misleading `succeeded`/100%. The CMS records `requested`; the SelfHelp
 * Manager writes the granular execution states back through the manager loop.
 * `approved` and `running` are kept as coarse legacy states for compatibility.
 */
export type TUpdateOperationStatus =
    | 'idle'
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

/**
 * Manager-loop visibility attached to the update status. `configured` is
 * whether this instance has a manager token (empty token = loop disabled);
 * `last_seen_at` is the last authenticated manager poll (null = never);
 * `requested_stale` is true when the latest operation has sat in `requested`
 * too long without the manager claiming it — the UI warns that the SelfHelp
 * Manager may not be running.
 */
export interface IUpdateStatusManager {
    configured: boolean;
    last_seen_at: string | null;
    requested_stale: boolean;
}

/** GET /admin/system/update/status — status/progress for THIS instance. */
export interface IUpdateStatus {
    instance_id: string;
    operation_id: string;
    status: TUpdateOperationStatus;
    /**
     * Whether the latest operation is a full-stack core update or a frontend-only
     * update. `idle` (no operation yet) reports `core`. Lets the status UI label a
     * frontend swap correctly instead of implying a core upgrade.
     */
    kind: TUpdateKind;
    target_version: string;
    /**
     * The frontend version a `frontend`-kind operation targets; `null` for a
     * core operation (the manager resolves the compatible frontend itself) and
     * for the synthetic `idle` status.
     */
    target_frontend_version: string | null;
    /**
     * The mobile-preview image version a `mobile-preview`-kind operation targets;
     * `null` for core/frontend operations and the synthetic `idle` status.
     */
    target_mobile_preview_version: string | null;
    progress_percent: number;
    steps: IUpdateStep[];
    requested_at: string;
    updated_at: string;
    message?: string;
    manager: IUpdateStatusManager;
}
export type IUpdateStatusResponse = IBaseApiResponse<IUpdateStatus>;

export type IUpdateRequestResponse = IBaseApiResponse<{
    operation_id: string;
    instance_id: string;
    status: TUpdateOperationStatus;
}>;

/**
 * POST /admin/system/update/frontend/request — request a FRONTEND-only update
 * for THIS instance. Like {@link IUpdateRequest} it carries no `instance_id`
 * (the backend derives + verifies it), but it also omits
 * `accepted_migration_risk`/`typed_confirmation`: a frontend swap is stateless,
 * so there is no destructive migration to confirm. The SelfHelp Manager
 * re-resolves the signed frontend release and is the final authority on
 * compatibility before it swaps the container.
 */
export interface IFrontendUpdateRequest {
    target_version: string;
    preflight_id: string;
}

/**
 * GET /admin/system/update/frontend/releases — frontend versions published in
 * the official registry (newest first). Reuses {@link IUpdateReleases}:
 * `current_version` is the instance's installed frontend version and
 * `available: false` means the registry was unreachable (fall back to manual
 * entry). Aliased for call-site clarity.
 */
export type IFrontendUpdateReleases = IUpdateReleases;
export type IFrontendUpdateReleasesResponse = IUpdateReleasesResponse;

/**
 * GET /admin/system/update/frontend/preflight — compatibility verdict for a
 * frontend-only target. Reuses {@link IUpdatePreflight}; the frontend is
 * stateless so `database.destructive`/`requires_backup` are always false. The
 * frontend ⇄ core compatibility rule IS evaluated here (as a
 * `frontend_compatibility` check) against the same signed registry metadata the
 * SelfHelp Manager resolves, so the CMS verdict matches the manager's instead of
 * always reporting "OK"; the manager still re-verifies signatures + image
 * digests at execution and remains the final authority (it also enforces the
 * running core's range from the instance lock when the core release has left the
 * registry). Aliased for call-site clarity.
 */
export type IFrontendUpdatePreflight = IUpdatePreflight;
export type IFrontendUpdatePreflightResponse = IUpdatePreflightResponse;

/** POST /admin/system/update/frontend/request — accepted frontend-update record. */
export type IFrontendUpdateRequestResponse = IBaseApiResponse<{
    operation_id: string;
    instance_id: string;
    status: TUpdateOperationStatus;
    kind: 'frontend';
    target_frontend_version: string;
}>;

/**
 * POST /admin/system/update/mobile-preview/request — request a MOBILE-PREVIEW
 * update for THIS instance. Like {@link IFrontendUpdateRequest} it carries no
 * `instance_id` (the backend derives + verifies it) and no
 * `accepted_migration_risk` (a preview swap is stateless). Requesting it onto an
 * instance that has no preview yet is also the enable/bootstrap path: the
 * SelfHelp Manager provisions the `selfhelp-mobile-preview` service. The manager
 * re-resolves the signed release and is the final authority on compatibility +
 * signatures + image digests before it swaps the container.
 */
export interface IMobilePreviewUpdateRequest {
    target_version: string;
    preflight_id: string;
}

/**
 * GET /admin/system/update/mobile-preview/releases — mobile-preview image
 * versions published in the official registry (newest first). Reuses
 * {@link IUpdateReleases}: `current_version` is the instance's provisioned
 * preview version (or `not_installed`) and `available: false` means the registry
 * was unreachable (fall back to manual entry). Aliased for call-site clarity.
 */
export type IMobilePreviewUpdateReleases = IUpdateReleases;
export type IMobilePreviewUpdateReleasesResponse = IUpdateReleasesResponse;

/**
 * GET /admin/system/update/mobile-preview/preflight — compatibility verdict for
 * a mobile-preview target. Reuses {@link IUpdatePreflight}; the preview is
 * stateless so `database.destructive`/`requires_backup` are always false. The
 * preview ⇄ core compatibility rule IS evaluated here (as a
 * `mobile_preview_compatibility` check) against the same signed registry
 * metadata the SelfHelp Manager resolves — the running core must satisfy the
 * target preview's `backendCompatibility.requiredCoreRange` — so the CMS verdict
 * matches the manager's instead of always reporting "OK". The manager still
 * re-verifies signatures + image digests and re-runs the per-plugin RN/Expo
 * twin-axis gate at execution and remains the final authority. Aliased for
 * call-site clarity.
 */
export type IMobilePreviewUpdatePreflight = IUpdatePreflight;
export type IMobilePreviewUpdatePreflightResponse = IUpdatePreflightResponse;

/** POST /admin/system/update/mobile-preview/request — accepted record. */
export type IMobilePreviewUpdateRequestResponse = IBaseApiResponse<{
    operation_id: string;
    instance_id: string;
    status: TUpdateOperationStatus;
    kind: 'mobile-preview';
    target_mobile_preview_version: string;
}>;
