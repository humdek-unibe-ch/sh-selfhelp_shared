/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Mobile plugin text helpers (C30): `plugin-sdk` is the only package a plugin
 * may import, so it re-exports `parseInlineRich`, `stripHtmlToText` and
 * `IInlineNode`. They must be the one implementation in `src/content`, not a
 * copy.
 */
import { describe, expect, it } from 'vitest';

import * as inlineFormat from '../../content/inlineFormat';
import * as sdk from '../index';
import type { IInlineNode } from '../index';

describe('plugin-sdk text helpers for native mobile plugin text', () => {
    it('re-exports the same parseInlineRich and stripHtmlToText as src/content/inlineFormat', () => {
        expect(sdk.parseInlineRich).toBe(inlineFormat.parseInlineRich);
        expect(sdk.stripHtmlToText).toBe(inlineFormat.stripHtmlToText);
    });

    it('works through the SDK entry on inline HTML', () => {
        const nodes: IInlineNode[] = sdk.parseInlineRich('a <b>bold</b> <a href="https://x.test">link</a>');
        expect(nodes.some((node) => node.bold === true && node.text === 'bold')).toBe(true);
        expect(nodes.some((node) => node.href === 'https://x.test' && node.text === 'link')).toBe(true);
        expect(sdk.stripHtmlToText('<p>Hello <b>you</b></p>')).toBe('Hello you');
    });
});
