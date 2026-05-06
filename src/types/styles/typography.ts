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
    mantine_title_order?: IContentField<TMantineTitleOrder>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_title_text_wrap?: IContentField<TMantineTitleTextWrap>;
    mantine_title_line_clamp?: IContentField<TMantineTitleLineClamp>;
    use_mantine_style?: IContentField<string>;
}

export interface ITextStyle extends IStyleWithSpacing {
    style_name: 'text';
    text?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_text_font_weight?: IContentField<TMantineTextFontWeight>;
    mantine_text_font_style?: IContentField<TMantineTextFontStyle>;
    mantine_text_text_decoration?: IContentField<TMantineTextDecoration>;
    mantine_text_text_transform?: IContentField<TMantineTextTransform>;
    mantine_text_align?: IContentField<TMantineTextAlign>;
    mantine_text_variant?: IContentField<TMantineTextVariant>;
    mantine_text_gradient?: IContentField<string>;
    mantine_text_truncate?: IContentField<TMantineTextTruncate>;
    mantine_text_line_clamp?: IContentField<TMantineLineClamp>;
    mantine_text_inherit?: IContentField<TMantineTextInherit>;
    mantine_text_span?: IContentField<TMantineTextSpan>;
    use_mantine_style?: IContentField<string>;
}

export interface ICodeStyle extends IStyleWithSpacing {
    style_name: 'code';
    mantine_code_block?: IContentField<string>;
    mantine_color?: IContentField<TMantineColor>;
    use_mantine_style?: IContentField<string>;
    content?: IContentField<string>;
}

export interface IHighlightStyle extends IStyleWithSpacing {
    style_name: 'highlight';
    text?: IContentField<string>;
    mantine_highlight_highlight?: IContentField<string>;
    mantine_color?: IContentField<TMantineColor>;
    use_mantine_style?: IContentField<string>;
}

export interface IBlockquoteStyle extends IStyleWithSpacing {
    style_name: 'blockquote';
    content?: IContentField<string>;
    cite?: IContentField<string>;
    mantine_left_icon?: IContentField<string>;
    mantine_icon_size?: IContentField<TMantineIconSize>;
    mantine_color?: IContentField<TMantineColor>;
    use_mantine_style?: IContentField<string>;
}

export interface IHtmlTagStyle extends IBaseStyle {
    style_name: 'html-tag';
    html_tag?: IContentField<string>;
    html_tag_content?: IContentField<string>;
}

export interface IKbdStyle extends IStyleWithSpacing {
    style_name: 'kbd';
    label?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    use_mantine_style?: IContentField<string>;
}

export interface ITypographyStyle extends IStyleWithSpacing {
    style_name: 'typography';
    use_mantine_style?: IContentField<string>;
}

export interface IFieldsetStyle extends IStyleWithSpacing {
    style_name: 'fieldset';
    label?: IContentField<string>;
    legend?: IContentField<string>;
    mantine_fieldset_variant?: IContentField<TMantineFieldsetVariant>;
    mantine_radius?: IContentField<TMantineRadius>;
    use_mantine_style?: IContentField<string>;
    disabled?: IContentField<string>;
}

export interface ISpoilerStyle extends IStyleWithSpacing {
    style_name: 'spoiler';
    mantine_height?: IContentField<TMantineSpoilerMaxHeight>;
    mantine_spoiler_show_label?: IContentField<string>;
    mantine_spoiler_hide_label?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}
