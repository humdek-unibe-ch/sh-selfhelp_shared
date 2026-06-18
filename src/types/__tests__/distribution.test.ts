/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type {
    AdvisoryFeed,
    CompatibilityRules,
    CoreRelease,
    PluginRelease,
    RegistryIndex,
} from '../distribution';

const here = path.dirname(fileURLToPath(import.meta.url));
// In the SelfHelp multi-repo dev layout the manager is a sibling checkout. Its
// example fixtures are the authoritative source for the distribution contracts,
// so we assert the shared types stay in parity against them.
const managerExamples = path.resolve(here, '../../../../sh-manager/packages/schemas/examples');
const hasManager = existsSync(managerExamples);

function readExample(name: string): Record<string, unknown> {
    return JSON.parse(readFileSync(path.join(managerExamples, name), 'utf8')) as Record<string, unknown>;
}

/** Top-level required/optional keys + discriminant for each shared contract. */
const SPEC: Record<string, { required: string[]; optional?: string[]; kind?: string }> = {
    'registry-index.json': {
        required: ['schemaVersion', 'requiresManager', 'publishedAt', 'baseUrl', 'publisher', 'core', 'frontend', 'scheduler', 'worker', 'plugins'],
        optional: ['advisoriesUrl', 'compatibilityUrl', 'trustedKeysUrl'],
    },
    'core-release.json': {
        kind: 'selfhelp-core-release',
        required: ['kind', 'id', 'version', 'channel', 'releasedAt', 'minimumDirectUpgradeFrom', 'pluginApiVersion', 'backend', 'worker', 'scheduler', 'frontendCompatibility', 'database', 'security'],
        optional: ['runtime', 'artifacts', 'blocked'],
    },
    'frontend-release.json': {
        kind: 'selfhelp-frontend-release',
        required: ['kind', 'id', 'version', 'channel', 'image', 'digest', 'backendCompatibility', 'security'],
        optional: ['builtFrom', 'blocked'],
    },
    'scheduler-release.json': {
        kind: 'selfhelp-scheduler-release',
        required: ['kind', 'id', 'version', 'channel', 'image', 'digest', 'backendCompatibility', 'security'],
        optional: ['builtFrom', 'blocked'],
    },
    'worker-release.json': {
        kind: 'selfhelp-worker-release',
        required: ['kind', 'id', 'version', 'channel', 'image', 'digest', 'backendCompatibility', 'security'],
        optional: ['builtFrom', 'blocked'],
    },
    'instance-manifest.json': {
        required: ['manifestVersion', 'instanceId', 'displayName', 'domain', 'mode', 'createdAt', 'updatedAt', 'registry', 'versions', 'images', 'routing', 'installedPlugins'],
        optional: ['resources', 'backupSchedule', 'envOverrides'],
    },
    'instance-lock.json': {
        required: ['lockfileVersion', 'generatedAt', 'registry', 'core', 'services', 'plugins'],
        optional: ['operationId'],
    },
    'server-inventory.json': {
        required: ['inventoryVersion', 'serverId', 'manager', 'proxy', 'instances'],
    },
    'backup-manifest.json': {
        required: ['backupManifestVersion', 'backupId', 'instanceId', 'createdAt', 'mode', 'selfhelpVersion', 'migrationVersion', 'plugins', 'includedAreas', 'files'],
    },
    'update-preflight.json': {
        required: ['preflightVersion', 'status', 'instanceId', 'currentVersion', 'targetVersion', 'checks', 'options', 'database', 'rollback'],
    },
    'trusted-keys.json': {
        required: ['schemaVersion', 'keys'],
    },
};

