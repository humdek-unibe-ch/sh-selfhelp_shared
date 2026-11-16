/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, expect, it } from 'vitest';
import {
    getFormInvalidData,
    getFormListFailure,
    getFormListRestoreBlocked,
    getFormStaleVersion,
} from '../formListErrors';

/** An axios-style failure with the backend's error envelope. */
const refused = (status: number, data: unknown, message = 'refused') => ({
    response: { status, data: { status, message, error: message, data } },
});

describe('getFormStaleVersion', () => {
    const stale = { reason: 'stale_version', record_id: 41, expected_version: 2, current_version: 3 };

    it('reads the 409 of a stale write', () => {
        expect(getFormStaleVersion(refused(409, stale))).toEqual(stale);
    });

    it('ignores other statuses, other reasons and incomplete payloads', () => {
        expect(getFormStaleVersion(refused(422, stale))).toBeNull();
        expect(getFormStaleVersion(refused(409, { ...stale, reason: 'something_else' }))).toBeNull();
        expect(getFormStaleVersion(refused(409, { reason: 'stale_version', record_id: 41 }))).toBeNull();
        expect(getFormStaleVersion(refused(409, { ...stale, current_version: '3' }))).toBeNull();
        expect(getFormStaleVersion(refused(409, null))).toBeNull();
        expect(getFormStaleVersion(refused(409, [stale]))).toBeNull();
        expect(getFormStaleVersion(new Error('Network Error'))).toBeNull();
        expect(getFormStaleVersion(undefined)).toBeNull();
    });
});

describe('getFormListRestoreBlocked', () => {
    const blocker = { field_key: 'section_9', field_label: 'Title', language_id: 1, reason: 'field_missing', detail: null };
    const blocked = { reason: 'restore_blocked', record_id: 41, from_version: 2, blockers: [blocker] };

    it('reads the 422 of a restore that cannot be applied whole', () => {
        expect(getFormListRestoreBlocked(refused(422, blocked))).toEqual(blocked);
    });

    it('ignores other statuses, other reasons and a payload without blockers', () => {
        expect(getFormListRestoreBlocked(refused(409, blocked))).toBeNull();
        expect(getFormListRestoreBlocked(refused(422, { ...blocked, reason: 'invalid' }))).toBeNull();
        expect(getFormListRestoreBlocked(refused(422, { ...blocked, blockers: 'none' }))).toBeNull();
        expect(getFormListRestoreBlocked(refused(422, { reason: 'restore_blocked', record_id: 41 }))).toBeNull();
        expect(getFormListRestoreBlocked(null)).toBeNull();
    });
});

describe('getFormInvalidData', () => {
    const error = { field: 'Title', key: 'section_9', rule: 'required', message: 'This field is required.' };
    const invalid = { reason: 'invalid_form_data', errors: [error, { ...error, field: 'Age', key: 'section_10', rule: 'min' }] };

    it('reads the 422 of a write that breaks the rules of the current form', () => {
        expect(getFormInvalidData(refused(422, invalid))).toEqual(invalid);
    });

    it('keeps the order the server sent and every documented rule as it came', () => {
        const rules = ['not_available', 'read_only', 'required', 'invalid', 'too_many', 'type', 'min', 'max', 'max_length', 'format', 'option', 'min_date', 'max_date', 'file_type'];
        const data = { reason: 'invalid_form_data', errors: rules.map((rule, index) => ({ ...error, key: `section_${index}`, rule })) };
        expect(getFormInvalidData(refused(422, data))?.errors.map((entry) => entry.rule)).toEqual(rules);
    });

    it('drops malformed entries and gives up when none is left', () => {
        expect(getFormInvalidData(refused(422, { ...invalid, errors: [error, null, 'text', { field: 'x' }, { ...error, message: 3 }] }))).toEqual({
            reason: 'invalid_form_data',
            errors: [error],
        });
        expect(getFormInvalidData(refused(422, { ...invalid, errors: [null, { field: 'x' }] }))).toBeNull();
        expect(getFormInvalidData(refused(422, { ...invalid, errors: [] }))).toBeNull();
    });

    it('ignores other statuses, other reasons and a payload without a list of errors', () => {
        expect(getFormInvalidData(refused(400, invalid))).toBeNull();
        expect(getFormInvalidData(refused(422, { ...invalid, reason: 'restore_blocked' }))).toBeNull();
        expect(getFormInvalidData(refused(422, { reason: 'invalid_form_data' }))).toBeNull();
        expect(getFormInvalidData(refused(422, { reason: 'invalid_form_data', errors: 'none' }))).toBeNull();
        expect(getFormInvalidData(refused(422, null))).toBeNull();
        expect(getFormInvalidData(new Error('Network Error'))).toBeNull();
        expect(getFormInvalidData(undefined)).toBeNull();
    });

    it('is also reported by reason, without its entries, by getFormListFailure', () => {
        expect(getFormListFailure(refused(422, invalid))).toMatchObject({ status: 422, reason: 'invalid_form_data' });
    });
});

describe('getFormListFailure', () => {
    it.each([
        [400, 'expected_version_required'],
        [400, 'invalid_expected_version'],
        [400, 'unsupported_target_selection'],
        [400, 'protected_field'],
        [400, 'unknown_field'],
        [400, 'invalid_file_value'],
        [404, 'unknown_action'],
        [409, 'action_not_available'],
    ])('names the %i write refusal %s so a client branches on it, not on the message', (status, reason) => {
        expect(getFormListFailure(refused(status, { reason }, 'a message that may change'))).toEqual({
            status,
            reason,
            parameter: null,
            message: 'a message that may change',
        });
    });

    it('names the reason and the parameter a client may drop', () => {
        expect(getFormListFailure(refused(400, { reason: 'invalid_list_parameter', parameter: 'tasks.page' }, 'bad page'))).toEqual({
            status: 400,
            reason: 'invalid_list_parameter',
            parameter: 'tasks.page',
            message: 'bad page',
        });
    });

    it('reports a refusal without a parameter', () => {
        expect(getFormListFailure(refused(403, { reason: 'operation_disabled' }))).toMatchObject({
            status: 403,
            reason: 'operation_disabled',
            parameter: null,
        });
        expect(getFormListFailure(refused(401, { reason: 'login_required', parameter: '' }))).toMatchObject({ parameter: null });
    });

    it('also reads the stale-version and restore-blocked refusals by reason', () => {
        expect(getFormListFailure(refused(409, { reason: 'stale_version', record_id: 1, expected_version: 1, current_version: 2 }))).toMatchObject({
            status: 409,
            reason: 'stale_version',
        });
    });

    it('has nothing to say about errors without a reason', () => {
        expect(getFormListFailure(refused(500, null))).toBeNull();
        expect(getFormListFailure(refused(500, { reason: '' }))).toBeNull();
        expect(getFormListFailure(refused(500, { reason: 12 }))).toBeNull();
        expect(getFormListFailure(new Error('Network Error'))).toBeNull();
        expect(getFormListFailure({ response: { data: { data: { reason: 'x' } } } })).toBeNull();
    });
});
