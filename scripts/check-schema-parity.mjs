#!/usr/bin/env node
/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/

/**
 * Schema-parity check for the @selfhelp/shared plugin SDK.
 *
 * Confirms that the TypeScript types shipped under `src/plugin-sdk/*.ts`
 * and `src/types/**` still describe every required property of the
 * corresponding JSON Schemas published by the host backend repository.
 * Catches the common drift case where someone adds/renames a required
 * field in a JSON Schema without updating the TS mirror (or vice versa).
 *
 * What this check DOES (strengthened beyond bare token-presence):
 *   1. Comment-stripping — the TS source is stripped of `//` and block
 *      comments BEFORE matching, so a field that survives only in a stale
 *      comment no longer counts as "present" (kills a false-negative class
 *      the previous raw token scan missed).
 *   2. Presence — every required field name of the mapped schema object
 *      must appear as a live token in the comment-stripped TS source.
 *
 * What this check DELIBERATELY does NOT do (documented limitation): it is
 * a NAME/presence-level guard, not a full TS<->JSON-schema bridge. It does
 * NOT validate:
 *   - required-vs-optional modeling (a schema-`required` field may be
 *     declared `field?:` in the TS mirror — a regex cannot reliably tie a
 *     property to its owning interface, since one file routinely holds both
 *     the authoritative type and an error/partial variant, e.g.
 *     `IBaseApiResponse` (required) next to `IApiError` (`data?`));
 *   - value types (e.g. `acl_version` is `string|null` in the schema but
 *     `string|number|null` in the TS mirror);
 *   - nested object/array SHAPES (e.g. user-data `roles`/`groups` are
 *     arrays of `{id,name,description}` objects in the schema but `string[]`
 *     in `IUserData` today — a real structural drift this guard is blind to);
 *   - enum membership or union narrowing.
 * That deeper, structural drift is caught by the cross-repo
 * `ecosystem-compat.yml` gate, which BUILDS `@selfhelp/shared` and then
 * type-checks + tests the frontend and mobile against the unreleased build —
 * i.e. the TS compiler validates the real shapes where they are actually
 * consumed. Treat this script as the fast first-line *name* guard and
 * `ecosystem-compat` as the authoritative *structural* gate.
 *
 * Exit code 0 = parity OK, 1 = drift detected, 2 = environment / wiring
 * problem (schema files missing, can't load, etc.).
 *
 * Usage:
 *   node scripts/check-schema-parity.mjs
 *
 * Invoked on PRs by `.github/workflows/shared-tests.yml` (the shared gate)
 * and cross-repo by `sh-selfhelp_backend/.github/workflows/ecosystem-compat.yml`.
 * The script tolerates the schemas being absent locally (when working
 * without a backend checkout next to the shared repo) by exiting 0 with a
 * `SKIP` line - intentionally lenient to keep local developers unblocked.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHARED_ROOT = path.resolve(__dirname, '..');
const BACKEND_ROOT = path.resolve(SHARED_ROOT, '..', 'sh-selfhelp_backend');
const BACKEND_PLUGIN_SCHEMA_DIR = path.join(BACKEND_ROOT, 'docs', 'plugins');
const BACKEND_API_SCHEMA_DIR = path.join(BACKEND_ROOT, 'config', 'schemas', 'api', 'v1');

/**
 * Plugin SDK schemas: the TS mirror must contain every top-level required
 * property of the JSON Schema (`mode: 'required'`).
 */
const PLUGIN_SCHEMA_MAPPING = [
    { schemaFile: 'plugin-manifest.schema.json', sourceFile: 'src/plugin-sdk/manifest.ts', label: 'plugin manifest' },
    { schemaFile: 'plugin-registry.schema.json', sourceFile: 'src/plugin-sdk/registry.ts', label: 'plugin registry' },
    { schemaFile: 'plugin-lock.schema.json', sourceFile: 'src/plugin-sdk/lock.ts', label: 'plugin lock file' },
];

