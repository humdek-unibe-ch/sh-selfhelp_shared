/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseStyle, IContentField, IStyleWithSpacing } from './base';
import type {
    TMantineSpacing,
    TMantineColor,
    TMantineOrientation,
    TMantineDirection,
    TMantineWrap,
    TMantineJustify,
    TMantineAlign,
    TMantineGridSpan,
    TSharedSize,
    TSharedRadius,
} from '../mantine/common';

// Style-specific helper types only used in layout interfaces
export type TMantineBorder = '0' | '1';
// Cross-platform border toggle (card family): Mantine `withBorder` on web,
// a themed border/divider on mobile.
export type TSharedBorder = '0' | '1';
export type TMantineWidth = string;
export type TMantineHeight = string;
export type TMantineDividerVariant = 'solid' | 'dashed' | 'dotted';
export type TMantinePaperShadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TMantineCardShadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TMantineCardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TMantineGap = '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TMantineCols = string;
export type TMantineGridOffset = string;
export type TMantineGridOrder = string;
export type TMantineScrollAreaSize = string;
export type TMantineScrollAreaType = 'hover' | 'always' | 'never' | 'scroll';

export interface IContainerStyle extends IStyleWithSpacing {
    style_name: 'container';
    shared_size?: IContentField<TSharedSize>;
    web_fluid?: IContentField<string>;
    web_px?: IContentField<TMantineSpacing>;
    web_py?: IContentField<TMantineSpacing>;}

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
    web_width?: IContentField<TMantineWidth>;
    web_height?: IContentField<TMantineHeight>;
}

export interface IGroupStyle extends IStyleWithSpacing {
    style_name: 'group';
    shared_gap?: IContentField<TMantineGap>;
    shared_justify?: IContentField<TMantineJustify>;
    shared_align?: IContentField<TMantineAlign>;
    web_group_wrap?: IContentField<'0' | '1'>;
    web_group_grow?: IContentField<'0' | '1'>;
    web_width?: IContentField<TMantineWidth>;
    web_height?: IContentField<TMantineHeight>;
}

export interface IStackStyle extends IStyleWithSpacing {
    style_name: 'stack';
    shared_gap?: IContentField<TMantineGap>;
    shared_justify?: IContentField<TMantineJustify>;
    shared_align?: IContentField<TMantineAlign>;
    web_width?: IContentField<TMantineWidth>;
    web_height?: IContentField<TMantineHeight>;
}

export interface ISimpleGridStyle extends IStyleWithSpacing {
    style_name: 'simple-grid';
    web_cols?: IContentField<TMantineCols>;
    web_spacing?: IContentField<TMantineSpacing>;
    web_breakpoints?: IContentField<string>;
    web_vertical_spacing?: IContentField<TMantineSpacing>;
    web_width?: IContentField<TMantineWidth>;
    web_height?: IContentField<TMantineHeight>;
}

export interface IGridStyle extends IStyleWithSpacing {
    style_name: 'grid';
    web_cols?: IContentField<TMantineCols>;
    shared_gap?: IContentField<TMantineGap>;
    shared_justify?: IContentField<TMantineJustify>;
    shared_align?: IContentField<TMantineAlign>;
    web_grid_overflow?: IContentField<string>;
    web_width?: IContentField<TMantineWidth>;
    web_height?: IContentField<TMantineHeight>;}

export interface IGridColumnStyle extends IStyleWithSpacing {
    style_name: 'grid-column';
    web_grid_span?: IContentField<TMantineGridSpan>;
    web_grid_offset?: IContentField<TMantineGridOffset>;
    web_grid_order?: IContentField<TMantineGridOrder>;
    web_grid_grow?: IContentField<string>;
    web_width?: IContentField<TMantineWidth>;
    web_height?: IContentField<TMantineHeight>;}

export interface ISpaceStyle extends IStyleWithSpacing {
    style_name: 'space';
    shared_size?: IContentField<TSharedSize>;
    web_space_direction?: IContentField<string>;
}

export interface IDividerStyle extends IBaseStyle {
    style_name: 'divider';
    web_divider_variant?: IContentField<TMantineDividerVariant>;
    shared_size?: IContentField<TSharedSize>;
    divider_label?: IContentField<string>;
    web_divider_label_position?: IContentField<string>;
    shared_orientation?: IContentField<TMantineOrientation>;
    shared_color?: IContentField<TMantineColor>;}

export interface IPaperStyle extends IStyleWithSpacing {
    style_name: 'paper';
    web_paper_shadow?: IContentField<TMantinePaperShadow>;
    shared_radius?: IContentField<TSharedRadius>;
    web_px?: IContentField<TMantineSpacing>;
    web_py?: IContentField<TMantineSpacing>;
    web_border?: IContentField<TMantineBorder>;}

export interface ICenterStyle extends IBaseStyle {
    style_name: 'center';
    web_center_inline?: IContentField<string>;
    web_width?: IContentField<TMantineWidth>;
    web_height?: IContentField<TMantineHeight>;
    web_miw?: IContentField<TMantineWidth>;
    web_mih?: IContentField<TMantineHeight>;
    web_maw?: IContentField<TMantineWidth>;
    web_mah?: IContentField<TMantineHeight>;
}

export interface IScrollAreaStyle extends IStyleWithSpacing {
    style_name: 'scroll-area';
    web_scroll_area_scrollbar_size?: IContentField<TMantineScrollAreaSize>;
    web_scroll_area_type?: IContentField<TMantineScrollAreaType>;
    web_scroll_area_offset_scrollbars?: IContentField<string>;
    web_scroll_area_scroll_hide_delay?: IContentField<string>;
    web_height?: IContentField<TMantineHeight>;
    web_width?: IContentField<TMantineWidth>;
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
