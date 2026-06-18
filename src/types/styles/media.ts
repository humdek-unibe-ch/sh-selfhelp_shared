/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseStyle, IContentField, IStyleWithSpacing } from './base';
import type { TMantineRadius } from '../mantine/common';
import type { TMantineWidth, TMantineHeight } from './layout';

export type TMantineImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

export interface IImageStyle extends IStyleWithSpacing {
    style_name: 'image';
    title?: IContentField<string>;
    is_fluid?: IContentField<string>;
    alt?: IContentField<string>;
    img_src?: IContentField<string>;
    height?: IContentField<string>;
    width?: IContentField<string>;
    web_image_fit?: IContentField<TMantineImageFit>;
    web_width?: IContentField<TMantineWidth>;
    web_height?: IContentField<TMantineHeight>;
    shared_radius?: IContentField<TMantineRadius>;
    use_web_style?: IContentField<string>;
}

export interface IVideoStyle extends IBaseStyle {
    style_name: 'video';
    is_fluid?: IContentField<string>;
    alt?: IContentField<string>;
    sources?: IContentField<unknown[]>;
}

export interface IAudioStyle extends IBaseStyle {
    style_name: 'audio';
    sources?: IContentField<unknown[]>;
}

export interface IFigureStyle extends IBaseStyle {
    style_name: 'figure';
    caption_title?: IContentField<string>;
    caption?: IContentField<string>;
}

export interface ICarouselStyle extends IStyleWithSpacing {
    style_name: 'carousel';
    id_prefix?: IContentField<string>;
    has_controls?: IContentField<string>;
    has_indicators?: IContentField<string>;
    has_crossfade?: IContentField<string>;
    sources?: IContentField<unknown[]>;
    web_height?: IContentField<string>;
    web_carousel_slide_size?: IContentField<string>;
    web_carousel_slide_gap?: IContentField<string>;
    shared_orientation?: IContentField<string>;
    web_control_size?: IContentField<string>;
    web_carousel_controls_offset?: IContentField<string>;
    web_carousel_next_control_icon?: IContentField<string>;
    web_carousel_previous_control_icon?: IContentField<string>;
    web_loop?: IContentField<string>;
    drag_free?: IContentField<string>;
    web_carousel_align?: IContentField<string>;
    web_carousel_contain_scroll?: IContentField<string>;
    skip_snaps?: IContentField<string>;
    web_carousel_in_view_threshold?: IContentField<string>;
    web_carousel_duration?: IContentField<string>;
    web_carousel_embla_options?: IContentField<string>;
    use_web_style?: IContentField<string>;
}
