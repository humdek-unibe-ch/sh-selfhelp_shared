/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, expect, it } from 'vitest';
import {
    FULL_RADIUS_PX,
    gridSpanToReactNativeColumn,
    mapDividerVariantToReactNative,
    mapMantineColorToHeroUiButtonVariant,
    mapMantineColorToHeroUiColor,
    mapAccordionVariantToHeroUiVariant,
    mapChipVariantToHeroUiVariant,
    mapMantineVariantToHeroUiButtonVariant,
    mapRadiusToMantine,
    mapRadiusToPx,
    mapSizeToHeroUi,
    mapSizeToMantine,
    mapSpacingToPx,
    parseDimensionToReactNative,
    parseDimensionToWeb,
    resolveSharedStyle,
    resolveSharedStyleProps,
    toHeroUiSemanticProps,
    toMantineSemanticProps,
    toReactNativeSemanticStyle,
    type TSemanticSize,
} from '../semantic';
import { RADIUS_PX, SPACING_PX } from '../tokens';

/**
 * The semantic mapper is the single source of truth that turns CMS
 * cross-platform (unprefixed portable) values into per-platform props. Per the
 * mobile rendering plan (section 8.2) it does NOT clamp: the shared scales
 * (`size` = sm|md|lg, `radius` = none|sm|md|lg|full) are the true common
 * denominator, so every value maps 1:1 to both platforms. Every mapping is
 * pinned here so a regression surfaces immediately on web and mobile.
 */
