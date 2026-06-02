/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, it, expect } from 'vitest';
import {
    CERTIFICATION_CHECKS,
    CERTIFICATION_KIT_VERSION,
    definePluginCertification,
    mockMercureHub,
    seedFromLockFile,
} from '../index';

describe('plugin certification kit (scaffold stability)', () => {
    it('exposes a stable kit version + ordered check list', () => {
        expect(CERTIFICATION_KIT_VERSION).toBe('0.1.0-scaffold');
        expect(CERTIFICATION_CHECKS).toEqual([
            'manifest-valid',
            'capabilities-declared',
            'install-lifecycle',
            'realtime-topics-registered',
            'cleanup-on-uninstall',
        ]);
    });

    it('definePluginCertification returns a frozen descriptor for a plugin', () => {
        const suite = definePluginCertification({ pluginId: 'sh2-shp-survey-js' });
        expect(suite.pluginId).toBe('sh2-shp-survey-js');
        expect(suite.kitVersion).toBe(CERTIFICATION_KIT_VERSION);
        expect(suite.checks).toEqual(CERTIFICATION_CHECKS);
    });

    it('definePluginCertification rejects a missing pluginId', () => {
        expect(() => definePluginCertification({ pluginId: '' })).toThrow(/pluginId is required/);
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
