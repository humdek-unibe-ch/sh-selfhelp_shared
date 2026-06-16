/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for @selfhelp/shared.
 *
 * `npm test` keeps Vitest's default test discovery. `npm run test:coverage`
 * additionally enforces a BLOCKING coverage gate (canonical Testing Rule 20,
 * plan §18/§23: coverage gate flips from warning -> blocking).
 *
 * The gate is scoped to the deterministic, framework-free runtime helpers
 * that the frontend AND mobile both consume (interpolation, condition,
 * asset-URL, CMS-class classifier, page transform). These are the contract
 * surfaces where a coverage drop is a real risk; type-only and data/registry
 * modules are intentionally out of scope because measuring "line coverage"
 * on declarations is noise. New runtime helpers added here must keep this
 * bundle at or above the threshold (>= 60% lines/functions/statements/branches).
 *
 * NOTE on the provider: we use `istanbul`, not `v8`. The v8 provider
 * double-counts each file on Windows (one real entry + one phantom 0% entry
 * under a differently-cased drive-letter path), which never merges, halves the
 * reported number, and makes the gate fail locally even though real coverage is
 * ~90%. Istanbul keys coverage by the resolved module path, so the numbers are
 * consistent on Windows and CI. Every helper in `include` is imported by a test
 * in this repo; if a brand-new helper is added here without a test, add the test
 * in the same change (canonical Rule 1).
 */
export default defineConfig({
    test: {
        coverage: {
            provider: 'istanbul',
            // json-summary keeps the gate cheap; text prints a console table
            // locally and in CI logs.
            reporter: ['text', 'json-summary'],
            include: [
                'src/interpolation/**/*.ts',
                'src/condition/**/*.ts',
                'src/assets/**/*.ts',
                'src/cms-classes/classify.ts',
                'src/utils/transformPageData.ts',
            ],
            exclude: ['**/__tests__/**', '**/index.ts'],
            thresholds: {
                lines: 60,
                functions: 60,
                statements: 60,
                branches: 60,
            },
        },
    },
});
