/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Fails when source under `src/` still compares against bare language id 1 or
 * locale `all`. The constant module itself and every `__tests__` folder are
 * excluded; clients must import `LANGUAGE_INDEPENDENT_*` / `isLanguageIndependent`.
 */
const SRC_ROOT = join(__dirname, '..', '..');
const OWN_MODULE = join('content', 'languageIndependent.ts');

const FORBIDDEN = [
    /language_id\s*===\s*1\b/,
    /language_id\s*!==\s*1\b/,
    /languageId\s*===\s*1\b/,
    /language_id\s*>\s*1\b/,
    /locale\s*===\s*['"]all['"]/,
] as const;

function listSourceFiles(dir: string): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        const st = statSync(full);
        if (st.isDirectory()) {
            if (name === '__tests__' || name === 'node_modules' || name === 'dist') {
                continue;
            }
            out.push(...listSourceFiles(full));
            continue;
        }
        if (/\.(ts|tsx|js|mjs|cjs)$/.test(name) && !name.endsWith('.d.ts')) {
            out.push(full);
        }
    }
    return out;
}

describe('language-independent literals in src/', () => {
    it('uses LANGUAGE_INDEPENDENT_* / isLanguageIndependent instead of bare 1 or locale all', () => {
        const hits: string[] = [];
        for (const file of listSourceFiles(SRC_ROOT)) {
            const rel = relative(SRC_ROOT, file).split(sep).join('/');
            if (rel === OWN_MODULE.replace(/\\/g, '/')) {
                continue;
            }
            const text = readFileSync(file, 'utf8');
            for (const pattern of FORBIDDEN) {
                if (pattern.test(text)) {
                    hits.push(`${rel} matches ${pattern}`);
                }
            }
        }
        expect(hits).toEqual([]);
    });
});
