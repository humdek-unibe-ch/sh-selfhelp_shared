/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import type { IAboutItem, IPlatformAbout, IVersionStyle } from '../index';

/**
 * Contract pin for the "about the platform" block of the `version` style
 * (backend `PlatformAboutService`, web `VersionStyle`, mobile `Version`).
 * The types are imported from the package's types barrel so the test also fails
 * if they stop being exported there; the shapes are checked by `tsc` (the
 * fixtures below do not compile if a key is renamed, dropped or made optional).
 */
describe('version style about contract', () => {
    const guest: IPlatformAbout = {
        detail: false,
        product: { name: 'SelfHelp', version: '0.1.43' },
        frameworks: [{ name: 'PHP', version: null, license: 'PHP-3.01' }],
        plugins: [],
        libraries: [{ name: 'doctrine/orm', version: null, license: 'MIT' }],
    };

    const admin: IPlatformAbout = {
        ...guest,
        detail: true,
        frameworks: [{ name: 'PHP', version: '8.4.1', license: 'PHP-3.01' }],
        libraries: [{ name: 'doctrine/orm', version: '3.3.0', license: 'MIT OR Apache-2.0' }],
    };

    it('shows only the product version to a caller without detail', () => {
        const versions = [...guest.frameworks, ...guest.plugins, ...guest.libraries].map((item) => item.version);

        expect(guest.detail).toBe(false);
        expect(guest.product.version).toBe('0.1.43');
        expect(versions.every((version) => version === null)).toBe(true);
    });

    it('carries exact versions and joined licences for a caller with detail', () => {
        const item: IAboutItem | undefined = admin.libraries[0];

        expect(admin.detail).toBe(true);
        expect(item?.version).toBe('3.3.0');
        expect(item?.license).toBe('MIT OR Apache-2.0');
    });

    it('is always present on a version section, together with its translatable headings', () => {
        const section: Pick<
            IVersionStyle,
            | 'style_name'
            | 'about'
            | 'title'
            | 'label_frameworks'
            | 'label_plugins'
            | 'label_libraries'
            | 'label_web'
            | 'label_app'
            | 'label_filter'
            | 'label_no_match'
        > = {
            style_name: 'version',
            about: guest,
            title: { content: 'About this platform' },
            label_frameworks: { content: 'Frameworks' },
            label_plugins: { content: 'Plugins' },
            label_libraries: { content: 'Libraries' },
            label_web: { content: 'Website' },
            label_app: { content: 'Mobile app' },
            label_filter: { content: 'Filter' },
            label_no_match: { content: 'Nothing matches the filter.' },
        };

        expect(section.style_name).toBe('version');
        expect(section.about.plugins).toEqual([]);
        expect(section.label_web?.content).toBe('Website');
        expect(section.label_filter?.content).toBe('Filter');
        expect(section.label_no_match?.content).toBe('Nothing matches the filter.');
    });
});
