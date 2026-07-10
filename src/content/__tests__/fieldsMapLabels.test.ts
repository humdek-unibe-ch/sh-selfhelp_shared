/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, expect, it } from 'vitest';
import {
    parseFieldsMapCatalog,
    parseFieldsMapLabels,
    resolveFieldsMapLabel,
    serializeFieldsMapCatalog,
    serializeFieldsMapLabels,
} from '../fieldsMapLabels';

describe('fieldsMapLabels helpers', () => {
    it('parses ordered field_key catalog arrays', () => {
        expect(parseFieldsMapCatalog(JSON.stringify(['title', 'body']))).toEqual(['title', 'body']);
    });

    it('parses legacy {field_name, field_new_name} objects into catalog keys', () => {
        expect(parseFieldsMapCatalog(JSON.stringify([
            { field_name: 'title', field_new_name: 'Headline' },
            { field_name: 'body' },
        ]))).toEqual(['title', 'body']);
    });

    it('returns empty catalog for invalid JSON or non-arrays', () => {
        expect(parseFieldsMapCatalog('not-json')).toEqual([]);
        expect(parseFieldsMapCatalog(JSON.stringify({ title: 'x' }))).toEqual([]);
        expect(parseFieldsMapCatalog('')).toEqual([]);
    });

    it('parses per-language labels and ignores empty or non-string values', () => {
        expect(parseFieldsMapLabels(JSON.stringify({
            title: ' Headline ',
            body: '',
            bad: 12,
        }))).toEqual({ title: 'Headline' });
    });

    it('resolves labels with fallbacks', () => {
        expect(resolveFieldsMapLabel('title', { title: 'Headline' })).toBe('Headline');
        expect(resolveFieldsMapLabel('title', {}, { title: 'Default' })).toBe('Default');
        expect(resolveFieldsMapLabel('title', {})).toBe('title');
    });

    it('round-trips catalog and labels serializers', () => {
        const keys = ['title', 'body'];
        expect(parseFieldsMapCatalog(serializeFieldsMapCatalog(keys))).toEqual(keys);
        expect(serializeFieldsMapCatalog([])).toBe('');
        expect(parseFieldsMapLabels(serializeFieldsMapLabels({ title: ' Headline ' }))).toEqual({
            title: 'Headline',
        });
        expect(serializeFieldsMapLabels({})).toBe('');
    });
});