/**
 * API response schemas consumed by the frontend/mobile (canonical Testing
 * Rule 25 / 28). `requiredPath` points at the JSON Schema `required` array
 * for the consumed object (the authoritative contract — optional/dev-only
 * fields such as `_debug` are intentionally excluded). Every required field
 * must appear in the shared TS type. `knownDrift: true` downgrades a mismatch
 * to a WARNING (ratchet) for a documented, pre-existing discrepancy that needs
 * cross-repo resolution — never to silently hide NEW drift.
 */
const RESPONSE_SCHEMA_MAPPING = [
    {
        schemaFile: 'common/_response_envelope.json',
        sourceFile: 'src/types/api/envelope.ts',
        label: 'response envelope',
        requiredPath: ['required'],
    },
    {
        schemaFile: 'responses/auth/login.json',
        sourceFile: 'src/types/api/auth.ts',
        label: 'auth login data',
        requiredPath: ['properties', 'data', 'required'],
    },
    {
        // User-data response carries the permission/ACL contract the frontend
        // consumes (roles, permissions, groups, acl_version) plus the profile
        // fields. IUserData is the authoritative shared mirror.
        schemaFile: 'responses/auth/user_data.json',
        sourceFile: 'src/types/auth.ts',
        label: 'auth user-data (permissions / roles / groups / acl_version)',
        requiredPath: ['properties', 'data', 'required'],
    },
    {
        // CMS page payload consumed by frontend + mobile renderers. The shared
        // mirror is IPageContent (the `data.page` object).
        schemaFile: 'responses/frontend/get_page.json',
        sourceFile: 'src/types/pages.ts',
        label: 'CMS page payload (IPageContent)',
        requiredPath: ['properties', 'data', 'properties', 'page', 'required'],
    },
    {
        // RESOLVED DRIFT (was knownDrift): IFormSubmitData now mirrors the real
        // FormController contract {record_id, section_id, page_id, submitted_at,
        // user_authenticated}. The legacy success/message/redirect_url fields
        // are retained as deprecated optionals for migrating consumers.
        schemaFile: 'responses/frontend/form_submitted.json',
        sourceFile: 'src/types/api/forms.ts',
        label: 'form submit data',
        requiredPath: ['allOf', 1, 'properties', 'data', 'required'],
    },
    {
        // Form UPDATE returns a distinct shape (updated_at, no user_authenticated)
        // mirrored by IFormUpdateData.
        schemaFile: 'responses/frontend/form_updated.json',
        sourceFile: 'src/types/api/forms.ts',
        label: 'form update data',
        requiredPath: ['allOf', 1, 'properties', 'data', 'required'],
    },
    {
        // Instance-scoped system version summary consumed by the admin
        // maintenance UI (ISystemVersion).
        schemaFile: 'responses/admin/system_version.json',
        sourceFile: 'src/types/api/system.ts',
        label: 'system version data (ISystemVersion)',
        requiredPath: ['properties', 'data', 'required'],
    },
    {
        // Aggregated instance-scoped health/status consumed by the admin
        // maintenance UI (ISystemHealth).
        schemaFile: 'responses/admin/system_health.json',
        sourceFile: 'src/types/api/system.ts',
        label: 'system health data (ISystemHealth)',
        requiredPath: ['properties', 'data', 'required'],
    },
    {
        // Update preflight result consumed by the admin maintenance UI
        // (IUpdatePreflight).
        schemaFile: 'responses/admin/update_preflight.json',
        sourceFile: 'src/types/api/system.ts',
        label: 'update preflight data (IUpdatePreflight)',
        requiredPath: ['properties', 'data', 'required'],
    },
    {
        // Update operation status consumed by the admin maintenance UI
        // (IUpdateStatus).
        schemaFile: 'responses/admin/update_status.json',
        sourceFile: 'src/types/api/system.ts',
        label: 'update status data (IUpdateStatus)',
        requiredPath: ['properties', 'data', 'required'],
    },
];

