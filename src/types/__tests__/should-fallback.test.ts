/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import type { IPageContent } from '../pages';

describe('IPageContent.should_fallback contract', () => {
    it('accepts explicit true/false and absence without requiring sections inference', () => {
        const withTrue = { should_fallback: true } as Pick<IPageContent, 'should_fallback'>;
        const withFalse = { should_fallback: false } as Pick<IPageContent, 'should_fallback'>;
        const absent = {} as Pick<IPageContent, 'should_fallback'>;

        expect(withTrue.should_fallback === true).toBe(true);
        expect(withFalse.should_fallback === true).toBe(false);
        expect(absent.should_fallback === true).toBe(false);
    });
});
