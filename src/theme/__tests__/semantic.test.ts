/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, expect, it } from 'vitest';
import {
    FULL_RADIUS_PX,
    mapIntentToHeroUiButtonVariant,
    mapIntentToHeroUiColor,
    mapIntentToMantine,
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
    resolveSharedStyle,
    resolveSharedStyleProps,
    toHeroUiSemanticProps,
    toMantineSemanticProps,
    toReactNativeSemanticStyle,
    type TSemanticIntent,
    type TSemanticSize,
} from '../semantic';
import { RADIUS_PX, SPACING_PX } from '../tokens';

/**
 * The semantic mapper is the single source of truth that turns CMS
 * cross-platform (`shared_*`) values into per-platform props. Per the mobile
 * rendering plan (section 8.2) it does NOT clamp: the shared scales
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

    describe('intent', () => {
        it('maps to Mantine color + variant', () => {
            expect(mapIntentToMantine('primary')).toEqual({ color: 'blue', variant: 'filled' });
            expect(mapIntentToMantine('secondary')).toEqual({ color: 'gray', variant: 'light' });
            expect(mapIntentToMantine('success')).toEqual({ color: 'green', variant: 'filled' });
            expect(mapIntentToMantine('warning')).toEqual({ color: 'yellow', variant: 'filled' });
            expect(mapIntentToMantine('danger')).toEqual({ color: 'red', variant: 'filled' });
            expect(mapIntentToMantine('neutral')).toEqual({ color: 'gray', variant: 'default' });
        });

        it('maps intent to a HeroUI button variant (status color carried separately)', () => {
            expect(mapIntentToHeroUiButtonVariant('primary')).toBe('primary');
            expect(mapIntentToHeroUiButtonVariant('secondary')).toBe('secondary');
            expect(mapIntentToHeroUiButtonVariant('danger')).toBe('danger');
            // HeroUI has no success/warning BUTTON variant; the status colour is
            // carried by mapIntentToHeroUiColor, the button stays prominent.
            expect(mapIntentToHeroUiButtonVariant('success')).toBe('primary');
            expect(mapIntentToHeroUiButtonVariant('warning')).toBe('primary');
            expect(mapIntentToHeroUiButtonVariant('neutral')).toBe('secondary');
        });

        it('maps to HeroUI semantic color preserving success/warning', () => {
            expect(mapIntentToHeroUiColor('primary')).toBe('accent');
            expect(mapIntentToHeroUiColor('secondary')).toBe('default');
            expect(mapIntentToHeroUiColor('success')).toBe('success');
            expect(mapIntentToHeroUiColor('warning')).toBe('warning');
            expect(mapIntentToHeroUiColor('danger')).toBe('danger');
            expect(mapIntentToHeroUiColor('neutral')).toBe('default');
        });
    });

    describe('resolveSharedStyleProps (read CMS fields)', () => {
        it('reads valid shared_* values', () => {
            expect(
                resolveSharedStyleProps({
                    shared_size: 'lg',
                    shared_radius: 'full',
                    shared_intent: 'danger',
                    shared_full_width: '1',
                }),
            ).toEqual({ size: 'lg', radius: 'full', intent: 'danger', fullWidth: true });
        });

        it('ignores out-of-domain values instead of clamping them', () => {
            // Stale Mantine values (xs/xl) are NOT mapped; the renderer falls
            // through to its component default rather than silently clamping.
            const resolved = resolveSharedStyleProps({
                shared_size: 'xl',
                shared_radius: 'xs',
                shared_intent: 'bogus',
            });
            expect(resolved.size).toBeUndefined();
            expect(resolved.radius).toBeUndefined();
            expect(resolved.intent).toBeUndefined();
        });

        it('coerces shared_full_width booleans', () => {
            expect(resolveSharedStyleProps({ shared_full_width: '0' }).fullWidth).toBe(false);
            expect(resolveSharedStyleProps({ shared_full_width: true }).fullWidth).toBe(true);
            expect(resolveSharedStyleProps({}).fullWidth).toBeUndefined();
        });

        it('reads shared_color and shared_variant (the REAL cross-platform fields)', () => {
            const resolved = resolveSharedStyleProps({ shared_color: 'red', shared_variant: 'light' });
            expect(resolved.color).toBe('red');
            expect(resolved.variant).toBe('light');
        });

        it('treats an empty shared_color / shared_variant as absent', () => {
            const resolved = resolveSharedStyleProps({ shared_color: '', shared_variant: '' });
            expect(resolved.color).toBeUndefined();
            expect(resolved.variant).toBeUndefined();
        });
    });

    describe('Mantine colour/variant -> HeroUI Native (real shared_color/shared_variant)', () => {
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

        it('toHeroUiSemanticProps prefers shared_variant, then shared_color, then intent', () => {
            expect(
                toHeroUiSemanticProps({ variant: 'outline', color: 'red', intent: 'primary' }).buttonVariant,
            ).toBe('outline');
            expect(toHeroUiSemanticProps({ color: 'red' })).toMatchObject({
                buttonVariant: 'danger',
                color: 'danger',
            });
            expect(toHeroUiSemanticProps({ intent: 'success' })).toMatchObject({
                buttonVariant: 'primary',
                color: 'success',
            });
        });

        it('resolves a real CMS button section (shared_color + shared_variant + shared_size)', () => {
            const props = resolveSharedStyleProps({
                shared_color: 'red',
                shared_variant: 'filled',
                shared_size: 'lg',
                shared_radius: 'md',
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
        it('resolves a danger / lg / full / fullWidth control consistently (no clamp)', () => {
            const props = {
                intent: 'danger' as const,
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
                buttonVariant: 'danger',
                color: 'danger',
                radiusPx: FULL_RADIUS_PX,
                spacingPx: SPACING_PX.md,
                isDisabled: true,
                isRequired: true,
                fullWidth: true,
            });
        });

        it('resolveSharedStyle returns both platform shapes', () => {
            const { web, mobile } = resolveSharedStyle({ size: 'md', intent: 'primary' });
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

        it('covers every intent without throwing', () => {
            for (const intent of ['primary', 'secondary', 'success', 'warning', 'danger', 'neutral'] as TSemanticIntent[]) {
                const { web, mobile } = resolveSharedStyle({ intent });
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
});
