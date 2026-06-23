/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Shared semantic style mapper — the single source of truth that turns
 * renderer-agnostic CMS values (the unprefixed portable fields) into concrete
 * per-platform props. Renderers consume this module instead of duplicating
 * mapping logic.
 *
 *   - Web    -> Mantine          (`toMantineSemanticProps`)
 *   - Mobile -> HeroUI Native    (`toHeroUiSemanticProps`)
 *   - Mobile -> React Native     (`toReactNativeSemanticStyle`)
 *
 * Design rules (mobile rendering plan, section 8.2):
 *   - NO value clamping. The shared scales are the true common denominator
 *     (`size` = sm|md|lg, `radius` = none|sm|md|lg|full), so every
 *     value maps 1:1 to each platform. The backend enforces the same domain
 *     (migration `Version20260618195450`).
 *   - NO implicit cross-platform fallback. These functions take already-resolved
 *     portable props; the precedence `web_*`/`mobile_*` override -> portable
 *     (unprefixed) -> component default is applied by each platform renderer,
 *     never here.
 *   - Exhaustive enum handling (every switch covers the full domain).
 *
 * Platform-specific props stay separate from these portable values:
 *   - `web_*`    Mantine-only fields
 *   - `mobile_*` HeroUI/native-only fields
 *   - portable   the unprefixed semantic fields mapped here
 */

import { RADIUS_PX, SPACING_PX, type TCanonicalSpacing } from './tokens';
import type { TMantineColor, TMantineVariant, TSharedRadius, TSharedSize } from '../types/mantine/common';

// ===== shared semantic scales (what the CMS stores) =====

/** Cross-platform size: the true common denominator (HeroUI Native has no xs/xl). */
export type TSemanticSize = TSharedSize; // 'sm' | 'md' | 'lg'
export type TSemanticSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
/** Cross-platform radius. `full` = pill; `none` = square. */
export type TSemanticRadius = TSharedRadius; // 'none' | 'sm' | 'md' | 'lg' | 'full'
export type TSemanticState = 'disabled' | 'loading' | 'invalid' | 'required';

/**
 * Cross-platform colour + variant authored in the CMS (`color` /
 * `variant`), stored as Mantine palette / variant *values* kept verbatim by the
 * catalog. They are the canonical cross-platform appearance fields; the mapper
 * maps them onto HeroUI Native for mobile, while the web renderer feeds them
 * straight into Mantine.
 */
export type TSemanticColor = TMantineColor;
export type TSemanticVariant = TMantineVariant;

/** Pixel value used for a fully-rounded ("pill") radius on both platforms. */
export const FULL_RADIUS_PX = 9999;

const SEMANTIC_SIZES: readonly TSemanticSize[] = ['sm', 'md', 'lg'];
const SEMANTIC_RADII: readonly TSemanticRadius[] = ['none', 'sm', 'md', 'lg', 'full'];

/**
 * Renderer-agnostic style values configured in the CMS. Every field is
 * optional; renderers fall back to component defaults when a value is
 * absent.
 */
export interface ISharedStyleProps {
    size?: TSemanticSize;
    spacing?: TSemanticSpacing;
    radius?: TSemanticRadius;
    /** Mantine palette colour authored via `color` (cross-platform). */
    color?: TSemanticColor;
    /** Mantine variant authored via `variant` (cross-platform). */
    variant?: TSemanticVariant;
    /** Active boolean states. Stored as a small set so multiple can apply. */
    states?: readonly TSemanticState[];
    /** Layout: stretch the control to the full width of its container. */
    fullWidth?: boolean;
}

// ===== Mantine (web) target shapes =====

export interface IMantineResolvedStyle {
    /** Mantine accepts sm|md|lg 1:1 (a subset of its xs..xl scale). */
    size?: TSemanticSize;
    /** Mantine palette colour, read verbatim from the `color` field. */
    color?: TSemanticColor;
    /** Mantine variant, read verbatim from the `variant` field. */
    variant?: TSemanticVariant;
    /** Mantine `radius` accepts a token or a number; pill => FULL_RADIUS_PX. */
    radius?: TSemanticSize | number;
    /** Margin/padding spacing token (xs..xl); `none` => undefined. */
    spacing?: Exclude<TSemanticSpacing, 'none'>;
    disabled?: boolean;
    loading?: boolean;
    error?: boolean;
    required?: boolean;
    fullWidth?: boolean;
}

