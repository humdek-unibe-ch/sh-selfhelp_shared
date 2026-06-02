/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, it, expect } from 'vitest';
import type { IPluginManifest } from '../../plugin-sdk';
import {
    CERTIFICATION_CHECKS,
    CERTIFICATION_KIT_VERSION,
    checkCapabilitiesVsTrustLevel,
    checkCompatibilityShape,
    checkDbNaming,
    checkLookupOwnership,
    checkManifestValid,
    definePluginCertification,
    mockMercureHub,
    seedFromLockFile,
} from '../index';

/** A minimal but valid `official` manifest modelled on the SurveyJS plugin. */
function validManifest(): IPluginManifest {
    return {
        id: 'sh2-shp-survey-js',
        name: 'SurveyJS',
        version: '0.2.20',
        pluginApiVersion: '1.1',
        compatibility: {
            selfhelp: '>=8.0.0-dev <9.0.0',
            php: '^8.4',
            node: '^22',
            react: '^19',
        },
        security: {
            trustLevel: 'official',
            capabilities: [
                'backendBundle',
                'databaseMigrations',
                'readDataTables',
                'writeDataTables',
                'lookupOwnGroup',
                'frontendStyles',
                'adminPages',
                'realtimePublish',
            ],
        },
        backend: {
            package: 'humdek/sh2-shp-survey-js',
            bundleClass: 'Humdek\\SurveyJsBundle\\HumdekSurveyJsBundle',
            migrationsNamespace: 'Humdek\\SurveyJsBundle\\Migrations',
        },
        adminPages: [{ slug: 'surveys', label: 'SurveyJS', permission: 'surveyjs.surveys.manage' }],
        realtimeTopics: [{ key: 'surveys/{id}/responses', description: 'responses' }],
        styles: [{ name: 'surveyjs', description: 'survey', canHaveChildren: false }],
        dataAccess: {
            ownedTables: ['surveys', 'survey_runs', 'survey_versions'],
            ownedDataTablePrefix: 'sh2_surveyjs_',
            read: ['data_tables', 'lookups'],
            write: ['data_tables', 'data_cells'],
        },
        lookups: {
            extends: [
                {
                    typeCode: 'surveyJsTheme',
                    ownership: 'plugin_owned',
                    entries: [{ code: 'default', value: 'Default' }],
                },
            ],
        },
    };
}

describe('plugin certification kit (contract)', () => {
    it('exposes a stable 1.0.0 kit version + ordered static check list', () => {
        expect(CERTIFICATION_KIT_VERSION).toBe('1.0.0');
        expect(CERTIFICATION_CHECKS).toEqual([
            'manifest-valid',
            'capabilities-vs-trust-level',
            'compatibility-shape',
            'lookup-ownership',
            'db-naming',
        ]);
    });

    it('definePluginCertification returns a suite that runs against a manifest', () => {
        const suite = definePluginCertification({ pluginId: 'sh2-shp-survey-js' });
        expect(suite.pluginId).toBe('sh2-shp-survey-js');
        expect(suite.kitVersion).toBe(CERTIFICATION_KIT_VERSION);
        expect(suite.checks).toEqual(CERTIFICATION_CHECKS);

        const report = suite.run(validManifest());
        expect(report.passed).toBe(true);
        expect(report.results.map((r) => r.name)).toEqual(CERTIFICATION_CHECKS);
        expect(report.results.every((r) => r.passed)).toBe(true);
    });

    it('definePluginCertification rejects a missing pluginId', () => {
        expect(() => definePluginCertification({ pluginId: '' })).toThrow(/pluginId is required/);
    });
});

