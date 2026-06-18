/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Standardized compatibility-error SHAPE parity across the SelfHelp stack
 * (#51 / #53 / #49).
 *
 * `ICompatibilityError` is a cross-repo contract: the SAME object is emitted by
 * the backend (`CompatibilityError::toArray()`), consumed by the frontend
 * (`IPluginCompatibilityError`) and the SelfHelp Manager (`@shm/resolver`
 * `CompatibilityError`), and mirrored here in `@selfhelp/shared`. They MUST all
 * enumerate the SAME fields so a core-update preflight and a plugin
 * install/update render identical compat info. This test pins the canonical set
 * and — when the sibling Manager repo is checked out in the dev layout —
 * asserts the Manager's `CompatibilityError` interface enumerates exactly the
 * same fields, so drift fails fast.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { ICompatibilityError, IUpdatePreflightCheck } from '../system';

/** The exact keys `CompatibilityError::toArray()` (backend) emits. Snake_case wire contract. */
const CANONICAL_KEYS = [
    'blocking',
    'component',
    'component_id',
    'current_version',
    'message',
    'required_range',
    'target_version',
] as const;

const here = path.dirname(fileURLToPath(import.meta.url));
// here = sh-selfhelp_shared/src/types/api/__tests__ -> five up = the repo parent.
const repoParent = path.resolve(here, '../../../../..');

/** Extract the field names declared in a TS `export interface <name> { ... }` block. */
function interfaceFields(source: string, name: string): string[] {
    const start = source.indexOf(`export interface ${name}`);
    if (start < 0) return [];
    const open = source.indexOf('{', start);
    const close = source.indexOf('}', open);
    if (open < 0 || close < 0) return [];
    const body = source.slice(open + 1, close);
    const fields: string[] = [];
    for (const rawLine of body.split('\n')) {
        const line = rawLine.trim();
        if (line === '' || line.startsWith('//') || line.startsWith('*') || line.startsWith('/*')) continue;
        const m = /^([A-Za-z_][A-Za-z0-9_]*)\??\s*:/.exec(line);
        if (m) fields.push(m[1]);
    }
    return fields;
}

describe('compatibility-error shape parity', () => {
    it('ICompatibilityError enumerates exactly the canonical compatibility-error keys', () => {
        // Typed literal: `tsc` rejects any added/renamed/removed field.
        const error: ICompatibilityError = {
            component: 'plugin',
            component_id: 'sh2-shp-survey-js',
            current_version: '0.1.0',
            target_version: '0.2.0',
            required_range: '>=0.1.0 <0.2.0',
            blocking: true,
            message: 'Plugin sh2-shp-survey-js is not compatible with SelfHelp 0.2.0.',
        };
        expect(Object.keys(error).sort()).toEqual([...CANONICAL_KEYS]);
    });

    it('an ICompatibilityError projects onto an IUpdatePreflightCheck (preflight mirrors the same fields)', () => {
        const error: ICompatibilityError = {
            component: 'plugin',
            component_id: 'sh2-shp-survey-js',
            current_version: '0.1.0',
            target_version: '0.2.0',
            required_range: '>=0.1.0 <0.2.0',
            blocking: true,
            message: 'incompatible',
        };
        // Same compat fields appear on a preflight check; null version fields
        // project to undefined (a check omits them rather than carrying null).
        const check: Pick<
            IUpdatePreflightCheck,
            'component' | 'component_id' | 'current_version' | 'target_version' | 'required_range' | 'blocking' | 'message'
        > = {
            component: error.component,
            component_id: error.component_id,
            current_version: error.current_version ?? undefined,
            target_version: error.target_version ?? undefined,
            required_range: error.required_range,
            blocking: error.blocking,
            message: error.message,
        };
        expect(check.component_id).toBe('sh2-shp-survey-js');
    });

    const managerResolver = path.join(repoParent, 'sh-manager', 'packages', 'resolver', 'src', 'plugins.ts');
    it.runIf(existsSync(managerResolver))('matches the SelfHelp Manager CompatibilityError interface', () => {
        const source = readFileSync(managerResolver, 'utf8');
        const fields = interfaceFields(source, 'CompatibilityError');
        expect(fields.length).toBeGreaterThan(0);
        expect([...fields].sort()).toEqual([...CANONICAL_KEYS]);
    });
});
