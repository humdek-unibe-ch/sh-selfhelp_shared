/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import {
    flattenFormRecordPrefillValues,
    parseFormRecordPrefill,
} from '../formRecordPrefill';

describe('parseFormRecordPrefill', () => {
    it('returns empty create state when section_data is missing', () => {
        expect(parseFormRecordPrefill({})).toEqual({ recordId: null, values: {} });
        expect(parseFormRecordPrefill({ section_data: null })).toEqual({
            recordId: null,
            values: {},
        });
        expect(parseFormRecordPrefill({ section_data: [] })).toEqual({
            recordId: null,
            values: {},
        });
    });

    it('flattens the first hydrated record and skips metadata fields', () => {
        const result = parseFormRecordPrefill({
            section_data: [
                {
                    record_id: 12,
                    id_users: 3,
                    user_name: 'qa.user',
                    id_languages: 1,
                    title: 'Hello',
                    body: 'World',
                },
            ],
            children: [
                { name: { content: 'title' }, translatable: { content: '0' } },
                { name: { content: 'body' }, translatable: { content: '0' } },
            ],
        });
        expect(result).toEqual({
            recordId: 12,
            values: { title: 'Hello', body: 'World' },
        });
    });

    it('accumulates per-language values for translatable fields', () => {
        const result = parseFormRecordPrefill({
            section_data: [
                { record_id: 5, id_languages: 1, bio: 'Independent seed' },
                { record_id: 5, id_languages: 2, bio: 'DE bio' },
                { record_id: 5, id_languages: 3, bio: 'EN bio' },
            ],
            children: [{ name: { content: 'bio' }, translatable: { content: '1' } }],
        });
        expect(result.recordId).toBe(5);
        expect(result.values.bio).toEqual([
            { language_id: 2, value: 'DE bio' },
            { language_id: 3, value: 'EN bio' },
        ]);
    });

    it('ignores malformed rows and nested non-scalar field values', () => {
        const result = parseFormRecordPrefill({
            section_data: [
                null,
                'skip',
                { record_id: 'nope', title: 'x' },
                { record_id: 9, id_languages: 1, title: 'ok', nested: { a: 1 }, list: [1, 2] },
            ],
            children: [{ name: { content: 'title' }, translatable: { content: '0' } }],
        });
        expect(result).toEqual({ recordId: 9, values: { title: 'ok' } });
    });

    it('accepts numeric string record_id from JSON payloads', () => {
        const result = parseFormRecordPrefill({
            section_data: [{ record_id: '42', id_languages: 1, name: 'Ada' }],
            children: [{ name: { content: 'name' }, translatable: { content: '0' } }],
        });
        expect(result).toEqual({ recordId: 42, values: { name: 'Ada' } });
    });
});

describe('flattenFormRecordPrefillValues', () => {
    it('prefers the requested language, else first public language', () => {
        const values = {
            bio: [
                { language_id: 2, value: 'DE' },
                { language_id: 3, value: 'EN' },
            ],
            title: 'plain',
        };
        expect(flattenFormRecordPrefillValues(values, 3)).toEqual({
            bio: 'EN',
            title: 'plain',
        });
        expect(flattenFormRecordPrefillValues(values)).toEqual({
            bio: 'DE',
            title: 'plain',
        });
    });
});