// ===== HeroUI Native (mobile) target shapes =====

/** HeroUI Native sizes — sm | md | lg (identical to the shared scale). */
export type THeroUiSize = TSharedSize;
/** HeroUI Native Button variants. */
export type THeroUiButtonVariant =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'danger-soft';
/** HeroUI Native semantic colors (Chip / Tag / status surfaces). */
export type THeroUiColor = 'accent' | 'default' | 'success' | 'warning' | 'danger';

export interface IHeroUiResolvedStyle {
    size?: THeroUiSize;
    /** Button variant derived from the Mantine `variant`/`color`. */
    buttonVariant?: THeroUiButtonVariant;
    /** Semantic color derived from the Mantine `color` (Chip/Tag/etc). */
    color?: THeroUiColor;
    /** Resolved radius in px (pill => FULL_RADIUS_PX, none => 0). */
    radiusPx?: number;
    /** Resolved spacing in px (none => 0/undefined). */
    spacingPx?: number;
    isDisabled?: boolean;
    isLoading?: boolean;
    isInvalid?: boolean;
    isRequired?: boolean;
    fullWidth?: boolean;
}

/** Plain React Native `View`/`Text` style subset derived from shared props. */
export interface IReactNativeResolvedStyle {
    borderRadius?: number;
    padding?: number;
    alignSelf?: 'stretch';
    width?: '100%';
}

/** Optional px-scale overrides a native theme can inject (no implicit fallback). */
export interface IReactNativeThemeScales {
    radiusPx?: Partial<Record<TSharedSize, number>>;
    spacingPx?: Partial<Record<TCanonicalSpacing, number>>;
}

// ===== size =====

/** Mantine accepts sm|md|lg directly, so size passes through unchanged. */
export function mapSizeToMantine(size: TSemanticSize | undefined): TSemanticSize | undefined {
    return size;
}

/** HeroUI Native uses the same sm|md|lg scale — a 1:1 pass-through (no clamp). */
export function mapSizeToHeroUi(size: TSemanticSize | undefined): THeroUiSize | undefined {
    if (!size) return undefined;
    switch (size) {
        case 'sm':
            return 'sm';
        case 'md':
            return 'md';
        case 'lg':
            return 'lg';
        default:
            return undefined;
    }
}

// ===== radius =====

/** Resolve a semantic radius to px for mobile (none => 0, full => pill). */
export function mapRadiusToPx(radius: TSemanticRadius | undefined): number | undefined {
    if (!radius) return undefined;
    switch (radius) {
        case 'none':
            return 0;
        case 'full':
            return FULL_RADIUS_PX;
        case 'sm':
            return RADIUS_PX.sm;
        case 'md':
            return RADIUS_PX.md;
        case 'lg':
            return RADIUS_PX.lg;
        default:
            return undefined;
    }
}

/** Resolve a semantic radius for Mantine (token, or px number for pill/none). */
export function mapRadiusToMantine(
    radius: TSemanticRadius | undefined,
): TSemanticSize | number | undefined {
    if (!radius) return undefined;
    switch (radius) {
        case 'none':
            return 0;
        case 'full':
            return FULL_RADIUS_PX;
        case 'sm':
            return 'sm';
        case 'md':
            return 'md';
        case 'lg':
            return 'lg';
        default:
            return undefined;
    }
}

// ===== spacing =====

/** Resolve a semantic spacing token to px (none => 0). */
export function mapSpacingToPx(spacing: TSemanticSpacing | undefined): number | undefined {
    if (!spacing) return undefined;
    if (spacing === 'none') return 0;
    return SPACING_PX[spacing as TCanonicalSpacing];
}

// ===== color / variant (the REAL cross-platform appearance fields) =====

/**
 * Map a Mantine palette colour (`color`) onto a HeroUI Native semantic
 * colour (Chip / Tag / status surfaces). The Mantine palette is broad; it
 * collapses onto HeroUI's five semantic colours by hue family:
 *   red/pink             -> danger
 *   green/teal/lime      -> success
 *   yellow/orange        -> warning
 *   gray/dark            -> default
 *   blue/cyan/indigo/…   -> accent (the brand/primary hue)
 */
