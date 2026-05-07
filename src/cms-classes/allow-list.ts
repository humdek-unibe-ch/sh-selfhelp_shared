/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Tailwind classes the CMS may emit in `css_mobile`. Anything outside
 * this list (or the remap table) is dropped on mobile with a dev-only
 * warning. Web doesn't apply this filter (it has full Tailwind +
 * Mantine CSS) — only the mobile renderer does.
 *
 * Patterns we accept: a literal class string, OR a value-pattern using
 * the `IClassPattern` shape (e.g. `mt-{xs,sm,md,lg,xl,1..12}`).
 *
 * Keep this list curated. Adding a class also means making sure Uniwind
 * supports it on Native; if it doesn't, add an entry to `remap.ts` instead.
 */

export interface IClassPattern {
    /** Prefix including the dash, e.g. 'mt-', 'p-', 'text-'. */
    prefix: string;
    /** Allowed value tokens after the prefix. */
    values: readonly string[];
}

/** Mantine spacing tokens we anchor on (matches `theme/tokens.ts`). */
export const SPACING_VALUES = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

/** Mantine size tokens. */
export const SIZE_VALUES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

/** Mantine palette names. */
export const COLOR_NAMES = [
    'gray',
    'red',
    'pink',
    'grape',
    'violet',
    'indigo',
    'blue',
    'cyan',
    'teal',
    'green',
    'lime',
    'yellow',
    'orange',
    'dark',
] as const;

/** Mantine palette name + scale 0..9 (e.g. `text-blue-6`, `bg-gray-1`). */
const COLOR_SCALE_VALUES = COLOR_NAMES.flatMap((c) => Array.from({ length: 10 }, (_, i) => `${c}-${i}`));

const NUMERIC_1_12 = Array.from({ length: 12 }, (_, i) => String(i + 1));
const NUMERIC_0_12 = ['0', ...NUMERIC_1_12];

/**
 * Allow-listed class patterns. Each entry: `<prefix><value>` is allowed.
 * Atomic literal classes that need no value go in `LITERAL_CLASSES`.
 */
export const CLASS_PATTERNS: readonly IClassPattern[] = [
    // spacing
    { prefix: 'm-', values: [...SPACING_VALUES, ...NUMERIC_0_12, 'auto'] },
    { prefix: 'mt-', values: [...SPACING_VALUES, ...NUMERIC_0_12, 'auto'] },
    { prefix: 'mb-', values: [...SPACING_VALUES, ...NUMERIC_0_12, 'auto'] },
    { prefix: 'ms-', values: [...SPACING_VALUES, ...NUMERIC_0_12, 'auto'] },
    { prefix: 'me-', values: [...SPACING_VALUES, ...NUMERIC_0_12, 'auto'] },
    { prefix: 'ml-', values: [...SPACING_VALUES, ...NUMERIC_0_12, 'auto'] },
    { prefix: 'mr-', values: [...SPACING_VALUES, ...NUMERIC_0_12, 'auto'] },
    { prefix: 'mx-', values: [...SPACING_VALUES, ...NUMERIC_0_12, 'auto'] },
    { prefix: 'my-', values: [...SPACING_VALUES, ...NUMERIC_0_12, 'auto'] },
    { prefix: 'p-', values: [...SPACING_VALUES, ...NUMERIC_0_12] },
    { prefix: 'pt-', values: [...SPACING_VALUES, ...NUMERIC_0_12] },
    { prefix: 'pb-', values: [...SPACING_VALUES, ...NUMERIC_0_12] },
    { prefix: 'ps-', values: [...SPACING_VALUES, ...NUMERIC_0_12] },
    { prefix: 'pe-', values: [...SPACING_VALUES, ...NUMERIC_0_12] },
    { prefix: 'pl-', values: [...SPACING_VALUES, ...NUMERIC_0_12] },
    { prefix: 'pr-', values: [...SPACING_VALUES, ...NUMERIC_0_12] },
    { prefix: 'px-', values: [...SPACING_VALUES, ...NUMERIC_0_12] },
    { prefix: 'py-', values: [...SPACING_VALUES, ...NUMERIC_0_12] },
    { prefix: 'gap-', values: [...SPACING_VALUES, ...NUMERIC_0_12] },
    // sizing
    { prefix: 'w-', values: [...SIZE_VALUES, 'full', 'auto', 'fit', '1/2', '1/3', '2/3', '1/4', '3/4'] },
    { prefix: 'h-', values: [...SIZE_VALUES, 'full', 'auto', 'fit'] },
    { prefix: 'min-w-', values: ['0', 'full', 'fit'] },
    { prefix: 'min-h-', values: ['0', 'full', 'fit', 'screen'] },
    { prefix: 'max-w-', values: [...SIZE_VALUES, 'full', 'fit', 'screen', 'none'] },
    { prefix: 'max-h-', values: [...SIZE_VALUES, 'full', 'screen', 'none'] },
    // typography
    { prefix: 'text-', values: [...SIZE_VALUES, 'left', 'center', 'right', 'justify', ...COLOR_SCALE_VALUES] },
    { prefix: 'font-', values: ['thin', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'] },
    { prefix: 'leading-', values: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'] },
    { prefix: 'tracking-', values: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'] },
    // background
    { prefix: 'bg-', values: ['transparent', 'white', 'black', ...COLOR_SCALE_VALUES] },
    // border
    { prefix: 'border-', values: ['0', '1', '2', '4', ...COLOR_SCALE_VALUES] },
    { prefix: 'rounded-', values: ['none', ...SIZE_VALUES, 'full'] },
    // flex
    { prefix: 'flex-', values: ['1', 'auto', 'initial', 'none', 'row', 'col', 'row-reverse', 'col-reverse', 'wrap', 'nowrap'] },
    { prefix: 'items-', values: ['start', 'end', 'center', 'baseline', 'stretch'] },
    { prefix: 'justify-', values: ['start', 'end', 'center', 'between', 'around', 'evenly'] },
    { prefix: 'self-', values: ['auto', 'start', 'end', 'center', 'stretch', 'baseline'] },
    // grid
    { prefix: 'col-span-', values: NUMERIC_1_12 },
    { prefix: 'row-span-', values: NUMERIC_1_12 },
    // opacity
    { prefix: 'opacity-', values: ['0', '25', '50', '75', '100'] },
    // z-index
    { prefix: 'z-', values: ['0', '10', '20', '30', '40', '50', 'auto'] },
];

/** Atomic literal classes (no value tail) safe to pass through. */
export const LITERAL_CLASSES: ReadonlySet<string> = new Set([
    'flex',
    'inline-flex',
    'block',
    'inline-block',
    'inline',
    'hidden',
    'absolute',
    'relative',
    'sticky',
    'fixed',
    'overflow-hidden',
    'overflow-visible',
    'overflow-scroll',
    'overflow-auto',
    'overflow-x-hidden',
    'overflow-y-hidden',
    'overflow-x-auto',
    'overflow-y-auto',
    'rounded',
    'border',
    'shadow',
    'shadow-sm',
    'shadow-md',
    'shadow-lg',
    'shadow-xl',
    'italic',
    'underline',
    'line-through',
    'no-underline',
    'uppercase',
    'lowercase',
    'capitalize',
    'normal-case',
    'truncate',
    'whitespace-nowrap',
    'whitespace-pre',
    'whitespace-pre-wrap',
    'pointer-events-none',
    'pointer-events-auto',
    'select-none',
    'select-text',
    'opacity-50',
    'cursor-pointer',
    'cursor-default',
    'cursor-not-allowed',
]);
