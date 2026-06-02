/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { afterEach, describe, expect, it } from 'vitest';
import {
    BASE_STYLE_REGISTRY,
    STYLE_REGISTRY,
    extendStyleRegistry,
    getMergedStyleRegistry,
    getPluginStyleRegistry,
    getRegistryEntry,
    getRegistryEntryAny,
    getStylePluginId,
    isKnownStyleName,
    isRegisteredStyleName,
    _resetPluginStyleRegistry,
    type IStyleRegistryEntry,
} from '../index';

/**
 * Contract coverage for the shared style registry — the runtime catalog the
 * frontend, mobile and plugin renderers all dispatch through. A renderer that
 * mis-resolves a style name (or crashes on an unknown one) breaks every page,
 * so these tests pin: the core catalog is present and well-shaped, lookups are
 * safe for unknown keys, and the plugin extension lifecycle (register → resolve
 * → collision-guard → dispose) behaves.
 */

const ALLOWED_CATEGORIES = new Set<IStyleRegistryEntry['category']>([
    'auth', 'layout', 'typography', 'media', 'interactive', 'forms', 'composite', 'plugin',
]);

const PLUGIN_ID = 'qa-shp-registry-test';
const pluginEntry: IStyleRegistryEntry = {
    description: 'QA plugin style for registry tests',
    category: 'plugin',
    frontendOnly: true,
    canHaveChildren: false,
};

describe('shared style registry', () => {
    // Plugin contributions live in module-level mutable state; reset after
    // every test so cases stay isolated and order-independent (Testing Rule 14/15).
    afterEach(() => {
        _resetPluginStyleRegistry();
    });

    describe('core catalog', () => {
        it('registers the expected representative core styles', () => {
            for (const name of ['login', 'container', 'text', 'button', 'form-record', 'accordion']) {
                expect(isKnownStyleName(name)).toBe(true);
                expect(getRegistryEntry(name)).toBeDefined();
            }
        });

        it('exposes STYLE_REGISTRY as the same closed core map', () => {
            expect(STYLE_REGISTRY).toBe(BASE_STYLE_REGISTRY);
        });

        it('keeps every core entry shape stable for renderer consumers', () => {
            for (const [name, entry] of Object.entries(BASE_STYLE_REGISTRY)) {
                expect(typeof entry.description, `${name}.description`).toBe('string');
                expect(entry.description.length, `${name}.description not empty`).toBeGreaterThan(0);
                expect(ALLOWED_CATEGORIES.has(entry.category), `${name}.category`).toBe(true);
                expect(entry.frontendOnly, `${name}.frontendOnly`).toBe(true);
                expect(typeof entry.canHaveChildren, `${name}.canHaveChildren`).toBe('boolean');
            }
        });

        it('reflects the documented canHaveChildren contract', () => {
            // Leaf style vs container style — renderers short-circuit children
            // traversal on this flag, so a flip is a real behaviour change.
            expect(getRegistryEntry('text')?.canHaveChildren).toBe(false);
            expect(getRegistryEntry('container')?.canHaveChildren).toBe(true);
        });
    });

    describe('lookups for unknown keys are safe', () => {
        const unknown = 'qa-not-a-real-style';

        it('returns undefined / false instead of throwing', () => {
            expect(getRegistryEntry(unknown)).toBeUndefined();
            expect(getRegistryEntryAny(unknown)).toBeUndefined();
            expect(isKnownStyleName(unknown)).toBe(false);
            expect(isRegisteredStyleName(unknown)).toBe(false);
            expect(getStylePluginId(unknown)).toBeUndefined();
        });
    });

    describe('plugin extension lifecycle', () => {
        it('registers, resolves and tags a plugin style without polluting the core map', () => {
            const dispose = extendStyleRegistry(
                { 'qa-survey': pluginEntry },
                { pluginId: PLUGIN_ID, pluginVersion: '1.0.0' },
            );

            // Resolvable via the merged/any lookups...
            expect(getRegistryEntryAny('qa-survey')).toMatchObject({ pluginId: PLUGIN_ID, category: 'plugin' });
            expect(isRegisteredStyleName('qa-survey')).toBe(true);
            expect(getStylePluginId('qa-survey')).toBe(PLUGIN_ID);
            expect(getPluginStyleRegistry()['qa-survey']).toBeDefined();
            expect(getMergedStyleRegistry()['qa-survey']).toBeDefined();
            // ...but it is NOT a core style.
            expect(isKnownStyleName('qa-survey')).toBe(false);
            expect(getRegistryEntry('qa-survey')).toBeUndefined();

            dispose();
            expect(isRegisteredStyleName('qa-survey')).toBe(false);
            expect(getPluginStyleRegistry()['qa-survey']).toBeUndefined();
        });

        it('rejects a plugin trying to shadow a core style', () => {
            expect(() => extendStyleRegistry(
                { container: pluginEntry },
                { pluginId: PLUGIN_ID },
            )).toThrow(/core style/i);
        });

        it('rejects a second plugin claiming an already-owned style', () => {
            extendStyleRegistry({ 'qa-shared-style': pluginEntry }, { pluginId: PLUGIN_ID });
            expect(() => extendStyleRegistry(
                { 'qa-shared-style': pluginEntry },
                { pluginId: 'qa-other-plugin' },
            )).toThrow(/already owned/i);
        });

        it('merged registry equals core when no plugins are registered', () => {
            expect(Object.keys(getMergedStyleRegistry()).sort())
                .toEqual(Object.keys(BASE_STYLE_REGISTRY).sort());
            expect(getPluginStyleRegistry()).toEqual({});
        });
    });
});
