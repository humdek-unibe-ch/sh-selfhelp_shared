/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

/**
 * Regression coverage for the cross-repo schema-parity checker.
 *
 * The script (`scripts/check-schema-parity.mjs`) is the contract-drift safety
 * net: it fails CI when a shared TS type stops covering a required field of the
 * backend JSON schema it mirrors. This test runs the real script as a child
 * process and asserts the binary contract:
 *   - no DRIFT / ERROR lines and a zero exit (the gate is green), and
 *   - a readable SUMMARY/RESULT footer.
 *
 * The backend schemas are read from a sibling `../sh-selfhelp_backend` checkout
 * (present locally and in shared-tests.yml CI). When that sibling is absent the
 * script SKIPs cleanly and still exits 0, so the first two assertions hold in
 * every environment; the contract-specific assertions are guarded on the
 * schemas actually being available.
 */
const SCRIPT = path.resolve(process.cwd(), 'scripts/check-schema-parity.mjs');

function runParity(): { status: number; output: string } {
    try {
        const output = execFileSync('node', [SCRIPT], { encoding: 'utf8' });
        return { status: 0, output };
    } catch (err: unknown) {
        const e = err as { status?: number; stdout?: string; stderr?: string };
        return { status: e.status ?? 1, output: `${e.stdout ?? ''}${e.stderr ?? ''}` };
    }
}

describe('check-schema-parity script', () => {
    const { status, output } = runParity();
    const backendSchemasPresent = !output.includes('SKIP: backend API schema dir not found');

    it('reports no contract drift and exits zero', () => {
        expect(output).not.toMatch(/^DRIFT:/m);
        expect(output).not.toMatch(/^ERROR:/m);
        expect(status).toBe(0);
    });

    it('prints a readable SUMMARY/RESULT footer', () => {
        expect(output).toMatch(/^SUMMARY: \d+ OK/m);
        expect(output).toContain('RESULT: OK');
    });

    it('covers the auth, page and form response contracts when the backend is present', () => {
        if (!backendSchemasPresent) {
            // No sibling backend checkout -> the script SKIPs the response
            // contracts; the binary green assertions above still apply.
            expect(output).toContain('RESULT: OK');
            return;
        }
        expect(output).toContain('auth user-data');
        expect(output).toContain('CMS page payload');
        expect(output).toContain('form submit data');
        expect(output).toContain('form update data');
        // The form-submit drift was resolved (no longer a tolerated warning).
        expect(output).not.toContain('known-drift');
    });
});
