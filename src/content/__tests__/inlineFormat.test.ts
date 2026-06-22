/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, it, expect } from 'vitest';
import { parseInlineRich, hasInlineFormatting, stripHtmlToText } from '../inlineFormat';

describe('parseInlineRich', () => {
    it('returns a single plain run for tag-free text', () => {
        expect(parseInlineRich('hello world')).toEqual([{ text: 'hello world' }]);
    });

    it('returns an empty list for empty / nullish input', () => {
        expect(parseInlineRich('')).toEqual([]);
        expect(parseInlineRich(null)).toEqual([]);
        expect(parseInlineRich(undefined)).toEqual([]);
    });

    it('marks <strong> and <b> as bold', () => {
        expect(parseInlineRich('a <strong>bold</strong> c')).toEqual([
            { text: 'a ' },
            { text: 'bold', bold: true },
            { text: ' c' },
        ]);
        expect(parseInlineRich('<b>x</b>')).toEqual([{ text: 'x', bold: true }]);
    });

    it('marks <em>/<i> as italic and <u> as underline (merging same-format runs)', () => {
        // <em>e</em><i>i</i> are both italic and adjacent, so they merge.
        expect(parseInlineRich('<em>e</em><i>i</i><u>u</u>')).toEqual([
            { text: 'ei', italic: true },
            { text: 'u', underline: true },
        ]);
    });

    it('combines nested formatting into one run', () => {
        expect(parseInlineRich('<strong>bold <em>both</em></strong>')).toEqual([
            { text: 'bold ', bold: true },
            { text: 'both', bold: true, italic: true },
        ]);
    });

    it('captures the href on anchor runs', () => {
        expect(parseInlineRich('see <a href="https://x.test">here</a>')).toEqual([
            { text: 'see ' },
            { text: 'here', href: 'https://x.test' },
        ]);
    });

    it('flattens the leading <p> wrapper the editor leaves behind', () => {
        // The exact "label authored as plain text but stored wrapped" case.
        expect(parseInlineRich('<p class="single-line-paragraph">9 STEF</p>')).toEqual([
            { text: '9 STEF' },
        ]);
    });

    it('collapses block tags + <br> to single spaces', () => {
        expect(parseInlineRich('<p>a</p><p>b</p>')).toEqual([{ text: 'a b' }]);
        expect(parseInlineRich('line<br/>break')).toEqual([{ text: 'line break' }]);
    });

    it('keeps bold across a block boundary as separate runs', () => {
        expect(parseInlineRich('<p><strong>A</strong></p><p>b</p>')).toEqual([
            { text: 'A', bold: true },
            { text: ' b' },
        ]);
    });

    it('decodes HTML entities', () => {
        expect(parseInlineRich('a &amp; <strong>b&nbsp;c</strong>')).toEqual([
            { text: 'a & ' },
            { text: 'b c', bold: true },
        ]);
    });

    it('drops unknown tags but keeps their text', () => {
        expect(parseInlineRich('<span class="x">keep</span>')).toEqual([{ text: 'keep' }]);
    });

    it('never touches structured JSON payloads', () => {
        const json = '{"type":"array","items":["a","b"]}';
        expect(parseInlineRich(json)).toEqual([{ text: json }]);
    });
});

describe('hasInlineFormatting', () => {
    it('is true only when a supported inline tag is present', () => {
        expect(hasInlineFormatting('<strong>x</strong>')).toBe(true);
        expect(hasInlineFormatting('<em>x</em>')).toBe(true);
        expect(hasInlineFormatting('<a href="#">x</a>')).toBe(true);
    });

    it('is false for plain text, block-only markup, and JSON', () => {
        expect(hasInlineFormatting('plain')).toBe(false);
        expect(hasInlineFormatting('<p>plain</p>')).toBe(false);
        expect(hasInlineFormatting('{"a":1}')).toBe(false);
        expect(hasInlineFormatting(null)).toBe(false);
    });
});

describe('stripHtmlToText', () => {
    it('strips tags to readable plain text', () => {
        expect(stripHtmlToText('<p>a</p><p>b</p>')).toBe('a b');
        expect(stripHtmlToText('<strong>bold</strong> text')).toBe('bold text');
    });

    it('leaves tag-free strings and JSON untouched', () => {
        expect(stripHtmlToText('plain')).toBe('plain');
        const json = '{"a":1}';
        expect(stripHtmlToText(json)).toBe(json);
    });

    it('decodes entities', () => {
        expect(stripHtmlToText('a &amp; b')).toBe('a & b');
    });
});
