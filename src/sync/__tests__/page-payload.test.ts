/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import {
    LOCK_IDLE_ENDED_ERROR,
    PAGE_LOCKED_ERROR,
    pageFromPayload,
    type IGetPageResponse,
    type IPageContent,
    type IPagePayload,
    type ISyncBlock,
} from '../../index';

const sync: ISyncBlock = {
    depends_on: ['page:12', 'global_values'],
    valid_until: '2026-11-23T12:00:00Z',
};

const page: IPageContent = {
    id: 12,
    keyword: 'demo',
    url: '/demo',
    parent_page_id: null,
    is_headless: false,
    title: 'Demo',
    sections: [],
};

describe('root exports (P1-A1)', () => {
    it('exports LOCK_IDLE_ENDED_ERROR, IPagePayload and pageFromPayload from the package root', () => {
        expect(LOCK_IDLE_ENDED_ERROR).toBe('lock_idle_ended');
        expect(PAGE_LOCKED_ERROR).toBe('page_locked');
        const payload: IPagePayload = { page, sync };
        expect(pageFromPayload(payload)?.id).toBe(12);
    });
});

describe('pageFromPayload (P1-A2)', () => {
    it('prefers payload.sync over page.sync', () => {
        const onPage: ISyncBlock = { depends_on: ['page:99'], valid_until: null };
        expect(pageFromPayload({ page: { ...page, sync: onPage }, sync })).toEqual({
            ...page,
            sync,
        });
    });

    it('falls back to page.sync when the payload has no sync', () => {
        expect(pageFromPayload({ page: { ...page, sync } })).toEqual({ ...page, sync });
    });

    it('returns null when there is no page', () => {
        expect(pageFromPayload({ page: null, sync })).toBeNull();
        expect(pageFromPayload({ sync })).toBeNull();
        expect(pageFromPayload(undefined)).toBeNull();
        expect(pageFromPayload(null)).toBeNull();
    });

    it('returns the page unchanged when there is no sync at all', () => {
        expect(pageFromPayload({ page })).toBe(page);
    });
});

describe('IGetPageResponse data shape (P1-A3)', () => {
    it('accepts { page, sync } on the response data', () => {
        const data: IGetPageResponse['data'] = { page, sync };
        expect(data.page.id).toBe(12);
        expect(data.sync?.depends_on).toContain('page:12');
    });
});
