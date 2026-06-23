/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Cross-platform inline-formatting helpers for CMS content fields.
 *
 * ## Why
 *
 * CMS authors can apply lightweight inline formatting (Ctrl+B bold, Ctrl+I
 * italic, Ctrl+U underline, links) to content fields whose field type allows it
 * (`markdown-inline`). The editor stores that as a tiny HTML subset
 * (`<strong>`/`<b>`, `<em>`/`<i>`, `<u>`, `<a>`), often wrapped in block tags
 * (`<p>`, `<div>`) that markdown processing leaves behind.
 *
 * Web can render that subset as real inline HTML, but React Native `<Text>`
 * cannot render HTML at all — so historically mobile (and several web leaf slots)
 * stripped everything to plain text and the bold was lost. To carry the same
 * formatting to BOTH platforms we parse the subset once, here, into a flat list
 * of {@link IInlineNode} runs. Each platform then renders the runs natively:
 *
 *   - web  → a fragment of `<strong>/<em>/<u>/<a>` (see frontend `InlineRich`)
 *   - mobile → nested `<Text>` with `fontWeight`/`fontStyle`/`textDecorationLine`
 *     (see mobile `InlineText`)
 *
 * ## Scope (deliberately tiny + safe)
 *
 * Only the inline subset above survives. **Block** tags (`<p>`, `<div>`,
 * `<h1>`…`<h6>`, `<ul>`/`<ol>`/`<li>`, `<blockquote>`, `<br>`) collapse to a
 * single space — an inline text slot (a label, a paragraph run) cannot lay out
 * block structure, and flattening matches the old strip behaviour. Any other tag
 * is dropped while keeping its inner text. HTML entities are decoded.
 *
 * ## JSON-aware (HARD)
 *
 * Some content fields legitimately hold JSON (config blobs, table/segmented
 * data). Those are read via `readField`, not these helpers, but as a safety net
 * a value that parses as JSON is returned untouched so structured payloads are
 * never mangled.
 *
 * This module is the canonical home the style docs refer to; the web
 * `stripHtmlTags` and mobile `stripHtmlToText` local copies mirror
 * {@link stripHtmlToText} and are folded into this once consumers adopt it.
 */

/** A single run of text with the inline formatting that applies to it. */
export interface IInlineNode {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    /** Present when the run sits inside an `<a href>`; the resolved target. */
    href?: string;
}

const HTML_ENTITIES: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&#x2f;': '/',
    '&#47;': '/',
};

