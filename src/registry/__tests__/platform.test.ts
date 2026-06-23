/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { afterEach, describe, expect, it } from 'vitest';
import {
    BASE_STYLE_REGISTRY,
    extendStyleRegistry,
    getStylePlacement,
    getStylePlatforms,
    isStyleAllowedOnPage,
    isStylePlacementAllowed,
    isStyleSupportedOnPlatform,
    setToStylePlatform,
    stylePlatformToSet,
    _resetPluginStyleRegistry,
    type IStyleRegistryEntry,
} from '../index';

/**
 * Render-target contract. Established styles default to BOTH targets so nothing
 * stops rendering; a style that declares a single target must be skipped on the
 * other platform's dispatcher and filtered by page target. (Milestone one ships
 * no single-target *core* style — the eight system/data styles all render on
 * both — so single-target behaviour is asserted through plugin entries, which is
 * exactly how plugin mobile-only/web-only styles behave at runtime.)
 */
describe('style render-target targeting', () => {
    afterEach(() => {
        _resetPluginStyleRegistry();
    });

    it('defaults registered styles without a render target to both', () => {
        expect(getStylePlatforms('container')).toEqual(['web', 'mobile']);
        expect(isStyleSupportedOnPlatform('container', 'web')).toBe(true);
        expect(isStyleSupportedOnPlatform('container', 'mobile')).toBe(true);
    });

    it('defaults the eight established system/data styles to both', () => {
        for (const name of [
            'no-access', 'missing', 'not-found', 'version',
            'ref-container', 'data-container', 'show-user-input', 'timeline-item',
        ]) {
            expect(getStylePlatforms(name)).toEqual(['web', 'mobile']);
        }
    });

    it('defaults unknown styles to both (safe fallback)', () => {
        expect(getStylePlatforms('qa-not-a-real-style')).toEqual(['web', 'mobile']);
        expect(isStyleSupportedOnPlatform('qa-not-a-real-style', 'mobile')).toBe(true);
    });

    it('honours an explicit mobile-only render target on a (plugin) style entry', () => {
        const mobileOnly: IStyleRegistryEntry = {
            description: 'QA mobile-only plugin style',
            category: 'plugin',
            canHaveChildren: false,
            platforms: ['mobile'],
        };
        extendStyleRegistry({ 'qa-fab': mobileOnly }, { pluginId: 'qa-shp-platform' });

        expect(getStylePlatforms('qa-fab')).toEqual(['mobile']);
        expect(isStyleSupportedOnPlatform('qa-fab', 'mobile')).toBe(true);
        expect(isStyleSupportedOnPlatform('qa-fab', 'web')).toBe(false);
        // Hidden on web pages, shown on mobile / both pages.
        expect(isStyleAllowedOnPage('qa-fab', 'web')).toBe(false);
        expect(isStyleAllowedOnPage('qa-fab', 'mobile')).toBe(true);
        expect(isStyleAllowedOnPage('qa-fab', 'both')).toBe(true);
    });

    it('converts between TStylePlatform and the concrete set', () => {
        expect(stylePlatformToSet('both')).toEqual(['web', 'mobile']);
        expect(stylePlatformToSet('mobile')).toEqual(['mobile']);
        expect(setToStylePlatform(['web', 'mobile'])).toBe('both');
        expect(setToStylePlatform(['mobile'])).toBe('mobile');
        expect(setToStylePlatform(['web'])).toBe('web');
    });

    it('filters by page target for the add-section picker', () => {
        const webOnly: IStyleRegistryEntry = {
            description: 'QA web-only plugin style',
            category: 'plugin',
            canHaveChildren: false,
            platforms: ['web'],
        };
        extendStyleRegistry({ 'qa-web-widget': webOnly }, { pluginId: 'qa-shp-platform' });

        // A `both` page accepts everything.
        expect(isStyleAllowedOnPage('qa-web-widget', 'both')).toBe(true);
        // A mobile page hides web-only styles.
        expect(isStyleAllowedOnPage('qa-web-widget', 'mobile')).toBe(false);
        // A web page accepts both-target core styles.
        expect(isStyleAllowedOnPage('container', 'web')).toBe(true);
    });
});

/**
 * Placement contract. The CMS picker uses this to hide root-only styles when
 * adding a child and container-only styles when adding at page root. No core
 * style declares a non-`any` placement in milestone one, so the rule is pinned
 * through plugin entries.
 */
describe('style placement targeting', () => {
    afterEach(() => {
        _resetPluginStyleRegistry();
    });

    it('defaults styles without a placement to "any" (root or container)', () => {
        expect(getStylePlacement('container')).toBe('any');
        expect(isStylePlacementAllowed('container', true)).toBe(true);
        expect(isStylePlacementAllowed('container', false)).toBe(true);
    });

    it('defaults unknown styles to "any"', () => {
        expect(getStylePlacement('qa-not-a-real-style')).toBe('any');
    });

    it('honours rootOnly on a (plugin) style entry', () => {
        const rootOnly: IStyleRegistryEntry = {
            description: 'QA root-only plugin style',
            category: 'plugin',
            canHaveChildren: false,
            placement: 'rootOnly',
        };
        extendStyleRegistry({ 'qa-overlay': rootOnly }, { pluginId: 'qa-shp-platform' });

        expect(getStylePlacement('qa-overlay')).toBe('rootOnly');
        expect(isStylePlacementAllowed('qa-overlay', true)).toBe(true);
        expect(isStylePlacementAllowed('qa-overlay', false)).toBe(false);
    });

    it('honours containerOnly on a (plugin) style entry', () => {
        const childOnly: IStyleRegistryEntry = {
            description: 'QA container-only plugin style',
            category: 'plugin',
            canHaveChildren: false,
            placement: 'containerOnly',
        };
        extendStyleRegistry({ 'qa-panel-item': childOnly }, { pluginId: 'qa-shp-platform' });

        expect(getStylePlacement('qa-panel-item')).toBe('containerOnly');
        expect(isStylePlacementAllowed('qa-panel-item', true)).toBe(false);
        expect(isStylePlacementAllowed('qa-panel-item', false)).toBe(true);
    });
});

/**
 * Catalog parity (mobile rendering plan, milestone one). The core registry must
 * be the established 90-style backend catalog: the eight previously-missing
 * system/data/reference styles are present, and the sixteen deferred
 * speculative styles are absent. Drift here means the shared contract and the
 * backend catalog have diverged.
 */
describe('core catalog parity (90 established styles)', () => {
    const CORE_NAMES = Object.keys(BASE_STYLE_REGISTRY);

    const PREVIOUSLY_MISSING = [
        'data-container', 'timeline-item', 'version', 'no-access',
        'missing', 'not-found', 'ref-container', 'show-user-input',
    ];

    const DEFERRED_SPECULATIVE = [
        'dialog', 'popover', 'menu', 'menu-item', 'bottom-sheet', 'skeleton',
        'skeleton-group', 'spinner', 'toast', 'tag-group', 'tag', 'input-group',
        'input-otp', 'search-field', 'fab-button', 'biometric-login-button',
    ];

    it('contains exactly the 90 established core styles', () => {
        expect(CORE_NAMES).toHaveLength(90);
    });

    it('includes every previously-missing established style', () => {
        for (const name of PREVIOUSLY_MISSING) {
            expect(CORE_NAMES, `missing established style: ${name}`).toContain(name);
        }
    });

    it('excludes every deferred speculative style', () => {
        for (const name of DEFERRED_SPECULATIVE) {
            expect(CORE_NAMES, `deferred style should be absent: ${name}`).not.toContain(name);
        }
    });
});
