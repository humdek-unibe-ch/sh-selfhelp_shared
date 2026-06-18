/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IContentField, IStyleWithSpacing } from './base';

export interface INoAccessStyle extends IStyleWithSpacing {
    style_name: 'no-access';
    title?: IContentField<string>;
    message?: IContentField<string>;
    button_label?: IContentField<string>;
    login_label?: IContentField<string>;
    show_login?: IContentField<string>;
    mantine_color?: IContentField<string>;
    mantine_radius?: IContentField<string>;
    mantine_shadow?: IContentField<string>;
    mantine_button_variant?: IContentField<string>;
    show_icon?: IContentField<string>;
}

export interface INotFoundStyle extends IStyleWithSpacing {
    style_name: 'not-found';
    title?: IContentField<string>;
    message?: IContentField<string>;
    button_label?: IContentField<string>;
    login_label?: IContentField<string>;
    mantine_color?: IContentField<string>;
    mantine_radius?: IContentField<string>;
    mantine_shadow?: IContentField<string>;
    mantine_button_variant?: IContentField<string>;
    show_icon?: IContentField<string>;
}

export interface IMissingStyle extends IStyleWithSpacing {
    style_name: 'missing';
    title?: IContentField<string>;
    message?: IContentField<string>;
    button_label?: IContentField<string>;
    mantine_color?: IContentField<string>;
    mantine_radius?: IContentField<string>;
    mantine_shadow?: IContentField<string>;
    mantine_button_variant?: IContentField<string>;
    show_icon?: IContentField<string>;
}
