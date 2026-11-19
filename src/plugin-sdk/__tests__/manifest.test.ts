/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { IPluginManifestApiRoute } from '../manifest';

describe('IPluginManifestApiRoute', () => {
    it('accepts public: true on a route item (C3)', () => {
        const route: IPluginManifestApiRoute = {
            name: 'surveyjs_public_published',
            path: '/cms-api/v1/plugins/sh2-shp-survey-js/surveys/{id}/published',
            methods: ['GET'],
            public: true,
        };
        expect(route.public).toBe(true);
        expectTypeOf(route.public).toEqualTypeOf<boolean | undefined>();
    });

    it('keeps permission-only routes valid without public', () => {
        const route: IPluginManifestApiRoute = {
            name: 'surveyjs_admin_list',
            path: '/cms-api/v1/plugins/sh2-shp-survey-js/surveys',
            methods: ['GET'],
            permission: 'surveyjs.surveys.manage',
        };
        expect(route.permission).toBe('surveyjs.surveys.manage');
        expect(route.public).toBeUndefined();
    });
});
