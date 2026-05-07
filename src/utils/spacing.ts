/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Parse the unified `mantine_spacing_margin_padding` field. The CMS
 * stores this as a JSON string with optional keys for each side:
 *
 *   { "mt": "md", "mb": "lg", "ms": "0", "me": "auto",
 *     "pt": "sm", "pb": "sm", "ps": "md", "pe": "md" }
 *
 * Empty/null/missing values are filtered out so downstream renderers
 * can call e.g. `Object.entries(parsed)` without seeing falsy entries.
 */

export interface ISpacingValue {
    mt?: string;
    mb?: string;
    ms?: string;
    me?: string;
    pt?: string;
    pb?: string;
    ps?: string;
    pe?: string;
}

const ALLOWED_KEYS: ReadonlyArray<keyof ISpacingValue> = ['mt', 'mb', 'ms', 'me', 'pt', 'pb', 'ps', 'pe'];

export function parseSpacing(raw: string | null | undefined): ISpacingValue {
    if (!raw) return {};
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return {};
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const result: ISpacingValue = {};
    const obj = parsed as Record<string, unknown>;
    for (const key of ALLOWED_KEYS) {
        const value = obj[key];
        if (value === undefined || value === null || value === '') continue;
        result[key] = String(value);
    }
    return result;
}

/**
 * Convert spacing values to Tailwind classes via `SPACING_TO_TAILWIND`
 * mapping. Numeric values pass through as `mt-{n}` etc.
 */
export function spacingToClasses(
    spacing: ISpacingValue,
    spacingToTailwind: Record<string, string>
): string[] {
    const classes: string[] = [];
    for (const [key, raw] of Object.entries(spacing)) {
        if (!raw) continue;
        const tail = spacingToTailwind[raw] ?? raw;
        classes.push(`${key}-${tail}`);
    }
    return classes;
}
