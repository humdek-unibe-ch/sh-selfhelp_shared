/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Web -> mobile class remap. Some Tailwind classes are valid on web but
 * have no mobile equivalent (or have a different name in Uniwind). This
 * table runs BEFORE the allow-list check.
 *
 * Rules of thumb:
 *   - drop classes that don't make sense on mobile (`select-text` is a no-op on RN, `cursor-*`, `hover:*`).
 *   - rewrite logical pairs (e.g. mobile prefers `text-center` over `text-left` defaults — leave alone).
 *   - alias common Mantine-flavored utility names users may type.
 */

export interface IClassRemap {
    /** Class to rewrite. */
    from: string;
    /** Replacement class, or null to drop the class entirely. */
    to: string | null;
    /** Optional reason surfaced via dev warning. */
    reason?: string;
}

/**
 * Standard Tailwind numeric color scale (`50..950`) → Mantine hex-backed
 * scale index (`0..9`). The web dropdown (`generate-css-classes.js`) offers
 * the standard Tailwind scale, but Tailwind v4's default palette is authored
 * in `oklch()`, which React Native cannot parse — only the Mantine palettes
 * carried by the shared preset (`theme/tailwind.ts`, indices `0..9`) resolve
 * to RN-safe hex. So we rewrite the dropdown's standard scale onto the Mantine
 * scale instead of dropping it. The shade is the closest visual match; this is
 * a deliberate, documented web→mobile remap.
 */
const TW_SCALE_TO_MANTINE: Readonly<Record<string, string>> = {
    '50': '0',
    '100': '1',
    '200': '2',
    '300': '3',
    '400': '4',
    '500': '6',
    '600': '7',
    '700': '8',
    '800': '9',
    '900': '9',
    '950': '9',
};

/**
 * Tailwind color name → Mantine palette name. Only Mantine palettes have an
 * RN-safe hex scale in the shared preset; Tailwind-only names (`slate`,
 * `purple`, `sky`, …) are aliased to their nearest Mantine palette.
 */
const TW_NAME_TO_MANTINE: Readonly<Record<string, string>> = {
    slate: 'gray',
    gray: 'gray',
    zinc: 'gray',
    neutral: 'gray',
    stone: 'gray',
    red: 'red',
    rose: 'pink',
    pink: 'pink',
    fuchsia: 'grape',
    purple: 'grape',
    grape: 'grape',
    violet: 'violet',
    indigo: 'indigo',
    blue: 'blue',
    sky: 'cyan',
    cyan: 'cyan',
    teal: 'teal',
    emerald: 'green',
    green: 'green',
    lime: 'lime',
    yellow: 'yellow',
    amber: 'orange',
    orange: 'orange',
};

const COLOR_PREFIXES = ['bg-', 'text-', 'border-'] as const;

/** Build the `{prefix}{twName}-{twScale}` → `{prefix}{mantineName}-{idx}` remaps. */
function buildColorScaleRemaps(): IClassRemap[] {
    const out: IClassRemap[] = [];
    for (const prefix of COLOR_PREFIXES) {
        for (const [twName, mantineName] of Object.entries(TW_NAME_TO_MANTINE)) {
            for (const [twScale, idx] of Object.entries(TW_SCALE_TO_MANTINE)) {
                out.push({
                    from: `${prefix}${twName}-${twScale}`,
                    to: `${prefix}${mantineName}-${idx}`,
                    reason: 'tailwind oklch scale → mantine hex scale (RN-safe)',
                });
            }
        }
    }
    return out;
}

/** Interactive-state classes the web dropdown offers but RN can't honour. */
const INTERACTIVE_DROP = [
    'hover:bg-gray-100',
    'hover:bg-blue-600',
    'hover:bg-green-600',
    'hover:bg-red-600',
    'hover:text-blue-600',
    'hover:text-green-600',
    'hover:text-red-600',
    'hover:shadow-md',
    'hover:shadow-lg',
    'hover:underline',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:ring-offset-2',
].map((from): IClassRemap => ({ from, to: null, reason: 'interactive state not applicable on mobile' }));

export const CLASS_REMAP: readonly IClassRemap[] = [
    ...INTERACTIVE_DROP,
    // cursor classes are no-ops on RN.
    { from: 'cursor-pointer', to: null, reason: 'no cursor on RN' },
    { from: 'cursor-default', to: null, reason: 'no cursor on RN' },
    { from: 'cursor-not-allowed', to: null, reason: 'no cursor on RN' },
    // select-text behaves slightly differently on RN; keep but as a soft no-op.
    { from: 'select-text', to: null, reason: 'unsupported on RN' },
    // legacy aliases
    { from: 'mantine-fw', to: 'w-full' },
    { from: 'mantine-h-full', to: 'h-full' },
    // standard Tailwind color scale → Mantine hex scale (RN-safe)
    ...buildColorScaleRemaps(),
];

const REMAP_MAP = new Map<string, IClassRemap>(CLASS_REMAP.map((r) => [r.from, r]));

export function findRemap(className: string): IClassRemap | undefined {
    return REMAP_MAP.get(className);
}
