/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * The URL grammar of a list (`entry-form-list` / `data-view`), shared by the web
 * frontend and the mobile app so a link, a bookmark and a cache key mean the same
 * thing on both and on the server.
 *
 *     <key>.page=2   <key>.q=anna   <key>.sort=title:asc,entry_date:desc
 *     <key>.f.<id>=value   <key>.record=17   <key>.mode=view|edit|create
 *
 * The parser mirrors the backend `FormListUrlStateParser` rule for rule: it is
 * strict, so a parameter in the list's namespace that is unknown, repeated,
 * written as an array or malformed is refused instead of silently ignored. The
 * server is the authority (it knows the list's sortable columns, controls and
 * operations); pass them as {@link IFormListUrlRules} to refuse early what it
 * would refuse. Parameters outside the namespace (the page, the language, other
 * lists, anything unrelated) are never touched and always survive a change of
 * list state.
 *
 * The state names choices only. It never carries a table, a column filter, an
 * operation or a permission, and no draft form value or credential belongs in a
 * URL.
 */
import type { IFormListSort, TFormListMode } from '../types/api/form-lists';

export const FORM_LIST_MODES: readonly TFormListMode[] = ['view', 'edit', 'create', 'history'];
/** The largest page number a URL may name. */
export const FORM_LIST_MAX_PAGE = 1_000_000;
/** A parameter value is at most this many bytes (UTF-8). */
export const FORM_LIST_MAX_VALUE_BYTES = 1000;
export const FORM_LIST_SEARCH_MIN_LENGTH = 2;
export const FORM_LIST_SEARCH_MAX_LENGTH = 100;
export const FORM_LIST_MAX_SORTS = 3;

/** How many route parameters a list state request carries at most (the server refuses more). */
export const FORM_LIST_MAX_ROUTE_PARAMS = 8;

/** The longest value of a route parameter the server accepts. */
export const FORM_LIST_MAX_ROUTE_VALUE_LENGTH = 255;

/** What a visitor changed in a list, as it travels in the page URL. */
export interface IFormListUrlState {
    /** 1-based. A page past the end is served as the last page. */
    page: number;
    /** The visitor's search text, trimmed; null = no search. */
    q: string | null;
    /** The visitor's sort keys; empty = the list's own default order. */
    sort: IFormListSort[];
    /** Control id to the control's raw value (a control without a value is absent). */
    filters: Record<string, string>;
    /** The record that is open. */
    record: number | null;
    /** `view`, `edit` or `create`; null = the list only. */
    mode: TFormListMode | null;
}

/**
 * What the list offers, to refuse early what the server would refuse. Every
 * rule is optional: without it only the grammar is checked.
 */
export interface IFormListUrlRules {
    /** Fields the list can be sorted by (columns marked sortable, `entry_date`). */
    sortable?: readonly string[];
    /** Ids of the list's controls. */
    controls?: readonly string[];
    /** Default true. False on a list that does not allow new entries (and for a guest on an own-entries list). */
    allowCreate?: boolean;
    /** Default true. False on a list that does not allow editing, and on a data view. */
    allowUpdate?: boolean;
    /** Default true. False when `show_history` is off (or on a data view). */
    showHistory?: boolean;
}

export type TFormListUrlErrorReason =
    | 'invalid_list_parameter'
    | 'unknown_list_parameter'
    | 'duplicate_list_parameter'
    | 'operation_disabled'
    | 'history_disabled';

/** Why a URL cannot be a list state. `parameter` names the parameter a client may drop and retry. */
export interface IFormListUrlError {
    /** 400 for a malformed or unknown parameter, 403 for a mode the list does not offer. */
    status: 400 | 403;
    reason: TFormListUrlErrorReason;
    parameter: string;
    message: string;
}

export type TFormListUrlParse =
    | { ok: true; state: IFormListUrlState }
    | { ok: false; error: IFormListUrlError };

/** A change of the list state a visitor can make; see {@link applyFormListUrlChange}. */
export type TFormListUrlChange =
    | { type: 'page'; page: number }
    | { type: 'search'; q: string | null }
    | { type: 'sort'; sort: readonly IFormListSort[] }
    | { type: 'filter'; id: string; value: string | null }
    | { type: 'reset' }
    | { type: 'open'; record: number; mode?: 'view' | 'edit' | 'history' }
    | { type: 'create' }
    | { type: 'close' };

