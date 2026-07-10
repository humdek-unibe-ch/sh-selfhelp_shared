/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Cross-platform helpers for user-owned option catalogs in CMS styles.
 *
 * The selected data row stores only stable option codes; labels are resolved
 * per language from translatable style config fields.
 */

export interface IOptionCatalogEntry {
    value: string;
    sort?: number;
    disabled?: boolean;
    meta?: Record<string, unknown>;
    /**
     * Compatibility-only label carried by legacy `{ value, text|label }`
     * catalogs. New catalogs keep labels in the translatable `option_labels`
     * field instead.
     */
    legacyLabel?: string;
}

export interface IOptionLabelMap {
    [code: string]: string;
}

export interface IResolvedOption {
    value: string;
    label: string;
    sort?: number;
    disabled?: boolean;
    meta?: Record<string, unknown>;
}

export interface IOptionStyleConfig {
    catalogField: 'options' | 'radio_options' | 'combobox_options' | 'segmented_control_data';
    multipleField?: 'is_multiple' | 'web_combobox_multi_select';
}

/**
 * Option-bearing core styles and the fields that define their catalogs.
 * Boolean `checkbox` is intentionally absent because it is not an enum group.
 */
export const OPTION_STYLE_CONFIGS = {
    select: {
        catalogField: 'options',
        multipleField: 'is_multiple',
    },
    radio: {
        catalogField: 'radio_options',
    },
    combobox: {
        catalogField: 'combobox_options',
        multipleField: 'web_combobox_multi_select',
    },
    'segmented-control': {
        catalogField: 'segmented_control_data',
    },
} as const satisfies Record<string, IOptionStyleConfig>;

export type TOptionStyleName = keyof typeof OPTION_STYLE_CONFIGS;

function parseJson(raw: unknown): unknown {
    if (typeof raw !== 'string' || raw.trim() === '') {
        return raw;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

function toString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
}

/**
 * Parse option catalog from style field content.
 *
 * Supports both current legacy shape (`[{ value, text|label }]`) and the new
 * language-neutral base shape (`[{ value, sort, disabled, meta }]`).
 */
export function parseOptionCatalog(raw: unknown): IOptionCatalogEntry[] {
    const parsed = parseJson(raw);
    if (!Array.isArray(parsed)) return [];

    const entries: IOptionCatalogEntry[] = [];
    for (const item of parsed) {
        if (item == null || typeof item !== 'object') continue;
        const record = item as Record<string, unknown>;
        const value = toString(record.value);
        if (!value) continue;
        const explicitMeta = record.meta
            && typeof record.meta === 'object'
            && !Array.isArray(record.meta)
            ? record.meta as Record<string, unknown>
            : {};
        const legacyDescription = toString(record.description);
        const meta = legacyDescription && explicitMeta.description === undefined
            ? { ...explicitMeta, description: legacyDescription }
            : explicitMeta;
        entries.push({
            value,
            ...(typeof record.sort === 'number' ? { sort: record.sort } : {}),
            ...(typeof record.disabled === 'boolean' ? { disabled: record.disabled } : {}),
            ...(Object.keys(meta).length > 0 ? { meta } : {}),
            ...(toString(record.label) ?? toString(record.text)
                ? { legacyLabel: toString(record.label) ?? toString(record.text) ?? undefined }
                : {}),
        });
    }
    return entries;
}

/**
 * Parse per-language labels map (`code -> label`) from a translatable style
 * field value.
 */
export function parseOptionLabels(raw: unknown): IOptionLabelMap {
    const parsed = parseJson(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {};
    }
    const labels: IOptionLabelMap = {};
    for (const [key, value] of Object.entries(parsed)) {
        if (!key || typeof value !== 'string') continue;
        const trimmed = value.trim();
        if (trimmed !== '') {
            labels[key] = trimmed;
        }
    }
    return labels;
}

export function resolveOptionLabel(
    code: string | null | undefined,
    labels: IOptionLabelMap,
    fallbackLabels: IOptionLabelMap = {},
    legacyLabel?: string,
): string {
    if (!code) return '';
    return labels[code] ?? fallbackLabels[code] ?? legacyLabel ?? code;
}

export function resolveOptions(
    catalogRaw: unknown,
    labelsRaw: unknown,
    fallbackLabelsRaw?: unknown,
): IResolvedOption[] {
    const catalog = parseOptionCatalog(catalogRaw);
    const labels = parseOptionLabels(labelsRaw);
    const fallbackLabels = parseOptionLabels(fallbackLabelsRaw);

    return catalog.map((entry) => ({
        value: entry.value,
        label: resolveOptionLabel(entry.value, labels, fallbackLabels, entry.legacyLabel),
        ...(entry.sort !== undefined ? { sort: entry.sort } : {}),
        ...(entry.disabled !== undefined ? { disabled: entry.disabled } : {}),
        ...(entry.meta ? { meta: entry.meta } : {}),
    }));
}

export function resolveOptionCodesLabels(
    codes: string[],
    labels: IOptionLabelMap,
    fallbackLabels: IOptionLabelMap = {},
): string[] {
    return codes
        .map((code) => resolveOptionLabel(code, labels, fallbackLabels))
        .filter((label) => label !== '');
}

/** Normalize a stored single value, comma-separated multi value, or array. */
export function parseOptionCodes(value: unknown): string[] {
    const rawCodes = Array.isArray(value)
        ? value
        : (typeof value === 'string' ? value.split(',') : []);

    return rawCodes
        .filter((code): code is string => typeof code === 'string')
        .map((code) => code.trim())
        .filter((code) => code !== '');
}

export function resolveOptionValueLabels(
    value: unknown,
    labelsRaw: unknown,
    fallbackLabelsRaw?: unknown,
): string[] {
    return resolveOptionCodesLabels(
        parseOptionCodes(value),
        parseOptionLabels(labelsRaw),
        parseOptionLabels(fallbackLabelsRaw),
    );
}
