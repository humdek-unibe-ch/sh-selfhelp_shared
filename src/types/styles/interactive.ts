/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseStyle, IContentField, IStyleWithSpacing } from './base';
import type {
    TMantineColor,
    TMantineVariant,
    TMantineBadgeVariant,
    TMantineAvatarVariant,
    TMantineChipVariant,
    TMantineIndicatorPosition,
    TMantineThemeIconVariant,
    TSharedSize,
    TSharedRadius,
} from '../mantine/common';
import type { TMantineIconSize } from './typography';

export interface IButtonStyle extends IStyleWithSpacing {
    style_name: 'button';
    web_variant?: IContentField<TMantineVariant>;
    web_color?: IContentField<TMantineColor>;
    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;
    web_left_icon?: IContentField<string>;
    web_right_icon?: IContentField<string>;
    shared_full_width?: IContentField<string>;
    web_compact?: IContentField<string>;
    web_auto_contrast?: IContentField<string>;
    is_link?: IContentField<string>;
    use_web_style?: IContentField<string>;
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
    web_variant?: IContentField<TMantineVariant>;
    web_action_icon_loading?: IContentField<string>;
    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;
    web_color?: IContentField<TMantineColor>;
    web_left_icon?: IContentField<string>;
    is_link?: IContentField<string>;
    page_keyword?: IContentField<string>;
    open_in_new_tab?: IContentField<string>;
    disabled?: IContentField<string>;
    use_web_style?: IContentField<string>;
}

export interface IAlertStyle extends IStyleWithSpacing {
    style_name: 'alert';
    web_alert_title?: IContentField<string>;
    close_button_label?: IContentField<string>;
    web_variant?: IContentField<TMantineVariant>;
    web_color?: IContentField<TMantineColor>;
    shared_radius?: IContentField<TSharedRadius>;
    web_left_icon?: IContentField<string>;
    web_with_close_button?: IContentField<string>;
    content?: IContentField<string>;
    use_web_style?: IContentField<string>;
}

export interface IBadgeStyle extends IStyleWithSpacing {
    style_name: 'badge';
    label?: IContentField<string>;
    web_variant?: IContentField<TMantineBadgeVariant>;
    shared_size?: IContentField<TSharedSize>;
    web_left_icon?: IContentField<string>;
    shared_radius?: IContentField<TSharedRadius>;
    web_color?: IContentField<TMantineColor>;
    use_web_style?: IContentField<string>;
    web_right_icon?: IContentField<string>;
    web_auto_contrast?: IContentField<string>;
}

export interface IAvatarStyle extends IStyleWithSpacing {
    style_name: 'avatar';
    alt?: IContentField<string>;
    web_avatar_variant?: IContentField<TMantineAvatarVariant>;
    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;
    web_color?: IContentField<TMantineColor>;
    use_web_style?: IContentField<string>;
    web_left_icon?: IContentField<string>;
    web_avatar_initials?: IContentField<string>;
    img_src?: IContentField<string>;
}

export interface IChipStyle extends IStyleWithSpacing {
    style_name: 'chip';
    label?: IContentField<string>;
    web_chip_variant?: IContentField<TMantineChipVariant>;
    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;
    web_color?: IContentField<TMantineColor>;
    web_chip_checked?: IContentField<string>;
    web_chip_multiple?: IContentField<string>;
    disabled?: IContentField<string>;
    use_web_style?: IContentField<string>;
    web_left_icon?: IContentField<string>;
    web_icon_size?: IContentField<TMantineIconSize>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    web_chip_on_value?: IContentField<string>;
    web_chip_off_value?: IContentField<string>;
    is_required?: IContentField<string>;
    tooltip?: IContentField<string>;
    web_tooltip_position?: IContentField<string>;
    chip_on_value?: IContentField<string>;
    chip_off_value?: IContentField<string>;
    chip_checked?: IContentField<string>;
}

export interface IIndicatorStyle extends IBaseStyle {
    style_name: 'indicator';
    web_indicator_processing?: IContentField<string>;
    web_indicator_disabled?: IContentField<string>;
    web_indicator_size?: IContentField<string>;
    web_indicator_position?: IContentField<TMantineIndicatorPosition>;
    label?: IContentField<string>;
    web_indicator_inline?: IContentField<string>;
    web_indicator_offset?: IContentField<string>;
    web_border?: IContentField<string>;
    shared_radius?: IContentField<TSharedRadius>;
    web_color?: IContentField<TMantineColor>;
    use_web_style?: IContentField<string>;
}

export interface IThemeIconStyle extends IStyleWithSpacing {
    style_name: 'theme-icon';
    web_variant?: IContentField<TMantineThemeIconVariant>;
    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;
    web_color?: IContentField<TMantineColor>;
    use_web_style?: IContentField<string>;
    web_left_icon?: IContentField<string>;
}

export interface INotificationStyle extends IStyleWithSpacing {
    style_name: 'notification';
    title?: IContentField<string>;
    content?: IContentField<string>;
    web_left_icon?: IContentField<string>;
    web_color?: IContentField<TMantineColor>;
    web_notification_loading?: IContentField<string>;
    web_notification_with_close_button?: IContentField<string>;
    web_border?: IContentField<string>;
    shared_radius?: IContentField<TSharedRadius>;
    use_web_style?: IContentField<string>;
}

// NOTE: `fab-button` and `biometric-login-button` are deferred (mobile rendering
// plan, milestone-one scope). They are NOT part of the established 90-style
// catalog and were removed from the registry, union and interfaces. Reintroduce
// only with a concrete CMS authoring use case, fields, render target, and tests.
