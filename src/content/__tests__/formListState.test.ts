/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

import { describe, expect, it } from 'vitest';
import {
    applyFormListUrlChange,
    emptyFormListUrlState,
    encodeFormListQuery,
    formListCacheKey,
    formListRouteQuery,
    formListQueryString,
    nextSortOnHeaderClick,
    parseFormListQuery,
    pickFormListQuery,
    type IFormListUrlRules,
    type IFormListUrlState,
} from '../formListState';

/**
 * The vectors of the backend `FormListUrlStateParserTest`: the web frontend and
 * the mobile app must read a URL exactly as the server does, refuse what it
 * refuses and write what it echoes.
 */
const RULES: IFormListUrlRules = { sortable: ['title', 'entry_date'], controls: ['state'] };

function parsed(query: string, rules: IFormListUrlRules = RULES): IFormListUrlState {
    const result = parseFormListQuery(query, 'tasks', rules);
    if (!result.ok) {
        throw new Error(`Expected "${query}" to parse, got ${result.error.reason}: ${result.error.message}`);
    }

    return result.state;
}

function refusedWith(query: string, rules: IFormListUrlRules = RULES) {
    const result = parseFormListQuery(query, 'tasks', rules);
    if (result.ok) {
        throw new Error(`Expected "${query.slice(0, 60)}" to be refused`);
    }

    return result.error;
}