export function mapMantineColorToHeroUiColor(
    color: TSemanticColor | undefined,
): THeroUiColor | undefined {
    if (!color) return undefined;
    switch (color) {
        case 'red':
        case 'pink':
            return 'danger';
        case 'green':
        case 'teal':
        case 'lime':
            return 'success';
        case 'yellow':
        case 'orange':
            return 'warning';
        case 'gray':
        case 'dark':
            return 'default';
        default:
            return 'accent';
    }
}

/**
 * Map a Mantine palette colour (`color`) onto a HeroUI Native **Button**
 * variant when no explicit `variant` is authored. HeroUI buttons encode
 * colour in the variant, so the destructive hue becomes `danger`, neutral hues
 * become `secondary`, and everything else stays the prominent `primary`.
 */
export function mapMantineColorToHeroUiButtonVariant(
    color: TSemanticColor | undefined,
): THeroUiButtonVariant | undefined {
    if (!color) return undefined;
    switch (color) {
        case 'red':
        case 'pink':
            return 'danger';
        case 'gray':
        case 'dark':
            return 'secondary';
        default:
            return 'primary';
    }
}

/**
 * Map a Mantine variant (`variant`) onto the HeroUI Native Button
 * vocabulary:
 *   filled / gradient        -> primary
 *   light / white / default  -> secondary
 *   outline                  -> outline
 *   subtle / transparent     -> ghost
 */
export function mapMantineVariantToHeroUiButtonVariant(
    variant: TSemanticVariant | undefined,
): THeroUiButtonVariant | undefined {
    if (!variant) return undefined;
    switch (variant) {
        case 'filled':
        case 'gradient':
            return 'primary';
        case 'light':
        case 'white':
        case 'default':
            return 'secondary';
        case 'outline':
            return 'outline';
        case 'subtle':
        case 'transparent':
            return 'ghost';
        default:
            return undefined;
    }
}

/**
 * Map the accordion variant token (`accordion_variant`: Mantine
 * default/contained/filled/separated) onto the HeroUI Native Accordion `variant`
 * vocabulary. HeroUI Native only has `default` (plain list) and `surface`
 * (grouped container), so every "boxed" Mantine variant collapses to `surface`.
 */
export function mapAccordionVariantToHeroUiVariant(
    variant: string | undefined,
): 'default' | 'surface' {
    switch (variant) {
        case 'contained':
        case 'filled':
        case 'separated':
            return 'surface';
        case 'default':
        default:
            return 'default';
    }
}

/**
 * Map the chip variant token (`chip_variant`: Mantine
 * filled/outline/light) onto the HeroUI Native Chip `variant` vocabulary
 * (`primary`/`secondary`/`tertiary`/`soft`):
 *   - filled  -> primary  (solid accent fill)
 *   - light   -> soft     (tinted accent background)
 *   - outline -> tertiary (transparent; the renderer adds the accent border)
 */
export function mapChipVariantToHeroUiVariant(
    variant: string | undefined,
): 'primary' | 'secondary' | 'tertiary' | 'soft' {
    switch (variant) {
        case 'light':
            return 'soft';
        case 'outline':
            return 'tertiary';
        case 'filled':
        default:
            return 'primary';
    }
}

// ===== layout dimensions (shared_width / shared_height / mih/miw/mah/maw / grid span / divider) =====

/** A React Native-safe dimension: a px number, a percentage string, or "auto". */
export type TReactNativeDimension = number | `${number}%` | 'auto';

/**
 * Parse a CMS dimension string (`shared_width`/`shared_height`/`mih`/`miw`/
 * `mah`/`maw`) into a React Native-safe value. Web (Mantine) accepts the raw
 * string verbatim ("320px", "100%", "auto"); React Native does NOT accept a
 * unit suffix, so a px value must become a unitless number:
 *   "320px" | "320" | 320  -> 320          (number)
 *   "50%"                   -> "50%"        (percentage string)
 *   "auto"                  -> "auto"
 *   ""/undefined/unknown    -> undefined    (renderer keeps its default)
 */
export function parseDimensionToReactNative(
    value: string | number | undefined | null,
): TReactNativeDimension | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    if (trimmed === 'auto') return 'auto';
    const pct = /^(\d+(?:\.\d+)?)%$/.exec(trimmed);
    if (pct) {
        const n = Number(pct[1]);
        return `${n}%`;
    }
    const px = /^(\d+(?:\.\d+)?)(?:px)?$/.exec(trimmed);
    if (px) return Number(px[1]);
    return undefined;
}

