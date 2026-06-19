/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseStyle, IContentField, IStyleWithSpacing } from './base';
import type { TSharedRadius } from '../mantine/common';

export interface INoAccessStyle extends IStyleWithSpacing {
    style_name: 'no-access';
    title?: IContentField<string>;
    message?: IContentField<string>;
    button_label?: IContentField<string>;
    login_label?: IContentField<string>;
    show_login?: IContentField<string>;
    shared_color?: IContentField<string>;
    shared_radius?: IContentField<TSharedRadius>;
    web_shadow?: IContentField<string>;
    shared_variant?: IContentField<string>;
    show_icon?: IContentField<string>;
}

export interface INotFoundStyle extends IStyleWithSpacing {
    style_name: 'not-found';
    title?: IContentField<string>;
    message?: IContentField<string>;
    button_label?: IContentField<string>;
    login_label?: IContentField<string>;
    shared_color?: IContentField<string>;
    shared_radius?: IContentField<TSharedRadius>;
    web_shadow?: IContentField<string>;
    shared_variant?: IContentField<string>;
    show_icon?: IContentField<string>;
}

export interface IMissingStyle extends IStyleWithSpacing {
    style_name: 'missing';
    title?: IContentField<string>;
    message?: IContentField<string>;
    button_label?: IContentField<string>;
    shared_color?: IContentField<string>;
    shared_radius?: IContentField<TSharedRadius>;
    web_shadow?: IContentField<string>;
    shared_variant?: IContentField<string>;
    show_icon?: IContentField<string>;
}

/**
 * Build/version diagnostic surface. Has no content fields in the catalog.
 * Per the mobile rendering plan (section 5.3) it is a candidate to be marked
 * web-only or removed after a zero-reference check; kept `both` for now to
 * match the backend render-target backfill.
 */
export interface IVersionStyle extends IBaseStyle {
    style_name: 'version';
}
