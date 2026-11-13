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
    color?: IContentField<string>;
    radius?: IContentField<TSharedRadius>;
    web_shadow?: IContentField<string>;
    variant?: IContentField<string>;
    show_icon?: IContentField<string>;
}

export interface INotFoundStyle extends IStyleWithSpacing {
    style_name: 'not-found';
    title?: IContentField<string>;
    message?: IContentField<string>;
    button_label?: IContentField<string>;
    login_label?: IContentField<string>;
    color?: IContentField<string>;
    radius?: IContentField<TSharedRadius>;
    web_shadow?: IContentField<string>;
    variant?: IContentField<string>;
    show_icon?: IContentField<string>;
}

export interface IMissingStyle extends IStyleWithSpacing {
    style_name: 'missing';
    title?: IContentField<string>;
    message?: IContentField<string>;
    button_label?: IContentField<string>;
    color?: IContentField<string>;
    radius?: IContentField<TSharedRadius>;
    web_shadow?: IContentField<string>;
    variant?: IContentField<string>;
    show_icon?: IContentField<string>;
}

/**
 * One line of the "about the platform" block: a framework, a plugin or a
 * library. The same shape is used by the server lists, by the lists the web and
 * mobile builds generate for themselves, and by `GET /admin/system/version`.
 *
 * - `version` is `null` unless the caller may see exact versions
 *   (`IPlatformAbout.detail`); then it is the exact version, or `null` when it
 *   is unknown.
 * - `license` is an SPDX id or a short text, `null` when unknown. Several
 *   licences are joined with ` OR `.
 */
export interface IAboutItem {
    name: string;
    version: string | null;
    license: string | null;
}

/**
 * The server-filled "about the platform" block of a `version` section.
 *
 * The backend adds it after the page cache is read, on every request, because
 * `detail` depends on the caller: it is `true` only when the caller holds
 * `admin.system.read`. A client never decides this; it draws what it receives.
 *
 * - `product.version` (the SelfHelp version) is always set.
 * - `frameworks` are the server-side parts (PHP, Symfony, MySQL, Redis),
 *   `plugins` the installed and enabled plugins, `libraries` the backend's
 *   direct production dependencies.
 * - Lists are empty arrays, never missing. Every item's `version` is `null`
 *   while `detail` is `false`.
 *
 * The web and mobile renderers add their own generated list (same
 * {@link IAboutItem} shape) and show its versions only when `detail` is `true`.
 */
export interface IPlatformAbout {
    detail: boolean;
    product: { name: string; version: string };
    frameworks: IAboutItem[];
    plugins: IAboutItem[];
    libraries: IAboutItem[];
}

/**
 * "About the platform" block. `about` is always present (filled by the backend
 * for every caller); the headings are translatable style fields so no client
 * hard-codes text.
 */
export interface IVersionStyle extends IBaseStyle {
    style_name: 'version';
    about: IPlatformAbout;
    title?: IContentField<string>;
    label_frameworks?: IContentField<string>;
    label_plugins?: IContentField<string>;
    label_libraries?: IContentField<string>;
    label_web?: IContentField<string>;
    label_app?: IContentField<string>;
    label_filter?: IContentField<string>;
    label_no_match?: IContentField<string>;
}
