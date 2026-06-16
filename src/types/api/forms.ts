/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseApiResponse } from './envelope';

export interface IFormSubmitRequest {
    section_id: number;
    page_id?: number;
    record_id?: number;
    form_data: Record<string, unknown>;
}

export interface IFormUpdateRequest {
    section_id: number;
    page_id?: number;
    record_id?: number;
    form_data: Record<string, unknown>;
    update_based_on?: Record<string, unknown>;
}

export interface IFormDeleteRequest {
    record_id: number;
    page_id?: number;
    section_id: number;
}

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
}

export type IFormSubmitResponse = IBaseApiResponse<IFormSubmitData>;
export type IFormUpdateResponse = IBaseApiResponse<IFormUpdateData>;
export type IFormDeleteResponse = IBaseApiResponse<{ success: boolean; message?: string }>;