describe('semantic style mapper', () => {
    describe('size (sm|md|lg, no clamp)', () => {
        it('passes sm|md|lg through unchanged on Mantine (web)', () => {
            for (const s of ['sm', 'md', 'lg'] as TSemanticSize[]) {
                expect(mapSizeToMantine(s)).toBe(s);
            }
        });

        it('maps sm|md|lg 1:1 onto HeroUI (no clamp)', () => {
            expect(mapSizeToHeroUi('sm')).toBe('sm');
            expect(mapSizeToHeroUi('md')).toBe('md');
            expect(mapSizeToHeroUi('lg')).toBe('lg');
            expect(mapSizeToHeroUi(undefined)).toBeUndefined();
        });
    });

    describe('radius (none|sm|md|lg|full)', () => {
        it('resolves to px for mobile (none=0, full=pill, tokens via RADIUS_PX)', () => {
            expect(mapRadiusToPx('none')).toBe(0);
            expect(mapRadiusToPx('full')).toBe(FULL_RADIUS_PX);
            expect(mapRadiusToPx('sm')).toBe(RADIUS_PX.sm);
            expect(mapRadiusToPx('md')).toBe(RADIUS_PX.md);
            expect(mapRadiusToPx('lg')).toBe(RADIUS_PX.lg);
            expect(mapRadiusToPx(undefined)).toBeUndefined();
        });

        it('resolves to token/number for Mantine (web)', () => {
            expect(mapRadiusToMantine('sm')).toBe('sm');
            expect(mapRadiusToMantine('md')).toBe('md');
            expect(mapRadiusToMantine('lg')).toBe('lg');
            expect(mapRadiusToMantine('none')).toBe(0);
            expect(mapRadiusToMantine('full')).toBe(FULL_RADIUS_PX);
        });
    });

    describe('spacing', () => {
        it('resolves tokens to px (none=0)', () => {
            expect(mapSpacingToPx('none')).toBe(0);
            expect(mapSpacingToPx('md')).toBe(SPACING_PX.md);
            expect(mapSpacingToPx('xl')).toBe(SPACING_PX.xl);
            expect(mapSpacingToPx(undefined)).toBeUndefined();
        });
    });

    describe('resolveSharedStyleProps (read CMS fields)', () => {
        it('reads valid portable values', () => {
            expect(
                resolveSharedStyleProps({
                    size: 'lg',
                    radius: 'full',
                    full_width: '1',
                }),
            ).toEqual({ size: 'lg', radius: 'full', fullWidth: true });
        });

        it('ignores out-of-domain values instead of clamping them', () => {
            // Stale Mantine values (xs/xl) are NOT mapped; the renderer falls
            // through to its component default rather than silently clamping.
            const resolved = resolveSharedStyleProps({
                size: 'xl',
                radius: 'xs',
            });
            expect(resolved.size).toBeUndefined();
            expect(resolved.radius).toBeUndefined();
        });

        it('coerces full_width booleans', () => {
            expect(resolveSharedStyleProps({ full_width: '0' }).fullWidth).toBe(false);
            expect(resolveSharedStyleProps({ full_width: true }).fullWidth).toBe(true);
            expect(resolveSharedStyleProps({}).fullWidth).toBeUndefined();
        });

        it('reads color and variant (the REAL cross-platform fields)', () => {
            const resolved = resolveSharedStyleProps({ color: 'red', variant: 'light' });
            expect(resolved.color).toBe('red');
            expect(resolved.variant).toBe('light');
        });

        it('treats an empty color / variant as absent', () => {
            const resolved = resolveSharedStyleProps({ color: '', variant: '' });
            expect(resolved.color).toBeUndefined();
            expect(resolved.variant).toBeUndefined();
        });
    });

    describe('Mantine colour/variant -> HeroUI Native (real color/variant)', () => {
        it('maps a Mantine palette colour to a HeroUI semantic colour', () => {
            expect(mapMantineColorToHeroUiColor('red')).toBe('danger');
            expect(mapMantineColorToHeroUiColor('green')).toBe('success');
            expect(mapMantineColorToHeroUiColor('yellow')).toBe('warning');
            expect(mapMantineColorToHeroUiColor('gray')).toBe('default');
            expect(mapMantineColorToHeroUiColor('blue')).toBe('accent');
            expect(mapMantineColorToHeroUiColor('grape')).toBe('accent');
            expect(mapMantineColorToHeroUiColor(undefined)).toBeUndefined();
        });

        it('maps a Mantine variant to a HeroUI button variant', () => {
            expect(mapMantineVariantToHeroUiButtonVariant('filled')).toBe('primary');
            expect(mapMantineVariantToHeroUiButtonVariant('light')).toBe('secondary');
            expect(mapMantineVariantToHeroUiButtonVariant('outline')).toBe('outline');
            expect(mapMantineVariantToHeroUiButtonVariant('subtle')).toBe('ghost');
            expect(mapMantineVariantToHeroUiButtonVariant('transparent')).toBe('ghost');
        });

        it('maps the accordion variant token onto the HeroUI Native accordion variant', () => {
            expect(mapAccordionVariantToHeroUiVariant('default')).toBe('default');
            expect(mapAccordionVariantToHeroUiVariant('contained')).toBe('surface');
            expect(mapAccordionVariantToHeroUiVariant('filled')).toBe('surface');
            expect(mapAccordionVariantToHeroUiVariant('separated')).toBe('surface');
            expect(mapAccordionVariantToHeroUiVariant(undefined)).toBe('default');
        });

        it('maps the chip variant token onto the HeroUI Native chip variant', () => {
            expect(mapChipVariantToHeroUiVariant('filled')).toBe('primary');
            expect(mapChipVariantToHeroUiVariant('light')).toBe('soft');
            expect(mapChipVariantToHeroUiVariant('outline')).toBe('tertiary');
            expect(mapChipVariantToHeroUiVariant(undefined)).toBe('primary');
        });

        it('derives a button variant from the colour when no variant is set', () => {
            expect(mapMantineColorToHeroUiButtonVariant('red')).toBe('danger');
            expect(mapMantineColorToHeroUiButtonVariant('gray')).toBe('secondary');
            expect(mapMantineColorToHeroUiButtonVariant('blue')).toBe('primary');
        });

        it('toHeroUiSemanticProps prefers variant, then color', () => {
            expect(
                toHeroUiSemanticProps({ variant: 'outline', color: 'red' }).buttonVariant,
            ).toBe('outline');
            expect(toHeroUiSemanticProps({ color: 'red' })).toMatchObject({
                buttonVariant: 'danger',
                color: 'danger',
            });
            expect(toHeroUiSemanticProps({ color: 'green' })).toMatchObject({
                buttonVariant: 'primary',
                color: 'success',
            });
        });

        it('resolves a real CMS button section (color + variant + size)', () => {
            const props = resolveSharedStyleProps({
                color: 'red',
                variant: 'filled',
                size: 'lg',
                radius: 'md',
            });
            expect(toHeroUiSemanticProps(props)).toMatchObject({
                size: 'lg',
                buttonVariant: 'primary', // filled -> primary
                color: 'danger', // red -> danger
                radiusPx: RADIUS_PX.md,
            });
        });
    });

    describe('platform resolvers', () => {
        it('resolves a red / filled / lg / full / fullWidth control consistently (no clamp)', () => {
            const props = {
                color: 'red' as const,
                variant: 'filled' as const,
                size: 'lg' as const,
                radius: 'full' as const,
                spacing: 'md' as const,
                states: ['disabled', 'required'] as const,
                fullWidth: true,
            };

            expect(toMantineSemanticProps(props)).toMatchObject({
                size: 'lg',
                color: 'red',
                variant: 'filled',
                radius: FULL_RADIUS_PX,
                spacing: 'md',
                disabled: true,
                required: true,
                fullWidth: true,
            });

            expect(toHeroUiSemanticProps(props)).toMatchObject({
                size: 'lg', // 1:1, not clamped
                buttonVariant: 'primary', // filled -> primary
                color: 'danger', // red -> danger
                radiusPx: FULL_RADIUS_PX,
                spacingPx: SPACING_PX.md,
                isDisabled: true,
                isRequired: true,
                fullWidth: true,
            });
        });

        it('resolveSharedStyle returns both platform shapes', () => {
            const { web, mobile } = resolveSharedStyle({ size: 'md', color: 'blue' });
            expect(web.size).toBe('md');
            expect(web.color).toBe('blue');
            expect(mobile.size).toBe('md');
            expect(mobile.buttonVariant).toBe('primary');
        });

        it('leaves unset values undefined on both platforms', () => {
            const { web, mobile } = resolveSharedStyle({});
            expect(web.color).toBeUndefined();
            expect(web.disabled).toBeUndefined();
            expect(mobile.buttonVariant).toBeUndefined();
            expect(mobile.isDisabled).toBeUndefined();
        });

        it('covers every mapped colour without throwing', () => {
            for (const color of ['blue', 'gray', 'green', 'yellow', 'red'] as const) {
                const { web, mobile } = resolveSharedStyle({ color });
                expect(web.color).toBeDefined();
                expect(mobile.color).toBeDefined();
                expect(mobile.buttonVariant).toBeDefined();
            }
        });
    });

    describe('toReactNativeSemanticStyle', () => {
        it('derives a plain RN style from shared props', () => {
            expect(
                toReactNativeSemanticStyle({ radius: 'md', spacing: 'lg', fullWidth: true }),
            ).toEqual({
                borderRadius: RADIUS_PX.md,
                padding: SPACING_PX.lg,
                alignSelf: 'stretch',
                width: '100%',
            });
        });

        it('honours none/full radius edge values', () => {
            expect(toReactNativeSemanticStyle({ radius: 'none' }).borderRadius).toBe(0);
            expect(toReactNativeSemanticStyle({ radius: 'full' }).borderRadius).toBe(FULL_RADIUS_PX);
        });

        it('applies theme scale overrides without an implicit default fallback', () => {
            const style = toReactNativeSemanticStyle(
                { radius: 'md', spacing: 'md' },
                { radiusPx: { md: 99 }, spacingPx: { md: 7 } },
            );
            expect(style.borderRadius).toBe(99);
            expect(style.padding).toBe(7);
        });

        it('returns an empty object for empty props', () => {
            expect(toReactNativeSemanticStyle({})).toEqual({});
        });
    });

    describe('layout dimensions (shared_width/height)', () => {
        it('strips the px suffix to a unitless number for React Native', () => {
            expect(parseDimensionToReactNative('320px')).toBe(320);
            expect(parseDimensionToReactNative('320')).toBe(320);
            expect(parseDimensionToReactNative(320)).toBe(320);
        });

        it('keeps percentages and auto for React Native', () => {
            expect(parseDimensionToReactNative('50%')).toBe('50%');
            expect(parseDimensionToReactNative('auto')).toBe('auto');
        });

        it('returns undefined for empty/invalid dimensions (renderer keeps its default)', () => {
            expect(parseDimensionToReactNative('')).toBeUndefined();
            expect(parseDimensionToReactNative('   ')).toBeUndefined();
            expect(parseDimensionToReactNative(undefined)).toBeUndefined();
            expect(parseDimensionToReactNative(null)).toBeUndefined();
            expect(parseDimensionToReactNative('10rem')).toBeUndefined();
        });

        it('passes a dimension through verbatim for web (Mantine)', () => {
            expect(parseDimensionToWeb('320px')).toBe('320px');
            expect(parseDimensionToWeb('100%')).toBe('100%');
            expect(parseDimensionToWeb('auto')).toBe('auto');
            expect(parseDimensionToWeb('')).toBeUndefined();
            expect(parseDimensionToWeb(undefined)).toBeUndefined();
        });
    });

    describe('grid span -> React Native column', () => {
        it('converts a numeric span to a flex-basis percentage of cols', () => {
            expect(gridSpanToReactNativeColumn(6, 12)).toEqual({
                flexBasis: '50%',
                flexGrow: 0,
                flexShrink: 1,
            });
            expect(gridSpanToReactNativeColumn(1, 4)).toEqual({
                flexBasis: '25%',
                flexGrow: 0,
                flexShrink: 1,
            });
        });

        it('grows to share space for "auto" and sizes to content for "content"', () => {
            expect(gridSpanToReactNativeColumn('auto')).toEqual({
                flexBasis: 0,
                flexGrow: 1,
                flexShrink: 1,
            });
            expect(gridSpanToReactNativeColumn('content')).toEqual({
                flexBasis: 'auto',
                flexGrow: 0,
                flexShrink: 0,
            });
        });

        it('clamps an oversized span and falls back to a full row for invalid input', () => {
            expect(gridSpanToReactNativeColumn(99, 12).flexBasis).toBe('100%');
            expect(gridSpanToReactNativeColumn('nope', 12).flexBasis).toBe('100%');
            expect(gridSpanToReactNativeColumn(0, 12).flexBasis).toBe('100%');
        });
    });

    describe('divider variant -> React Native borderStyle', () => {
        it('maps the identical vocabulary and defaults to solid', () => {
            expect(mapDividerVariantToReactNative('solid')).toBe('solid');
            expect(mapDividerVariantToReactNative('dashed')).toBe('dashed');
            expect(mapDividerVariantToReactNative('dotted')).toBe('dotted');
            expect(mapDividerVariantToReactNative(undefined)).toBe('solid');
            expect(mapDividerVariantToReactNative('bogus')).toBe('solid');
        });
    });
});
