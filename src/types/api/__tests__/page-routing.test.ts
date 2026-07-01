/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import type { IPageContent, IPageRoute } from '../../pages';
import type { IResolvePageResponse } from '../page';

/**
 * Contract coverage for the DB-driven public routing types (issue #30). The web
 * frontend auth styles and the mobile app read `page.route_params.user_id` /
 * `.token` straight off the resolved page, so the route metadata MUST live on
 * `IPageContent` with snake_case param keys. `IPageRoute` is the admin
 * page-routes editor + export/import contract and must keep `path_pattern`
 * placeholders verbatim.
 */
describe('IPageContent route metadata (resolve responses)', () => {
    it('carries optional snake_case route_params + matched/canonical url', () => {
        const page: IPageContent = {
            id: 7,
            keyword: 'reset-password',
            url: '/reset',
            parent_page_id: null,
            is_headless: true,
            route_params: { user_id: '42', token: 'abc.def~1' },
            matched_url_pattern: '/reset/{user_id}/{token}',
            canonical_url: '/reset',
            sections: [],
        };

        expect(page.route_params?.user_id).toBe('42');
        expect(page.route_params?.token).toBe('abc.def~1');
        expect(page.matched_url_pattern).toBe('/reset/{user_id}/{token}');
        expect(page.canonical_url).toBe('/reset');
    });

    it('treats route metadata as optional (a static page omits it)', () => {
        const page: IPageContent = {
            id: 1,
            keyword: 'home',
            url: '/',
            parent_page_id: null,
            is_headless: false,
            sections: [],
        };

        expect(page.route_params).toBeUndefined();
        expect(page.matched_url_pattern).toBeUndefined();
    });

    it('wraps the resolved page in the standard envelope', () => {
        const response: IResolvePageResponse = {
            status: 200,
            message: 'OK',
            error: null,
            logged_in: false,
            meta: { version: 'v1', timestamp: '2026-06-30T00:00:00Z' },
            data: {
                page: {
                    id: 9,
                    keyword: 'team',
                    url: '/team/7',
                    parent_page_id: null,
                    is_headless: false,
                    route_params: { record_id: '7' },
                    sections: [],
                },
            },
        };

        expect(response.data?.page.route_params?.record_id).toBe('7');
    });
});

describe('IPageRoute (admin editor + export/import contract)', () => {
    it('models a parameterized canonical route with regex requirements', () => {
        const route: IPageRoute = {
            id: 12,
            path_pattern: '/team/{record_id}',
            requirements: { record_id: '\\d+' },
            is_canonical: true,
            is_active: true,
            priority: 50,
        };

        // Param names are NEVER remapped, so the placeholder must survive verbatim.
        expect(route.path_pattern).toContain('{record_id}');
        expect(route.requirements?.record_id).toBe('\\d+');
        expect(route.is_canonical).toBe(true);
    });

    it('allows a static route with no requirements', () => {
        const route: IPageRoute = {
            path_pattern: '/reset',
            requirements: null,
            is_canonical: true,
            is_active: true,
            priority: 100,
        };

        expect(route.requirements).toBeNull();
    });
});
