/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, expect, it } from 'vitest';
import {
    parseOptionCatalog,
    parseOptionCodes,
    parseOptionLabels,
    resolveOptionLabel,
    resolveOptionValueLabels,
    resolveOptions,
} from '../optionLabels';

describe('option labels helpers', () => {
    it('parses language-neutral option catalog and keeps metadata', () => {
        const raw = JSON.stringify([
            { value: 'release', sort: 1, disabled: false, meta: { color: 'blue' } },
            { value: 'feature', sort: 2 },
        ]);
        expect(parseOptionCatalog(raw)).toEqual([
            { value: 'release', sort: 1, disabled: false, meta: { color: 'blue' } },
            { value: 'feature', sort: 2 },
        ]);
    });

    it('parses per-language labels map and ignores invalid entries', () => {
        const raw = JSON.stringify({
            release: 'Freigabe',
            feature: ' Funktion ',
            notice: '',
            invalid: 12,
        });
        expect(parseOptionLabels(raw)).toEqual({
            release: 'Freigabe',
            feature: 'Funktion',
        });
    });

    it('resolves options with label fallback to code', () => {
        const catalog = JSON.stringify([
            { value: 'release' },
            { value: 'feature' },
        ]);
        const labels = JSON.stringify({
            release: 'Freigabe',
        });
        expect(resolveOptions(catalog, labels)).toEqual([
            { value: 'release', label: 'Freigabe' },
            { value: 'feature', label: 'feature' },
        ]);
        expect(resolveOptionLabel('release', { release: 'Release' })).toBe('Release');
        expect(resolveOptionLabel('notice', { release: 'Release' })).toBe('notice');
    });

    it('supports legacy option array with text/label while labels map is empty', () => {
        const legacy = JSON.stringify([
            { value: 'release', text: 'Release', description: 'Release notes' },
            { value: 'feature', label: 'Feature' },
        ]);
        expect(resolveOptions(legacy, null)).toEqual([
            {
                value: 'release',
                label: 'Release',
                meta: { description: 'Release notes' },
            },
            { value: 'feature', label: 'Feature' },
        ]);
    });

    it('uses active language, fallback language, legacy label, then code', () => {
        const catalog = [
            { value: 'release', text: 'Legacy release' },
            { value: 'feature', label: 'Legacy feature' },
            { value: 'notice' },
            { value: 'other' },
        ];

        expect(resolveOptions(
            catalog,
            { release: 'Freigabe' },
            { release: 'Release', feature: 'Feature', notice: 'Notice' },
        )).toEqual([
            { value: 'release', label: 'Freigabe' },
            { value: 'feature', label: 'Feature' },
            { value: 'notice', label: 'Notice' },
            { value: 'other', label: 'other' },
        ]);
    });

    it('resolves stored single and multi codes without persisting labels', () => {
        expect(parseOptionCodes('release, notice')).toEqual(['release', 'notice']);
        expect(parseOptionCodes(['release', '', 'notice'])).toEqual(['release', 'notice']);
        expect(resolveOptionValueLabels(
            'release,notice',
            { release: 'Freigabe' },
            { notice: 'Notice' },
        )).toEqual(['Freigabe', 'Notice']);
    });
});
