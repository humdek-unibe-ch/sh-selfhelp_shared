/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * entry-table column catalog + per-language header labels (select-style split).
 */

export interface IFieldsMapStyleConfig {
    catalogField: 'fields_map';
    labelsField: 'fields_map_labels';
}

export const FIELDS_MAP_STYLE_CONFIG: IFieldsMapStyleConfig = {
    catalogField: 'fields_map',
    labelsField: 'fields_map_labels',
};

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

/** Parse ordered field_key catalog from property `fields_map`. */
export function parseFieldsMapCatalog(raw: unknown): string[] {
    const parsed = parseJson(raw);
    if (!Array.isArray(parsed)) {
        return [];
    }

    const keys: string[] = [];
    for (const item of parsed) {
        if (typeof item === 'string' && item.trim() !== '') {
            keys.push(item.trim());
            continue;
        }
        if (item && typeof item === 'object' && !Array.isArray(item)) {
            const record = item as Record<string, unknown>;
            const legacy = typeof record.field_name === 'string' ? record.field_name.trim() : '';
            if (legacy !== '') {
                keys.push(legacy);
            }
        }
    }

    return keys;
}

export function parseFieldsMapLabels(raw: unknown): Record<string, string> {
    const parsed = parseJson(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {};
    }

    const labels: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
        if (!key || typeof value !== 'string') {
            continue;
        }
        const trimmed = value.trim();
        if (trimmed !== '') {
            labels[key] = trimmed;
        }
    }

    return labels;
}

export function resolveFieldsMapLabel(
    fieldKey: string,
    labels: Record<string, string>,
    fallbackLabels: Record<string, string> = {},
): string {
    return labels[fieldKey] ?? fallbackLabels[fieldKey] ?? fieldKey;
}

export function serializeFieldsMapCatalog(fieldKeys: string[]): string {
    const keys = fieldKeys.map((key) => key.trim()).filter((key) => key !== '');
    if (keys.length === 0) {
        return '';
    }
    return JSON.stringify(keys);
}

export function serializeFieldsMapLabels(labels: Record<string, string>): string {
    const clean: Record<string, string> = {};
    for (const [key, value] of Object.entries(labels)) {
        const trimmed = value.trim();
        if (key && trimmed !== '') {
            clean[key] = trimmed;
        }
    }
    if (Object.keys(clean).length === 0) {
        return '';
    }
    return JSON.stringify(clean);
}