/**
 * Web pass-through for a CMS dimension: Mantine accepts "320px"/"100%"/"auto"
 * verbatim. Returns undefined for empty so the renderer omits the prop.
 */
export function parseDimensionToWeb(
    value: string | number | undefined | null,
): string | number | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'number') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
}

/** React Native flex layout for one emulated grid column. */
export interface IReactNativeGridColumn {
    flexBasis: TReactNativeDimension;
    flexGrow: number;
    flexShrink: number;
}

/**
 * Convert a Mantine `Grid.Col` span into a React Native flex layout for the
 * emulated mobile grid. `cols` is the parent grid's column count (Mantine
 * default 12).
 *   number    -> a flex-basis percentage of (span / cols)
 *   "auto"    -> grow to share remaining space (flexGrow 1, basis 0)
 *   "content" -> size to content (no grow/shrink, basis auto)
 *   invalid   -> full row ("100%")
 */
export function gridSpanToReactNativeColumn(
    span: string | number | undefined | null,
    cols: number = 12,
): IReactNativeGridColumn {
    const totalCols = cols > 0 ? cols : 12;
    if (span === 'auto') return { flexBasis: 0, flexGrow: 1, flexShrink: 1 };
    if (span === 'content') return { flexBasis: 'auto', flexGrow: 0, flexShrink: 0 };
    const n = typeof span === 'number' ? span : Number.parseInt(String(span ?? ''), 10);
    if (!Number.isFinite(n) || n <= 0) return { flexBasis: '100%', flexGrow: 0, flexShrink: 1 };
    const clamped = Math.min(n, totalCols);
    const pct = Math.round((clamped / totalCols) * 10000) / 100;
    return { flexBasis: `${pct}%`, flexGrow: 0, flexShrink: 1 };
}

/**
 * Map a `divider_variant` (solid/dashed/dotted) onto a React Native
 * `borderStyle`. The vocabularies are identical, so this validates the domain
 * and falls back to 'solid'.
 */
export function mapDividerVariantToReactNative(
    variant: string | undefined | null,
): 'solid' | 'dashed' | 'dotted' {
    switch (variant) {
        case 'dashed':
            return 'dashed';
        case 'dotted':
            return 'dotted';
        case 'solid':
        default:
            return 'solid';
    }
}

// ===== state helpers =====

function hasState(states: readonly TSemanticState[] | undefined, state: TSemanticState): boolean {
    return !!states && states.includes(state);
}

// ===== field reader =====

function readString(value: unknown): string | undefined {
    if (typeof value === 'string' && value !== '') return value;
    return undefined;
}

function readBool(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') return value;
    if (value === '1' || value === 1) return true;
    if (value === '0' || value === 0) return false;
    return undefined;
}

/**
 * Read the `shared_*` CMS fields of a section into {@link ISharedStyleProps}.
 *
 * Only valid values for the narrowed shared scales are accepted; anything
 * outside the domain (e.g. a stale `xl`) is ignored rather than clamped, so the
 * renderer falls through to its component default. Platform `web_*`/`mobile_*`
 * overrides are NOT read here — that precedence lives in the platform renderer.
 */
export function resolveSharedStyleProps(fields: Record<string, unknown>): ISharedStyleProps {
    const resolved: ISharedStyleProps = {};

    const size = readString(fields.size);
    if (size !== undefined && (SEMANTIC_SIZES as readonly string[]).includes(size)) {
        resolved.size = size as TSemanticSize;
    }

    const radius = readString(fields.radius);
    if (radius !== undefined && (SEMANTIC_RADII as readonly string[]).includes(radius)) {
        resolved.radius = radius as TSemanticRadius;
    }

    // `color` / `variant` are the REAL cross-platform appearance
    // fields (Mantine palette/variant values stored verbatim). Read them
    // open-domain — the palette is intentionally broad and platform mappers
    // collapse it; an unknown value simply falls through to a renderer default.
    const color = readString(fields.color);
    if (color !== undefined) {
        resolved.color = color;
    }

    const variant = readString(fields.variant);
    if (variant !== undefined) {
        resolved.variant = variant as TSemanticVariant;
    }

    const fullWidth = readBool(fields.full_width);
    if (fullWidth !== undefined) {
        resolved.fullWidth = fullWidth;
    }

    return resolved;
}