const POSITIVE_INT = /^[1-9][0-9]{0,8}$/;
const SORT_ITEM = /^([A-Za-z][A-Za-z0-9_]{0,63}):(asc|desc)$/;
const CONTROL_ID = /^[a-z][a-z0-9_]{0,31}$/;
const LIST_KEY = /^[a-z][a-z0-9_]{0,31}$/;
/** PHP `trim()`: the server strips exactly these, not every Unicode space. */
const PHP_TRIM_CHARACTERS = ' \t\n\r\0\x0B';

export function emptyFormListUrlState(): IFormListUrlState {
    return { page: 1, q: null, sort: [], filters: {}, record: null, mode: null };
}

/** True when `name` is a parameter of the list called `key` (`<key>.` namespace). */
export function isFormListParam(name: string, key: string): boolean {
    return name.startsWith(`${key}.`);
}

/**
 * Parse the raw query string of a page URL into the state of the list `key`.
 *
 * The raw string is read, not a decoded parameter array: PHP (and many routers)
 * rewrite the dot of `news.q` to `news_q`, which would destroy the namespace.
 */
export function parseFormListQuery(
    query: string | URLSearchParams,
    key: string,
    rules: IFormListUrlRules = {},
): TFormListUrlParse {
    const prefix = `${key}.`;
    const own = new Map<string, string>();
    for (const pair of splitPairs(query)) {
        const equals = pair.indexOf('=');
        const name = lenientDecode(equals === -1 ? pair : pair.slice(0, equals));
        if (!name.startsWith(prefix)) {
            continue;
        }
        if (own.has(name)) {
            return refused(400, 'duplicate_list_parameter', name, `The parameter "${name}" is given twice.`);
        }
        own.set(name, lenientDecode(equals === -1 ? '' : pair.slice(equals + 1)));
    }

    let page = 1;
    let q: string | null = null;
    let sort: IFormListSort[] = [];
    const filters: Record<string, string> = {};
    let record: number | null = null;
    let mode: TFormListMode | null = null;

    for (const [name, value] of own) {
        const suffix = name.slice(prefix.length);
        if (utf8Length(value) > FORM_LIST_MAX_VALUE_BYTES) {
            return refused(400, 'invalid_list_parameter', name, `The parameter "${name}" is too long.`);
        }

        if (suffix === 'page') {
            const parsed = positiveInt(value);
            if (parsed === null) {
                return refused(400, 'invalid_list_parameter', name, `The parameter "${name}" is a positive whole number.`);
            }
            if (parsed > FORM_LIST_MAX_PAGE) {
                return refused(400, 'invalid_list_parameter', name, `The page in "${name}" is out of range.`);
            }
            page = parsed;
        } else if (suffix === 'q') {
            const term = phpTrim(value);
            if (term === '') {
                q = null;
                continue;
            }
            const length = Array.from(term).length;
            if (length < FORM_LIST_SEARCH_MIN_LENGTH || length > FORM_LIST_SEARCH_MAX_LENGTH) {
                return refused(400, 'invalid_list_parameter', name, `A search has ${FORM_LIST_SEARCH_MIN_LENGTH} to ${FORM_LIST_SEARCH_MAX_LENGTH} characters.`);
            }
            q = term;
        } else if (suffix === 'sort') {
            const sorts = parseSort(value, name, rules.sortable);
            if (!Array.isArray(sorts)) {
                return { ok: false, error: sorts };
            }
            sort = sorts;
        } else if (suffix === 'record') {
            const parsed = positiveInt(value);
            if (parsed === null) {
                return refused(400, 'invalid_list_parameter', name, `The parameter "${name}" is a positive whole number.`);
            }
            record = parsed;
        } else if (suffix === 'mode') {
            if (!isMode(value)) {
                return refused(400, 'invalid_list_parameter', name, `The mode in "${name}" is view, edit, create or history.`);
            }
            mode = value;
        } else if (suffix.startsWith('f.')) {
            const controlId = suffix.slice(2);
            const known = rules.controls === undefined ? CONTROL_ID.test(controlId) : rules.controls.includes(controlId);
            if (!known) {
                return refused(400, 'unknown_list_parameter', name, `The list has no filter "${controlId}".`);
            }
            if (value !== '') {
                filters[controlId] = value;
            }
        } else {
            return refused(400, 'unknown_list_parameter', name, `The list has no parameter "${name}".`);
        }
    }

    return withMode({ page, q, sort, filters, record, mode }, key, rules);
}

