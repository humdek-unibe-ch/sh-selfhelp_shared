/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Shared Tailwind preset extended by both the web frontend (Tailwind v4)
 * and the mobile app (Uniwind v4 inside HeroUI Native). Anchors the same
 * scale values that drive `shared_size`, `shared_radius`,
 * `shared_spacing`, and the color palette so a class like `p-md` or
 * `text-blue-6` resolves identically on web and mobile.
 */

import { COLOR_SCALES, RADIUS_PX, SPACING_PX, FONT_SIZE_PX, LINE_HEIGHT } from './tokens';

const px = (n: number | undefined): string => (n === undefined ? '0px' : `${n}px`);

const colorScaleToTailwind = (scale: readonly string[]): Record<string, string> => {
    const out: Record<string, string> = {};
    scale.forEach((value, idx) => {
        out[String(idx)] = value;
    });
    return out;
};

const colors: Record<string, Record<string, string>> = {};
for (const [name, scale] of Object.entries(COLOR_SCALES)) {
    colors[name] = colorScaleToTailwind(scale);
}

const spacing: Record<string, string> = {
    none: px(SPACING_PX.none),
    xs: px(SPACING_PX.xs),
    sm: px(SPACING_PX.sm),
    md: px(SPACING_PX.md),
    lg: px(SPACING_PX.lg),
    xl: px(SPACING_PX.xl),
};

const borderRadius: Record<string, string> = {
    xs: px(RADIUS_PX.xs),
    sm: px(RADIUS_PX.sm),
    md: px(RADIUS_PX.md),
    lg: px(RADIUS_PX.lg),
    xl: px(RADIUS_PX.xl),
};

const fontSize: Record<string, [string, { lineHeight: string }]> = {
    xs: [px(FONT_SIZE_PX.xs), { lineHeight: String(LINE_HEIGHT.xs) }],
    sm: [px(FONT_SIZE_PX.sm), { lineHeight: String(LINE_HEIGHT.sm) }],
    md: [px(FONT_SIZE_PX.md), { lineHeight: String(LINE_HEIGHT.md) }],
    lg: [px(FONT_SIZE_PX.lg), { lineHeight: String(LINE_HEIGHT.lg) }],
    xl: [px(FONT_SIZE_PX.xl), { lineHeight: String(LINE_HEIGHT.xl) }],
};

/**
 * Tailwind theme `extend` block. Apps spread this into their own
 * tailwind config (`theme.extend`).
 */
export const sharedTailwindExtend = {
    colors,
    spacing,
    borderRadius,
    fontSize,
} as const;

/**
 * Convenience preset object that fits both Tailwind v3 and v4 / Uniwind.
 */
export const sharedTailwindPreset = {
    theme: {
        extend: sharedTailwindExtend,
    },
} as const;
