/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Compile-time contract of the form and list writes: the server refuses an
 * interactive update, delete, quick action or restore that names no record
 * version (400), and judges every request by the configuration the person looks
 * at (`preview`). `npm run typecheck` fails when a type drifts from that; the
 * runtime assertions only keep the file a real test.
 */
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { IFormListQuickActionRequest, IFormListRestoreRequest } from '../form-lists';
import type {
    IFormDeleteRequest,
    IFormEffectiveContext,
    IFormInputError,
    IFormInvalidData,
    IFormSubmitRequest,
    IFormUpdateRequest,
    TFormInputRule,
    TFormWriteRefusalReason,
} from '../forms';

describe('form write contracts', () => {
    it('requires the record version of an interactive update and delete', () => {
        // @ts-expect-error an update without expected_version is refused by the server (400 expected_version_required)
        const update: IFormUpdateRequest = { section_id: 1, form_data: {} };
        // @ts-expect-error a delete without expected_version is refused by the server (400 expected_version_required)
        const remove: IFormDeleteRequest = { record_id: 1, section_id: 1 };

        expectTypeOf<IFormUpdateRequest['expected_version']>().toEqualTypeOf<number>();
        expectTypeOf<IFormDeleteRequest['expected_version']>().toEqualTypeOf<number>();
        expectTypeOf<IFormListQuickActionRequest['expected_version']>().toEqualTypeOf<number>();
        expect([update, remove]).toHaveLength(2);
    });

    it('lets a restore preview omit the version and sends the version of a real one', () => {
        const preview: IFormListRestoreRequest = { page_id: 1, version: 2, dry_run: true };
        const restore: IFormListRestoreRequest = { page_id: 1, version: 2, expected_version: 3 };

        expectTypeOf<IFormListRestoreRequest['expected_version']>().toEqualTypeOf<number | undefined>();
        expect([preview.dry_run, restore.expected_version]).toEqual([true, 3]);
    });

    it('lets every write and read name the page version it acts on', () => {
        const draft: IFormEffectiveContext = { preview: true };

        expectTypeOf<IFormSubmitRequest['preview']>().toEqualTypeOf<boolean | undefined>();
        expectTypeOf<IFormUpdateRequest['preview']>().toEqualTypeOf<boolean | undefined>();
        expectTypeOf<IFormDeleteRequest['preview']>().toEqualTypeOf<boolean | undefined>();
        expectTypeOf<IFormListQuickActionRequest['preview']>().toEqualTypeOf<boolean | undefined>();
        expectTypeOf<IFormListRestoreRequest['preview']>().toEqualTypeOf<boolean | undefined>();
        expect(draft.preview).toBe(true);
    });

    it('describes a refused value by the rule of its input', () => {
        const error: IFormInputError = { field: 'Title', key: 'section_9', rule: 'required', message: 'This field is required.' };
        const data: IFormInvalidData = { reason: 'invalid_form_data', errors: [error] };

        expectTypeOf<IFormInputError['rule']>().toEqualTypeOf<TFormInputRule>();
        expectTypeOf<IFormInvalidData['reason']>().toEqualTypeOf<'invalid_form_data'>();
        expect(data.errors[0]?.rule).toBe('required');
    });

    it('lists the refusals a write can answer with', () => {
        const reasons: TFormWriteRefusalReason[] = [
            'expected_version_required',
            'invalid_expected_version',
            'unsupported_target_selection',
            'protected_field',
            'unknown_field',
            'invalid_file_value',
            'table_mismatch',
            'login_required',
            'operation_disabled',
            'history_disabled',
            'unknown_action',
            'action_not_available',
        ];

        expect(new Set(reasons).size).toBe(reasons.length);
    });
});
