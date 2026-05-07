/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Mantine semantic token tables. Both the web Mantine theme and the
 * mobile HeroUI Native theme extend these so a `mantine_size: 'md'` on a
 * section renders identical sizing regardless of platform.
 *
 * Pixel values come straight from Mantine v9 defaults:
 *   https://mantine.dev/theming/sizes/
 */

import type { TMantineSize } from '../types/mantine/common';

/** Canonical spacing tokens (without the `string` escape hatch). */
export type TCanonicalSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TCanonicalRadius = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TCanonicalColor =
    | 'gray'
    | 'red'
    | 'pink'
    | 'grape'
    | 'violet'
    | 'indigo'
    | 'blue'
    | 'cyan'
    | 'teal'
    | 'green'
    | 'lime'
    | 'yellow'
    | 'orange'
    | 'dark';

/** xs..xl -> font-size px (Mantine `theme.fontSizes`). */
export const FONT_SIZE_PX: Record<TMantineSize, number> = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
};

/** xs..xl -> line-height. */
export const LINE_HEIGHT: Record<TMantineSize, number> = {
    xs: 1.4,
    sm: 1.45,
    md: 1.55,
    lg: 1.6,
    xl: 1.65,
};

/** xs..xl -> spacing px (Mantine `theme.spacing`). */
export const SPACING_PX: Record<TCanonicalSpacing, number> = {
    none: 0,
    xs: 10,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 32,
};

/** Mantine spacing -> Tailwind spacing class suffix. */
export const SPACING_TO_TAILWIND: Record<TCanonicalSpacing, string> = {
    none: '0',
    xs: '2.5',
    sm: '3',
    md: '4',
    lg: '5',
    xl: '8',
};

/** xs..xl -> border-radius px. */
export const RADIUS_PX: Record<TCanonicalRadius, number> = {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 32,
};

/** Mantine container size -> max-width px. */
export const CONTAINER_SIZE_PX: Record<TMantineSize, number> = {
    xs: 540,
    sm: 720,
    md: 960,
    lg: 1140,
    xl: 1320,
};

/**
 * Mantine palette base colors (color-6 from each scale). Each renderer
 * maps these to its own theme tokens. For HeroUI Native we feed these
 * into the theme builder so `mantine_color: 'blue'` resolves to the
 * same Mantine-blue look on mobile.
 */
export const COLOR_PALETTE: Record<TCanonicalColor, string> = {
    gray: '#868e96',
    red: '#fa5252',
    pink: '#e64980',
    grape: '#be4bdb',
    violet: '#7950f2',
    indigo: '#4c6ef5',
    blue: '#228be6',
    cyan: '#15aabf',
    teal: '#12b886',
    green: '#40c057',
    lime: '#82c91e',
    yellow: '#fab005',
    orange: '#fd7e14',
    dark: '#212529',
};

/**
 * Full Mantine color scales (0..9). The renderer can pick a shade
 * (default 6 for `light`/`filled`).
 */
export const COLOR_SCALES: Record<TCanonicalColor, readonly string[]> = {
    gray: ['#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#868e96', '#495057', '#343a40', '#212529'],
    red: ['#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a'],
    pink: ['#fff0f6', '#ffdeeb', '#fcc2d7', '#faa2c1', '#f783ac', '#f06595', '#e64980', '#d6336c', '#c2255c', '#a61e4d'],
    grape: ['#f8f0fc', '#f3d9fa', '#eebefa', '#e599f7', '#da77f2', '#cc5de8', '#be4bdb', '#ae3ec9', '#9c36b5', '#862e9c'],
    violet: ['#f3f0ff', '#e5dbff', '#d0bfff', '#b197fc', '#9775fa', '#845ef7', '#7950f2', '#7048e8', '#6741d9', '#5f3dc4'],
    indigo: ['#edf2ff', '#dbe4ff', '#bac8ff', '#91a7ff', '#748ffc', '#5c7cfa', '#4c6ef5', '#4263eb', '#3b5bdb', '#364fc7'],
    blue: ['#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7', '#339af0', '#228be6', '#1c7ed6', '#1971c2', '#1864ab'],
    cyan: ['#e3fafc', '#c5f6fa', '#99e9f2', '#66d9e8', '#3bc9db', '#22b8cf', '#15aabf', '#1098ad', '#0c8599', '#0b7285'],
    teal: ['#e6fcf5', '#c3fae8', '#96f2d7', '#63e6be', '#38d9a9', '#20c997', '#12b886', '#0ca678', '#099268', '#087f5b'],
    green: ['#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c', '#51cf66', '#40c057', '#37b24d', '#2f9e44', '#2b8a3e'],
    lime: ['#f4fce3', '#e9fac8', '#d8f5a2', '#c0eb75', '#a9e34b', '#94d82d', '#82c91e', '#74b816', '#66a80f', '#5c940d'],
    yellow: ['#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b', '#fcc419', '#fab005', '#f59f00', '#f08c00', '#e67700'],
    orange: ['#fff4e6', '#ffe8cc', '#ffd8a8', '#ffc078', '#ffa94d', '#ff922b', '#fd7e14', '#f76707', '#e8590c', '#d9480f'],
    dark: ['#c1c2c5', '#a6a7ab', '#909296', '#5c5f66', '#373a40', '#2c2e33', '#25262b', '#1a1b1e', '#141517', '#101113'],
};

export interface ISpacingResolved {
    mt?: number | string;
    mb?: number | string;
    ms?: number | string;
    me?: number | string;
    pt?: number | string;
    pb?: number | string;
    ps?: number | string;
    pe?: number | string;
}

/** Resolve a spacing token (xs..xl/none) to a px value, passing through any non-Mantine string verbatim. */
export function spacingToPx(token: string | undefined): number | string | undefined {
    if (!token || token === 'none') return undefined;
    if (token in SPACING_PX) return SPACING_PX[token as TCanonicalSpacing];
    return token;
}

/** Resolve a Mantine size to a font-size px value, passing through any non-Mantine string verbatim. */
export function sizeToFontPx(token: string | undefined): number | string | undefined {
    if (!token) return undefined;
    if (token in FONT_SIZE_PX) return FONT_SIZE_PX[token as TMantineSize];
    return token;
}

/** Resolve a Mantine radius to a px value, passing through any non-Mantine string verbatim. */
export function radiusToPx(token: string | undefined): number | string | undefined {
    if (!token) return undefined;
    if (token in RADIUS_PX) return RADIUS_PX[token as TCanonicalRadius];
    return token;
}

/**
 * Resolve a Mantine palette color name + optional shade index to a hex
 * string. Passes raw hex/css color values through unchanged.
 */
export function colorToHex(name: string | undefined, shade = 6): string | undefined {
    if (!name) return undefined;
    if (name.startsWith('#') || name.startsWith('rgb') || name.startsWith('hsl')) return name;
    const scale = COLOR_SCALES[name as TCanonicalColor];
    if (!scale) return name;
    return scale[Math.max(0, Math.min(9, shade))];
}
