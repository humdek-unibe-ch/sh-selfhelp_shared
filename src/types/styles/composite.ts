/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseStyle, IContentField, IStyleWithSpacing } from './base';
import type {
    TMantineColor,
    TMantineRadius,
    TMantineSpacing,
    TMantineOrientation,
    TMantineAccordionVariant,
    TMantineTabsVariant,
    TMantineTimelineLineVariant,
    TSharedSize,
    TSharedRadius,
} from '../mantine/common';
import type { TMantineWidth, TMantineHeight } from './layout';
import type { TMantineLineClamp } from './typography';

export type TMantineAccordionMultiple = '0' | '1';
export type TMantineAccordionChevronPosition = 'left' | 'right';
export type TMantineAccordionDisableChevronRotation = '0' | '1';
export type TMantineAccordionLoop = '0' | '1';
export type TMantineTimelineAlign = 'left' | 'right';
export type TMantineListType = 'ordered' | 'unordered';
export type TMantineListStyleType =
    | 'none'
    | 'disc'
    | 'circle'
    | 'square'
    | 'decimal'
    | 'decimal-leading-zero'
    | 'lower-roman'
    | 'upper-roman'
    | 'lower-alpha'
    | 'upper-alpha'
    | string;
export type TMantineListWithPadding = '0' | '1';
export type TMantineListCenter = '0' | '1';

export interface IAccordionStyle extends IStyleWithSpacing {
    style_name: 'accordion';
    // Cross-platform variant token: web -> Mantine variant
    // (default/contained/filled/separated), mobile -> HeroUI Native
    // default ('default') / surface (contained/filled/separated).
    shared_accordion_variant?: IContentField<TMantineAccordionVariant>;
    // RF-19: selection mode (single vs multiple open) is portable; mobile reads it.
    shared_multiple?: IContentField<TMantineAccordionMultiple>;
    web_accordion_chevron_position?: IContentField<TMantineAccordionChevronPosition>;
    web_accordion_chevron_size?: IContentField<string>;
    web_accordion_disable_chevron_rotation?: IContentField<TMantineAccordionDisableChevronRotation>;
    web_accordion_loop?: IContentField<TMantineAccordionLoop>;
    web_accordion_transition_duration?: IContentField<string>;
    web_accordion_default_value?: IContentField<string>;
    shared_radius?: IContentField<TSharedRadius>;}

export interface IAccordionItemStyle extends IStyleWithSpacing {
    style_name: 'accordion-item';
    web_accordion_item_value?: IContentField<string>;
    label?: IContentField<string>;
    // Optional subtitle rendered under the item label (both platforms).
    description?: IContentField<string>;
    web_accordion_item_icon?: IContentField<string>;
    disabled?: IContentField<string>;}

export interface ITabsStyle extends IStyleWithSpacing {
    style_name: 'tabs';
    web_tabs_variant?: IContentField<TMantineTabsVariant>;
    web_tabs_orientation?: IContentField<TMantineOrientation>;
    web_tabs_radius?: IContentField<TMantineRadius>;
    shared_color?: IContentField<TMantineColor>;
    // Capability pass (2026-06-22): list layout + panel mount behaviour.
    web_tabs_grow?: IContentField<string>;
    web_tabs_justify?: IContentField<string>;
    web_tabs_keep_mounted?: IContentField<string>;
    web_tabs_placement?: IContentField<string>;
    web_width?: IContentField<TMantineWidth>;
    web_height?: IContentField<TMantineHeight>;}

export interface ITabStyle extends IBaseStyle {
    style_name: 'tab';
    label?: IContentField<string>;
    web_left_icon?: IContentField<string>;
    web_right_icon?: IContentField<string>;
    web_tab_disabled?: IContentField<string>;
    web_width?: IContentField<TMantineWidth>;
    web_height?: IContentField<TMantineHeight>;}

export interface ITimelineStyle extends IStyleWithSpacing {
    style_name: 'timeline';
    web_timeline_bullet_size?: IContentField<string>;
    web_timeline_line_width?: IContentField<string>;
    web_timeline_active?: IContentField<string>;
    web_timeline_align?: IContentField<TMantineTimelineAlign>;
    web_timeline_line_variant?: IContentField<TMantineTimelineLineVariant>;
    shared_color?: IContentField<TMantineColor>;}

/**
 * A single entry inside a `timeline`. Child-only style; placement is enforced
 * by the backend parent/child relationship rules.
 */
export interface ITimelineItemStyle extends IBaseStyle {
    style_name: 'timeline-item';
    title?: IContentField<string>;
    web_timeline_item_bullet?: IContentField<string>;
    web_timeline_item_line_variant?: IContentField<TMantineTimelineLineVariant>;
    shared_color?: IContentField<TMantineColor>;}

export interface IListStyle extends IStyleWithSpacing {
    style_name: 'list';
    web_list_type?: IContentField<TMantineListType>;
    web_spacing?: IContentField<TMantineSpacing>;
    shared_size?: IContentField<TSharedSize>;    web_list_list_style_type?: IContentField<TMantineListStyleType>;
    web_list_with_padding?: IContentField<TMantineListWithPadding>;
    web_list_center?: IContentField<TMantineListCenter>;
    web_list_icon?: IContentField<string>;
}

export interface IListItemStyle extends IStyleWithSpacing {
    style_name: 'list-item';
    list_item_content?: IContentField<string>;
    web_list_item_icon?: IContentField<string>;}

export interface IEntryListStyle extends IBaseStyle {
    style_name: 'entry-list';
    line_clamp?: IContentField<TMantineLineClamp>;
}

export interface IEntryRecordStyle extends IBaseStyle {
    style_name: 'entry-record';
}

export interface IEntryRecordDeleteStyle extends IBaseStyle {
    style_name: 'entry-record-delete';
}

export interface ILoopStyle extends IBaseStyle {
    style_name: 'loop';
    loop?: IContentField<unknown[]>;
}
