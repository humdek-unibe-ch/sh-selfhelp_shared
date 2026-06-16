/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import { SYSTEM_ENDPOINTS } from '../system';
import type {
    IFrontendUpdatePreflight,
    IFrontendUpdateReleases,
    IFrontendUpdateRequest,
    IFrontendUpdateRequestResponse,
    IMaintenanceSetRequest,
    ISystemAdvisories,
    ISystemAdvisoriesResponse,
    ISystemAdvisory,
    ISystemHealth,
    ISystemMaintenance,
    ISystemVersion,
    IUpdatePreflight,
    IUpdateRequest,
    IUpdateRequestResponse,
    IUpdateStatus,
    IUpdateStatusResponse,
    TSystemAdvisorySeverity,
    TUpdateKind,
    TUpdateOperationStatus,
} from '../system';

/**
 * Contract coverage for the instance-scoped system maintenance / update flow
 * (SelfHelp Manager <-> CMS <-> admin UI). The hard cross-repo invariant under
 * test: an update request carries NO `instance_id` — the backend derives and
 * verifies the instance identity server-side, so the browser can never target a
 * different instance.
 */
describe('system maintenance contracts', () => {
    it('exposes admin system endpoints under /cms-api/v1/admin/system', () => {
        expect(SYSTEM_ENDPOINTS.VERSION).toBe('/cms-api/v1/admin/system/version');
        expect(SYSTEM_ENDPOINTS.HEALTH).toBe('/cms-api/v1/admin/system/health');
        expect(SYSTEM_ENDPOINTS.ADVISORIES).toBe('/cms-api/v1/admin/system/advisories');
        expect(SYSTEM_ENDPOINTS.MAINTENANCE).toBe('/cms-api/v1/admin/system/maintenance');
        expect(SYSTEM_ENDPOINTS.UPDATE_PREFLIGHT).toBe('/cms-api/v1/admin/system/update/preflight');
        expect(SYSTEM_ENDPOINTS.UPDATE_REQUEST).toBe('/cms-api/v1/admin/system/update/request');
        expect(SYSTEM_ENDPOINTS.UPDATE_STATUS).toBe('/cms-api/v1/admin/system/update/status');
        expect(SYSTEM_ENDPOINTS.UPDATE_RELEASES).toBe('/cms-api/v1/admin/system/update/releases');
    });

    it('exposes the frontend-only update endpoints under update/frontend', () => {
        expect(SYSTEM_ENDPOINTS.UPDATE_FRONTEND_RELEASES).toBe('/cms-api/v1/admin/system/update/frontend/releases');
        expect(SYSTEM_ENDPOINTS.UPDATE_FRONTEND_PREFLIGHT).toBe('/cms-api/v1/admin/system/update/frontend/preflight');
        expect(SYSTEM_ENDPOINTS.UPDATE_FRONTEND_REQUEST).toBe('/cms-api/v1/admin/system/update/frontend/request');
    });

    it('advisories model the registry feed filtered to installed components', () => {
        const offline: ISystemAdvisories = { available: false, advisories: [] };
        expect(offline.available).toBe(false);

        const advisories: ISystemAdvisories = {
            available: true,
            advisories: [
                {
                    id: 'SHSA-2026-0001',
                    severity: 'high',
                    recommended_action: 'Update SelfHelp core.',
                    blocked: true,
                    details_url: 'https://example.test/advisory',
                    affected: [{ kind: 'core', id: 'selfhelp-core', installed_version: '0.1.0' }],
                    fixed_versions: ['0.1.1'],
                },
            ],
        };
        expect(advisories.advisories[0]?.severity).toBe('high');
        expect(advisories.advisories[0]?.affected[0]?.kind).toBe('core');
    });

    it('advisory severity covers the full registry feed union', () => {
        const severities: TSystemAdvisorySeverity[] = ['low', 'medium', 'high', 'critical'];
        expect(severities).toHaveLength(4);
    });

    it('an advisory with no details page models details_url as null and may be non-blocking', () => {
        // A low-severity, multi-component, non-blocking advisory with no details
        // page — the variant the existing happy-path test does not exercise.
        const advisory: ISystemAdvisory = {
            id: 'SHSA-2026-0002',
            severity: 'low',
            recommended_action: 'Upgrade the affected plugin at your convenience.',
            blocked: false,
            details_url: null,
            affected: [
                { kind: 'frontend', id: 'selfhelp-frontend', installed_version: '0.1.0' },
                { kind: 'plugin', id: 'sh2-shp-survey-js', installed_version: '0.2.20' },
            ],
            fixed_versions: [],
        };
        expect(advisory.details_url).toBeNull();
        expect(advisory.blocked).toBe(false);
        expect(advisory.affected.map((a) => a.kind)).toEqual(['frontend', 'plugin']);
        expect(advisory.fixed_versions).toEqual([]);
    });

    it('models the aggregated, secret-free health payload consumed by the admin dashboard', () => {
        const health: ISystemHealth = {
            instance_id: 'inst-a',
            overall: 'degraded',
            checked_at: '2026-06-08T00:00:00Z',
            safe_mode: false,
            maintenance_mode: true,
            version: {
                selfhelp: '0.1.0',
                backend: '0.1.0',
                frontend: '0.1.0',
                plugin_api: '0.1.0',
                database_migration: 'Version20260608174905',
            },
            update: { operation_id: 'op-001', status: 'running', progress_percent: 42 },
            components: [
                { name: 'database', status: 'ok', detail: 'reachable' },
                { name: 'mercure', status: 'not_configured', detail: 'no hub configured' },
            ],
        };
        expect(health.overall).toBe('degraded');
        expect(health.update.progress_percent).toBe(42);
        // Health is secret-free: connection strings are reduced to a status word.
        expect(JSON.stringify(health)).not.toContain('mysql://');
    });

    it('maintenance state models the env-forced + safe-mode flags and carries no secret', () => {
        const state: ISystemMaintenance = {
            enabled: true,
            forced_by_env: false,
            message: 'Upgrade window',
            since: '2026-06-08T18:00:00Z',
            updated_by: 'user:42',
            safe_mode: false,
        };
        expect(state.enabled).toBe(true);
        expect(state.forced_by_env).toBe(false);
    });

    it('maintenance set request never includes an instance_id (server-derived only)', () => {
        const req: IMaintenanceSetRequest = { enabled: true, message: 'window' };
        expect(Object.keys(req)).not.toContain('instance_id');
    });

    it('update request DTO never includes an instance_id (server-derived only)', () => {
        const req: IUpdateRequest = {
            target_version: '1.5.0',
            preflight_id: 'pf-001',
            accepted_migration_risk: false,
        };
        expect(Object.keys(req)).not.toContain('instance_id');
    });

    it('models the version, preflight and status shapes consumed by the admin UI', () => {
        const version: ISystemVersion = {
            instance_id: 'inst-a',
            selfhelp_version: '1.4.0',
            backend_version: '1.4.0',
            frontend_version: '1.4.0',
            plugin_api_version: '2.1',
            database_migration_version: 'Version20260605081254',
            safe_mode: false,
            maintenance_mode: false,
            installed_plugins: [{ id: 'sh2-shp-survey-js', version: '0.2.20', compatible: true }],
        };
        const preflight: IUpdatePreflight = {
            preflight_id: 'pf-001',
            status: 'ok',
            instance_id: 'inst-a',
            current_version: '1.4.0',
            target_version: '1.5.0',
            checks: [{ code: 'disk', severity: 'info', message: 'ok' }],
            options: [{ type: 'frontend', version: '1.5.0', label: 'Frontend 1.5.0' }],
            database: { destructive: false, requires_backup: true, manual_confirmation_required: false },
            rollback: { automatic_before_migrations: true, automatic_after_destructive_migrations: false },
        };
        const status: IUpdateStatus = {
            instance_id: 'inst-a',
            operation_id: 'op-001',
            status: 'running',
            kind: 'core',
            target_version: '1.5.0',
            target_frontend_version: null,
            progress_percent: 42,
            steps: [{ name: 'backup', status: 'succeeded' }],
            requested_at: '2026-06-08T00:00:00Z',
            updated_at: '2026-06-08T00:01:00Z',
        };

        expect(version.installed_plugins[0]?.compatible).toBe(true);
        expect(preflight.status).toBe('ok');
        expect(status.progress_percent).toBe(42);
    });

    it('carries the standardized compatibility-error fields on a blocked preflight check', () => {
        // A plugin_compatibility check raised by the core-update preflight when an
        // installed (pinned) plugin does not admit the target core version. This is
        // the SAME standardized compatibility-error shape the plugin install/update
        // flow emits (backend CompatibilityError::toArray()), so the admin/operator
        // sees the blocking component + the required range, not just a message.
        const blocked: IUpdatePreflight = {
            preflight_id: 'pf-002',
            status: 'blocked',
            instance_id: 'inst-a',
            current_version: '0.1.0',
            target_version: '0.2.0',
            checks: [
                {
                    code: 'plugin_compatibility',
                    severity: 'error',
                    message:
                        'Plugin sh2-shp-survey-js requires SelfHelp >=0.1.0 <0.2.0 and is not compatible with target version 0.2.0 (current 0.1.0).',
                    component: 'plugin',
                    component_id: 'sh2-shp-survey-js',
                    current_version: '0.1.0',
                    target_version: '0.2.0',
                    required_range: '>=0.1.0 <0.2.0',
                    blocking: true,
                    pinned: true,
                },
            ],
            options: [],
            database: { destructive: false, requires_backup: true, manual_confirmation_required: false },
            rollback: { automatic_before_migrations: true, automatic_after_destructive_migrations: false },
        };

        const check = blocked.checks[0]!;
        expect(blocked.status).toBe('blocked');
        expect(check.component).toBe('plugin');
        expect(check.component_id).toBe('sh2-shp-survey-js');
        expect(check.required_range).toBe('>=0.1.0 <0.2.0');
        expect(check.current_version).toBe('0.1.0');
        expect(check.target_version).toBe('0.2.0');
        expect(check.blocking).toBe(true);
        expect(check.pinned).toBe(true);
    });

    it('covers the manager-driven terminal lifecycle states', () => {
        // The states the SelfHelp Manager writes back as an operation finishes.
        const terminal: TUpdateOperationStatus[] = ['succeeded', 'failed', 'rolled_back', 'rollback_failed', 'rejected'];
        for (const s of terminal) {
            const status: IUpdateStatus = {
                instance_id: 'inst-a',
                operation_id: 'op-term',
                status: s,
                kind: 'core',
                target_version: '8.0.1',
                target_frontend_version: null,
                progress_percent: 100,
                steps: [],
                requested_at: '2026-06-08T00:00:00Z',
                updated_at: '2026-06-08T00:05:00Z',
            };
            expect(status.status).toBe(s);
        }
    });

    it('wraps system payloads in the standard backend envelope', () => {
        // The admin UI consumes the envelope-wrapped responses; assert the
        // generic IBaseApiResponse<T> wrappers compose with the system data
        // types (status/error/logged_in/meta/data).
        const advisories: ISystemAdvisoriesResponse = {
            status: 200,
            message: 'OK',
            error: null,
            logged_in: true,
            meta: { version: 'v1', timestamp: '2026-06-08T00:00:00Z' },
            data: { available: true, advisories: [] },
        };
        const requested: IUpdateRequestResponse = {
            status: 202,
            message: 'Accepted',
            error: null,
            logged_in: true,
            meta: { version: 'v1', timestamp: '2026-06-08T00:00:00Z' },
            data: { operation_id: 'op-001', instance_id: 'inst-a', status: 'requested' },
        };
        const statusResponse: IUpdateStatusResponse = {
            status: 200,
            message: 'OK',
            error: null,
            logged_in: true,
            meta: { version: 'v1', timestamp: '2026-06-08T00:00:00Z' },
            data: {
                instance_id: 'inst-a',
                operation_id: 'op-001',
                status: 'succeeded',
                kind: 'core',
                target_version: '8.0.1',
                target_frontend_version: null,
                progress_percent: 100,
                steps: [{ name: 'migrate', status: 'succeeded' }],
                requested_at: '2026-06-08T00:00:00Z',
                updated_at: '2026-06-08T00:05:00Z',
            },
        };

        expect(advisories.data.available).toBe(true);
        expect(requested.data.status).toBe('requested');
        expect(requested.status).toBe(202);
        expect(statusResponse.data.status).toBe('succeeded');
    });

    it('frontend-only update request omits instance_id AND the destructive-migration risk fields', () => {
        // A frontend swap is stateless: there is no destructive migration to
        // confirm, so — unlike IUpdateRequest — the frontend request body has no
        // `accepted_migration_risk`/`typed_confirmation`, and (like every update
        // request) no `instance_id` (the backend derives + verifies it).
        const req: IFrontendUpdateRequest = { target_version: '0.1.7', preflight_id: 'fe-pf-001' };
        const keys = Object.keys(req);
        expect(keys).not.toContain('instance_id');
        expect(keys).not.toContain('accepted_migration_risk');
        expect(keys).not.toContain('typed_confirmation');
        expect(keys.sort()).toEqual(['preflight_id', 'target_version']);
    });

    it('frontend releases + preflight reuse the core shapes but the preflight is never destructive', () => {
        const releases: IFrontendUpdateReleases = {
            available: true,
            current_version: '0.1.5',
            releases: [
                { version: '0.1.7', channel: 'stable', blocked: false },
                { version: '0.1.5', channel: 'stable', blocked: false },
            ],
        };
        const preflight: IFrontendUpdatePreflight = {
            preflight_id: 'fe-pf-001',
            status: 'ok',
            instance_id: 'inst-a',
            current_version: '0.1.5',
            target_version: '0.1.7',
            checks: [{ code: 'resource', severity: 'info', message: 'Manager performs the authoritative checks.' }],
            options: [{ type: 'frontend', version: '0.1.7', label: 'SelfHelp frontend 0.1.7' }],
            // The frontend is stateless: a swap is never destructive and needs no backup.
            database: { destructive: false, requires_backup: false, manual_confirmation_required: false },
            rollback: { automatic_before_migrations: true, automatic_after_destructive_migrations: true },
        };

        expect(releases.releases[0]?.version).toBe('0.1.7');
        expect(preflight.database.destructive).toBe(false);
        expect(preflight.database.requires_backup).toBe(false);
    });

    it('a frontend-kind status/response carries the targeted frontend version', () => {
        const kinds: TUpdateKind[] = ['core', 'frontend'];
        expect(kinds).toEqual(['core', 'frontend']);

        const status: IUpdateStatus = {
            instance_id: 'inst-a',
            operation_id: 'op-fe-1',
            status: 'update_running',
            kind: 'frontend',
            target_version: '0.1.7',
            target_frontend_version: '0.1.7',
            progress_percent: 50,
            steps: [{ name: 'pull', status: 'succeeded' }],
            requested_at: '2026-06-15T00:00:00Z',
            updated_at: '2026-06-15T00:01:00Z',
        };

        const accepted: IFrontendUpdateRequestResponse = {
            status: 202,
            message: 'Accepted',
            error: null,
            logged_in: true,
            meta: { version: 'v1', timestamp: '2026-06-15T00:00:00Z' },
            data: {
                operation_id: 'op-fe-1',
                instance_id: 'inst-a',
                status: 'requested',
                kind: 'frontend',
                target_frontend_version: '0.1.7',
            },
        };

        expect(status.kind).toBe('frontend');
        expect(status.target_frontend_version).toBe('0.1.7');
        expect(accepted.data.kind).toBe('frontend');
        expect(accepted.data.target_frontend_version).toBe('0.1.7');
    });
});
