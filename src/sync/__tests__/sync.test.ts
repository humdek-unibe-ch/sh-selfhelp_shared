/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import {
    API_VERSION_PREFIX,
    ENDPOINTS,
    HEADER_ACL_STAMP,
    HEADER_PAGE_VERSION,
    HEADER_PAGE_VIEW,
    SYNC_EVENT_NAME,
    pageDependsOn,
    parseSyncMessage,
    parseSyncMessageJson,
    syncRefetchDelayMs,
    type IPageLockStatus,
    type ISyncBlock,
} from '../../index';

describe('parseSyncMessage (C1)', () => {
    it('accepts the contract example', () => {
        expect(parseSyncMessage({ v: 1, tags: ['page:12', 'navigation'] })).toEqual({
            v: 1,
            tags: ['page:12', 'navigation'],
        });
    });

    it('accepts every tag kind of the contract', () => {
        const tags = [
            'acl',
            'navigation',
            'global_values',
            'page:1',
            'page_draft:2',
            'page_lock:3',
            'table:4',
            'section:5',
            'asset:6',
        ];
        expect(parseSyncMessage({ v: 1, tags })?.tags).toEqual(tags);
    });

    it('ignores a message of a higher version', () => {
        expect(parseSyncMessage({ v: 2, tags: ['page:12'] })).toBeNull();
        expect(parseSyncMessage({ v: 0, tags: ['page:12'] })).toBeNull();
        expect(parseSyncMessage({ tags: ['page:12'] })).toBeNull();
    });

    it('returns null for anything that is not an object with a tag list', () => {
        expect(parseSyncMessage(null)).toBeNull();
        expect(parseSyncMessage(undefined)).toBeNull();
        expect(parseSyncMessage('{"v":1,"tags":["page:1"]}')).toBeNull();
        expect(parseSyncMessage(['page:1'])).toBeNull();
        expect(parseSyncMessage({ v: 1, tags: 'page:1' })).toBeNull();
        expect(parseSyncMessage({ v: 1 })).toBeNull();
    });

    it('returns null for an empty tag list or one with no known tag', () => {
        expect(parseSyncMessage({ v: 1, tags: [] })).toBeNull();
        expect(parseSyncMessage({ v: 1, tags: ['foo:1', 'page:x'] })).toBeNull();
    });

    it('drops unknown and malformed tags and keeps the valid ones', () => {
        expect(
            parseSyncMessage({
                v: 1,
                tags: ['foo:1', 'page:12', 'page:', 'page:12x', ' table:3', 7, null, 'table:31'],
            }),
        ).toEqual({ v: 1, tags: ['page:12', 'table:31'] });
    });

    it('removes duplicate tags', () => {
        expect(parseSyncMessage({ v: 1, tags: ['page:12', 'acl', 'page:12', 'acl'] })?.tags).toEqual([
            'page:12',
            'acl',
        ]);
    });
});

describe('parseSyncMessageJson', () => {
    it('reads the raw data of a server-sent event', () => {
        expect(parseSyncMessageJson('{"v":1,"tags":["table:31"]}')).toEqual({ v: 1, tags: ['table:31'] });
    });

    it('returns null for invalid JSON or an invalid message', () => {
        expect(parseSyncMessageJson('not json')).toBeNull();
        expect(parseSyncMessageJson('')).toBeNull();
        expect(parseSyncMessageJson('{"v":2,"tags":["page:1"]}')).toBeNull();
    });
});

