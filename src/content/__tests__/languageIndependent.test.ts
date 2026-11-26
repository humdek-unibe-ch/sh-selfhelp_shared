/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import {
    LANGUAGE_INDEPENDENT_ID,
    LANGUAGE_INDEPENDENT_LOCALE,
    isLanguageIndependent,
} from '../languageIndependent';

describe('isLanguageIndependent', () => {
    it('is true only for the sentinel id 1', () => {
        expect(LANGUAGE_INDEPENDENT_ID).toBe(1);
        expect(LANGUAGE_INDEPENDENT_LOCALE).toBe('all');
        expect(isLanguageIndependent(1)).toBe(true);
        expect(isLanguageIndependent(LANGUAGE_INDEPENDENT_ID)).toBe(true);
    });

    it('is false for a real language, null and undefined', () => {
        expect(isLanguageIndependent(2)).toBe(false);
        expect(isLanguageIndependent(null)).toBe(false);
        expect(isLanguageIndependent(undefined)).toBe(false);
    });
});
