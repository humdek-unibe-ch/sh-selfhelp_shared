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

export const CLASS_REMAP: readonly IClassRemap[] = [
    // hover/focus on mobile only fires for keyboard nav; safe to drop.
    { from: 'hover:bg-gray-100', to: null, reason: 'hover not applicable on mobile' },
    { from: 'hover:underline', to: null, reason: 'hover not applicable on mobile' },
    // cursor classes are no-ops on RN.
    { from: 'cursor-pointer', to: null, reason: 'no cursor on RN' },
    { from: 'cursor-default', to: null, reason: 'no cursor on RN' },
    { from: 'cursor-not-allowed', to: null, reason: 'no cursor on RN' },
    // select-text behaves slightly differently on RN; keep but as a soft no-op.
    { from: 'select-text', to: null, reason: 'unsupported on RN' },
    // legacy aliases
    { from: 'mantine-fw', to: 'w-full' },
    { from: 'mantine-h-full', to: 'h-full' },
];

const REMAP_MAP = new Map<string, IClassRemap>(CLASS_REMAP.map((r) => [r.from, r]));

export function findRemap(className: string): IClassRemap | undefined {
    return REMAP_MAP.get(className);
}
