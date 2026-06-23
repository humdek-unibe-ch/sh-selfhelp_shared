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
    web_image_fit?: IContentField<TMantineImageFit>;
    web_width?: IContentField<TMantineWidth>;
    web_height?: IContentField<TMantineHeight>;
    radius?: IContentField<TMantineRadius>;
    /** Image shown when the main source fails to load (Mantine Image fallbackSrc). */
    fallback_src?: IContentField<string>;
}

export interface IVideoStyle extends IStyleWithSpacing {
    style_name: 'video';
    is_fluid?: IContentField<string>;
    alt?: IContentField<string>;
    video_src?: IContentField<string>;
    /** Poster image shown before playback. */
    poster_src?: IContentField<string>;
    /** Cross-platform playback toggles ('0' | '1'). */
    has_controls?: IContentField<string>;
    media_loop?: IContentField<string>;
    media_autoplay?: IContentField<string>;
    media_muted?: IContentField<string>;
}

export interface IAudioStyle extends IStyleWithSpacing {
    style_name: 'audio';
    alt?: IContentField<string>;
    sources?: IContentField<unknown[]>;
    /** Cross-platform playback toggles ('0' | '1'). */
    has_controls?: IContentField<string>;
    media_loop?: IContentField<string>;
    media_autoplay?: IContentField<string>;
}

export interface IFigureStyle extends IBaseStyle {
    style_name: 'figure';
    caption_title?: IContentField<string>;
    caption?: IContentField<string>;
    /** Optional built-in image so a figure needs no child image section. */
    img_src?: IContentField<string>;
    alt?: IContentField<string>;
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
    orientation?: IContentField<string>;
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
}