describe('certification checks produce real, specific findings', () => {
    it('manifest-valid flags missing required fields + bad version', () => {
        const result = checkManifestValid({
            ...validManifest(),
            id: '',
            version: 'not-semver',
        });
        expect(result.passed).toBe(false);
        expect(result.errors.some((e) => e.includes('id is required'))).toBe(true);
        expect(result.errors.some((e) => e.includes('not valid semver'))).toBe(true);
    });

    it('capabilities-vs-trust-level rejects an untrusted plugin shipping a bundle', () => {
        const manifest = validManifest();
        const result = checkCapabilitiesVsTrustLevel({
            ...manifest,
            security: { trustLevel: 'untrusted', capabilities: ['backendBundle', 'databaseMigrations'] },
        });
        expect(result.passed).toBe(false);
        expect(result.errors.some((e) => e.includes("untrusted plugins may not declare capability 'backendBundle'"))).toBe(
            true,
        );
    });

    it('capabilities-vs-trust-level flags a declared surface missing its capability', () => {
        const manifest = validManifest();
        const result = checkCapabilitiesVsTrustLevel({
            ...manifest,
            security: { trustLevel: 'official', capabilities: [] },
        });
        expect(result.passed).toBe(false);
        expect(result.errors.some((e) => e.includes("'backendBundle'"))).toBe(true);
        expect(result.errors.some((e) => e.includes("'realtimePublish'"))).toBe(true);
        expect(result.errors.some((e) => e.includes("'lookupOwnGroup'"))).toBe(true);
    });

    it('capabilities-vs-trust-level flags an unknown capability', () => {
        const manifest = validManifest();
        const result = checkCapabilitiesVsTrustLevel({
            ...manifest,
            security: { trustLevel: 'official', capabilities: [...manifest.security.capabilities, 'timeTravel'] },
        } as unknown as IPluginManifest);
        expect(result.passed).toBe(false);
        expect(result.errors.some((e) => e.includes("unknown capability 'timeTravel'"))).toBe(true);
    });

    it('compatibility-shape rejects the per-surface object shape', () => {
        const manifest = validManifest();
        const result = checkCompatibilityShape({
            ...manifest,
            compatibility: {
                selfhelp: { backend: '^8.0', shared: '^8.0' },
            } as unknown as IPluginManifest['compatibility'],
        });
        expect(result.passed).toBe(false);
        expect(result.errors.some((e) => e.includes('single-range shape'))).toBe(true);
    });

    it('compatibility-shape accepts the adopted single-range shape', () => {
        expect(checkCompatibilityShape(validManifest()).passed).toBe(true);
    });

    it('lookup-ownership rejects an invalid ownership + empty entries', () => {
        const manifest = validManifest();
        const result = checkLookupOwnership({
            ...manifest,
            lookups: {
                extends: [{ typeCode: 'surveyJsTheme', ownership: 'world_owned' as never, entries: [] }],
            },
        });
        expect(result.passed).toBe(false);
        expect(result.errors.some((e) => e.includes('invalid ownership'))).toBe(true);
        expect(result.errors.some((e) => e.includes('at least one entry'))).toBe(true);
    });

    it('db-naming rejects non snake_case owned tables and a bad prefix', () => {
        const manifest = validManifest();
        const result = checkDbNaming({
            ...manifest,
            dataAccess: {
                ownedTables: ['SurveyRuns', 'survey runs'],
                ownedDataTablePrefix: 'SurveyJS',
            },
        });
        expect(result.passed).toBe(false);
        expect(result.errors.some((e) => e.includes("owned table 'SurveyRuns'"))).toBe(true);
        expect(result.errors.some((e) => e.includes('ownedDataTablePrefix'))).toBe(true);
    });
});

describe('mockMercureHub', () => {
    it('records published topics + payloads and supports counting/reset (no polling)', () => {
        const hub = mockMercureHub();
        hub.publish('plugin/sh2-shp-survey-js/progress', { pct: 10 });
        hub.publish('plugin/sh2-shp-survey-js/progress', { pct: 100 });
        hub.publish('plugin/sh2-shp-survey-js/done');

        expect(hub.updates).toHaveLength(3);
        expect(hub.publishedTopics()).toEqual([
            'plugin/sh2-shp-survey-js/progress',
            'plugin/sh2-shp-survey-js/done',
        ]);
        expect(hub.countForTopic('plugin/sh2-shp-survey-js/progress')).toBe(2);

        hub.reset();
        expect(hub.updates).toHaveLength(0);
    });
});

describe('seedFromLockFile', () => {
    it('extracts plugin id + version pairs from a lock document', () => {
        const seed = seedFromLockFile({
            plugins: {
                'sh2-shp-survey-js': { version: '1.1.0' },
                'sh2-shp-llm': { version: '2.0.1' },
            },
        });
        expect(seed.plugins).toEqual([
            { pluginId: 'sh2-shp-survey-js', version: '1.1.0' },
            { pluginId: 'sh2-shp-llm', version: '2.0.1' },
        ]);
    });

    it('tolerates a missing/empty plugins map', () => {
        expect(seedFromLockFile({}).plugins).toEqual([]);
        expect(seedFromLockFile(null).plugins).toEqual([]);
    });
});
