/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */
import { describe, expect, it } from 'vitest';
import { matchPluginSyncEntries, type IPluginSyncEntry } from '../sync-map';

describe('matchPluginSyncEntries (C10)', () => {
    const entries: IPluginSyncEntry[] = [
        { tags: ['acl'], queryKey: ['plugin', 'bootstrap'] },
        { tags: ['res:surveyjs_survey:*'], queryKey: ['plugin', 'surveys'] },
        { tags: ['table:*'], queryKey: ['plugin', 'table-rows'] },
        { tags: ['res:surveyjs_survey:99'], queryKey: ['plugin', 'survey', 99] },
    ];

    it('matches exact tags and prefix patterns', () => {
        expect(matchPluginSyncEntries(entries, ['acl'])).toEqual([['plugin', 'bootstrap']]);
        expect(matchPluginSyncEntries(entries, ['res:surveyjs_survey:12'])).toEqual([
            ['plugin', 'surveys'],
        ]);
        expect(matchPluginSyncEntries(entries, ['table:31'])).toEqual([['plugin', 'table-rows']]);
        expect(matchPluginSyncEntries(entries, ['res:surveyjs_survey:99'])).toEqual([
            ['plugin', 'surveys'],
            ['plugin', 'survey', 99],
        ]);
    });

    it('ignores tags that no entry lists', () => {
        expect(matchPluginSyncEntries(entries, ['navigation', 'page:1'])).toEqual([]);
        expect(matchPluginSyncEntries(entries, ['res:other_type:1'])).toEqual([]);
    });

    it('returns each query key once when several tags hit the same entry', () => {
        const duplicated: IPluginSyncEntry[] = [
            { tags: ['acl', 'navigation'], queryKey: ['plugin', 'bootstrap'] },
            { tags: ['acl'], queryKey: ['plugin', 'bootstrap'] },
        ];
        expect(matchPluginSyncEntries(duplicated, ['acl', 'navigation'])).toEqual([
            ['plugin', 'bootstrap'],
        ]);
    });

    it('returns an empty list for missing entries or tags', () => {
        expect(matchPluginSyncEntries(undefined, ['acl'])).toEqual([]);
        expect(matchPluginSyncEntries(null, ['acl'])).toEqual([]);
        expect(matchPluginSyncEntries(entries, [])).toEqual([]);
    });
});
