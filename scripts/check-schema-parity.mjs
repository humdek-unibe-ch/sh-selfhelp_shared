#!/usr/bin/env node
/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/

/**
 * Schema-parity check for the @selfhelp/shared plugin SDK.
 *
 * Confirms that the TypeScript types shipped under `src/plugin-sdk/*.ts`
 * still describe every required top-level property of the corresponding
 * JSON Schemas published by the host backend repository. Catches the
 * common drift case where someone adds a new required field to a JSON
 * Schema without updating the TS mirror (or vice versa).
 *
 * The check is intentionally lightweight: it only verifies that for each
 * top-level required property of every schema, the field name appears
 * inside the TypeScript source for the matching SDK file. It does NOT
 * try to be a full TS/JSON-schema bridge - that is reserved for the
 * generated types step the team can layer on top later.
 *
 * Exit code 0 = parity OK, 1 = drift detected, 2 = environment / wiring
 * problem (schema files missing, can't load, etc.).
 *
 * Usage:
 *   node scripts/check-schema-parity.mjs
 *
 * The CI workflow `.github/workflows/plugin-sdk-check.yml` invokes this
 * script. The script tolerates the schemas being absent locally (when
 * working without a backend checkout next to the shared repo) by
 * exiting 0 with a `SKIP` line - intentionally lenient to keep local
 * developers unblocked.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHARED_ROOT = path.resolve(__dirname, '..');
const BACKEND_SCHEMA_DIR = path.resolve(SHARED_ROOT, '..', 'sh-selfhelp_backend', 'docs', 'plugins');

const SCHEMA_MAPPING = [
    {
        schemaFile: 'plugin-manifest.schema.json',
        sourceFile: 'src/plugin-sdk/manifest.ts',
        label: 'plugin manifest',
    },
    {
        schemaFile: 'plugin-registry.schema.json',
        sourceFile: 'src/plugin-sdk/registry.ts',
        label: 'plugin registry',
    },
    {
        schemaFile: 'plugin-lock.schema.json',
        sourceFile: 'src/plugin-sdk/lock.ts',
        label: 'plugin lock file',
    },
];

let drift = false;
const lines = [];

function log(line) {
    lines.push(line);
}

if (!existsSync(BACKEND_SCHEMA_DIR)) {
    log(`SKIP: backend schema directory not found at ${BACKEND_SCHEMA_DIR}.`);
    log('      Run this check from a workspace where the sh-selfhelp_backend repository is checked out as a sibling.');
    process.stdout.write(`${lines.join('\n')}\n`);
    process.exit(0);
}

for (const { schemaFile, sourceFile, label } of SCHEMA_MAPPING) {
    const schemaPath = path.join(BACKEND_SCHEMA_DIR, schemaFile);
    const sourcePath = path.resolve(SHARED_ROOT, sourceFile);

    if (!existsSync(schemaPath)) {
        log(`ERROR: schema missing for ${label}: ${schemaPath}`);
        drift = true;
        continue;
    }
    if (!existsSync(sourcePath)) {
        log(`ERROR: SDK source missing for ${label}: ${sourcePath}`);
        drift = true;
        continue;
    }

    let schemaJson;
    let sourceCode;
    try {
        const raw = await readFile(schemaPath, 'utf8');
        schemaJson = JSON.parse(raw);
    } catch (err) {
        log(`ERROR: cannot parse ${schemaFile}: ${err.message}`);
        drift = true;
        continue;
    }
    try {
        sourceCode = await readFile(sourcePath, 'utf8');
    } catch (err) {
        log(`ERROR: cannot read ${sourceFile}: ${err.message}`);
        drift = true;
        continue;
    }

    const required = Array.isArray(schemaJson.required) ? schemaJson.required : [];
    if (required.length === 0) {
        log(`WARN: ${label} schema has no top-level "required" array; nothing to check.`);
        continue;
    }

    const missing = required.filter((prop) => {
        const tokenRegex = new RegExp(`\\b${prop.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`);
        return !tokenRegex.test(sourceCode);
    });

    if (missing.length === 0) {
        log(`OK:    ${label} - all ${required.length} required properties present in ${sourceFile}.`);
    } else {
        drift = true;
        log(`DRIFT: ${label} - required schema properties missing from ${sourceFile}: ${missing.join(', ')}`);
    }
}

process.stdout.write(`${lines.join('\n')}\n`);
process.exit(drift ? 1 : 0);