/**
 * The state as URL parameters, in the order the server echoes them (`page` only
 * above 1, then `q`, `sort`, the filters, `record`, `mode`). Empty state, no
 * parameters.
 */
export function encodeFormListQuery(key: string, state: IFormListUrlState): Record<string, string> {
    const query: Record<string, string> = {};
    if (state.page > 1) {
        query[`${key}.page`] = String(state.page);
    }
    if (state.q !== null && state.q !== '') {
        query[`${key}.q`] = state.q;
    }
    if (state.sort.length > 0) {
        query[`${key}.sort`] = state.sort.map((item) => `${item.field}:${item.direction}`).join(',');
    }
    for (const [id, value] of Object.entries(state.filters)) {
        if (value !== '') {
            query[`${key}.f.${id}`] = value;
        }
    }
    if (state.record !== null) {
        query[`${key}.record`] = String(state.record);
    }
    if (state.mode !== null) {
        query[`${key}.mode`] = state.mode;
    }

    return query;
}

/**
 * The query string (no leading `?`) of a link that shows `state` of the list
 * `key` on the page whose current query string is `base`.
 *
 * Every parameter outside the list's namespace is kept exactly as it was, in
 * its place; the list's own parameters are replaced by the encoding of `state`
 * and appended last. Opening a record, paging or searching never drops the
 * language, a preview flag, another list's state or a campaign parameter.
 */
export function formListQueryString(base: string | URLSearchParams, key: string, state: IFormListUrlState): string {
    const kept = splitPairs(base).filter((pair) => {
        const equals = pair.indexOf('=');
        return !isFormListParam(lenientDecode(equals === -1 ? pair : pair.slice(0, equals)), key);
    });
    const written = Object.entries(encodeFormListQuery(key, state)).map(
        ([name, value]) => `${encodeURIComponent(name)}=${encodeValue(value)}`,
    );

    return [...kept, ...written].join('&');
}

/**
 * The next state after a visitor's change. Pure; the URL is then rebuilt with
 * {@link formListQueryString}.
 *
 * Narrowing the list (search, sort, filter, reset) goes back to page 1, because
 * the old page number may no longer exist. The open record is left alone: the
 * server reads it inside the list's dataset and never inside the visitor's
 * filters, so a link to a record keeps working after the visitor narrows the
 * list. Open, create and close change the record and mode and keep the rest.
 */
export function applyFormListUrlChange(state: IFormListUrlState, change: TFormListUrlChange): IFormListUrlState {
    switch (change.type) {
        case 'page':
            return { ...state, page: clampPage(change.page) };
        case 'search': {
            const term = change.q === null ? '' : phpTrim(change.q);
            return { ...state, q: term === '' ? null : term, page: 1 };
        }
        case 'sort':
            return { ...state, sort: change.sort.slice(0, FORM_LIST_MAX_SORTS).map((item) => ({ ...item })), page: 1 };
        case 'filter': {
            const filters = { ...state.filters };
            if (change.value === null || change.value === '') {
                delete filters[change.id];
            } else {
                filters[change.id] = change.value;
            }
            return { ...state, filters, page: 1 };
        }
        case 'reset':
            return { ...state, page: 1, q: null, sort: [], filters: {} };
        case 'open':
            return { ...state, record: change.record, mode: change.mode ?? 'view' };
        case 'create':
            return { ...state, record: null, mode: 'create' };
        case 'close':
            return { ...state, record: null, mode: null };
        default: {
            // Compile-time exhaustiveness: a new change type must be handled above.
            const unhandled: never = change;
            throw new Error(`Unknown list state change: ${JSON.stringify(unhandled)}`);
        }
    }
}

/**
 * The sort a click on a column header asks for: none -> ascending -> descending
 * -> none, one key at a time. A click on another column starts that column
 * ascending and drops the others.
 */
export function nextSortOnHeaderClick(current: readonly IFormListSort[], field: string): IFormListSort[] {
    const first = current[0];
    if (first === undefined || first.field !== field) {
        return [{ field, direction: 'asc' }];
    }
    if (first.direction === 'asc') {
        return [{ field, direction: 'desc' }];
    }

    return [];
}