function decodeEntities(value: string): string {
    if (!value.includes('&')) return value;
    return value.replace(/&[a-zA-Z#0-9]+;/g, (entity) => HTML_ENTITIES[entity.toLowerCase()] ?? entity);
}

function looksLikeJson(trimmed: string): boolean {
    const first = trimmed[0];
    if (first !== '{' && first !== '[') return false;
    try {
        JSON.parse(trimmed);
        return true;
    } catch {
        return false;
    }
}

/**
 * Tags whose boundaries collapse to a single space. An inline text slot cannot
 * lay out blocks, so `<p>`/`<div>`/headings/lists/`<br>` become whitespace.
 */
const SEPARATOR_TAGS = new Set([
    'br', 'p', 'div', 'li', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'tr', 'section', 'article', 'header', 'footer', 'pre',
]);

/** Quick test for "does this string carry any of the supported inline tags". */
const INLINE_TAG_RE = /<(?:b|strong|i|em|u|a)\b/i;
const TAG_RE = /<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi;
const HREF_RE = /href\s*=\s*(?:"([^"]*)"|'([^']*)')/i;

function extractHref(attrs: string): string {
    const match = HREF_RE.exec(attrs);
    return (match?.[1] ?? match?.[2] ?? '').trim();
}

function formatKey(node: IInlineNode): string {
    return `${node.bold ? 1 : 0}|${node.italic ? 1 : 0}|${node.underline ? 1 : 0}|${node.href ?? ''}`;
}

/**
 * Parse a CMS content string into a flat list of inline-formatted runs,
 * preserving only the safe inline subset. Block tags + `<br>` collapse to
 * spaces; entities are decoded; a JSON payload is returned as one untouched run.
 * Adjacent runs that share formatting are merged and outer whitespace trimmed.
 */
export function parseInlineRich(value: string | null | undefined): IInlineNode[] {
    if (value == null) return [];
    const str = String(value);
    if (str === '') return [];

    const trimmed = str.trim();
    if (looksLikeJson(trimmed)) return [{ text: str }];

    // Fast path: no markup at all.
    if (!str.includes('<')) {
        const text = decodeEntities(str);
        return text === '' ? [] : [{ text }];
    }

    const raw: IInlineNode[] = [];
    let bold = 0;
    let italic = 0;
    let underline = 0;
    const hrefStack: string[] = [];

    const pushText = (segment: string): void => {
        if (segment === '') return;
        raw.push({
            text: segment,
            ...(bold > 0 ? { bold: true } : {}),
            ...(italic > 0 ? { italic: true } : {}),
            ...(underline > 0 ? { underline: true } : {}),
            ...(hrefStack.length > 0 ? { href: hrefStack[hrefStack.length - 1] } : {}),
        });
    };

    let lastIndex = 0;
    let match: RegExpExecArray | null;
    TAG_RE.lastIndex = 0;
    while ((match = TAG_RE.exec(str)) !== null) {
        pushText(str.slice(lastIndex, match.index));
        lastIndex = TAG_RE.lastIndex;

        const isClose = match[0].charAt(1) === '/';
        const tag = match[1].toLowerCase();
        const attrs = match[2] ?? '';

        if (tag === 'b' || tag === 'strong') {
            bold = isClose ? Math.max(0, bold - 1) : bold + 1;
        } else if (tag === 'i' || tag === 'em') {
            italic = isClose ? Math.max(0, italic - 1) : italic + 1;
        } else if (tag === 'u') {
            underline = isClose ? Math.max(0, underline - 1) : underline + 1;
        } else if (tag === 'a') {
            if (isClose) {
                hrefStack.pop();
            } else {
                hrefStack.push(extractHref(attrs));
            }
        } else if (SEPARATOR_TAGS.has(tag)) {
            pushText(' ');
        }
        // Any other tag: drop the tag, keep the surrounding text.
    }
    pushText(str.slice(lastIndex));

    // Merge adjacent runs that share formatting.
    const merged: IInlineNode[] = [];
    for (const node of raw) {
        const prev = merged[merged.length - 1];
        if (prev && formatKey(prev) === formatKey(node)) {
            prev.text += node.text;
        } else {
            merged.push({ ...node });
        }
    }

    // Decode entities + collapse whitespace, then trim the outer edges.
    for (const node of merged) {
        node.text = decodeEntities(node.text).replace(/\s+/g, ' ');
    }
    if (merged.length > 0) {
        merged[0].text = merged[0].text.replace(/^\s+/, '');
        merged[merged.length - 1].text = merged[merged.length - 1].text.replace(/\s+$/, '');
    }
    return merged.filter((node) => node.text !== '');
}

/**
 * Does this value carry any of the supported inline tags? Used by renderers to
 * fast-path plain strings (and to skip JSON). Cheap: no full parse.
 */
export function hasInlineFormatting(value: string | null | undefined): boolean {
    if (value == null) return false;
    const str = String(value);
    if (!str.includes('<')) return false;
    if (looksLikeJson(str.trim())) return false;
    return INLINE_TAG_RE.test(str);
}

/**
 * Strip a content string to readable plain text: drop every tag, decode common
 * entities, collapse whitespace. Block tags + `<br>` become spaces so words do
 * not run together. JSON payloads and tag-free strings are returned untouched
 * (apart from entity decoding), so it is safe to call on any field.
 *
 * This is the canonical cross-platform helper (web `stripHtmlTags` / mobile
 * `stripHtmlToText` mirror it).
 */
export function stripHtmlToText(value: string | null | undefined): string {
    if (!value || typeof value !== 'string') return value ?? '';

    const trimmed = value.trim();
    if (looksLikeJson(trimmed)) return value;
    if (!/[<&]/.test(value)) return value;

    let out = value
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, ' ')
        .replace(/<[^>]+>/g, '');

    out = out.replace(/&[a-zA-Z#0-9]+;/g, (entity) => HTML_ENTITIES[entity.toLowerCase()] ?? entity);

    return out.replace(/\s+/g, ' ').trim();
}
