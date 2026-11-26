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

import type { IFormListFilesCell, IFormListFileValue } from '../types/api/form-lists';
import { isLanguageIndependent } from './languageIndependent';

/** Per-language value for a translatable form field. */
export interface IFormRecordPrefillTranslatedValue {
    language_id: number;
    value: string;
}

/**
 * A file-input prefill value (contract 4): current files with server-built URLs,
 * never a storage key. Same shape as a list `file`/`image` cell.
 */
export type TFormRecordPrefillFileValue = IFormListFilesCell;

export type TFormRecordPrefillFieldValue =
    | string
    | IFormRecordPrefillTranslatedValue[]
    | TFormRecordPrefillFileValue;

export interface IFormRecordPrefill {
    recordId: number | null;
    values: Record<string, TFormRecordPrefillFieldValue>;
    /**
     * The version the record had when the page was built (`_version` of its rows). Send it back
     * as `expected_version` when saving or deleting the record: the server refuses a save
     * without it (400) and a save based on an old one (409, the draft stays). Absent when the page
     * offered none (a new record, or a server that does not name it).
     */
    version?: number;
}

/**
 * Metadata fields that are never form inputs. The trigger type is skipped under
 * both spellings: `id_action_trigger_types` is the column the data store (and the
 * list engine) returns, `id_actionTriggerTypes` the name older payloads used. A
 * form that wrote it back would be refused ("not allowed in form data"). `_version`
 * is the record's version, read into {@link IFormRecordPrefill.version}.
 */
export const FORM_RECORD_PREFILL_SKIP_FIELDS: ReadonlySet<string> = new Set([
    'record_id',
    '_version',
    'entry_date',
    'id_users',
    'user_name',
    'user_code',
    'id_action_trigger_types',
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
    // Nested objects/arrays are not plain text field values — skip (files use asFilesCell).
    return null;
}

/** Narrow a prefill cell to `{ files: [...] }` when the server sent contract-4 file metadata. */
export function asFilesCell(value: unknown): TFormRecordPrefillFileValue | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    const files = (value as { files?: unknown }).files;
    if (!Array.isArray(files)) {
        return null;
    }
    const out: IFormListFileValue[] = [];
    for (const entry of files) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            continue;
        }
        const file = entry as Record<string, unknown>;
        const index = typeof file.index === 'number' ? file.index : Number(file.index);
        const name = typeof file.name === 'string' ? file.name : null;
        const url = typeof file.url === 'string' ? file.url : null;
        if (!Number.isFinite(index) || name === null || url === null) {
            continue;
        }
        const mime = typeof file.mime === 'string' ? file.mime : file.mime === null ? null : undefined;
        const size =
            typeof file.size === 'number'
                ? file.size
                : file.size === null
                  ? null
                  : typeof file.size === 'string' && Number.isFinite(Number(file.size))
                    ? Number(file.size)
                    : undefined;
        out.push({
            index: Math.trunc(index),
            name,
            url,
            ...(mime !== undefined ? { mime } : {}),
            ...(size !== undefined ? { size } : {}),
        });
    }
    return { files: out };
}

/**
 * Parse hydrated `section_data` rows into `{ recordId, values }`.
 *
 * - Missing / empty / non-array `section_data` → empty create state.
 * - Rows without a numeric `record_id` are ignored.
 * - Translatable fields accumulate `{ language_id, value }[]` (the
 *   language-independent seed is kept only until a public-language row arrives).
 * - Non-translatable fields prefer the language-independent row, else the first
 *   seen value.
 */
export function parseFormRecordPrefill(section: IFormRecordPrefillSection): IFormRecordPrefill {
    const sectionDataArray = section?.section_data;
    if (!Array.isArray(sectionDataArray) || sectionDataArray.length === 0) {
        return { recordId: null, values: {} };
    }

    const recordGroups: Record<number, Record<string, TFormRecordPrefillFieldValue>> = {};
    const recordVersions: Record<number, number> = {};

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

        // Every row of a record (one per language) names the same version.
        const version = asRecordVersion(record._version);
        if (version !== null && recordVersions[recordId] === undefined) {
            recordVersions[recordId] = version;
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
            const filesCell = asFilesCell(fieldValue);
            if (filesCell !== null) {
                if (isLanguageIndependent(languageId) || !recordGroups[recordId][fieldName]) {
                    recordGroups[recordId][fieldName] = filesCell;
                }
                continue;
            }
            const value = asScalarString(fieldValue);
            if (value === null) {
                continue;
            }

            const translatable = isTranslatableChild(section.children, fieldName);

            if (translatable) {
                if (isLanguageIndependent(languageId)) {
                    if (!recordGroups[recordId][fieldName]) {
                        recordGroups[recordId][fieldName] = value;
                    }
                } else if (typeof languageId === 'number') {
                    const current = recordGroups[recordId][fieldName];
                    if (typeof current === 'string' || Array.isArray(current) === false || !current) {
                        if (typeof current === 'object' && current !== null && 'files' in current) {
                            // Keep an existing file cell; do not overwrite with text.
                            continue;
                        }
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
            } else if (isLanguageIndependent(languageId) || !recordGroups[recordId][fieldName]) {
                recordGroups[recordId][fieldName] = value;
            }
        }
    }

    const firstRecordId = Object.keys(recordGroups)[0];
    if (!firstRecordId) {
        return { recordId: null, values: {} };
    }

    const id = Number(firstRecordId);
    const version = recordVersions[id];
    return version === undefined
        ? { recordId: id, values: recordGroups[id] ?? {} }
        : { recordId: id, values: recordGroups[id] ?? {}, version };
}

/** A record version as the page offers it: a whole number of at least 1, as a number or as digits. */
export function asRecordVersion(value: unknown): number | null {
    const candidate =
        typeof value === 'number'
            ? value
            : typeof value === 'string' && /^[1-9]\d*$/.test(value.trim())
              ? Number(value.trim())
              : Number.NaN;
    return Number.isSafeInteger(candidate) && candidate >= 1 ? candidate : null;
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
        if (value && typeof value === 'object' && !Array.isArray(value) && 'files' in value) {
            // File cells stay structured; callers that need plain strings omit them.
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
        const nonIndependent = value.find((entry) => !isLanguageIndependent(entry.language_id));
        out[key] = (nonIndependent ?? value[0]).value;
    }
    return out;
}
