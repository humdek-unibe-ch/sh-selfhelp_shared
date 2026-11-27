/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseApiResponse } from './envelope';
import type { IFormStaleVersionData } from './form-lists';

/** `data` of a 409 form-write envelope (re-exported for form consumers). */
export type TFormConflictData = IFormStaleVersionData;

/**
 * Which configuration a form or list request acts on: every write (submit,
 * update, delete, quick action, restore) and every list read (state, history,
 * version, comparison, historical file). The server decides what is allowed;
 * the client only says which version of the page it is looking at.
 */
export interface IFormEffectiveContext {
    /**
     * Act on the DRAFT of the page instead of its published version. Send it
     * exactly when the person looks at the draft (the page was fetched with
     * `preview`): the request must be judged by the same inputs, conditions,
     * list properties and quick actions the person sees. Honoured for a
     * signed-in person who may read the draft, refused otherwise; without it the
     * published version decides, also for a signed-in person. Page access
     * rights, live data and permissions are not part of the draft and stay the
     * same. A request body carries it as a boolean, a query string as `preview=true`.
     */
    preview?: boolean;
}

/**
 * `form_data` holds the values of the inputs of the form the server resolves for
 * `section_id` (keyed by input name). It is untrusted: the server refuses (400)
 * an unknown input, an owner or trigger field and any internal key, on JSON and
 * on multipart requests, signed in or as a guest.
 */
export interface IFormSubmitRequest extends IFormEffectiveContext {
    section_id: number;
    page_id?: number;
    record_id?: number;
    form_data: Record<string, unknown>;
}

export interface IFormUpdateRequest extends IFormEffectiveContext {
    section_id: number;
    page_id?: number;
    record_id?: number;
    form_data: Record<string, unknown>;
    /**
     * The record the update changes: `{ record_id }` alone, or the documented
     * alternative of plain field values. Anything else (empty, both, malformed)
     * answers 400 `unsupported_target_selection`; a record outside the dataset
     * of the form or list answers 404.
     */
    update_based_on?: Record<string, unknown>;
    /**
     * REQUIRED: the record `version` the change is based on (the `version` the
     * client last received from the record, a list row or the previous write).
     * Missing, not a whole number of at least 1 (also as multipart text) answers
     * 400 `expected_version_required` / `invalid_expected_version` before
     * anything is stored; a save based on an older version answers 409 with
     * {@link IFormStaleVersionData} and writes nothing. The schema marks it
     * optional only so the refusal can carry its reason; the type does not.
     */
    expected_version: number;
}

export interface IFormDeleteRequest extends IFormEffectiveContext {
    record_id: number;
    page_id?: number;
    /** The form's section, or the id of the entry list the record belongs to. */
    section_id: number;
    /**
     * REQUIRED: the record `version` the delete is based on, with the same
     * refusals as {@link IFormUpdateRequest.expected_version} (400 when missing
     * or malformed, 409 `stale_version` when old).
     */
    expected_version: number;
}

/**
 * The rule of an input a value broke (`422 invalid_form_data`). The server
 * checks the CURRENT effective form: `required`, `read_only` and `not_available`
 * (hidden by a condition or not an input of the form), `invalid` (not a value
 * this kind of input takes), `too_many` (selections or files), `type`, `min`,
 * `max`, `max_length`, `format` (email, web address), `option`, `min_date`,
 * `max_date` and `file_type`.
 */
export type TFormInputRule =
    | 'not_available'
    | 'read_only'
    | 'required'
    | 'invalid'
    | 'too_many'
    | 'type'
    | 'min'
    | 'max'
    | 'max_length'
    | 'format'
    | 'option'
    | 'min_date'
    | 'max_date'
    | 'file_type';

/** One refused input of a write. Show `message` at the input named `field`; branch on `rule`, never on the text. */
export interface IFormInputError {
    /** The input's name, as the person knows it. */
    field: string;
    /** The stable column key of the input (`section_<input id>`). */
    key: string;
    rule: TFormInputRule;
    message: string;
}

/**
 * `data` of the 422 envelope a write answers with when a value breaks the rules
 * of the CURRENT form (a save, a quick action's candidate state or a restore). The
 * whole write is refused: nothing was stored, uploaded or scheduled, so a client
 * keeps the person's draft and files and shows the errors.
 */
