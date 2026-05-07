/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * `classifyClass()` — one-shot decision for a single CMS class on mobile.
 *
 * Returns a tuple describing what the renderer should do:
 *   - 'allow'   — pass the class through unchanged
 *   - 'remap'   — pass the rewritten class through (`to` is the new value)
 *   - 'drop'    — do not pass the class through; renderer should warn
 *                 in development.
 */

import { CLASS_PATTERNS, LITERAL_CLASSES } from './allow-list';
import { findRemap } from './remap';

export type TClassDecision =
    | { kind: 'allow'; className: string }
    | { kind: 'remap'; from: string; to: string; reason?: string }
    | { kind: 'drop'; className: string; reason?: string };

function matchesPattern(className: string): boolean {
    for (const pattern of CLASS_PATTERNS) {
        if (!className.startsWith(pattern.prefix)) continue;
        const tail = className.slice(pattern.prefix.length);
        if (pattern.values.includes(tail)) return true;
    }
    return false;
}

export function classifyClass(rawClass: string): TClassDecision {
    const className = rawClass.trim();
    if (!className) return { kind: 'drop', className, reason: 'empty class' };

    // Variant prefixes (`md:`, `dark:`, `hover:`) — strip the prefix
    // before matching, but the remap table can also intercept them.
    const remap = findRemap(className);
    if (remap) {
        if (remap.to === null) {
            return { kind: 'drop', className, reason: remap.reason };
        }
        return { kind: 'remap', from: className, to: remap.to, reason: remap.reason };
    }

    // arbitrary value tail like `w-[120px]` — pass through, Uniwind handles it.
    if (className.includes('[') && className.endsWith(']')) {
        return { kind: 'allow', className };
    }

    if (LITERAL_CLASSES.has(className)) {
        return { kind: 'allow', className };
    }

    if (matchesPattern(className)) {
        return { kind: 'allow', className };
    }

    return { kind: 'drop', className, reason: 'not in mobile allow-list' };
}

/**
 * Run classifyClass over a whitespace-separated class string and return
 * the resulting list of allowed classes. The optional `onWarn` callback
 * fires for every drop/remap (use this in dev to spot CMS-side issues).
 */
export function classifyClassString(
    raw: string | null | undefined,
    onWarn?: (decision: Exclude<TClassDecision, { kind: 'allow' }>) => void
): string[] {
    if (!raw) return [];
    const out: string[] = [];
    for (const cls of raw.split(/\s+/)) {
        if (!cls) continue;
        const decision = classifyClass(cls);
        switch (decision.kind) {
            case 'allow':
                out.push(decision.className);
                break;
            case 'remap':
                out.push(decision.to);
                if (onWarn) onWarn(decision);
                break;
            case 'drop':
                if (onWarn) onWarn(decision);
                break;
        }
    }
    return out;
}
