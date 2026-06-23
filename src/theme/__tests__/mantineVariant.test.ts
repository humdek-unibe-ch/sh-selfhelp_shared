/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, expect, it } from 'vitest';
import { resolveMantineVariant } from '../mantineVariant';
import { COLOR_PALETTE, COLOR_SCALES } from '../tokens';

/**
 * The Mantine palette resolver is the single cross-repo source of truth for
 * the portable `color` + `variant` fields -> concrete RGB (consumed by the
 * mobile renderer). Every variant branch is pinned so a regression surfaces
 * immediately and neither repo re-implements the ladder.
 */
describe('resolveMantineVariant', () => {
    const red = COLOR_SCALES.red;

    it('filled uses the accent as background with white foreground', () => {
        const v = resolveMantineVariant('filled', 'red');
        expect(v.background).toBe(COLOR_PALETTE.red);
        expect(v.foreground).toBe('#ffffff');
        expect(v.borderWidth).toBe(0);
    });

    it('gradient collapses onto filled', () => {
        expect(resolveMantineVariant('gradient', 'red')).toEqual(
            resolveMantineVariant('filled', 'red'),
        );
    });

    it('light uses soft fill + dark palette text, no border', () => {
        const v = resolveMantineVariant('light', 'red');
        expect(v.background).toBe(red[0]);
        expect(v.foreground).toBe(red[8]);
        expect(v.border).toBe('transparent');
    });

    it('outline is transparent with a palette border', () => {
        const v = resolveMantineVariant('outline', 'red');
        expect(v.background).toBe('transparent');
        expect(v.border).toBe(red[6]);
        expect(v.borderWidth).toBe(1);
    });

    it('default is the neutral white/gray surface', () => {
        const v = resolveMantineVariant('default', 'red');
        expect(v.background).toBe('#ffffff');
        expect(v.border).toBe('#dee2e6');
        expect(v.borderWidth).toBe(1);
    });

    it('subtle and transparent have no border; transparent has no pressed surface', () => {
        const subtle = resolveMantineVariant('subtle', 'red');
        const transparent = resolveMantineVariant('transparent', 'red');
        expect(subtle.background).toBe('transparent');
        expect(subtle.pressedBackground).toBe(red[0]);
        expect(transparent.pressedBackground).toBe('transparent');
    });

    it('dot keeps a neutral bordered chip surface', () => {
        const v = resolveMantineVariant('dot', 'red');
        expect(v.background).toBe('transparent');
        expect(v.borderWidth).toBe(1);
    });

    it('defaults variant to filled and color to blue when omitted', () => {
        const v = resolveMantineVariant(undefined, undefined);
        expect(v.background).toBe(COLOR_PALETTE.blue);
        expect(v.foreground).toBe('#ffffff');
    });

    it('falls back to the blue scale for an unknown color', () => {
        const unknown = resolveMantineVariant('light', 'not-a-color');
        const blue = resolveMantineVariant('light', 'blue');
        expect(unknown.background).toBe(blue.background);
    });

    it('covers every variant without throwing', () => {
        for (const variant of [
            'filled', 'light', 'outline', 'default', 'subtle', 'transparent', 'gradient', 'dot',
        ]) {
            const v = resolveMantineVariant(variant, 'green');
            expect(typeof v.background).toBe('string');
            expect(typeof v.foreground).toBe('string');
        }
    });
});
