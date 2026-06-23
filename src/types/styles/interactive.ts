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

/** Mantine `Anchor` `underline` behaviour. */
export type TMantineAnchorUnderline = 'always' | 'hover' | 'never';

/**
 * Mobile-only HeroUI Native Button press feedback (no web equivalent). The web
 * renderer ignores `mobile_*`; only the mobile button renderer reads it.
 */
export type TMobileButtonFeedback = 'scale-highlight' | 'scale-ripple' | 'scale' | 'none';

export interface IButtonStyle extends IStyleWithSpacing {
    style_name: 'button';
    variant?: IContentField<TMantineVariant>;
    color?: IContentField<TMantineColor>;
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    web_left_icon?: IContentField<string>;
    web_right_icon?: IContentField<string>;
    full_width?: IContentField<string>;
    web_compact?: IContentField<string>;
    web_auto_contrast?: IContentField<string>;
    is_link?: IContentField<string>;    disabled?: IContentField<string>;
    open_in_new_tab?: IContentField<string>;
    page_keyword?: IContentField<string>;
    url?: IContentField<string>;
    label?: IContentField<string>;
    label_cancel?: IContentField<string>;
    confirmation_title?: IContentField<string>;
    confirmation_continue?: IContentField<string>;
    confirmation_message?: IContentField<string>;
    // Mobile-only HeroUI Native press feedback (scale-highlight / scale-ripple / scale / none).
    mobile_button_feedback?: IContentField<TMobileButtonFeedback>;
}

export interface ILinkStyle extends IStyleWithSpacing {
    style_name: 'link';
    label?: IContentField<string>;
    url?: IContentField<string>;
    open_in_new_tab?: IContentField<string>;
    color?: IContentField<TMantineColor>;
    web_link_underline?: IContentField<TMantineAnchorUnderline>;
    web_left_icon?: IContentField<string>;
    web_right_icon?: IContentField<string>;
}

export interface IActionIconStyle extends IStyleWithSpacing {
    style_name: 'action-icon';
    web_variant?: IContentField<TMantineVariant>;
    web_action_icon_loading?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    color?: IContentField<TMantineColor>;
    web_left_icon?: IContentField<string>;
    is_link?: IContentField<string>;
    page_keyword?: IContentField<string>;
    open_in_new_tab?: IContentField<string>;
    disabled?: IContentField<string>;
    /** Accessible name for the icon-only control (screen readers). */
    aria_label?: IContentField<string>;}

export interface IAlertStyle extends IStyleWithSpacing {
    style_name: 'alert';
    alert_title?: IContentField<string>;
    web_variant?: IContentField<TMantineVariant>;
    color?: IContentField<TMantineColor>;
    radius?: IContentField<TSharedRadius>;
    web_left_icon?: IContentField<string>;
    /** Cross-platform dismiss toggle (was the web-only `web_with_close_button`). */
    closable?: IContentField<string>;
    content?: IContentField<string>;
}

export interface IBadgeStyle extends IStyleWithSpacing {
    style_name: 'badge';
    label?: IContentField<string>;
    /** Cross-platform variant (web Mantine + mobile HeroUI). Primary control. */
    variant?: IContentField<TMantineBadgeVariant>;
    /** Web-only variant override (e.g. `dot`); empty falls back to variant. */
    web_variant?: IContentField<TMantineBadgeVariant>;
    /** Render as a circle (equal width/height) for short counts. */
    circle?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    web_left_icon?: IContentField<string>;
    radius?: IContentField<TSharedRadius>;
    color?: IContentField<TMantineColor>;
    web_right_icon?: IContentField<string>;
    web_auto_contrast?: IContentField<string>;
}

export interface IAvatarStyle extends IStyleWithSpacing {
    style_name: 'avatar';
    alt?: IContentField<string>;
    /** Person name; seeds auto-initials + a stable auto colour when no image. */
    name?: IContentField<string>;
    web_variant?: IContentField<TMantineAvatarVariant>;
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    color?: IContentField<TMantineColor>;
    web_left_icon?: IContentField<string>;
    web_avatar_initials?: IContentField<string>;
    img_src?: IContentField<string>;
}

export interface IChipStyle extends IStyleWithSpacing {
    style_name: 'chip';
    label?: IContentField<string>;
    // Cross-platform variant (Mantine filled/outline/light; HeroUI Native chip variant).
    chip_variant?: IContentField<TMantineChipVariant>;
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    color?: IContentField<TMantineColor>;
    web_chip_checked?: IContentField<string>;
    web_chip_multiple?: IContentField<string>;
    disabled?: IContentField<string>;    web_left_icon?: IContentField<string>;
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
    radius?: IContentField<TSharedRadius>;
    color?: IContentField<TMantineColor>;}

export interface IThemeIconStyle extends IStyleWithSpacing {
    style_name: 'theme-icon';
    web_variant?: IContentField<TMantineThemeIconVariant>;
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    color?: IContentField<TMantineColor>;    web_left_icon?: IContentField<string>;
}

export interface INotificationStyle extends IStyleWithSpacing {
    style_name: 'notification';
    title?: IContentField<string>;
    content?: IContentField<string>;
    /** Portable icon: honoured by both web (Mantine) and mobile renderers. */
    shared_icon?: IContentField<string>;
    color?: IContentField<TMantineColor>;
    web_notification_loading?: IContentField<string>;
    /** Portable dismiss toggle: both platforms show a close button when '1'. */
    with_close_button?: IContentField<string>;
    web_border?: IContentField<string>;
    radius?: IContentField<TSharedRadius>;}

// NOTE: `fab-button` and `biometric-login-button` are deferred (mobile rendering
// plan, milestone-one scope). They are NOT part of the established 90-style
// catalog and were removed from the registry, union and interfaces. Reintroduce
// only with a concrete CMS authoring use case, fields, render target, and tests.