describe('parseFormListQuery', () => {
    it('reads an empty query as the list itself', () => {
        expect(parsed('')).toEqual(emptyFormListUrlState());
        expect(encodeFormListQuery('tasks', parsed(''))).toEqual({});
    });

    it('reads a leading question mark and URLSearchParams like a plain query string', () => {
        expect(parsed('?tasks.page=2').page).toBe(2);
        expect(parsed(new URLSearchParams({ 'tasks.page': '5' }).toString()).page).toBe(5);
    });

    it('round trips everything a visitor can choose through the URL', () => {
        const query = 'tasks.page=3&tasks.q=write+report&tasks.sort=title%3Aasc%2Centry_date%3Adesc&tasks.f.state=open&tasks.record=17&tasks.mode=edit';
        const state = parsed(query);

        expect(state).toEqual({
            page: 3,
            q: 'write report',
            sort: [
                { field: 'title', direction: 'asc' },
                { field: 'entry_date', direction: 'desc' },
            ],
            filters: { state: 'open' },
            record: 17,
            mode: 'edit',
        });

        const written = encodeFormListQuery('tasks', state);
        expect(written).toEqual({
            'tasks.page': '3',
            'tasks.q': 'write report',
            'tasks.sort': 'title:asc,entry_date:desc',
            'tasks.f.state': 'open',
            'tasks.record': '17',
            'tasks.mode': 'edit',
        });
        expect(Object.keys(written)).toEqual([
            'tasks.page', 'tasks.q', 'tasks.sort', 'tasks.f.state', 'tasks.record', 'tasks.mode',
        ]);

        const again = parseFormListQuery(formListQueryString('', 'tasks', state), 'tasks', RULES);
        expect(again).toEqual({ ok: true, state });
    });

    it('does not touch parameters of the page, the language or other lists', () => {
        const state = parsed('page_id=5&lang=de&other.page=9&other.f.x=1&tasks.page=2&utm_source=mail');

        expect(state.page).toBe(2);
    });

    it('accepts an encoded dot in a parameter name', () => {
        expect(parsed('tasks%2Epage=4').page).toBe(4);
    });

    it('views a record that comes without a mode', () => {
        expect(parsed('tasks.record=8').mode).toBe('view');
    });

    it('treats an empty filter value as no filter and a blank search as no search', () => {
        const state = parsed('tasks.f.state=&tasks.q=%20%20');

        expect(state.filters).toEqual({});
        expect(state.q).toBeNull();
    });

    it('takes create as a mode of its own', () => {
        const state = parsed('tasks.mode=create');

        expect(state.mode).toBe('create');
        expect(state.record).toBeNull();
    });

    it('trims a search the way the server does and keeps its inner spaces', () => {
        expect(parsed('tasks.q=%20%20anna%20maria%20').q).toBe('anna maria');
    });

    it('trims exactly what PHP trim() trims: NUL and vertical tab go, a no-break space stays', () => {
        expect(parsed('tasks.q=%00%0Banna%0B%00').q).toBe('anna');
        expect(parsed('tasks.q=%C2%A0anna%C2%A0').q).toBe('\u00a0anna\u00a0');
        expect(applyFormListUrlChange(emptyFormListUrlState(), { type: 'search', q: '\u00a0anna\u00a0' }).q).toBe('\u00a0anna\u00a0');
    });

    it('counts a search in characters, not bytes', () => {
        expect(parsed(`tasks.q=${encodeURIComponent('äö')}`).q).toBe('äö');
        expect(refusedWith(`tasks.q=${encodeURIComponent('ä')}`).reason).toBe('invalid_list_parameter');
    });

    it('accepts the longest page and search and the longest value', () => {
        expect(parsed('tasks.page=1000000').page).toBe(1_000_000);
        expect(parsed(`tasks.q=${'x'.repeat(100)}`).q).toHaveLength(100);
        expect(parsed(`tasks.f.state=${'x'.repeat(1000)}`).filters.state).toHaveLength(1000);
    });

    const refused: ReadonlyArray<[string, string, string, 400 | 403]> = [
        ['page given twice', 'tasks.page=1&tasks.page=2', 'duplicate_list_parameter', 400],
        ['page zero', 'tasks.page=0', 'invalid_list_parameter', 400],
        ['page negative', 'tasks.page=-1', 'invalid_list_parameter', 400],
        ['page not a number', 'tasks.page=two', 'invalid_list_parameter', 400],
        ['page with a leading zero', 'tasks.page=02', 'invalid_list_parameter', 400],
        ['page beyond the limit', 'tasks.page=1000001', 'invalid_list_parameter', 400],
        ['page written as an array', 'tasks.page[]=1', 'unknown_list_parameter', 400],
        ['unknown parameter', 'tasks.limit=500', 'unknown_list_parameter', 400],
        ['unknown filter', 'tasks.f.secret=1', 'unknown_list_parameter', 400],
        ['search too short', 'tasks.q=a', 'invalid_list_parameter', 400],
        ['search too long', `tasks.q=${'x'.repeat(101)}`, 'invalid_list_parameter', 400],
        ['sort of a column that is not sortable', 'tasks.sort=status:asc', 'invalid_list_parameter', 400],
        ['sort without a direction', 'tasks.sort=title', 'invalid_list_parameter', 400],
        ['sort with a bad direction', 'tasks.sort=title:up', 'invalid_list_parameter', 400],
        ['sort twice on a column', 'tasks.sort=title:asc,title:desc', 'invalid_list_parameter', 400],
        ['too many sort keys', 'tasks.sort=title:asc,entry_date:desc,title:desc,x:asc', 'invalid_list_parameter', 400],
        ['record not a number', 'tasks.record=abc', 'invalid_list_parameter', 400],
        ['unknown mode', 'tasks.record=1&tasks.mode=delete', 'invalid_list_parameter', 400],
        ['create with a record', 'tasks.record=1&tasks.mode=create', 'invalid_list_parameter', 400],
        ['edit without a record', 'tasks.mode=edit', 'invalid_list_parameter', 400],
        ['view without a record', 'tasks.mode=view', 'invalid_list_parameter', 400],
        ['value over the length limit', `tasks.f.state=${'x'.repeat(1001)}`, 'invalid_list_parameter', 400],
    ];

    it.each(refused)('refuses, not ignores: %s', (_label, query, reason, status) => {
        const error = refusedWith(query);

        expect(error.reason).toBe(reason);
        expect(error.status).toBe(status);
        expect(error.parameter.startsWith('tasks.')).toBe(true);
    });

    it('reports a duplicate before any other problem, as the server does', () => {
        expect(refusedWith('tasks.page=0&tasks.q=a&tasks.q=bb').reason).toBe('duplicate_list_parameter');
    });

    it('names the parameter a client may drop and retry', () => {
        expect(refusedWith('tasks.page=0').parameter).toBe('tasks.page');
        expect(refusedWith('tasks.mode=edit').parameter).toBe('tasks.record');
        expect(refusedWith('tasks.f.secret=1').parameter).toBe('tasks.f.secret');
    });

    it('forbids, not malforms, a mode the list does not offer', () => {
        const readOnly: IFormListUrlRules = { ...RULES, allowCreate: false, allowUpdate: false };

        for (const query of ['tasks.mode=create', 'tasks.record=1&tasks.mode=edit']) {
            const error = refusedWith(query, readOnly);
            expect(error.status).toBe(403);
            expect(error.reason).toBe('operation_disabled');
        }
        expect(parsed('tasks.record=1&tasks.mode=view', readOnly).mode).toBe('view');
    });

    it('accepts mode=history as a deep link to the history tab', () => {
        expect(parsed('tasks.record=8&tasks.mode=history').mode).toBe('history');
        expect(parsed('tasks.record=8&tasks.mode=history').record).toBe(8);
    });

    it('forbids history when the list does not offer it', () => {
        const noHistory: IFormListUrlRules = { ...RULES, showHistory: false };
        const error = refusedWith('tasks.record=1&tasks.mode=history', noHistory);
        expect(error.status).toBe(403);
        expect(error.reason).toBe('history_disabled');
    });

    it('checks only the grammar when no rules are given', () => {
        expect(parsed('tasks.sort=anything:desc&tasks.f.some_id=1', {}).filters).toEqual({ some_id: '1' });
        expect(refusedWith('tasks.f.Bad-Id=1', {}).reason).toBe('unknown_list_parameter');
        expect(refusedWith('tasks.sort=1abc:asc', {}).reason).toBe('invalid_list_parameter');
    });

    it('leaves a malformed percent escape as written instead of throwing', () => {
        expect(parsed('tasks.q=100%25%zz').q).toBe('100%%zz');
    });

    it('scopes the namespace to the key: a longer key sharing the prefix is another list', () => {
        const result = parseFormListQuery('tasks_archive.page=9&tasks.page=2', 'tasks', RULES);

        expect(result).toMatchObject({ ok: true, state: { page: 2 } });
    });
});