/**
 * Request schemas for public endpoints consumed by the frontend/mobile. Every
 * required request field must be present in the shared TS request DTO so the
 * cross-repo contract (Testing Rule 25) covers the request side too.
 */
const REQUEST_SCHEMA_MAPPING = [
    {
        schemaFile: 'requests/auth/forgot_password.json',
        sourceFile: 'src/types/api/auth.ts',
        label: 'auth forgot-password request (IForgotPasswordRequest)',
        requiredPath: ['required'],
    },
    {
        schemaFile: 'requests/auth/reset_password.json',
        sourceFile: 'src/types/api/auth.ts',
        label: 'auth reset-password request (IResetPasswordRequest)',
        requiredPath: ['required'],
    },
    {
        // Instance-scoped update request. The schema deliberately forbids
        // `instance_id` (server-derived); the TS DTO IUpdateRequest matches.
        schemaFile: 'requests/admin/update_request.json',
        sourceFile: 'src/types/api/system.ts',
        label: 'system update request (IUpdateRequest)',
        requiredPath: ['required'],
    },
];

let drift = false;
const lines = [];
const log = (line) => lines.push(line);

function getByPath(obj, segments) {
    let cur = obj;
    for (const seg of segments) {
        if (cur == null || typeof cur !== 'object') return undefined;
        cur = cur[seg];
    }
    return cur;
}

/**
 * Strip `//` line comments and block comments from TS source so a field
 * that only survives in a comment is not mistaken for a live declaration.
 * (String-literal contents are left intact; that is acceptable here since
 * we only match field-name tokens, not arbitrary prose.)
 */
function stripComments(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}