describe.runIf(hasManager)('distribution contract parity with manager fixtures', () => {
    for (const [file, spec] of Object.entries(SPEC)) {
        it(`shared type stays in parity with ${file}`, () => {
            const obj = readExample(file);
            // Forward parity: every shared-required key is emitted by the manager.
            for (const k of spec.required) expect(obj, `missing required key "${k}"`).toHaveProperty(k);
            // Reverse parity: the manager never emits a key the shared type lacks.
            const allowed = [...spec.required, ...(spec.optional ?? [])];
            for (const k of Object.keys(obj)) {
                expect(allowed, `manager fixture key "${k}" is missing from the shared type`).toContain(k);
            }
            if (spec.kind) expect(obj.kind).toBe(spec.kind);
        });
    }
});

// Always-on compile-time parity: the fixture-less contracts must remain usable.
describe('distribution contracts compile and are usable', () => {
    it('types a registry index and core release', () => {
        const index: RegistryIndex = {
            schemaVersion: '1.0',
            requiresManager: '>=0.1.0',
            publishedAt: '2026-06-05T12:00:00Z',
            baseUrl: 'https://example/',
            publisher: { name: 'SelfHelp', url: 'https://example/' },
            core: [{ id: 'selfhelp-core-0.1.0', version: '0.1.0', channel: 'stable', releaseUrl: 'releases/core/x.json' }],
            frontend: [],
            scheduler: [],
            worker: [],
            plugins: [],
        };
        const core: CoreRelease = {
            kind: 'selfhelp-core-release',
            id: 'selfhelp-core-0.1.0',
            version: '0.1.0',
            channel: 'stable',
            releasedAt: '2026-06-01T00:00:00Z',
            minimumDirectUpgradeFrom: '0.1.0',
            pluginApiVersion: '0.1.0',
            backend: { image: 'b', digest: 'sha256:1' },
            worker: { image: 'w', digest: 'sha256:2' },
            scheduler: { image: 's', digest: 'sha256:3' },
            frontendCompatibility: { requiredFrontendRange: '>=0.1.0 <0.2.0' },
            database: { migrationRange: 'A..B', destructive: false, requiresBackup: true, manualConfirmationRequired: false },
            security: { signature: 'sig', keyId: 'selfhelp-dev-fixture' },
        };
        expect(index.core[0]?.version).toBe('0.1.0');
        expect(core.kind).toBe('selfhelp-core-release');
        // Plan invariant: no automatic rollback is promised after destructive migrations.
    });

    it('types a plugin release, advisory feed, and compatibility rules (no manager fixture)', () => {
        const plugin: PluginRelease = {
            kind: 'selfhelp-plugin-release',
            id: 'surveyjs',
            version: '0.1.0',
            channel: 'stable',
            official: true,
            compatibility: { core: '>=0.1.0 <0.2.0', pluginApi: '0.1.0' },
            artifacts: { manifestUrl: 'm', archiveUrl: 'a', sha256: 'sha256:0' },
            security: { signature: 'sig', keyId: 'selfhelp-dev-fixture' },
        };
        const advisories: AdvisoryFeed = {
            schemaVersion: '1.0',
            advisories: [
                {
                    id: 'SH-2026-0001',
                    severity: 'high',
                    affected: [{ kind: 'core', versions: '<0.1.1' }],
                    fixed: [{ kind: 'core', version: '0.1.1' }],
                    recommendedAction: 'Update to 0.1.1.',
                    blocked: true,
                },
            ],
        };
        const compatibility: CompatibilityRules = {
            schemaVersion: '1.0',
            rules: [
                {
                    selfhelp: '>=0.1.0 <0.2.0',
                    runtime: {
                        mysql: { supportedVersions: '8.x', recommendedImage: 'mysql:8.4' },
                        redis: { supportedVersions: '7.x', recommendedImage: 'redis:7.2' },
                        mercure: { supportedVersions: '0.x', recommendedImage: 'dunglas/mercure:0.18' },
                    },
                },
            ],
        };
        expect(plugin.official).toBe(true);
        expect(advisories.advisories[0]?.blocked).toBe(true);
        expect(compatibility.rules[0]?.runtime.mysql.recommendedImage).toBe('mysql:8.4');
    });
});
