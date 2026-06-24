/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, expect, it } from 'vitest';
import {
    MOBILE_RENDERER_VERSION,
    isMobileRendererCompatible,
    parseSemver,
} from '../version';

describe('mobile renderer compatibility (compatibility.mobile axis)', () => {
    it('exposes a valid semver MOBILE_RENDERER_VERSION constant', () => {
        const v = parseSemver(MOBILE_RENDERER_VERSION);
        expect(v.major).toBeGreaterThanOrEqual(0);
        expect(typeof v.minor).toBe('number');
        expect(typeof v.patch).toBe('number');
    });

    it('accepts a range that covers the host renderer version', () => {
        expect(isMobileRendererCompatible('>=0.1.0 <0.2.0', '0.1.0')).toBe(true);
        expect(isMobileRendererCompatible('^0.2.0', '0.2.3')).toBe(true);
        // Default host arg = MOBILE_RENDERER_VERSION.
        expect(isMobileRendererCompatible(`>=${MOBILE_RENDERER_VERSION}`)).toBe(true);
    });

    it('rejects a range outside the host renderer version', () => {
        expect(isMobileRendererCompatible('>=0.2.0', '0.1.0')).toBe(false);
        expect(isMobileRendererCompatible('<0.1.0', '0.1.0')).toBe(false);
    });

    it('treats a missing range as "no mobile support declared" (web-only plugin)', () => {
        expect(isMobileRendererCompatible(undefined)).toBe(false);
        expect(isMobileRendererCompatible('')).toBe(false);
    });

    it('never throws on a malformed range', () => {
        expect(isMobileRendererCompatible('not-a-range', '0.1.0')).toBe(false);
    });
});
