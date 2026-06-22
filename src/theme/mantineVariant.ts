/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Mantine `variant + color` -> resolved concrete colors.
 *
 * This is the single, cross-repo source of truth for turning a Mantine
 * palette `color` + `variant` pair into concrete background / foreground /
 * border values. It lives in `@selfhelp/shared` so neither the web frontend
 * nor the mobile app re-implements the variant ladder.
 *
 * SCOPE — this is NOT the semantic mapper (`semantic.ts`). The two have
 * different input domains and both live here so there is exactly one home
 * for style mapping:
 *   - `semantic.ts`        maps renderer-agnostic shared fields
 *                          (`intent` / `size` / `radius` / `spacing`) per platform.
 *   - `mantineVariant.ts`  resolves a Mantine palette `color` + `variant` value
 *                          pair (e.g. the semantic `color` + `web_variant`)
 *                          into concrete RGB. Its only runtime
 *                          consumer today is the mobile **Expo Web preview**
 *                          fallback (where `heroui-native` cannot render and the
 *                          renderer reproduces the Mantine look); the web
 *                          frontend uses Mantine components directly.
 *
 * Mantine offers six interactive variants:
 *   - filled       solid fill, white text
 *   - light        soft fill (color-0 / color-1), color-8 text
 *   - outline      transparent bg, color-6 border + text
 *   - default      white bg, gray border, gray-9 text  (the "neutral" one)
 *   - subtle       transparent bg, color-7 text, hover bg color-0
 *   - transparent  transparent bg, color-7 text, no hover surface
 *
 * `gradient` and `dot` (used by Alert/Card/Badge) collapse onto
 * `filled` / `dot` here so the surface stays tight and consistent.
 */

import { COLOR_PALETTE, COLOR_SCALES, type TCanonicalColor } from './tokens';

/**
 * Variant keys this resolver understands. Superset of the canonical
 * `TMantineVariant` (it adds `dot`, used by Alert/Badge); kept internal so it
 * never collides with the exported `TMantineVariant` from `types/mantine`.
 */
type TMantineVariantKey =
    | 'filled'
    | 'light'
    | 'outline'
    | 'default'
    | 'subtle'
    | 'transparent'
    | 'gradient'
    | 'dot';

export interface IResolvedVariant {
    background: string;
    foreground: string;
    border: string;
    borderWidth: number;
    pressedBackground: string;
    accent: string;
}

const TRANSPARENT = 'transparent';

function scale(color: string | undefined): readonly string[] {
    if (!color) return COLOR_SCALES.blue;
    return COLOR_SCALES[color as TCanonicalColor] ?? COLOR_SCALES.blue;
}

export function resolveMantineVariant(
    variant: string | undefined,
    color: string | undefined,
): IResolvedVariant {
    const palette = scale(color);
    const accent = COLOR_PALETTE[color as TCanonicalColor] ?? palette[6] ?? '#228be6';
    const v = (variant ?? 'filled') as TMantineVariantKey;

    switch (v) {
        case 'light':
            return {
                background: palette[0],
                foreground: palette[8],
                border: TRANSPARENT,
                borderWidth: 0,
                pressedBackground: palette[1],
                accent,
            };
        case 'outline':
            return {
                background: TRANSPARENT,
                foreground: palette[7],
                border: palette[6],
                borderWidth: 1,
                pressedBackground: palette[0],
                accent,
            };
        case 'default':
            return {
                background: '#ffffff',
                foreground: '#212529',
                border: '#dee2e6',
                borderWidth: 1,
                pressedBackground: '#f1f3f5',
                accent,
            };
        case 'subtle':
            return {
                background: TRANSPARENT,
                foreground: palette[7],
                border: TRANSPARENT,
                borderWidth: 0,
                pressedBackground: palette[0],
                accent,
            };
        case 'transparent':
            return {
                background: TRANSPARENT,
                foreground: palette[7],
                border: TRANSPARENT,
                borderWidth: 0,
                pressedBackground: TRANSPARENT,
                accent,
            };
        case 'dot':
            return {
                background: TRANSPARENT,
                foreground: palette[7],
                border: '#dee2e6',
                borderWidth: 1,
                pressedBackground: '#f8f9fa',
                accent,
            };
        case 'filled':
        case 'gradient':
        default:
            return {
                background: accent,
                foreground: '#ffffff',
                border: TRANSPARENT,
                borderWidth: 0,
                pressedBackground: palette[7] ?? accent,
                accent,
            };
    }
}
