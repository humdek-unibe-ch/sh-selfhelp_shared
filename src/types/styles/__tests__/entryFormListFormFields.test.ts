/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expectTypeOf, it } from 'vitest';
import type { IContentField } from '../base';
import type { IEntryFormListStyle, IFormRecordStyle, TEntryFormListFormFields } from '../forms';

/**
 * Compile-time pin: the form fields on Entry List with Form stay aligned with
 * form-record (Pick), so a rename or type change on the form cannot drift.
 */
describe('TEntryFormListFormFields', () => {
    it('matches the corresponding IFormRecordStyle members', () => {
        expectTypeOf<TEntryFormListFormFields['name']>().toEqualTypeOf<IFormRecordStyle['name']>();
        expectTypeOf<TEntryFormListFormFields['btn_save_label']>().toEqualTypeOf<
            IFormRecordStyle['btn_save_label']
        >();
        expectTypeOf<TEntryFormListFormFields['btn_update_label']>().toEqualTypeOf<
            IFormRecordStyle['btn_update_label']
        >();
        expectTypeOf<TEntryFormListFormFields['btn_update_color']>().toEqualTypeOf<
            IFormRecordStyle['btn_update_color']
        >();
        expectTypeOf<TEntryFormListFormFields['alert_success']>().toEqualTypeOf<
            IFormRecordStyle['alert_success']
        >();
        expectTypeOf<TEntryFormListFormFields['redirect_at_end']>().toEqualTypeOf<
            IFormRecordStyle['redirect_at_end']
        >();
        expectTypeOf<TEntryFormListFormFields['buttons_order']>().toEqualTypeOf<
            IFormRecordStyle['buttons_order']
        >();
    });

    it('is carried by IEntryFormListStyle without changing style_name', () => {
        expectTypeOf<IEntryFormListStyle['style_name']>().toEqualTypeOf<'entry-form-list'>();
        expectTypeOf<IEntryFormListStyle['name']>().toEqualTypeOf<IContentField<string> | undefined>();
        expectTypeOf<IEntryFormListStyle['btn_update_label']>().toEqualTypeOf<
            IContentField<string> | undefined
        >();
    });
});
