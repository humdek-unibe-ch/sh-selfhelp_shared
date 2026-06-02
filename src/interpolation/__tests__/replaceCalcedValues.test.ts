/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, it, expect } from 'vitest';
import { replaceCalcedValues } from '../replaceCalcedValues';

describe('replaceCalcedValues', () => {
    it('replaces a single {{name}} placeholder with its value', () => {
        expect(replaceCalcedValues('Hello {{name}}!', { name: 'Ada' })).toBe('Hello Ada!');
    });

    it('replaces the double-brace {{{{name}}}} form (backend regex parity)', () => {
        expect(replaceCalcedValues('{{{{score}}}}', { score: 42 })).toBe('42');
    });

    it('coerces number and boolean values to strings', () => {
        expect(replaceCalcedValues('{{count}}/{{active}}', { count: 3, active: true })).toBe('3/true');
    });

    it('leaves unknown placeholders intact so editors notice them', () => {
        expect(replaceCalcedValues('Hi {{missing}}', { name: 'Ada' })).toBe('Hi {{missing}}');
    });

    it('leaves the placeholder intact when the value is null or undefined', () => {
        expect(replaceCalcedValues('{{a}}{{b}}', { a: null, b: undefined })).toBe('{{a}}{{b}}');
    });

    it('returns an empty string for null/undefined input (never renders "undefined")', () => {
        expect(replaceCalcedValues(null, {})).toBe('');
        expect(replaceCalcedValues(undefined, {})).toBe('');
    });

    it('trims whitespace inside the braces before lookup', () => {
        expect(replaceCalcedValues('{{  name  }}', { name: 'Ada' })).toBe('Ada');
    });

    it('replaces multiple placeholders in one pass', () => {
        expect(replaceCalcedValues('{{a}} and {{b}}', { a: 'x', b: 'y' })).toBe('x and y');
    });
});