describe('formListQueryString', () => {
    it('keeps every foreign parameter exactly as written and appends the list state last', () => {
        const base = 'lang=de&other.page=9&tasks.page=2&utm_source=mail%20x&tasks.q=old';
        const state = applyFormListUrlChange(emptyFormListUrlState(), { type: 'search', q: 'anna' });

        expect(formListQueryString(base, 'tasks', state)).toBe('lang=de&other.page=9&utm_source=mail%20x&tasks.q=anna');
    });

    it('drops the whole list namespace when the state is empty', () => {
        expect(formListQueryString('tasks.page=4&tasks.record=3&lang=de', 'tasks', emptyFormListUrlState())).toBe('lang=de');
        expect(formListQueryString('', 'tasks', emptyFormListUrlState())).toBe('');
    });

    it('writes readable separators and encodes the rest', () => {
        const state: IFormListUrlState = {
            ...emptyFormListUrlState(),
            q: 'a&b c',
            sort: [{ field: 'title', direction: 'asc' }, { field: 'entry_date', direction: 'desc' }],
            filters: { state: 'open' },
        };

        expect(formListQueryString('', 'tasks', state)).toBe('tasks.q=a%26b%20c&tasks.sort=title:asc,entry_date:desc&tasks.f.state=open');
    });

    it('keeps the state of other lists of the page', () => {
        const state = applyFormListUrlChange(emptyFormListUrlState(), { type: 'page', page: 3 });

        expect(formListQueryString('news.page=2&news.q=x', 'tasks', state)).toBe('news.page=2&news.q=x&tasks.page=3');
    });
});