function escapeToken(token) {
    return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokenPresent(source, token) {
    return new RegExp(`\\b${escapeToken(token)}\\b`).test(source);
}

async function readJson(file) {
    return JSON.parse(await readFile(file, 'utf8'));
}

/** Plugin SDK schemas: check top-level required props against the TS mirror. */
async function checkPluginSchemas() {
    if (!existsSync(BACKEND_PLUGIN_SCHEMA_DIR)) {
        log(`SKIP: backend plugin schema dir not found at ${BACKEND_PLUGIN_SCHEMA_DIR} (sibling backend checkout required).`);
        return;
    }
    for (const { schemaFile, sourceFile, label } of PLUGIN_SCHEMA_MAPPING) {
        const schemaPath = path.join(BACKEND_PLUGIN_SCHEMA_DIR, schemaFile);
        const sourcePath = path.resolve(SHARED_ROOT, sourceFile);
        if (!existsSync(schemaPath)) { log(`ERROR: schema missing for ${label}: ${schemaPath}`); drift = true; continue; }
        if (!existsSync(sourcePath)) { log(`ERROR: SDK source missing for ${label}: ${sourcePath}`); drift = true; continue; }

        const schemaJson = await readJson(schemaPath);
        const sourceCode = stripComments(await readFile(sourcePath, 'utf8'));
        const required = Array.isArray(schemaJson.required) ? schemaJson.required : [];
        if (required.length === 0) { log(`WARN: ${label} schema has no top-level "required"; nothing to check.`); continue; }

        const missing = required.filter((p) => !tokenPresent(sourceCode, p));
        if (missing.length === 0) {
            log(`OK:    ${label} - all ${required.length} required properties present in ${sourceFile}.`);
        } else {
            drift = true;
            log(`DRIFT: ${label} - required schema properties missing from ${sourceFile}: ${missing.join(', ')}`);
        }
    }
}

/** API response schemas: check consumed data fields against the TS type. */
async function checkResponseSchemas() {
    if (!existsSync(BACKEND_API_SCHEMA_DIR)) {
        log(`SKIP: backend API schema dir not found at ${BACKEND_API_SCHEMA_DIR} (sibling backend checkout required).`);
        return;
    }
    for (const { schemaFile, sourceFile, label, requiredPath, knownDrift } of RESPONSE_SCHEMA_MAPPING) {
        const schemaPath = path.join(BACKEND_API_SCHEMA_DIR, schemaFile);
        const sourcePath = path.resolve(SHARED_ROOT, sourceFile);
        if (!existsSync(schemaPath)) { log(`ERROR: response schema missing for ${label}: ${schemaPath}`); drift = true; continue; }
        if (!existsSync(sourcePath)) { log(`ERROR: TS type missing for ${label}: ${sourcePath}`); drift = true; continue; }

        const schemaJson = await readJson(schemaPath);
        const sourceCode = stripComments(await readFile(sourcePath, 'utf8'));
        const fields = getByPath(schemaJson, requiredPath);
        if (!Array.isArray(fields)) {
            log(`WARN: ${label} - required path [${requiredPath.join('.')}] not found in ${schemaFile}; skipping.`);
            continue;
        }

        const missing = fields.filter((f) => !tokenPresent(sourceCode, f));
        if (missing.length === 0) {
            log(`OK:    ${label} - all ${fields.length} required response fields present in ${sourceFile}.`);
        } else if (knownDrift) {
            log(`WARN(known-drift): ${label} - fields missing from ${sourceFile}: ${missing.join(', ')} (needs cross-repo reconciliation).`);
        } else {
            drift = true;
            log(`DRIFT: ${label} - response fields missing from ${sourceFile}: ${missing.join(', ')}`);
        }
    }
}

/** Request schemas: check required request fields against the TS request DTO. */
async function checkRequestSchemas() {
    if (!existsSync(BACKEND_API_SCHEMA_DIR)) {
        log(`SKIP: backend API schema dir not found at ${BACKEND_API_SCHEMA_DIR} (sibling backend checkout required).`);
        return;
    }
    for (const { schemaFile, sourceFile, label, requiredPath } of REQUEST_SCHEMA_MAPPING) {
        const schemaPath = path.join(BACKEND_API_SCHEMA_DIR, schemaFile);
        const sourcePath = path.resolve(SHARED_ROOT, sourceFile);
        if (!existsSync(schemaPath)) { log(`ERROR: request schema missing for ${label}: ${schemaPath}`); drift = true; continue; }
        if (!existsSync(sourcePath)) { log(`ERROR: TS type missing for ${label}: ${sourcePath}`); drift = true; continue; }

        const schemaJson = await readJson(schemaPath);
        const sourceCode = stripComments(await readFile(sourcePath, 'utf8'));
        const fields = getByPath(schemaJson, requiredPath);
        if (!Array.isArray(fields)) {
            log(`WARN: ${label} - required path [${requiredPath.join('.')}] not found in ${schemaFile}; skipping.`);
            continue;
        }

        const missing = fields.filter((f) => !tokenPresent(sourceCode, f));
        if (missing.length === 0) {
            log(`OK:    ${label} - all ${fields.length} required request fields present in ${sourceFile}.`);
        } else {
            drift = true;
            log(`DRIFT: ${label} - request fields missing from ${sourceFile}: ${missing.join(', ')}`);
        }
    }
}

await checkPluginSchemas();
await checkResponseSchemas();
await checkRequestSchemas();

const count = (prefix) => lines.filter((l) => l.startsWith(prefix)).length;
const total = PLUGIN_SCHEMA_MAPPING.length + RESPONSE_SCHEMA_MAPPING.length + REQUEST_SCHEMA_MAPPING.length;
log('');
log(
    `SUMMARY: ${count('OK:')} OK, ${count('DRIFT:')} DRIFT, ${count('ERROR:')} ERROR, `
    + `${count('WARN')} WARN, ${count('SKIP')} SKIP across ${total} contracts.`,
);
log(
    drift
        ? 'RESULT: FAIL — contract drift detected. Align the named shared TS type with the backend JSON schema (or vice versa), then re-run.'
        : 'RESULT: OK — shared TS types cover every checked backend response/SDK schema contract.',
);

process.stdout.write(`${lines.join('\n')}\n`);
process.exit(drift ? 1 : 0);
