/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Global web header presentation presets (menu-builder `web_header` menu).
 */

export type TWebHeaderPreset =
    | 'simple'
    | 'dropdown'
    | 'mega-menu'
    | 'tabs'
    | 'double-dropdown'
    | 'double-mega-menu';

export const WEB_HEADER_PRESET_VALUES: readonly TWebHeaderPreset[] = [
    'simple',
    'dropdown',
    'mega-menu',
    'tabs',
    'double-dropdown',
    'double-mega-menu',
] as const;

export const DEFAULT_WEB_HEADER_PRESET: TWebHeaderPreset = 'dropdown';

export interface IWebHeaderPresetOption {
    value: TWebHeaderPreset;
    label: string;
    description: string;
}

export const WEB_HEADER_PRESET_OPTIONS: readonly IWebHeaderPresetOption[] = [
    { value: 'simple', label: 'Simple', description: 'Flat header links for small sites.' },
    { value: 'dropdown', label: 'Dropdown', description: 'Default — nested dropdown menus.' },
    { value: 'mega-menu', label: 'Mega menu', description: 'Rich sections with descriptions and icons.' },
    { value: 'tabs', label: 'Tabs', description: 'Top-level sections as tabs.' },
    { value: 'double-dropdown', label: 'Double header (dropdown)', description: 'Utility row plus main dropdown nav.' },
    { value: 'double-mega-menu', label: 'Double header (mega menu)', description: 'Utility row plus mega menu.' },
] as const;

export function isWebHeaderPreset(value: unknown): value is TWebHeaderPreset {
    return typeof value === 'string' && (WEB_HEADER_PRESET_VALUES as readonly string[]).includes(value);
}

export function resolveWebHeaderPreset(
    value: unknown,
    fallback: TWebHeaderPreset = DEFAULT_WEB_HEADER_PRESET,
): TWebHeaderPreset {
    return isWebHeaderPreset(value) ? value : fallback;
}