describe('applyFormListUrlChange', () => {
    const wide: IFormListUrlState = {
        page: 4,
        q: 'anna',
        sort: [{ field: 'title', direction: 'asc' }],
        filters: { state: 'open' },
        record: 8,
        mode: 'edit',
    };

    it('changes the page and nothing else', () => {
        expect(applyFormListUrlChange(wide, { type: 'page', page: 2 })).toEqual({ ...wide, page: 2 });
        expect(applyFormListUrlChange(wide, { type: 'page', page: 0 }).page).toBe(1);
        expect(applyFormListUrlChange(wide, { type: 'page', page: Number.NaN }).page).toBe(1);
        expect(applyFormListUrlChange(wide, { type: 'page', page: 2_000_000 }).page).toBe(1_000_000);
        expect(applyFormListUrlChange(wide, { type: 'page', page: 2.9 }).page).toBe(2);
    });

    it('goes back to the first page when the list is narrowed', () => {
        expect(applyFormListUrlChange(wide, { type: 'search', q: ' berta ' })).toMatchObject({ q: 'berta', page: 1 });
        expect(applyFormListUrlChange(wide, { type: 'search', q: '   ' })).toMatchObject({ q: null, page: 1 });
        expect(applyFormListUrlChange(wide, { type: 'search', q: null })).toMatchObject({ q: null, page: 1 });
        expect(applyFormListUrlChange(wide, { type: 'sort', sort: [{ field: 'entry_date', direction: 'desc' }] })).toMatchObject({
            sort: [{ field: 'entry_date', direction: 'desc' }],
            page: 1,
        });
        expect(applyFormListUrlChange(wide, { type: 'filter', id: 'state', value: 'done' })).toMatchObject({ filters: { state: 'done' }, page: 1 });
    });

    it('removes a filter whose value is cleared', () => {
        expect(applyFormListUrlChange(wide, { type: 'filter', id: 'state', value: null }).filters).toEqual({});
        expect(applyFormListUrlChange(wide, { type: 'filter', id: 'state', value: '' }).filters).toEqual({});
    });

    it('keeps the open record when the list is narrowed: the server reads it outside the visitor filters', () => {
        const narrowed = applyFormListUrlChange(wide, { type: 'filter', id: 'state', value: 'done' });

        expect(narrowed.record).toBe(8);
        expect(narrowed.mode).toBe('edit');
    });

    it('resets search, sort, filters and page but not the record', () => {
        expect(applyFormListUrlChange(wide, { type: 'reset' })).toEqual({
            page: 1, q: null, sort: [], filters: {}, record: 8, mode: 'edit',
        });
    });

    it('opens, creates and closes a record keeping the list state', () => {
        const closed = applyFormListUrlChange(wide, { type: 'close' });
        expect(closed).toEqual({ ...wide, record: null, mode: null });
        expect(applyFormListUrlChange(closed, { type: 'open', record: 12 })).toMatchObject({ record: 12, mode: 'view' });
        expect(applyFormListUrlChange(closed, { type: 'open', record: 12, mode: 'edit' })).toMatchObject({ record: 12, mode: 'edit' });
        expect(applyFormListUrlChange(wide, { type: 'create' })).toMatchObject({ record: null, mode: 'create', q: 'anna' });
    });

    it('does not mutate the state it was given and caps the sort keys', () => {
        const before = structuredClone(wide);
        applyFormListUrlChange(wide, { type: 'filter', id: 'state', value: 'x' });
        applyFormListUrlChange(wide, { type: 'sort', sort: [] });

        expect(wide).toEqual(before);
        const many = applyFormListUrlChange(wide, {
            type: 'sort',
            sort: [
                { field: 'a', direction: 'asc' }, { field: 'b', direction: 'asc' },
                { field: 'c', direction: 'asc' }, { field: 'd', direction: 'asc' },
            ],
        });
        expect(many.sort).toHaveLength(3);
    });

    it('produces a state the parser accepts', () => {
        let state = emptyFormListUrlState();
        state = applyFormListUrlChange(state, { type: 'search', q: 'write' });
        state = applyFormListUrlChange(state, { type: 'filter', id: 'state', value: 'open' });
        state = applyFormListUrlChange(state, { type: 'page', page: 2 });
        state = applyFormListUrlChange(state, { type: 'open', record: 5, mode: 'edit' });

        expect(parseFormListQuery(formListQueryString('', 'tasks', state), 'tasks', RULES)).toEqual({ ok: true, state });
    });
});

describe('nextSortOnHeaderClick', () => {
    it('cycles a column none, ascending, descending, none', () => {
        const first = nextSortOnHeaderClick([], 'title');
        expect(first).toEqual([{ field: 'title', direction: 'asc' }]);
        const second = nextSortOnHeaderClick(first, 'title');
        expect(second).toEqual([{ field: 'title', direction: 'desc' }]);
        expect(nextSortOnHeaderClick(second, 'title')).toEqual([]);
    });

    it('starts another column ascending and drops the others', () => {
        expect(nextSortOnHeaderClick([{ field: 'title', direction: 'desc' }, { field: 'entry_date', direction: 'asc' }], 'entry_date')).toEqual([
            { field: 'entry_date', direction: 'asc' },
        ]);
    });
});

describe('pickFormListQuery', () => {
    it('keeps the pairs that can belong to a list, unchanged and in order', () => {
        expect(pickFormListQuery('?page_id=5&tasks.page=2&lang=de&news.q=a%20b&utm_source=mail&tasks.f.state=open')).toBe(
            'tasks.page=2&news.q=a%20b&tasks.f.state=open',
        );
    });

    it('recognises an encoded dot and ignores names that are not a list key', () => {
        expect(pickFormListQuery('tasks%2Epage=2&Tasks.page=1&.page=1&9a.page=1&x=1')).toBe('tasks%2Epage=2');
        expect(pickFormListQuery('')).toBe('');
    });
});

