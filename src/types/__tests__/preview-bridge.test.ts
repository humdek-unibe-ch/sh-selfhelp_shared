/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Live Preview bridge contract tests.
 *
 * The shell and both frame bridges trust `isPreviewBridgeMessage` to narrow
 * arbitrary cross-frame `postMessage` data, and derive the cross-platform sync
 * unit with `previewKeywordFromPath`. These lock both: a malformed/foreign
 * message must be rejected, a well-formed one in either direction accepted, and
 * web/mobile paths must reduce to the same keyword (so sync can't drift).
 */
import { describe, expect, it } from 'vitest';
import {
    PREVIEW_BRIDGE_MESSAGE,
    isPreviewBridgeMessage,
    previewKeywordFromPath,
    type TPreviewBridgeMessage,
} from '../preview-bridge';

describe('isPreviewBridgeMessage', () => {
    it('accepts a frame->shell navigated message (the user clicked a link)', () => {
        const msg: TPreviewBridgeMessage = {
            type: PREVIEW_BRIDGE_MESSAGE.NAVIGATED,
            source: 'web',
            keyword: 'impressum',
            href: '/impressum?previewShell=1',
            locale: 'de-CH',
        };
        expect(isPreviewBridgeMessage(msg)).toBe(true);
    });

    it('accepts a navigated message for home (keyword null) and a ready message', () => {
        expect(
            isPreviewBridgeMessage({
                type: PREVIEW_BRIDGE_MESSAGE.NAVIGATED,
                source: 'mobile',
                keyword: null,
                href: '/',
            }),
        ).toBe(true);
        expect(
            isPreviewBridgeMessage({ type: PREVIEW_BRIDGE_MESSAGE.READY, source: 'mobile' }),
        ).toBe(true);
    });

    it('accepts a shell->frame navigate command (keyword or null)', () => {
        expect(
            isPreviewBridgeMessage({ type: PREVIEW_BRIDGE_MESSAGE.NAVIGATE, keyword: 'team' }),
        ).toBe(true);
        expect(
            isPreviewBridgeMessage({ type: PREVIEW_BRIDGE_MESSAGE.NAVIGATE, keyword: null }),
        ).toBe(true);
    });

    it('rejects foreign / malformed messages so cross-frame noise is ignored', () => {
        expect(isPreviewBridgeMessage(null)).toBe(false);
        expect(isPreviewBridgeMessage('selfhelp-preview:navigate')).toBe(false);
        expect(isPreviewBridgeMessage({ type: 'webpack:hot-update' })).toBe(false);
        // wrong source
        expect(
            isPreviewBridgeMessage({ type: PREVIEW_BRIDGE_MESSAGE.READY, source: 'desktop' }),
        ).toBe(false);
        // navigated without href
        expect(
            isPreviewBridgeMessage({
                type: PREVIEW_BRIDGE_MESSAGE.NAVIGATED,
                source: 'web',
                keyword: 'x',
            }),
        ).toBe(false);
        // navigate with a non-string keyword
        expect(
            isPreviewBridgeMessage({ type: PREVIEW_BRIDGE_MESSAGE.NAVIGATE, keyword: 5 }),
        ).toBe(false);
    });
});

describe('previewKeywordFromPath', () => {
    it('reduces web and mobile paths to the same keyword (no drift)', () => {
        expect(previewKeywordFromPath('/impressum')).toBe('impressum');
        expect(previewKeywordFromPath('impressum')).toBe('impressum');
        expect(previewKeywordFromPath('/impressum/')).toBe('impressum');
        expect(previewKeywordFromPath('/impressum?previewShell=1')).toBe('impressum');
        expect(previewKeywordFromPath('/impressum#section')).toBe('impressum');
    });

    it('treats home / empty as null (the shared "home" sentinel)', () => {
        expect(previewKeywordFromPath('/')).toBeNull();
        expect(previewKeywordFromPath('')).toBeNull();
        expect(previewKeywordFromPath(null)).toBeNull();
        expect(previewKeywordFromPath(undefined)).toBeNull();
    });

    it('keeps multi-segment keywords and decodes percent-encoding', () => {
        expect(previewKeywordFromPath('/projects/alpha')).toBe('projects/alpha');
        expect(previewKeywordFromPath('/caf%C3%A9')).toBe('café');
    });
});