describe('pageDependsOn (C6)', () => {
    const sync: ISyncBlock = {
        depends_on: ['page:12', 'table:31', 'global_values'],
        valid_until: null,
    };

    it('is true when a tag is listed in depends_on', () => {
        expect(pageDependsOn(sync, ['page:12'])).toBe(true);
        expect(pageDependsOn(sync, ['navigation', 'table:31'])).toBe(true);
    });

    it('is false for a page, table or draft the payload does not name', () => {
        expect(pageDependsOn(sync, ['page:13'])).toBe(false);
        expect(pageDependsOn(sync, ['table:32'])).toBe(false);
        expect(pageDependsOn(sync, ['page_draft:12'])).toBe(false);
    });

    it('matches global_values because a page payload lists it', () => {
        expect(pageDependsOn(sync, ['global_values'])).toBe(true);
        expect(pageDependsOn({ depends_on: ['page:1'], valid_until: null }, ['global_values'])).toBe(false);
    });

    it('never matches acl and navigation: those refresh every page, not a listed one', () => {
        expect(pageDependsOn(sync, ['acl'])).toBe(false);
        expect(pageDependsOn(sync, ['navigation'])).toBe(false);
    });

    it('matches page_draft only for a draft payload', () => {
        const draft: ISyncBlock = { depends_on: ['page_draft:12', 'table:31'], valid_until: null };
        expect(pageDependsOn(draft, ['page_draft:12'])).toBe(true);
        expect(pageDependsOn(draft, ['page:12'])).toBe(false);
    });

    it('is false without a sync block or an empty list', () => {
        expect(pageDependsOn(undefined, ['page:12'])).toBe(false);
        expect(pageDependsOn(null, ['page:12'])).toBe(false);
        expect(pageDependsOn({ depends_on: [], valid_until: null }, ['page:12'])).toBe(false);
        expect(pageDependsOn(sync, [])).toBe(false);
    });
});

describe('syncRefetchDelayMs', () => {
    it('stays within 0 to 300 ms for a pushed change', () => {
        expect(syncRefetchDelayMs('changed', () => 0)).toBe(0);
        expect(syncRefetchDelayMs('changed', () => 0.5)).toBe(150);
        expect(syncRefetchDelayMs('changed', () => 0.999999)).toBe(300);
        expect(syncRefetchDelayMs('changed', () => 1)).toBe(300);
    });

    it('stays within 0 to 2000 ms for valid_until', () => {
        expect(syncRefetchDelayMs('valid_until', () => 0)).toBe(0);
        expect(syncRefetchDelayMs('valid_until', () => 0.5)).toBe(1000);
        expect(syncRefetchDelayMs('valid_until', () => 1)).toBe(2000);
    });

    it('clamps a misbehaving random source', () => {
        expect(syncRefetchDelayMs('changed', () => -3)).toBe(0);
        expect(syncRefetchDelayMs('changed', () => 7)).toBe(300);
        expect(syncRefetchDelayMs('changed', () => Number.NaN)).toBe(0);
    });

    it('uses Math.random by default and returns an integer in range', () => {
        for (let i = 0; i < 50; i++) {
            const ms = syncRefetchDelayMs('changed');
            expect(Number.isInteger(ms)).toBe(true);
            expect(ms).toBeGreaterThanOrEqual(0);
            expect(ms).toBeLessThanOrEqual(300);
        }
    });
});

describe('sync constants and endpoints', () => {
    it('names the event and the three headers as the backend does', () => {
        expect(SYNC_EVENT_NAME).toBe('changed');
        expect(HEADER_ACL_STAMP).toBe('X-Acl-Stamp');
        expect(HEADER_PAGE_VIEW).toBe('X-Page-View');
        expect(HEADER_PAGE_VERSION).toBe('X-Page-Version');
    });

    it('builds the four page lock routes (C9)', () => {
        expect(ENDPOINTS.ADMIN_PAGE_LOCK.LOCK(12)).toBe(`${API_VERSION_PREFIX}/admin/pages/12/lock`);
        expect(ENDPOINTS.ADMIN_PAGE_LOCK.TAKE_OVER(12)).toBe(
            `${API_VERSION_PREFIX}/admin/pages/12/lock/take-over`,
        );
    });

    it('types the lock status the way the contract example shows it', () => {
        const status: IPageLockStatus = {
            page_id: 12,
            held: true,
            mine: false,
            holder: { id: 7, name: 'Anna Muster' },
            expires_at: '2026-11-20T10:02:00Z',
            idle_expires_at: '2026-11-20T10:15:00Z',
        };
        expect(Object.keys(status).sort()).toEqual(
            ['expires_at', 'held', 'holder', 'idle_expires_at', 'mine', 'page_id'],
        );
    });
});