// ===== top-level resolvers =====

/** Resolve shared props into Mantine (web) props. */
export function toMantineSemanticProps(props: ISharedStyleProps): IMantineResolvedStyle {
    const spacing = props.spacing && props.spacing !== 'none' ? props.spacing : undefined;
    return {
        size: mapSizeToMantine(props.size),
        color: props.color,
        variant: props.variant,
        radius: mapRadiusToMantine(props.radius),
        spacing,
        disabled: hasState(props.states, 'disabled') || undefined,
        loading: hasState(props.states, 'loading') || undefined,
        error: hasState(props.states, 'invalid') || undefined,
        required: hasState(props.states, 'required') || undefined,
        fullWidth: props.fullWidth || undefined,
    };
}

/**
 * Resolve shared props into HeroUI Native (mobile) props.
 *
 * Appearance precedence (mirrors the web renderer, which reads the same CMS
 * fields straight into Mantine):
 *   1. `variant` (Mantine variant) mapped onto the HeroUI button vocab;
 *   2. else `color` (Mantine palette) mapped onto a button variant.
 * The semantic `color` is resolved from `color`.
 */
export function toHeroUiSemanticProps(props: ISharedStyleProps): IHeroUiResolvedStyle {
    const buttonVariant =
        mapMantineVariantToHeroUiButtonVariant(props.variant) ??
        mapMantineColorToHeroUiButtonVariant(props.color);
    const color = mapMantineColorToHeroUiColor(props.color);
    return {
        size: mapSizeToHeroUi(props.size),
        buttonVariant,
        color,
        radiusPx: mapRadiusToPx(props.radius),
        spacingPx: mapSpacingToPx(props.spacing),
        isDisabled: hasState(props.states, 'disabled') || undefined,
        isLoading: hasState(props.states, 'loading') || undefined,
        isInvalid: hasState(props.states, 'invalid') || undefined,
        isRequired: hasState(props.states, 'required') || undefined,
        fullWidth: props.fullWidth || undefined,
    };
}

/**
 * Resolve shared props into a plain React Native style object (for styles with
 * no HeroUI Native equivalent). `theme` may override the token px scales; when a
 * token is not overridden the shared default is used (no implicit web fallback).
 */
export function toReactNativeSemanticStyle(
    props: ISharedStyleProps,
    theme?: IReactNativeThemeScales,
): IReactNativeResolvedStyle {
    const style: IReactNativeResolvedStyle = {};

    if (props.radius !== undefined) {
        const borderRadius = resolveRadiusPx(props.radius, theme);
        if (borderRadius !== undefined) style.borderRadius = borderRadius;
    }

    if (props.spacing !== undefined) {
        const padding = resolveSpacingPx(props.spacing, theme);
        if (padding !== undefined) style.padding = padding;
    }

    if (props.fullWidth) {
        style.alignSelf = 'stretch';
        style.width = '100%';
    }

    return style;
}

function resolveRadiusPx(radius: TSemanticRadius, theme?: IReactNativeThemeScales): number | undefined {
    if (radius === 'none') return 0;
    if (radius === 'full') return FULL_RADIUS_PX;
    return theme?.radiusPx?.[radius] ?? mapRadiusToPx(radius);
}

function resolveSpacingPx(spacing: TSemanticSpacing, theme?: IReactNativeThemeScales): number | undefined {
    if (spacing === 'none') return 0;
    return theme?.spacingPx?.[spacing] ?? mapSpacingToPx(spacing);
}

/** Resolve shared props for both UI-library platforms at once. */
export function resolveSharedStyle(props: ISharedStyleProps): {
    web: IMantineResolvedStyle;
    mobile: IHeroUiResolvedStyle;
} {
    return {
        web: toMantineSemanticProps(props),
        mobile: toHeroUiSemanticProps(props),
    };
}

/** @deprecated Use {@link toMantineSemanticProps}. */
export const resolveSharedStyleForWeb = toMantineSemanticProps;
/** @deprecated Use {@link toHeroUiSemanticProps}. */
export const resolveSharedStyleForMobile = toHeroUiSemanticProps;
