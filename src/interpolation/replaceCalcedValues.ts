/**
 * Mirrors the backend `PageDb::replace_calced_values()` regex:
 *
 *     ~{{({{)?(.*?)(}})?}}~s
 *
 * Replaces every `{{name}}` or `{{{{name}}}}` occurrence in the input
 * string with `values[name]`. Unknown placeholders are left intact so
 * editors notice them and so we never accidentally render `undefined`.
 */

const PLACEHOLDER_RE = /{{({{)?([^{}]+?)(}})?}}/g;

export type TCalcedValues = Record<string, string | number | boolean | null | undefined>;

export function replaceCalcedValues(input: string | null | undefined, values: TCalcedValues): string {
    if (input === null || input === undefined) return '';
    return String(input).replace(PLACEHOLDER_RE, (full, _open, key) => {
        const trimmed = String(key).trim();
        const value = values[trimmed];
        if (value === undefined || value === null) return full;
        return String(value);
    });
}
