/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import {
    asRecordVersion,
    flattenFormRecordPrefillValues,
    parseFormRecordPrefill,
} from '../formRecordPrefill';

describe('the record version of a prefill', () => {
    it('is read from the rows and never becomes a form field', () => {
        const result = parseFormRecordPrefill({
            section_data: [
                { record_id: 12, id_languages: 1, _version: 4, title: 'Hello' },
                { record_id: 12, id_languages: 3, _version: 4, title: 'Hello' },
            ],
            children: [{ name: { content: 'title' }, translatable: { content: '0' } }],
        });
        expect(result).toEqual({ recordId: 12, values: { title: 'Hello' }, version: 4 });
        expect(Object.keys(result.values)).not.toContain('_version');
    });

    it('is the version of the record the prefill is for, not of another one', () => {
        const result = parseFormRecordPrefill({
            section_data: [
                { record_id: 1, id_languages: 1, _version: 2, title: 'first' },
                { record_id: 2, id_languages: 1, _version: 9, title: 'second' },
            ],
            children: [{ name: { content: 'title' }, translatable: { content: '0' } }],
        });
        expect(result.recordId).toBe(1);
        expect(result.version).toBe(2);
    });

    it('is absent when the page offered none, and a malformed one is not trusted', () => {
        expect(parseFormRecordPrefill({ section_data: [{ record_id: 3, id_languages: 1, title: 'x' }] })).not.toHaveProperty('version');
        for (const bad of [0, -1, 1.5, '0', '01', 'x', '', null, true, {}]) {
            expect(parseFormRecordPrefill({ section_data: [{ record_id: 3, id_languages: 1, _version: bad }] })).not.toHaveProperty('version');
        }
    });

    it('asRecordVersion accepts a whole number of at least 1 as a number or as digits', () => {
        expect(asRecordVersion(7)).toBe(7);
        expect(asRecordVersion('7')).toBe(7);
        expect(asRecordVersion(' 12 ')).toBe(12);
        expect(asRecordVersion('0')).toBeNull();
        expect(asRecordVersion('07')).toBeNull();
        expect(asRecordVersion(Number.NaN)).toBeNull();
        expect(asRecordVersion(Number.MAX_SAFE_INTEGER + 2)).toBeNull();
        expect(asRecordVersion(undefined)).toBeNull();
    });
});

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

    it('skips every spelling of the trigger type, so a form never writes it back', () => {
        const result = parseFormRecordPrefill({
            section_data: [
                {
                    record_id: 7,
                    entry_date: '2026-11-13 10:00:00',
                    id_users: 3,
                    user_code: 'ABC',
                    id_action_trigger_types: 73,
                    id_actionTriggerTypes: 73,
                    triggerType: 'updated',
                    id_languages: 1,
                    language_locale: 'all',
                    language_name: 'Independent',
                    title: 'Hello',
                },
            ],
            children: [{ name: { content: 'title' }, translatable: { content: '0' } }],
        });
        expect(result).toEqual({ recordId: 7, values: { title: 'Hello' } });
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

    it('keeps file cells out of the flattened string map', () => {
        expect(
            flattenFormRecordPrefillValues({
                title: 'Hello',
                portrait: {
                    files: [{ index: 0, name: 'a.jpg', url: '/lists/1/records/2/files/portrait?page_id=3&index=0' }],
                },
            }),
        ).toEqual({ title: 'Hello' });
    });
});

describe('file-input prefill (contract 4)', () => {
    it('keeps the server files list and never a storage key', () => {
        const result = parseFormRecordPrefill({
            section_data: [
                {
                    record_id: 9,
                    id_languages: 1,
                    _version: 2,
                    title: 'Photo',
                    portrait: {
                        files: [
                            {
                                index: 0,
                                name: 'shot.jpg',
                                mime: 'image/jpeg',
                                size: 12,
                                url: '/lists/5/records/9/files/portrait?page_id=1&index=0',
                            },
                        ],
                    },
                },
            ],
            children: [
                { name: { content: 'title' }, translatable: { content: '0' } },
                { name: { content: 'portrait' }, translatable: { content: '0' } },
            ],
        });
        expect(result.values.portrait).toEqual({
            files: [
                {
                    index: 0,
                    name: 'shot.jpg',
                    mime: 'image/jpeg',
                    size: 12,
                    url: '/lists/5/records/9/files/portrait?page_id=1&index=0',
                },
            ],
        });
        expect(JSON.stringify(result.values)).not.toContain('uploads/form-files');
    });
});
