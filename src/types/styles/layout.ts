/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseStyle, IContentField, IStyleWithSpacing } from './base';
import type {
    TMantineColor,
    TMantineOrientation,
    TMantineDirection,
    TMantineWrap,
    TMantineJustify,
    TMantineAlign,
    TMantineGridSpan,
    TMantineGridGrow,
    TMantineGridOverflow,
    TSharedSize,
    TSharedRadius,
} from '../mantine/common';

// Style-specific helper types only used in layout interfaces
export type TMantineBorder = '0' | '1';
// Cross-platform border toggle (card family + paper): Mantine `withBorder` on
// web, a themed border on mobile.
export type TSharedBorder = '0' | '1';
// Cross-platform width/height/min/max dimension (e.g. "100%", "320px", "auto").
// Drives the web (Mantine) and the mobile (RN flexbox) renderer via the mapper.
export type TSharedDimension = string;
export type TMantineWidth = string;
export type TMantineHeight = string;
// Cross-platform divider line style (Mantine `variant` / RN `borderStyle`).
export type TSharedDividerVariant = 'solid' | 'dashed' | 'dotted';
export type TSharedDividerLabelPosition = 'left' | 'center' | 'right';
export type TMantineDividerVariant = 'solid' | 'dashed' | 'dotted';
export type TMantinePaperShadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TMantineCardShadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TMantineCardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TMantineGap = '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
// Cross-platform grid column count (string-encoded integer).
export type TSharedCols = string;
export type TMantineCols = string;
export type TMantineGridOffset = string;
export type TMantineGridOrder = string;
export type TMantineScrollAreaSize = string;
export type TMantineScrollAreaType = 'hover' | 'always' | 'auto' | 'never' | 'scroll';

export interface IContainerStyle extends IStyleWithSpacing {
    style_name: 'container';
    shared_size?: IContentField<TSharedSize>;
    web_fluid?: IContentField<string>;
}

export interface IBoxStyle extends IStyleWithSpacing {
    style_name: 'box';
    content?: IContentField<string>;}

export interface IFlexStyle extends IStyleWithSpacing {
    style_name: 'flex';
    shared_gap?: IContentField<TMantineGap>;
    shared_justify?: IContentField<TMantineJustify>;
    shared_align?: IContentField<TMantineAlign>;
    shared_direction?: IContentField<TMantineDirection>;
    shared_wrap?: IContentField<TMantineWrap>;
    shared_width?: IContentField<TSharedDimension>;
    shared_height?: IContentField<TSharedDimension>;
}

export interface IGroupStyle extends IStyleWithSpacing {
    style_name: 'group';
    shared_gap?: IContentField<TMantineGap>;
    shared_justify?: IContentField<TMantineJustify>;
    shared_align?: IContentField<TMantineAlign>;
    shared_width?: IContentField<TSharedDimension>;
    shared_height?: IContentField<TSharedDimension>;
    web_group_wrap?: IContentField<'0' | '1'>;
    web_group_grow?: IContentField<'0' | '1'>;
}

export interface IStackStyle extends IStyleWithSpacing {
    style_name: 'stack';
    shared_gap?: IContentField<TMantineGap>;
    shared_justify?: IContentField<TMantineJustify>;
    shared_align?: IContentField<TMantineAlign>;
    shared_width?: IContentField<TSharedDimension>;
    shared_height?: IContentField<TSharedDimension>;
}

export interface ISimpleGridStyle extends IStyleWithSpacing {
    style_name: 'simple-grid';
    shared_cols?: IContentField<TSharedCols>;
    shared_gap?: IContentField<TMantineGap>;
    shared_vertical_spacing?: IContentField<TMantineGap>;
    shared_width?: IContentField<TSharedDimension>;
    shared_height?: IContentField<TSharedDimension>;
    // Web-only responsive column overrides; clear to inherit shared_cols.
    web_cols_sm?: IContentField<TSharedCols>;
    web_cols_md?: IContentField<TSharedCols>;
    web_cols_lg?: IContentField<TSharedCols>;
}

export interface IGridStyle extends IStyleWithSpacing {
    style_name: 'grid';
    shared_cols?: IContentField<TSharedCols>;
    shared_gap?: IContentField<TMantineGap>;
    shared_justify?: IContentField<TMantineJustify>;
    shared_align?: IContentField<TMantineAlign>;
    shared_width?: IContentField<TSharedDimension>;
    shared_height?: IContentField<TSharedDimension>;
    web_grid_overflow?: IContentField<TMantineGridOverflow>;
}

