/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Release-channel enum parity across the SelfHelp distribution stack.
 *
 * The `channel` field of a registry release ref is a cross-repo contract: it is
 * defined by the registry wire schema (`sh2-plugin-registry/registry.schema.json`),
 * validated by the SelfHelp Manager (`@shm/schemas`), consumed by the backend
 * (`RegistryReleaseRef::CHANNELS`), and mirrored here in `@selfhelp/shared` for
 * the frontend/mobile/plugin consumers. They MUST all agree. This test pins the
 * canonical set and — when the sibling repos are checked out in the dev layout —
 * asserts the registry schema and the manager schema enumerate exactly the same
 * channels, so drift (e.g. a stray `alpha`/`test`) fails fast.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { RELEASE_CHANNELS } from '../distribution';
import { PLUGIN_REGISTRY_CHANNELS } from '../../plugin-sdk/registry';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoParent = path.resolve(here, '../../../..');

/** The single canonical channel set every repo must enumerate. */
const CANONICAL = ['stable', 'beta', 'nightly', 'test'];

/** Recursively collect every `channel.enum` array in a JSON-schema object. */
function collectChannelEnums(node: unknown, out: string[][]): void {
    if (Array.isArray(node)) {
        for (const item of node) collectChannelEnums(item, out);
        return;
    }
    if (node && typeof node === 'object') {
        const obj = node as Record<string, unknown>;
        const channel = obj.channel;
        if (channel && typeof channel === 'object') {
            const e = (channel as Record<string, unknown>).enum;
            if (Array.isArray(e)) out.push(e.map((v) => String(v)));
        }
        for (const value of Object.values(obj)) collectChannelEnums(value, out);
    }
}

describe('release-channel enum parity', () => {
    it('the shared distribution + plugin-sdk channel sets are the canonical set', () => {
        expect([...RELEASE_CHANNELS]).toEqual(CANONICAL);
        // The plugin-sdk registry channel set must match the distribution set
        // exactly (no stray `alpha`, includes the staging `test` channel).
        expect([...PLUGIN_REGISTRY_CHANNELS]).toEqual([...RELEASE_CHANNELS]);
    });

    const registrySchemaPath = path.join(repoParent, 'plugins', 'sh2-plugin-registry', 'registry.schema.json');
    it.runIf(existsSync(registrySchemaPath))('matches the registry wire schema channel enum', () => {
        const schema = JSON.parse(readFileSync(registrySchemaPath, 'utf8')) as unknown;
        const enums: string[][] = [];
        collectChannelEnums(schema, enums);
        expect(enums.length).toBeGreaterThan(0);
        for (const e of enums) expect([...e].sort()).toEqual([...CANONICAL].sort());
    });

    const managerSchemasPath = path.join(repoParent, 'sh-manager', 'packages', 'schemas', 'src', 'json-schemas.ts');
    it.runIf(existsSync(managerSchemasPath))('matches the SelfHelp Manager schema channel enum', () => {
        const src = readFileSync(managerSchemasPath, 'utf8');
        const matches = [...src.matchAll(/channel:\s*\{\s*enum:\s*(\[[^\]]*\])/g)];
        expect(matches.length).toBeGreaterThan(0);
        for (const m of matches) {
            const arr = JSON.parse(m[1]!.replace(/'/g, '"')) as string[];
            expect([...arr].sort()).toEqual([...CANONICAL].sort());
        }
    });
});
