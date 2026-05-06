import type { IBaseStyle, IContentField, IStyleWithSpacing } from './base';
import type {
    TMantineSize,
    TMantineSpacing,
    TMantineRadius,
    TMantineColor,
    TMantineOrientation,
    TMantineDirection,
    TMantineWrap,
    TMantineJustify,
    TMantineAlign,
    TMantineGridSpan,
} from '../mantine/common';

// Style-specific helper types only used in layout interfaces
export type TMantineBorder = '0' | '1';
export type TMantineWidth = string;
export type TMantineHeight = string;
export type TMantineDividerVariant = 'solid' | 'dashed' | 'dotted';
export type TMantinePaperShadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TMantineCardShadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TMantineGap = '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TMantineCols = string;
export type TMantineGridOffset = string;
export type TMantineGridOrder = string;
export type TMantineScrollAreaSize = string;
export type TMantineScrollAreaType = 'hover' | 'always' | 'never' | 'scroll';

export interface IContainerStyle extends IStyleWithSpacing {
    style_name: 'container';
    mantine_size?: IContentField<TMantineSize>;
    mantine_fluid?: IContentField<string>;
    mantine_px?: IContentField<TMantineSpacing>;
    mantine_py?: IContentField<TMantineSpacing>;
    use_mantine_style?: IContentField<string>;
}

export interface IBoxStyle extends IStyleWithSpacing {
    style_name: 'box';
    content?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}

export interface IFlexStyle extends IStyleWithSpacing {
    style_name: 'flex';
    mantine_gap?: IContentField<TMantineGap>;
    mantine_justify?: IContentField<TMantineJustify>;
    mantine_align?: IContentField<TMantineAlign>;
    mantine_direction?: IContentField<TMantineDirection>;
    mantine_wrap?: IContentField<TMantineWrap>;
    mantine_width?: IContentField<TMantineWidth>;
    mantine_height?: IContentField<TMantineHeight>;
}

export interface IGroupStyle extends IStyleWithSpacing {
    style_name: 'group';
    mantine_gap?: IContentField<TMantineGap>;
    mantine_justify?: IContentField<TMantineJustify>;
    mantine_align?: IContentField<TMantineAlign>;
    mantine_group_wrap?: IContentField<'0' | '1'>;
    mantine_group_grow?: IContentField<'0' | '1'>;
    mantine_width?: IContentField<TMantineWidth>;
    mantine_height?: IContentField<TMantineHeight>;
}

export interface IStackStyle extends IStyleWithSpacing {
    style_name: 'stack';
    mantine_gap?: IContentField<TMantineGap>;
    mantine_justify?: IContentField<TMantineJustify>;
    mantine_align?: IContentField<TMantineAlign>;
    mantine_width?: IContentField<TMantineWidth>;
    mantine_height?: IContentField<TMantineHeight>;
}

export interface ISimpleGridStyle extends IStyleWithSpacing {
    style_name: 'simple-grid';
    mantine_cols?: IContentField<TMantineCols>;
    mantine_spacing?: IContentField<TMantineSpacing>;
    mantine_breakpoints?: IContentField<string>;
    mantine_vertical_spacing?: IContentField<TMantineSpacing>;
    mantine_width?: IContentField<TMantineWidth>;
    mantine_height?: IContentField<TMantineHeight>;
}

export interface IGridStyle extends IStyleWithSpacing {
    style_name: 'grid';
    mantine_cols?: IContentField<TMantineCols>;
    mantine_gap?: IContentField<TMantineGap>;
    mantine_justify?: IContentField<TMantineJustify>;
    mantine_align?: IContentField<TMantineAlign>;
    mantine_grid_overflow?: IContentField<string>;
    mantine_width?: IContentField<TMantineWidth>;
    mantine_height?: IContentField<TMantineHeight>;
    use_mantine_style?: IContentField<string>;
}

export interface IGridColumnStyle extends IStyleWithSpacing {
    style_name: 'grid-column';
    mantine_grid_span?: IContentField<TMantineGridSpan>;
    mantine_grid_offset?: IContentField<TMantineGridOffset>;
    mantine_grid_order?: IContentField<TMantineGridOrder>;
    mantine_grid_grow?: IContentField<string>;
    mantine_width?: IContentField<TMantineWidth>;
    mantine_height?: IContentField<TMantineHeight>;
    use_mantine_style?: IContentField<string>;
}

export interface ISpaceStyle extends IStyleWithSpacing {
    style_name: 'space';
    mantine_size?: IContentField<TMantineSize>;
    mantine_space_direction?: IContentField<string>;
}

export interface IDividerStyle extends IBaseStyle {
    style_name: 'divider';
    mantine_divider_variant?: IContentField<TMantineDividerVariant>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_divider_label?: IContentField<string>;
    mantine_divider_label_position?: IContentField<string>;
    mantine_orientation?: IContentField<TMantineOrientation>;
    mantine_color?: IContentField<TMantineColor>;
    use_mantine_style?: IContentField<string>;
}

export interface IPaperStyle extends IStyleWithSpacing {
    style_name: 'paper';
    mantine_paper_shadow?: IContentField<TMantinePaperShadow>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_px?: IContentField<TMantineSpacing>;
    mantine_py?: IContentField<TMantineSpacing>;
    mantine_border?: IContentField<TMantineBorder>;
    use_mantine_style?: IContentField<string>;
}

export interface ICenterStyle extends IBaseStyle {
    style_name: 'center';
    mantine_center_inline?: IContentField<string>;
    mantine_width?: IContentField<TMantineWidth>;
    mantine_height?: IContentField<TMantineHeight>;
    mantine_miw?: IContentField<TMantineWidth>;
    mantine_mih?: IContentField<TMantineHeight>;
    mantine_maw?: IContentField<TMantineWidth>;
    mantine_mah?: IContentField<TMantineHeight>;
}

export interface IScrollAreaStyle extends IStyleWithSpacing {
    style_name: 'scroll-area';
    mantine_scroll_area_scrollbar_size?: IContentField<TMantineScrollAreaSize>;
    mantine_scroll_area_type?: IContentField<TMantineScrollAreaType>;
    mantine_scroll_area_offset_scrollbars?: IContentField<string>;
    mantine_scroll_area_scroll_hide_delay?: IContentField<string>;
    mantine_height?: IContentField<TMantineHeight>;
    mantine_width?: IContentField<TMantineWidth>;
}

export interface ICardStyle extends IStyleWithSpacing {
    style_name: 'card';
    mantine_card_shadow?: IContentField<TMantineCardShadow>;
    mantine_border?: IContentField<TMantineBorder>;
    mantine_radius?: IContentField<TMantineRadius>;
    use_mantine_style?: IContentField<string>;
}

export interface ICardSegmentStyle extends IStyleWithSpacing {
    style_name: 'card-segment';
    use_mantine_style?: IContentField<string>;
}

export interface IAspectRatioStyle extends IBaseStyle {
    style_name: 'aspect-ratio';
    mantine_aspect_ratio?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}

export interface IBackgroundImageStyle extends IStyleWithSpacing {
    style_name: 'background-image';
    img_src?: IContentField<string>;
    mantine_radius?: IContentField<TMantineRadius>;
    use_mantine_style?: IContentField<string>;
}