export interface IGridColumnStyle extends IStyleWithSpacing {
    style_name: 'grid-column';
    shared_grid_span?: IContentField<TMantineGridSpan>;
    shared_grid_offset?: IContentField<TMantineGridOffset>;
    shared_grid_order?: IContentField<TMantineGridOrder>;
    shared_grid_grow?: IContentField<TMantineGridGrow>;
    shared_width?: IContentField<TSharedDimension>;
    shared_height?: IContentField<TSharedDimension>;
}

export interface ISpaceStyle extends IStyleWithSpacing {
    style_name: 'space';
    shared_size?: IContentField<TSharedSize>;
    shared_orientation?: IContentField<TMantineOrientation>;
}

export interface IDividerStyle extends IStyleWithSpacing {
    style_name: 'divider';
    shared_divider_variant?: IContentField<TSharedDividerVariant>;
    shared_size?: IContentField<TSharedSize>;
    divider_label?: IContentField<string>;
    shared_divider_label_position?: IContentField<TSharedDividerLabelPosition>;
    shared_orientation?: IContentField<TMantineOrientation>;
    shared_color?: IContentField<TMantineColor>;}

export interface IPaperStyle extends IStyleWithSpacing {
    style_name: 'paper';
    // Optional auto-styled heading rendered above the content when non-empty;
    // never auto-creates a child section.
    title?: IContentField<string>;
    web_paper_shadow?: IContentField<TMantinePaperShadow>;
    shared_radius?: IContentField<TSharedRadius>;
    shared_border?: IContentField<TSharedBorder>;}

export interface ICenterStyle extends IStyleWithSpacing {
    style_name: 'center';
    web_center_inline?: IContentField<string>;
    shared_width?: IContentField<TSharedDimension>;
    shared_height?: IContentField<TSharedDimension>;
    shared_miw?: IContentField<TSharedDimension>;
    shared_mih?: IContentField<TSharedDimension>;
    shared_maw?: IContentField<TSharedDimension>;
    shared_mah?: IContentField<TSharedDimension>;
}

export interface IScrollAreaStyle extends IStyleWithSpacing {
    style_name: 'scroll-area';
    web_scroll_area_scrollbar_size?: IContentField<TMantineScrollAreaSize>;
    web_scroll_area_type?: IContentField<TMantineScrollAreaType>;
    web_scroll_area_offset_scrollbars?: IContentField<string>;
    web_scroll_area_scroll_hide_delay?: IContentField<string>;
    shared_height?: IContentField<TSharedDimension>;
}

export interface ICardStyle extends IStyleWithSpacing {
    style_name: 'card';
    // Optional auto-styled convenience content: rendered only when non-empty,
    // never auto-creating a child section.
    title?: IContentField<string>;
    img_src?: IContentField<string>;
    // Cross-platform border (Mantine withBorder / themed border on mobile).
    shared_border?: IContentField<TSharedBorder>;
    // NOTE: no web-only card padding — padding is the portable `shared_spacing`
    // (pt/pb/ps/pe), which renders on web AND mobile. The renderer keeps a fixed
    // Mantine inner padding ("md") as the default + Card.Section bleed reference.
    web_card_shadow?: IContentField<TMantineCardShadow>;
    shared_radius?: IContentField<TSharedRadius>;}

export interface ICardSegmentStyle extends IStyleWithSpacing {
    style_name: 'card-segment';
    // Mantine Card.Section withBorder (themed divider on mobile).
    shared_border?: IContentField<TSharedBorder>;
    // Mantine Card.Section inheritPadding (web only).
    web_segment_inherit_padding?: IContentField<'0' | '1'>;}

export interface IAspectRatioStyle extends IBaseStyle {
    style_name: 'aspect-ratio';
    web_aspect_ratio?: IContentField<string>;}

export interface IBackgroundImageStyle extends IStyleWithSpacing {
    style_name: 'background-image';
    img_src?: IContentField<string>;
    shared_radius?: IContentField<TSharedRadius>;}

/**
 * Renders content referenced from another section. Has no own fields; the
 * referenced subtree arrives as `children`. Renderers must reuse the normal
 * recursive section renderer (no second renderer).
 */
export interface IRefContainerStyle extends IBaseStyle {
    style_name: 'ref-container';
}

/**
 * A data-scoped container. `scope` selects the backend data context that the
 * subtree is rendered against (mirrors backend `data-container`).
 */
export interface IDataContainerStyle extends IBaseStyle {
    style_name: 'data-container';
    scope?: IContentField<string>;
}
