/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseStyle, IContentField, IStyleWithSpacing } from './base';
import type {
    TMantineSize,
    TMantineColor,
    TMantineRadius,
    TMantineVariant,
    TMantineBadgeVariant,
    TMantineAvatarVariant,
    TMantineChipVariant,
    TMantineIndicatorPosition,
    TMantineThemeIconVariant,
} from '../mantine/common';
import type { TMantineIconSize } from './typography';

export interface IButtonStyle extends IStyleWithSpacing {
    style_name: 'button';
    mantine_variant?: IContentField<TMantineVariant>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_left_icon?: IContentField<string>;
    mantine_right_icon?: IContentField<string>;
    mantine_fullwidth?: IContentField<string>;
    mantine_compact?: IContentField<string>;
    mantine_auto_contrast?: IContentField<string>;
    is_link?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
    disabled?: IContentField<string>;
    open_in_new_tab?: IContentField<string>;
    page_keyword?: IContentField<string>;
    url?: IContentField<string>;
    label?: IContentField<string>;
    label_cancel?: IContentField<string>;
    confirmation_title?: IContentField<string>;
    confirmation_continue?: IContentField<string>;
    confirmation_message?: IContentField<string>;
}

export interface ILinkStyle extends IStyleWithSpacing {
    style_name: 'link';
    label?: IContentField<string>;
    url?: IContentField<string>;
    open_in_new_tab?: IContentField<string>;
}

export interface IActionIconStyle extends IStyleWithSpacing {
    style_name: 'action-icon';
    mantine_variant?: IContentField<TMantineVariant>;
    mantine_action_icon_loading?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_left_icon?: IContentField<string>;
    is_link?: IContentField<string>;
    page_keyword?: IContentField<string>;
    open_in_new_tab?: IContentField<string>;
    disabled?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}

export interface IAlertStyle extends IStyleWithSpacing {
    style_name: 'alert';
    mantine_alert_title?: IContentField<string>;
    close_button_label?: IContentField<string>;
    mantine_variant?: IContentField<TMantineVariant>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_left_icon?: IContentField<string>;
    mantine_with_close_button?: IContentField<string>;
    content?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}

export interface IBadgeStyle extends IStyleWithSpacing {
    style_name: 'badge';
    label?: IContentField<string>;
    mantine_variant?: IContentField<TMantineBadgeVariant>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_left_icon?: IContentField<string>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_color?: IContentField<TMantineColor>;
    use_mantine_style?: IContentField<string>;
    mantine_right_icon?: IContentField<string>;
    mantine_auto_contrast?: IContentField<string>;
}

export interface IAvatarStyle extends IStyleWithSpacing {
    style_name: 'avatar';
    alt?: IContentField<string>;
    mantine_avatar_variant?: IContentField<TMantineAvatarVariant>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_color?: IContentField<TMantineColor>;
    use_mantine_style?: IContentField<string>;
    mantine_left_icon?: IContentField<string>;
    mantine_avatar_initials?: IContentField<string>;
    img_src?: IContentField<string>;
}

export interface IChipStyle extends IStyleWithSpacing {
    style_name: 'chip';
    label?: IContentField<string>;
    mantine_chip_variant?: IContentField<TMantineChipVariant>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_chip_checked?: IContentField<string>;
    mantine_chip_multiple?: IContentField<string>;
    disabled?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
    mantine_left_icon?: IContentField<string>;
    mantine_icon_size?: IContentField<TMantineIconSize>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    mantine_chip_on_value?: IContentField<string>;
    mantine_chip_off_value?: IContentField<string>;
    is_required?: IContentField<string>;
    tooltip?: IContentField<string>;
    mantine_tooltip_position?: IContentField<string>;
    chip_on_value?: IContentField<string>;
    chip_off_value?: IContentField<string>;
    chip_checked?: IContentField<string>;
}

export interface IIndicatorStyle extends IBaseStyle {
    style_name: 'indicator';
    mantine_indicator_processing?: IContentField<string>;
    mantine_indicator_disabled?: IContentField<string>;
    mantine_indicator_size?: IContentField<string>;
    mantine_indicator_position?: IContentField<TMantineIndicatorPosition>;
    label?: IContentField<string>;
    mantine_indicator_inline?: IContentField<string>;
    mantine_indicator_offset?: IContentField<string>;
    mantine_border?: IContentField<string>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_color?: IContentField<TMantineColor>;
    use_mantine_style?: IContentField<string>;
}

export interface IThemeIconStyle extends IStyleWithSpacing {
    style_name: 'theme-icon';
    mantine_variant?: IContentField<TMantineThemeIconVariant>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_color?: IContentField<TMantineColor>;
    use_mantine_style?: IContentField<string>;
    mantine_left_icon?: IContentField<string>;
}

export interface INotificationStyle extends IStyleWithSpacing {
    style_name: 'notification';
    title?: IContentField<string>;
    content?: IContentField<string>;
    mantine_left_icon?: IContentField<string>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_notification_loading?: IContentField<string>;
    mantine_notification_with_close_button?: IContentField<string>;
    mantine_border?: IContentField<string>;
    mantine_radius?: IContentField<TMantineRadius>;
    use_mantine_style?: IContentField<string>;
}