/**
 * The raw `name=value` pairs of a page URL that can belong to a list: those whose
 * name starts with a list key and a dot. Forward exactly these, unchanged, to
 * `GET /pages/by-keyword/{keyword}` and `GET /pages/resolve` so the server can
 * render the lists of the page. The client does not know the page's list keys
 * before it asks, and the server only reads the namespaces of lists that exist.
 */
export function pickFormListQuery(query: string | URLSearchParams): string {
    return splitPairs(query)
        .filter((pair) => {
            const equals = pair.indexOf('=');
            const name = lenientDecode(equals === -1 ? pair : pair.slice(0, equals));
            const dot = name.indexOf('.');

            return dot > 0 && LIST_KEY.test(name.slice(0, dot));
        })
        .join('&');
}

/**
 * The route parameters of a page as the list state request names them: `route[record_id]=3`.
 *
 * A page with a route (`/team/{record_id}`) draws the layout of a record with `{{route.record_id}}`, so the
 * state of a list depends on the route as well as on the page. The client repeats the declared parameters
 * of the page it shows (`page.route_params`); the server does not believe them, it checks them against the
 * routes of that page. Names and values are percent-encoded, sorted by name, and a parameter that cannot be a
 * route parameter (a name that is not a placeholder name, an empty value, a value that is too long, or one
 * beyond {@link FORM_LIST_MAX_ROUTE_PARAMS}) is left out. Returns `''` for a page without route parameters.
 */
export function formListRouteQuery(route: Readonly<Record<string, string | undefined>> | null | undefined): string {
    if (!route) {
        return '';
    }

    return Object.entries(route)
        .filter((entry): entry is [string, string] => {
            const [name, value] = entry;

            return ROUTE_PARAM_NAME.test(name) && typeof value === 'string' && value !== '' && value.length <= FORM_LIST_MAX_ROUTE_VALUE_LENGTH;
        })
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .slice(0, FORM_LIST_MAX_ROUTE_PARAMS)
        .map(([name, value]) => `route%5B${encodeURIComponent(name)}%5D=${encodeURIComponent(value)}`)
        .join('&');
}

/** What a list's cached state depends on. Log out and a server switch clear every list cache. */
export interface IFormListCacheScope {
    /** The API base URL of the server the account belongs to. */
    apiBase: string;
    /** The signed-in account's id; null for a guest. */
    account: string | number | null;
    languageId: number;
    platform: 'web' | 'mobile';
    pageId: number;
    sectionId: number;
    /** The list's key in the URL. */
    key: string;
    /**
     * The declared route parameters of the page (`page.route_params`). The layout of a record can read them, so
     * the same page and section with another route is another list state.
     */
    route?: Readonly<Record<string, string | undefined>> | null;
}

/**
 * A stable client cache key for one list in one state: API base, account (or
 * guest), language, platform, page, section, the declared route of the page and
 * the normalized `<key>.*` parameters (sorted, decoded, so two spellings of
 * one state share an entry). The last part is always the list's own state; every
 * part before it identifies the list itself.
 * Never reuse a key across accounts: the same URL shows different records to
 * different people.
 */
export function formListCacheKey(scope: IFormListCacheScope, query: string | URLSearchParams): readonly (string | number)[] {
    const own = splitPairs(query)
        .map((pair): [string, string] => {
            const equals = pair.indexOf('=');
            return [lenientDecode(equals === -1 ? pair : pair.slice(0, equals)), lenientDecode(equals === -1 ? '' : pair.slice(equals + 1))];
        })
        .filter(([name]) => isFormListParam(name, scope.key))
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([name, value]) => `${name}=${value}`)
        .join('&');

    return [
        'form-list',
        scope.apiBase,
        scope.account === null ? 'guest' : String(scope.account),
        scope.languageId,
        scope.platform,
        scope.pageId,
        scope.sectionId,
        formListRouteQuery(scope.route),
        own,
    ];
}

// -- internals ------------------------------------------------------------------------------

/** A route placeholder name, as the server's route patterns allow it. */
const ROUTE_PARAM_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

function refused(status: 400 | 403, reason: TFormListUrlErrorReason, parameter: string, message: string): TFormListUrlParse {
    return { ok: false, error: { status, reason, parameter, message } };
}

