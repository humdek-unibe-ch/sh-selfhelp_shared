/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/

/**
 * Structured refusals of the entry-list workflow, read the same way by the web
 * and mobile clients. Every refusal travels in the normal error envelope
 * (`error.response.status`, `error.response.data.data`) with a stable
 * `data.reason`; clients branch on the reason, never on the message text.
 *
 * - `409 stale_version`: the record changed since the client read it. Nothing was
 *   written. Keep the draft, offer reload, comparison and re-apply.
 * - `422 restore_blocked`: an earlier version cannot be written back whole today.
 *   Nothing was applied; the blockers say which fields and why.
 * - `422 invalid_form_data`: a value breaks the rules of the CURRENT form (a save,
 *   the candidate state of a quick action, or a restore). The whole write was
 *   refused: keep the draft and the chosen files and show the errors
 *   ({@link getFormInvalidData}).
 * - any other list refusal (`invalid_list_parameter`, `unknown_list_parameter`,
 *   `duplicate_list_parameter`, `operation_disabled`, `history_disabled`,
 *   `login_required`, `expected_version_required`, ...): {@link getFormListFailure};
 *   `parameter` names the URL parameter a client may drop before it retries. The
 *   reasons a write can answer with are listed in `TFormWriteRefusalReason`
 *   (`types/api/forms.ts`); a client never repairs them by guessing, it fixes the
 *   request (the version it sends, the inputs it names).
 */
import type {
    IFormListRestoreBlockedData,
    IFormListRestoreBlocker,
    IFormStaleVersionData,
} from '../types/api/form-lists';
import type { IFormInputError, IFormInvalidData, TFormInputRule } from '../types/api/forms';

interface IListErrorShape {
    response?: {
        status?: number;
        data?: { message?: unknown; data?: unknown } | null;
    } | null;
}

/** What a failed list request says, independent of the status it came with. */
export interface IFormListFailure {
    status: number;
    /** Stable machine-readable cause (`data.reason`). */
    reason: string;
    /** The URL parameter that caused it, when the server names one. */
    parameter: string | null;
    /** The server's message, for logs; never branch on it. */
    message: string | null;
}

function envelope(error: unknown): { status: number; message: unknown; data: Record<string, unknown> } | null {
    const response = (error as IListErrorShape | null | undefined)?.response;
    const status = response?.status;
    const data = response?.data?.data;
    if (typeof status !== 'number' || typeof data !== 'object' || data === null || Array.isArray(data)) {
        return null;
    }

    return { status, message: response?.data?.message, data: data as Record<string, unknown> };
}

/** The 409 of a stale save, delete, quick action or restore, else `null`. */
export function getFormStaleVersion(error: unknown): IFormStaleVersionData | null {
    const found = envelope(error);
    if (found === null || found.status !== 409 || found.data.reason !== 'stale_version') {
        return null;
    }
    const { record_id: recordId, expected_version: expected, current_version: current } = found.data;
    if (typeof recordId !== 'number' || typeof expected !== 'number' || typeof current !== 'number') {
        return null;
    }

    return { reason: 'stale_version', record_id: recordId, expected_version: expected, current_version: current };
}

/** The 422 of a restore that cannot be applied whole, else `null`. */
export function getFormListRestoreBlocked(error: unknown): IFormListRestoreBlockedData | null {
    const found = envelope(error);
    if (found === null || found.status !== 422 || found.data.reason !== 'restore_blocked') {
        return null;
    }
    const { record_id: recordId, from_version: fromVersion, blockers } = found.data;
    if (typeof recordId !== 'number' || typeof fromVersion !== 'number' || !Array.isArray(blockers)) {
        return null;
    }

    return {
        reason: 'restore_blocked',
        record_id: recordId,
        from_version: fromVersion,
        blockers: blockers as IFormListRestoreBlocker[],
    };
}

/**
 * The 422 of a write whose values break the rules of the CURRENT form, else
 * `null`. Entries without the four documented text keys are dropped; when none is
 * left the helper answers `null` and the caller falls back to {@link getFormListFailure}.
 */
export function getFormInvalidData(error: unknown): IFormInvalidData | null {
    const found = envelope(error);
    if (found === null || found.status !== 422 || found.data.reason !== 'invalid_form_data' || !Array.isArray(found.data.errors)) {
        return null;
    }
    const errors: IFormInputError[] = [];
    for (const entry of found.data.errors as unknown[]) {
        if (typeof entry !== 'object' || entry === null) {
            continue;
        }
        const { field, key, rule, message } = entry as Record<string, unknown>;
        if (typeof field === 'string' && typeof key === 'string' && typeof rule === 'string' && typeof message === 'string') {
            errors.push({ field, key, rule: rule as TFormInputRule, message });
        }
    }

    return errors.length > 0 ? { reason: 'invalid_form_data', errors } : null;
}

/** Any refusal that carries a `data.reason`, else `null` (a network error, a bare 500). */
export function getFormListFailure(error: unknown): IFormListFailure | null {
    const found = envelope(error);
    if (found === null || typeof found.data.reason !== 'string' || found.data.reason === '') {
        return null;
    }

    return {
        status: found.status,
        reason: found.data.reason,
        parameter: typeof found.data.parameter === 'string' && found.data.parameter !== '' ? found.data.parameter : null,
        message: typeof found.message === 'string' ? found.message : null,
    };
}
