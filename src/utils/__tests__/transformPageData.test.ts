/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, it, expect } from 'vitest';
import { transformPageData, transformPagesData } from '../transformPageData';

describe('transformPageData', () => {
    it('maps snake_case backend keys to the consumer page shape', () => {
        const result = transformPageData({
            id_pages: 7,
            keyword: 'qa-home',
            url: '/qa-home',
            nav_position: 3,
            footer_position: null,
            is_headless: 1,
            is_system: 0,
        });

        expect(result.id).toBe(7);
        expect(result.id_pages).toBe(7);
        expect(result.keyword).toBe('qa-home');
        expect(result.navPosition).toBe(3);
        expect(result.footerPosition).toBeNull();
        expect(result.is_headless).toBe(true);
        expect(result.is_system).toBe(false);
    });

    it('prefers an explicit camelCase navPosition over the snake_case key', () => {
        const result = transformPageData({ id: 1, keyword: 'k', navPosition: 9, nav_position: 1 });
        expect(result.navPosition).toBe(9);
    });

    it('coerces boolean-like is_headless values (number/string/boolean)', () => {
        expect(transformPageData({ id: 1, keyword: 'k', is_headless: '1' }).is_headless).toBe(true);
        expect(transformPageData({ id: 1, keyword: 'k', is_headless: true }).is_headless).toBe(true);
        expect(transformPageData({ id: 1, keyword: 'k', is_headless: 0 }).is_headless).toBe(false);
    });

    it('recursively transforms children', () => {
        const result = transformPageData({
            id: 1,
            keyword: 'parent',
            children: [{ id_pages: 2, keyword: 'child', nav_position: 5 }],
        });
        expect(result.children).toHaveLength(1);
        expect(result.children[0].id).toBe(2);
        expect(result.children[0].navPosition).toBe(5);
    });

    it('defaults missing id/keyword safely', () => {
        const result = transformPageData({});
        expect(result.id).toBe(0);
        expect(result.keyword).toBe('');
        expect(result.children).toEqual([]);
    });
});

describe('transformPagesData', () => {
    it('transforms a list of pages', () => {
        const out = transformPagesData([{ id: 1, keyword: 'a' }, { id: 2, keyword: 'b' }]);
        expect(out.map((p) => p.keyword)).toEqual(['a', 'b']);
    });

    it('returns an empty array for null/undefined', () => {
        expect(transformPagesData(null)).toEqual([]);
        expect(transformPagesData(undefined)).toEqual([]);
    });
});
