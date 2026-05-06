import type { IBaseStyle, IContentField, IStyleWithSpacing } from './base';
import type {
    TMantineSize,
    TMantineColor,
    TMantineRadius,
    TMantineSpacing,
    TMantineOrientation,
    TMantineAccordionVariant,
    TMantineTabsVariant,
    TMantineTimelineLineVariant,
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
    mantine_accordion_variant?: IContentField<TMantineAccordionVariant>;
    mantine_accordion_multiple?: IContentField<TMantineAccordionMultiple>;
    mantine_accordion_chevron_position?: IContentField<TMantineAccordionChevronPosition>;
    mantine_accordion_chevron_size?: IContentField<string>;
    mantine_accordion_disable_chevron_rotation?: IContentField<TMantineAccordionDisableChevronRotation>;
    mantine_accordion_loop?: IContentField<TMantineAccordionLoop>;
    mantine_accordion_transition_duration?: IContentField<string>;
    mantine_accordion_default_value?: IContentField<string>;
    mantine_radius?: IContentField<TMantineRadius>;
    use_mantine_style?: IContentField<string>;
}

export interface IAccordionItemStyle extends IStyleWithSpacing {
    style_name: 'accordion-item';
    mantine_accordion_item_value?: IContentField<string>;
    label?: IContentField<string>;
    mantine_accordion_item_icon?: IContentField<string>;
    disabled?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}

export interface ITabsStyle extends IStyleWithSpacing {
    style_name: 'tabs';
    mantine_tabs_variant?: IContentField<TMantineTabsVariant>;
    mantine_tabs_orientation?: IContentField<TMantineOrientation>;
    mantine_tabs_radius?: IContentField<TMantineRadius>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_width?: IContentField<TMantineWidth>;
    mantine_height?: IContentField<TMantineHeight>;
    use_mantine_style?: IContentField<string>;
}

export interface ITabStyle extends IBaseStyle {
    style_name: 'tab';
    label?: IContentField<string>;
    mantine_left_icon?: IContentField<string>;
    mantine_right_icon?: IContentField<string>;
    mantine_tab_disabled?: IContentField<string>;
    mantine_width?: IContentField<TMantineWidth>;
    mantine_height?: IContentField<TMantineHeight>;
    use_mantine_style?: IContentField<string>;
}

export interface ITimelineStyle extends IStyleWithSpacing {
    style_name: 'timeline';
    mantine_timeline_bullet_size?: IContentField<string>;
    mantine_timeline_line_width?: IContentField<string>;
    mantine_timeline_active?: IContentField<string>;
    mantine_timeline_align?: IContentField<TMantineTimelineAlign>;
    mantine_timeline_line_variant?: IContentField<TMantineTimelineLineVariant>;
    mantine_color?: IContentField<TMantineColor>;
    use_mantine_style?: IContentField<string>;
}

export interface IListStyle extends IStyleWithSpacing {
    style_name: 'list';
    mantine_list_type?: IContentField<TMantineListType>;
    mantine_spacing?: IContentField<TMantineSpacing>;
    mantine_size?: IContentField<TMantineSize>;
    use_mantine_style?: IContentField<string>;
    mantine_list_list_style_type?: IContentField<TMantineListStyleType>;
    mantine_list_with_padding?: IContentField<TMantineListWithPadding>;
    mantine_list_center?: IContentField<TMantineListCenter>;
    mantine_list_icon?: IContentField<string>;
}

export interface IListItemStyle extends IStyleWithSpacing {
    style_name: 'list-item';
    mantine_list_item_content?: IContentField<string>;
    mantine_list_item_icon?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}

export interface IEntryListStyle extends IBaseStyle {
    style_name: 'entryList';
    line_clamp?: IContentField<TMantineLineClamp>;
}

export interface IEntryRecordStyle extends IBaseStyle {
    style_name: 'entryRecord';
}

export interface IEntryRecordDeleteStyle extends IBaseStyle {
    style_name: 'entryRecordDelete';
}

export interface ILoopStyle extends IBaseStyle {
    style_name: 'loop';
    loop?: IContentField<unknown[]>;
}