export interface IFormInvalidData {
    reason: 'invalid_form_data';
    errors: IFormInputError[];
}

/**
 * The `data.reason` of the refusals a form or list write can answer with, besides
 * `stale_version` and `restore_blocked` ({@link IFormStaleVersionData},
 * {@link IFormListRestoreBlockedData}) and `invalid_form_data`
 * ({@link IFormInvalidData}). They are statuses of one request, not page state.
 *
 * - 400: `expected_version_required`, `invalid_expected_version`,
 *   `unsupported_target_selection`, `protected_field`, `unknown_field`,
 *   `invalid_file_value`, `table_mismatch`.
 * - 401 `login_required`: a guest on an own-entries list.
 * - 403: `operation_disabled` (create, update or delete switched off on the list),
 *   `history_disabled`, or no right to the page, the record or the table.
 * - 404: `unknown_action`, or a record that is not part of the list's dataset
 *   (never a hint whether it exists elsewhere).
 * - 409: `action_not_available` (the action's condition no longer holds).
 */
export type TFormWriteRefusalReason =
    | 'expected_version_required'
    | 'invalid_expected_version'
    | 'unsupported_target_selection'
    | 'protected_field'
    | 'unknown_field'
    | 'invalid_file_value'
    | 'table_mismatch'
    | 'login_required'
    | 'operation_disabled'
    | 'history_disabled'
    | 'unknown_action'
    | 'action_not_available';

/**
 * Legacy/aspirational form-result fields.
 *
 * @deprecated The current backend `form_submitted` / `form_updated` responses
 * do NOT include these. `FormController` returns only the structured fields on
 * {@link IFormSubmitData} / {@link IFormUpdateData}, and both JSON schemas
 * declare `additionalProperties: false`. Frontend code that reads
 * `data.success` / `data.message` (e.g. `useFormSubmission.ts`) is reading
 * values the backend never sends. Kept OPTIONAL so consumers keep compiling
 * during migration; drop them once no consumer references them.
 */
export interface IFormResultLegacyFields {
    /** @deprecated Not returned by the current backend form endpoints. */
    success?: boolean;
    /** @deprecated Not returned by the current backend form endpoints. */
    redirect_url?: string;
    /** @deprecated Not returned by the current backend form endpoints. */
    message?: string;
    /** @deprecated Not returned by the current backend form endpoints. */
    field_errors?: Record<string, string>;
}

/**
 * Data returned by a successful POST form submit. Mirrors the backend contract
 * `config/schemas/api/v1/responses/frontend/form_submitted.json`.
 */
export interface IFormSubmitData extends IFormResultLegacyFields {
    record_id: number;
    section_id: number;
    page_id: number;
    submitted_at: string;
    user_authenticated: boolean;
    /** The record's version after the submit (1 for a new record). */
    version: number;
    /**
     * Content the write was based on (`page:<id>@v<n>|draft` or
     * `res:<type>:<id>@v<n>`). Null when unknown.
     */
    content_ref?: string | null;
}

/**
 * Data returned by a successful PUT form update. Mirrors the backend contract
 * `config/schemas/api/v1/responses/frontend/form_updated.json` (note: the
 * update response carries `updated_at`, not `submitted_at`/`user_authenticated`).
 */
export interface IFormUpdateData extends IFormResultLegacyFields {
    record_id: number;
    section_id: number;
    page_id: number;
    updated_at: string;
    /** The record's version after the update. */
    version: number;
    /**
     * Content the write was based on (`page:<id>@v<n>|draft` or
     * `res:<type>:<id>@v<n>`). Null when unknown.
     */
    content_ref?: string | null;
}

/**
 * Data returned by a successful DELETE form delete. Mirrors the backend contract
 * `config/schemas/api/v1/responses/frontend/form_deleted.json`. The delete is
 * soft: the record's history is kept.
 */
export interface IFormDeleteData extends IFormResultLegacyFields {
    record_id: number;
    section_id?: number;
    page_id?: number;
    /** The record's version after the delete. */
    version: number;
}

export type IFormSubmitResponse = IBaseApiResponse<IFormSubmitData>;
export type IFormUpdateResponse = IBaseApiResponse<IFormUpdateData>;
export type IFormDeleteResponse = IBaseApiResponse<IFormDeleteData>;
