/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Base interfaces shared by every CMS style. Mirrors what the backend
 * `PageService` returns per section: a `style_name` discriminator, a
 * `fields` map, and a handful of side-channel fields (css, condition, debug).
 *
 * The per-style interfaces (in `auth.ts`, `layout.ts`, …) extend these.
 */

import type { TStyle } from './unknown';

/**
 * One translatable / typed field as returned by the backend. The backend
 * stores `{ content, meta?, type?, id?, default? }` per field; we keep
 * the same shape so the renderer can simply read `field.content`.
 */
export interface IContentField<T> {
    content: T;
    meta?: string;
    type?: string;
    id?: string;
    default?: string;
}

/**
 * Common fields every style has. The discriminator is `style_name`.
 *
 * - `id` / `id_styles` / `position` / `path` come from the section row.
 * - `fields` is the field map (some styles also expose specific fields
 *   directly at the top level — those are typed in the per-style interfaces).
 * - `css` is the web-only CSS class string. Mobile renderer reads ONLY
 *   `css_mobile` per the project decision.
 * - `condition` is a JSON-Logic expression evaluated client-side for
 *   visibility (mirrors backend `ConditionService`).
 * - `data_config` is an optional JSON config string used by data-bound
 *   styles (entry-list, form-record, …).
 */
export interface IBaseStyle {
    id: number;
    id_styles: number;
    style_name: string;
    can_have_children: number | null;
    position: number;
    path: string;
    children?: TStyle[];
    section_name: string;
    section_data?: unknown[];
    fields: Record<string, IContentField<unknown>>;
    condition: string | null;
    css: string | null;
    css_mobile: string | null;
    debug: number | null;
    data_config: string | number | null;
    condition_debug?: {
        condition?: string;
        result: boolean;
        error?: unknown[];
        variables?: Record<string, unknown>;
        condition_object?: unknown;
    } | null;
}

/** Styles that support the unified spacing field. */
export interface IStyleWithSpacing extends IBaseStyle {
    /** Portable box-model spacing (margin + padding). Backend field `spacing`; RF-15 merged the legacy margin-only `web_spacing_margin` into this, so every spacing-capable style now uses it. */
    spacing?: IContentField<string>;
}
