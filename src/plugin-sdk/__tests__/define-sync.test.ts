/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */
import { describe, expect, expectTypeOf, it } from 'vitest';
import { definePlugin } from '../define';
import type { IPluginManifest } from '../manifest';
import { PLUGIN_API_VERSION } from '../version';

describe('definePlugin sync map and PLUGIN_API_VERSION 0.2.0 (C2, C10)', () => {
    it('accepts a sync map on definePlugin and reports PLUGIN_API_VERSION 0.2.0', () => {
        expect(PLUGIN_API_VERSION).toBe('0.2.0');

        const registration = definePlugin({
            id: 'sh2-shp-qa-hooks',
            version: '0.1.0',
            pluginApiVersion: '0.2.0',
            sync: [
                { tags: ['acl'], queryKey: ['qa', 'bootstrap'] },
                { tags: ['res:qa_item:*'], queryKey: ['qa', 'items'] },
            ],
        });

        expect(registration.sync).toHaveLength(2);
        expect(registration.pluginApiVersion).toBe('0.2.0');
    });

    it('typechecks a manifest object that carries every C2 key', () => {
        const manifest: IPluginManifest = {
            id: 'sh2-shp-r-serve',
            name: 'R serve',
            version: '0.1.0',
            pluginApiVersion: '0.2.0',
            compatibility: { selfhelp: '>=0.1.51' },
            security: {
                trustLevel: 'official',
                capabilities: ['scheduledJobs', 'frontendStyles', 'secretAccess'],
            },
            styles: [
                {
                    name: 'survey-js',
                    description: 'Survey',
                    canHaveChildren: false,
                    resourceFields: { survey_id: 'surveyjs_survey' },
                },
            ],
            cacheCategories: [
                { name: 'surveys', ttlSeconds: 3600, description: 'Survey definitions' },
            ],
            scheduledJobs: [
                {
                    type: 'r_script',
                    description: 'Run an R script',
                    capability: 'scheduledJobs',
                    label: 'R script',
                    actionPlannable: true,
                    configSchema: {
                        type: 'object',
                        properties: {
                            script_id: { type: 'integer', title: 'Script' },
                            note: { type: 'string', format: 'variable-text' },
                        },
                        required: ['script_id'],
                    },
                    resourceFields: { script_id: 'rserve_script' },
                    timeoutSeconds: 120,
                },
            ],
            settings: [
                {
                    key: 'api_key',
                    label: 'API key',
                    type: 'string',
                    secret: true,
                    required: true,
                    envOverride: 'LLM_API_KEY',
                },
            ],
            rateLimits: [
                { name: 'chat', policy: 'sliding_window', limit: 20, interval: '1 minute' },
            ],
            jsonLogicOperations: [
                { name: 'stats.mean', description: 'Mean of a list of numbers' },
            ],
            listens: ['record.saved', 'page.published'],
            recurringJobs: [
                {
                    name: 'nightly_cleanup',
                    type: 'r_script',
                    cron: '0 2 * * *',
                    description: 'Nightly cleanup',
                },
            ],
        };

        expect(manifest.cacheCategories?.[0]?.name).toBe('surveys');
        expect(manifest.settings?.[0]?.secret).toBe(true);
        expect(manifest.rateLimits?.[0]?.limit).toBe(20);
        expect(manifest.jsonLogicOperations?.[0]?.name).toBe('stats.mean');
        expect(manifest.styles?.[0]?.resourceFields?.survey_id).toBe('surveyjs_survey');
        expect(manifest.scheduledJobs?.[0]?.actionPlannable).toBe(true);
        expect(manifest.listens).toContain('record.saved');
        expect(manifest.recurringJobs?.[0]?.cron).toBe('0 2 * * *');
        expectTypeOf(manifest.pluginApiVersion).toEqualTypeOf<string>();
    });
});
