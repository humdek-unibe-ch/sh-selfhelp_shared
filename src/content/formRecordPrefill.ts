/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * Flatten server-hydrated form `section_data` into a form-record prefill map.
 *
 * Used by web `FormStyle` and mobile `FormUserInput` so create/edit hydration
 * cannot drift between clients. The backend owns which row is present
 * (`load_record_from`); this helper only reshapes that payload.
 */

/** Per-language value for a translatable form field. */
export interface IFormRecordPrefillTranslatedValue {
    language_id: number;
    value: string;
}

export type TFormRecordPrefillFieldValue = string | IFormRecordPrefillTranslatedValue[];

export interface IFormRecordPrefill {
    recordId: number | null;
    values: Record<string, TFormRecordPrefillFieldValue>;
}

/** Metadata fields that are never form inputs. */
export const FORM_RECORD_PREFILL_SKIP_FIELDS: ReadonlySet<string> = new Set([
    'record_id',
    'entry_date',
    'id_users',
    'user_name',
    'user_code',
    'id_actionTriggerTypes',
    'triggerType',
    'id_languages',
    'language_locale',
    'language_name',
]);

export interface IFormRecordPrefillChild {
    name?: { content?: string } | null;
    translatable?: { content?: string } | null;
}

export interface IFormRecordPrefillSection {
    section_data?: unknown;
    children?: IFormRecordPrefillChild[] | null;
}

function isTranslatableChild(
    children: IFormRecordPrefillChild[] | null | undefined,
    fieldName: string,
): boolean {
    if (!Array.isArray(children)) {
        return false;
    }
    const child = children.find((item) => item?.name?.content === fieldName);
    return child?.translatable?.content === '1';
}

function asScalarString(value: unknown): string | null {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    // Nested objects/arrays are not form field values — skip.
    return null;
}

/**
 * Parse hydrated `section_data` rows into `{ recordId, values }`.
 *
 * - Missing / empty / non-array `section_data` → empty create state.
 * - Rows without a numeric `record_id` are ignored.
 * - Translatable fields accumulate `{ language_id, value }[]` (language id `1`
 *   is an Independent seed kept only until a public-language row arrives).
 * - Non-translatable fields prefer language id `1`, else the first seen value.
 */
export function parseFormRecordPrefill(section: IFormRecordPrefillSection): IFormRecordPrefill {
    const sectionDataArray = section?.section_data;
    if (!Array.isArray(sectionDataArray) || sectionDataArray.length === 0) {
        return { recordId: null, values: {} };
    }

    const recordGroups: Record<number, Record<string, TFormRecordPrefillFieldValue>> = {};

    for (const row of sectionDataArray) {
        if (!row || typeof row !== 'object' || Array.isArray(row)) {
            continue;
        }
        const record = row as Record<string, unknown>;
        const rawRecordId = record.record_id;
        const recordId =
            typeof rawRecordId === 'number'
                ? rawRecordId
                : typeof rawRecordId === 'string' && rawRecordId.trim() !== '' && Number.isFinite(Number(rawRecordId))
                  ? Number(rawRecordId)
                  : null;
        if (recordId === null) {
            continue;
        }

        if (!recordGroups[recordId]) {
            recordGroups[recordId] = {};
        }

        const languageId =
            typeof record.id_languages === 'number'
                ? record.id_languages
                : typeof record.id_languages === 'string' && Number.isFinite(Number(record.id_languages))
                  ? Number(record.id_languages)
                  : undefined;

        for (const [fieldName, fieldValue] of Object.entries(record)) {
            if (FORM_RECORD_PREFILL_SKIP_FIELDS.has(fieldName)) {
                continue;
            }
            const value = asScalarString(fieldValue);
            if (value === null) {
                continue;
            }

            const translatable = isTranslatableChild(section.children, fieldName);

            if (translatable) {
                if (languageId === 1) {
                    if (!recordGroups[recordId][fieldName]) {
                        recordGroups[recordId][fieldName] = value;
                    }
                } else if (typeof languageId === 'number') {
                    const current = recordGroups[recordId][fieldName];
                    if (typeof current === 'string' || !current) {
                        recordGroups[recordId][fieldName] = [{ language_id: languageId, value }];
                    } else {
                        const langValues = current;
                        const existingIndex = langValues.findIndex((v) => v.language_id === languageId);
                        if (existingIndex >= 0) {
                            langValues[existingIndex] = { language_id: languageId, value };
                        } else {
                            langValues.push({ language_id: languageId, value });
                        }
                    }
                }
            } else if (languageId === 1 || !recordGroups[recordId][fieldName]) {
                recordGroups[recordId][fieldName] = value;
            }
        }
    }

    const firstRecordId = Object.keys(recordGroups)[0];
    if (!firstRecordId) {
        return { recordId: null, values: {} };
    }

    const id = Number(firstRecordId);
    return { recordId: id, values: recordGroups[id] ?? {} };
}

/**
 * Flatten rich prefill values to plain strings for clients that do not keep
 * per-language arrays (mobile). Prefers `languageId` when present, else the
 * first translated entry, else the Independent seed string.
 */
export function flattenFormRecordPrefillValues(
    values: Record<string, TFormRecordPrefillFieldValue>,
    languageId?: number | null,
): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
        if (typeof value === 'string') {
            out[key] = value;
            continue;
        }
        if (!Array.isArray(value) || value.length === 0) {
            continue;
        }
        if (languageId != null) {
            const match = value.find((entry) => entry.language_id === languageId);
            if (match) {
                out[key] = match.value;
                continue;
            }
        }
        const nonIndependent = value.find((entry) => entry.language_id !== 1);
        out[key] = (nonIndependent ?? value[0]).value;
    }
    return out;
}
