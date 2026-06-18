/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseStyle, IContentField, IStyleWithSpacing } from './base';
import type {
    TMantineSize,
    TMantineColor,
    TMantineRadius,
    TMantineTitleOrder,
    TMantineFieldsetVariant,
    TMantineSpoilerMaxHeight,
} from '../mantine/common';

export type TMantineTitleTextWrap = 'wrap' | 'balance' | 'nowrap';
export type TMantineTitleLineClamp = '1' | '2' | '3' | '4' | '5' | string;
export type TMantineTextFontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type TMantineTextFontStyle = 'normal' | 'italic';
export type TMantineTextDecoration = 'none' | 'underline' | 'line-through';
export type TMantineTextTransform = 'none' | 'uppercase' | 'capitalize' | 'lowercase';
export type TMantineTextAlign = 'left' | 'center' | 'right' | 'justify';
export type TMantineTextVariant = 'default' | 'gradient';
export type TMantineTextTruncate = 'none' | 'end' | 'start';
export type TMantineLineClamp = '2' | '3' | '4' | '5' | string;
export type TMantineTextInherit = '0' | '1';
export type TMantineTextSpan = '0' | '1';
export type TMantineIconSize = string;

export interface ITitleStyle extends IStyleWithSpacing {
    style_name: 'title';
    content?: IContentField<string>;
    web_title_order?: IContentField<TMantineTitleOrder>;
    shared_size?: IContentField<TMantineSize>;
    web_title_text_wrap?: IContentField<TMantineTitleTextWrap>;
    web_title_line_clamp?: IContentField<TMantineTitleLineClamp>;
    use_web_style?: IContentField<string>;
}

export interface ITextStyle extends IStyleWithSpacing {
    style_name: 'text';
    text?: IContentField<string>;
    shared_size?: IContentField<TMantineSize>;
    web_color?: IContentField<TMantineColor>;
    web_text_font_weight?: IContentField<TMantineTextFontWeight>;
    web_text_font_style?: IContentField<TMantineTextFontStyle>;
    web_text_text_decoration?: IContentField<TMantineTextDecoration>;
    web_text_text_transform?: IContentField<TMantineTextTransform>;
    shared_text_align?: IContentField<TMantineTextAlign>;
    web_text_variant?: IContentField<TMantineTextVariant>;
    web_text_gradient?: IContentField<string>;
    web_text_truncate?: IContentField<TMantineTextTruncate>;
    web_text_line_clamp?: IContentField<TMantineLineClamp>;
    web_text_inherit?: IContentField<TMantineTextInherit>;
    web_text_span?: IContentField<TMantineTextSpan>;
    use_web_style?: IContentField<string>;
}

export interface ICodeStyle extends IStyleWithSpacing {
    style_name: 'code';
    web_code_block?: IContentField<string>;
    web_color?: IContentField<TMantineColor>;
    use_web_style?: IContentField<string>;
    content?: IContentField<string>;
}

export interface IHighlightStyle extends IStyleWithSpacing {
    style_name: 'highlight';
    text?: IContentField<string>;
    web_highlight_highlight?: IContentField<string>;
    web_color?: IContentField<TMantineColor>;
    use_web_style?: IContentField<string>;
}

export interface IBlockquoteStyle extends IStyleWithSpacing {
    style_name: 'blockquote';
    content?: IContentField<string>;
    cite?: IContentField<string>;
    web_left_icon?: IContentField<string>;
    web_icon_size?: IContentField<TMantineIconSize>;
    web_color?: IContentField<TMantineColor>;
    use_web_style?: IContentField<string>;
}

export interface IHtmlTagStyle extends IBaseStyle {
    style_name: 'html-tag';
    html_tag?: IContentField<string>;
    html_tag_content?: IContentField<string>;
}

export interface IKbdStyle extends IStyleWithSpacing {
    style_name: 'kbd';
    label?: IContentField<string>;
    shared_size?: IContentField<TMantineSize>;
    use_web_style?: IContentField<string>;
}

export interface ITypographyStyle extends IStyleWithSpacing {
    style_name: 'typography';
    use_web_style?: IContentField<string>;
}

export interface IFieldsetStyle extends IStyleWithSpacing {
    style_name: 'fieldset';
    label?: IContentField<string>;
    legend?: IContentField<string>;
    web_fieldset_variant?: IContentField<TMantineFieldsetVariant>;
    shared_radius?: IContentField<TMantineRadius>;
    use_web_style?: IContentField<string>;
    disabled?: IContentField<string>;
}

export interface ISpoilerStyle extends IStyleWithSpacing {
    style_name: 'spoiler';
    web_height?: IContentField<TMantineSpoilerMaxHeight>;
    web_spoiler_show_label?: IContentField<string>;
    web_spoiler_hide_label?: IContentField<string>;
    use_web_style?: IContentField<string>;
}
