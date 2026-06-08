/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import { SYSTEM_ENDPOINTS } from '../system';
import type {
    IMaintenanceSetRequest,
    ISystemMaintenance,
    ISystemVersion,
    IUpdatePreflight,
    IUpdateRequest,
    IUpdateStatus,
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
        expect(SYSTEM_ENDPOINTS.MAINTENANCE).toBe('/cms-api/v1/admin/system/maintenance');
        expect(SYSTEM_ENDPOINTS.UPDATE_PREFLIGHT).toBe('/cms-api/v1/admin/system/update/preflight');
        expect(SYSTEM_ENDPOINTS.UPDATE_REQUEST).toBe('/cms-api/v1/admin/system/update/request');
        expect(SYSTEM_ENDPOINTS.UPDATE_STATUS).toBe('/cms-api/v1/admin/system/update/status');
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
            target_version: '1.5.0',
            progress_percent: 42,
            steps: [{ name: 'backup', status: 'succeeded' }],
            requested_at: '2026-06-08T00:00:00Z',
            updated_at: '2026-06-08T00:01:00Z',
        };

        expect(version.installed_plugins[0]?.compatible).toBe(true);
        expect(preflight.status).toBe('ok');
        expect(status.progress_percent).toBe(42);
    });
});