/** The record and the mode belong together; a mode the list does not offer is forbidden, not malformed. */
function withMode(state: IFormListUrlState, key: string, rules: IFormListUrlRules): TFormListUrlParse {
    let mode = state.mode;
    if (mode === null && state.record !== null) {
        mode = 'view';
    }

    if (mode === 'create') {
        if (state.record !== null) {
            return refused(400, 'invalid_list_parameter', `${key}.record`, 'A new entry has no record.');
        }
        if (rules.allowCreate === false) {
            return refused(403, 'operation_disabled', `${key}.mode`, 'This list does not allow new entries.');
        }
    } else if (mode !== null && state.record === null) {
        return refused(400, 'invalid_list_parameter', `${key}.record`, `The mode "${mode}" needs a record.`);
    }
    if (mode === 'edit' && rules.allowUpdate === false) {
        return refused(403, 'operation_disabled', `${key}.mode`, 'This list does not allow editing.');
    }
    if (mode === 'history' && rules.showHistory === false) {
        return refused(403, 'history_disabled', `${key}.mode`, 'This list does not offer history.');
    }

    return { ok: true, state: { ...state, mode } };
}

function parseSort(value: string, name: string, sortable: readonly string[] | undefined): IFormListSort[] | IFormListUrlError {
    if (value === '') {
        return [];
    }
    const items = value.split(',');
    const fail = (message: string): IFormListUrlError => ({ status: 400, reason: 'invalid_list_parameter', parameter: name, message });
    if (items.length > FORM_LIST_MAX_SORTS) {
        return fail(`At most ${FORM_LIST_MAX_SORTS} sort keys.`);
    }

    const sorts: IFormListSort[] = [];
    const seen = new Set<string>();
    for (const item of items) {
        const match = SORT_ITEM.exec(item);
        if (match === null) {
            return fail('A sort key is "column:asc" or "column:desc".');
        }
        const field = match[1] ?? '';
        const direction = match[2] === 'desc' ? 'desc' : 'asc';
        if (sortable !== undefined && !sortable.includes(field)) {
            return fail(`The list cannot be sorted by "${field}".`);
        }
        if (seen.has(field)) {
            return fail(`"${field}" is sorted twice.`);
        }
        seen.add(field);
        sorts.push({ field, direction });
    }

    return sorts;
}

/** `trim()` of PHP: strips space, tab, newline, carriage return, NUL and vertical tab, nothing else. */
function phpTrim(text: string): string {
    let start = 0;
    let end = text.length;
    while (start < end && PHP_TRIM_CHARACTERS.includes(text.charAt(start))) {
        start += 1;
    }
    while (end > start && PHP_TRIM_CHARACTERS.includes(text.charAt(end - 1))) {
        end -= 1;
    }

    return text.slice(start, end);
}

function positiveInt(value: string): number | null {
    return POSITIVE_INT.test(value) ? Number(value) : null;
}

function isMode(value: string): value is TFormListMode {
    return (FORM_LIST_MODES as readonly string[]).includes(value);
}

function clampPage(page: number): number {
    if (!Number.isFinite(page)) {
        return 1;
    }

    return Math.min(FORM_LIST_MAX_PAGE, Math.max(1, Math.trunc(page)));
}

function splitPairs(query: string | URLSearchParams): string[] {
    const text = typeof query === 'string' ? query : query.toString();
    const trimmed = text.startsWith('?') ? text.slice(1) : text;

    return trimmed.split('&').filter((pair) => pair !== '');
}

/** `rawurldecode(str_replace('+', ' ', ...))` as the server reads it; a malformed escape stays as written. */
function lenientDecode(text: string): string {
    return text
        .replace(/\+/g, ' ')
        .replace(/(?:%[0-9A-Fa-f]{2})+/g, (run) => {
            try {
                return decodeURIComponent(run);
            } catch {
                return run;
            }
        });
}

/** A value in a link: percent-encoded, with the readable separators of the grammar left as they are. */
function encodeValue(value: string): string {
    return encodeURIComponent(value).replace(/%3A/g, ':').replace(/%2C/g, ',');
}

function utf8Length(text: string): number {
    let bytes = 0;
    for (const character of text) {
        const code = character.codePointAt(0) ?? 0;
        bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
    }

    return bytes;
}
