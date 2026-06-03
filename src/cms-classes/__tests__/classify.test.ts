/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, it, expect, vi } from 'vitest';
import { classifyClass, classifyClassString, type TClassDecision } from '../classify';

describe('classifyClass (css_mobile classifier)', () => {
    it('allows literal classes from the allow-list', () => {
        expect(classifyClass('flex')).toEqual({ kind: 'allow', className: 'flex' });
        expect(classifyClass('rounded')).toEqual({ kind: 'allow', className: 'rounded' });
    });

    it('allows pattern classes (spacing / color scale)', () => {
        expect(classifyClass('mt-md').kind).toBe('allow');
        expect(classifyClass('text-blue-6').kind).toBe('allow');
        expect(classifyClass('p-4').kind).toBe('allow');
    });

    it('allows arbitrary value classes (Uniwind handles them)', () => {
        expect(classifyClass('w-[120px]')).toEqual({ kind: 'allow', className: 'w-[120px]' });
    });

    it('remaps legacy aliases before the allow-list check', () => {
        expect(classifyClass('mantine-fw')).toMatchObject({ kind: 'remap', from: 'mantine-fw', to: 'w-full' });
    });

    it('drops classes remapped to null (no mobile equivalent)', () => {
        expect(classifyClass('cursor-pointer').kind).toBe('drop');
        expect(classifyClass('hover:underline').kind).toBe('drop');
    });

    it('drops classes outside the allow-list', () => {
        expect(classifyClass('grid-cols-7').kind).toBe('drop');
        expect(classifyClass('').kind).toBe('drop');
    });
});

describe('classifyClassString', () => {
    it('returns only allowed/remapped classes and warns on drops + remaps', () => {
        const warnings: TClassDecision[] = [];
        const out = classifyClassString(
            'flex mt-md mantine-fw cursor-pointer grid-cols-7 w-[120px]',
            (d) => warnings.push(d),
        );

        expect(out).toEqual(['flex', 'mt-md', 'w-full', 'w-[120px]']);
        // cursor-pointer (drop) + grid-cols-7 (drop) + mantine-fw (remap) = 3 warnings.
        expect(warnings).toHaveLength(3);
    });

    it('returns an empty array for null/undefined/empty input', () => {
        expect(classifyClassString(null)).toEqual([]);
        expect(classifyClassString(undefined)).toEqual([]);
        expect(classifyClassString('')).toEqual([]);
    });

    it('does not call onWarn for a fully-allowed class string', () => {
        const onWarn = vi.fn();
        expect(classifyClassString('flex mt-md', onWarn)).toEqual(['flex', 'mt-md']);
        expect(onWarn).not.toHaveBeenCalled();
    });
});