describe('formListCacheKey', () => {
    const scope = {
        apiBase: 'https://api.example.test',
        account: 41,
        languageId: 2,
        platform: 'web' as const,
        pageId: 7,
        sectionId: 311,
        key: 'tasks',
    };

    it('is the same for two spellings of one state and ignores foreign parameters', () => {
        const a = formListCacheKey(scope, 'tasks.q=write+report&tasks.page=2&utm_source=x');
        const b = formListCacheKey(scope, 'lang=de&tasks.page=2&tasks.q=write%20report');

        expect(a).toEqual(b);
    });

    it('differs by account, guest, language, platform, server, page and section', () => {
        const query = 'tasks.page=2';
        const base = JSON.stringify(formListCacheKey(scope, query));
        const variants = [
            { ...scope, account: 42 },
            { ...scope, account: null },
            { ...scope, languageId: 3 },
            { ...scope, platform: 'mobile' as const },
            { ...scope, apiBase: 'https://other.example.test' },
            { ...scope, pageId: 8 },
            { ...scope, sectionId: 312 },
        ].map((variant) => JSON.stringify(formListCacheKey(variant, query)));

        expect(new Set([base, ...variants]).size).toBe(variants.length + 1);
        expect(formListCacheKey({ ...scope, account: null }, query)).toContain('guest');
    });

    it('differs by list state', () => {
        expect(formListCacheKey(scope, 'tasks.page=2')).not.toEqual(formListCacheKey(scope, 'tasks.page=3'));
        expect(formListCacheKey(scope, '')).toEqual(formListCacheKey(scope, 'news.page=3'));
    });

    it('differs by the route of the page and keeps the list state as its last part', () => {
        const three = formListCacheKey({ ...scope, route: { record_id: '3' } }, 'tasks.page=2');
        const four = formListCacheKey({ ...scope, route: { record_id: '4' } }, 'tasks.page=2');
        const none = formListCacheKey(scope, 'tasks.page=2');

        expect(three).not.toEqual(four);
        expect(three).not.toEqual(none);
        expect(formListCacheKey({ ...scope, route: {} }, 'tasks.page=2')).toEqual(none);
        expect(formListCacheKey({ ...scope, route: null }, 'tasks.page=2')).toEqual(none);
        expect(three[three.length - 1]).toBe('tasks.page=2');
        expect(three.slice(0, -1)).toHaveLength(8);
        // Two spellings of one route share an entry.
        expect(formListCacheKey({ ...scope, route: { b: '2', a: '1' } }, '')).toEqual(formListCacheKey({ ...scope, route: { a: '1', b: '2' } }, ''));
    });
});

describe('formListRouteQuery', () => {
    it('names the route parameters of a page the way the state request wants them', () => {
        expect(formListRouteQuery({ record_id: '3' })).toBe('route%5Brecord_id%5D=3');
        expect(formListRouteQuery({ token: 'a.b-c~d', user_id: '42' })).toBe('route%5Btoken%5D=a.b-c~d&route%5Buser_id%5D=42');
    });

    it('sorts by name and percent-encodes the values', () => {
        expect(formListRouteQuery({ b: 'x y', a: 'ü/&=' })).toBe('route%5Ba%5D=%C3%BC%2F%26%3D&route%5Bb%5D=x%20y');
    });

    it('is empty for a page without route parameters and leaves out what cannot be one', () => {
        expect(formListRouteQuery(undefined)).toBe('');
        expect(formListRouteQuery(null)).toBe('');
        expect(formListRouteQuery({})).toBe('');
        expect(formListRouteQuery({ record_id: '' })).toBe('');
        expect(formListRouteQuery({ record_id: undefined })).toBe('');
        expect(formListRouteQuery({ 'bad name': '1', '9x': '1', 'a[b]': '1' })).toBe('');
        expect(formListRouteQuery({ long: 'x'.repeat(256) })).toBe('');
        expect(formListRouteQuery({ long: 'x'.repeat(255) })).toBe(`route%5Blong%5D=${'x'.repeat(255)}`);
    });

    it('never names more parameters than the server accepts', () => {
        const route = Object.fromEntries(Array.from({ length: 12 }, (_, index) => [`p${String(index).padStart(2, '0')}`, '1']));
        const query = formListRouteQuery(route);

        expect(query.split('&')).toHaveLength(8);
        expect(query.split('&')[0]).toBe('route%5Bp00%5D=1');
    });
});
