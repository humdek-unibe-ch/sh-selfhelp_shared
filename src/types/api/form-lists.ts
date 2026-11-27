/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * DTOs of the `entry-form-list` and `data-view` styles ("lists").
 *
 * They mirror the backend contracts under
 * `config/schemas/api/v1/{common/_form_list_state,common/_form_list_error,
 * responses/frontend/form_list_*,requests/frontend/list_*}.json` and
 * `docs/reference/api/22-form-lists.md`. The server decides, clients draw:
 * nothing in here lets a client evaluate access, conditions, filters or
 * quick-action assignments. A list's state is read from the page payload
 * (`list_state` / `list_error` on the section) or from
 * `GET /cms-api/v1/lists/{section_id}/state`.
 */
import type { TStyle } from '../styles/unknown';
import type { IBaseApiResponse } from './envelope';
import type { IFormEffectiveContext } from './forms';

// -- vocabulary ----------------------------------------------------------------

export type TFormListStyleName = 'entry-form-list' | 'data-view';
/**
 * `custom` (a `data-view` only): the sections placed inside the view are the layout of one
 * record; the server renders them per record into each row's `sections`.
 */
export type TFormListLayout = 'table' | 'cards' | 'custom';
export type TFormListPresentation = 'modal' | 'page';
export type TFormListColumnFormat = 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'badge' | 'file' | 'image';
export type TFormListControlType = 'text' | 'select' | 'multi_select' | 'boolean' | 'date_range' | 'number_range';
export type TFormListTextMatch = 'contains' | 'eq' | 'starts_with';
export type TFormListSortDirection = 'asc' | 'desc';
/** What the URL asks for next to a record: look at it, edit it, or start a new one. */
export type TFormListMode = 'view' | 'edit' | 'create' | 'history';
/** The modes of an open record (`create` has no record). */
export type TFormListOpenMode = Exclude<TFormListMode, 'create'>;

// -- state ----------------------------------------------------------------------

/** An uploaded file in a cell. `url` is a section-scoped download route; no storage path ever leaves the server. */
export interface IFormListFileValue {
    index: number;
    name: string;
    mime?: string | null;
    size?: number | null;
    url: string;
}

/**
 * A file / image cell: the `files` list of contract 2. Format `image` is drawn as a
 * thumbnail; `file` as download links. Never a bare array of files and never a storage key.
 */
export interface IFormListFilesCell {
    files: IFormListFileValue[];
}

/** A cell as the server sends it: text, a number, nothing, or a file/image cell. */
export type TFormListCellValue = string | number | null | IFormListFilesCell;

/** Author text in the visitor's language. `add` and `confirm_delete` exist on `entry-form-list` only. */
export type TFormListLabels = Partial<Record<'add' | 'empty' | 'search' | 'confirm_delete', string>>;

export interface IFormListInfo {
    section_id: number;
    page_id: number;
    /** The list's name in the URL: `<key>.page`, `<key>.q`, ... */
    key: string;
    style: TFormListStyleName;
    layout: TFormListLayout;
    form_presentation: TFormListPresentation;
    /**
     * The section that creates and edits records.
     * For an `entry-form-list` that owns its table (no foreign `data_table`),
     * this is the **list's own** section id. It is `null` for a `data-view`
     * and for an `entry-form-list` with a foreign `data_table` (read-only
     * override: delete and quick actions only, no form).
     */
    form_section_id: number | null;
    /** False while the list's form was never submitted: there is nothing to read yet. */
    table_exists: boolean;
    labels: TFormListLabels;
    /** Classes of the element that holds the records of the `custom` layout (web only); empty otherwise. */
    row_css: string;
    /**
     * True when the author placed sections inside a data view with the `custom` layout.
     * A `custom` layout without any is drawn as cards.
     */
    has_template: boolean;
}

export interface IFormListColumn {
    /** The key of `values` in rows. */
    field: string;
    label: string;
    format: TFormListColumnFormat;
    sortable: boolean;
    searchable: boolean;
}

export interface IFormListControlOption {
    value: string;
    label: string;
    /** Records holding the value inside the visitor's dataset; null for fixed choices. */
    count: number | null;
}

export interface IFormListControl {
    /** The `<key>.f.<id>` URL parameter. */
    id: string;
    type: TFormListControlType;
    field: string;
    label: string;
    match?: TFormListTextMatch;
    options?: IFormListControlOption[];
}

export interface IFormListSort {
    field: string;
    direction: TFormListSortDirection;
}

/** The state that was served: the page after clamping, the order in effect, and the URL parameters that express it. */
export interface IFormListServedState {
    page: number;
    page_size: number;
    q: string | null;
    sort: IFormListSort[];
    /** Control id to the control's raw value. */
    filters: Record<string, string>;
    record: number | null;
    mode: TFormListMode | null;
    /** The URL parameters (`news.page`, `news.q`, ...) that express this state; build links from them. */
    query: Record<string, string>;
}

export interface IFormListQuickActionInfo {
    id: string;
    label: string;
    confirm: string | null;
}

export interface IFormListCapabilities {
    /** False for a guest on an own-entries list. */
    create: boolean;
    search: boolean;
    history: boolean;
    /** Labels and confirmations; a row's `quick_actions` say which of them apply to it. */
    quick_actions: IFormListQuickActionInfo[];
}

/** What the visitor may do with one record. These are rendering hints; the server re-checks on every write. */
export interface IFormListRecordAccess {
    is_own: boolean;
    can_update: boolean;
    can_delete: boolean;
    can_view_history: boolean;
    /** Ids of the quick actions whose condition holds now for this record. Offer no other. */
    quick_actions: string[];
    detail_url: string | null;
}

export interface IFormListRow extends IFormListRecordAccess {
    record_id: number;
    entry_date: string;
    /** Send back as `expected_version` when changing the record. */
    version: number;
    /**
     * Content the write was based on (`page:<id>@v<n>|draft` or
     * `res:<type>:<id>@v<n>`). Null when unknown (older rows).
     */
    content_ref?: string | null;
    /** Exactly the configured columns, by field. */
    values: Record<string, TFormListCellValue>;
    /**
     * Only with the `custom` layout: the author's row template rendered for this record, in the
     * shape of page sections (tokens, translations and conditions already resolved). Render them
     * like any other sections; never evaluate anything.
     */
    sections?: TStyle[];
}

/** The record that is open (view or edit). */
export interface IFormListSelected extends IFormListRecordAccess {
    record_id: number;
    mode: TFormListOpenMode;
    entry_date: string;
    /** Send back as `expected_version` when saving, deleting, running an action or restoring. */
    version: number;
    /**
     * Content the write was based on (`page:<id>@v<n>|draft` or
     * `res:<type>:<id>@v<n>`). Null when unknown (older rows).
     */
    content_ref?: string | null;
    values: Record<string, TFormListCellValue>;
    /** The prefill the inline form receives on a page load; null when the caller cannot edit the record. */
    form_values: Record<string, unknown> | unknown[] | null;
}

export interface IFormListPagination {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}

/** The server-rendered state of one list for one visitor and one URL state. */
export interface IFormListState {
    list: IFormListInfo;
    columns: IFormListColumn[];
    controls: IFormListControl[];
    state: IFormListServedState;
    capabilities: IFormListCapabilities;
    rows: IFormListRow[];
    pagination: IFormListPagination;
    selected: IFormListSelected | null;
}

/**
 * Why a list on a page has no state. The page is still served; the client draws
 * the list's error state. `parameter` names the URL parameter that caused it - a
 * client may drop it and retry.
 */
export interface IFormListError {
    /** The HTTP status the state endpoint would answer with: 400, 401, 403, 404 or 500. */
    status: number;
    message: string;
    reason?: TFormListErrorReason | string | null;
    parameter?: string | null;
}

export type TFormListErrorReason =
    | 'login_required'
    | 'operation_disabled'
    | 'history_disabled'
    | 'invalid_list_parameter'
    | 'unknown_list_parameter'
    | 'duplicate_list_parameter'
    | 'field_not_allowed'
    | 'table_mismatch'
    | 'unknown_action'
    | 'stale_version'
    | 'action_not_available'
    | 'restore_blocked'
    | 'invalid_list_config';

export type IFormListStateResponse = IBaseApiResponse<IFormListState>;

// -- writes: conflict ---------------------------------------------------------------

/**
 * `data` of the 409 envelope a stale save, delete, quick action or restore answers
 * with. Nothing was written: keep the draft and offer reload, comparison and re-apply.
 */
export interface IFormStaleVersionData {
    reason: 'stale_version';
    record_id: number;
    expected_version: number;
    current_version: number;
}

// -- quick action --------------------------------------------------------------------

export interface IFormListQuickActionRequest extends IFormEffectiveContext {
    page_id: number;
    /** REQUIRED: the record `version` the action is based on; missing or malformed answers 400, an old one 409. */
    expected_version: number;
}

export interface IFormListQuickActionData {
    record_id: number;
    /** The record's version after the action. */
    version: number;
    action: string;
}

export type IFormListQuickActionResponse = IBaseApiResponse<IFormListQuickActionData>;

// -- history -------------------------------------------------------------------------

export type TDataRevisionOperation = 'create' | 'update' | 'delete' | 'restore' | 'baseline';
export type TDataRevisionSource = 'form' | 'admin' | 'quick_action' | 'job' | 'import' | 'system' | 'plugin';

export interface IFormListActor {
    id: number;
    name: string | null;
}

/** One revision of a record: who changed it, how, and how much. */
export interface IFormListRevision {
    version: number;
    /** UTC, ISO 8601 (ATOM). */
    created_at: string;
    operation: TDataRevisionOperation;
    source: TDataRevisionSource;
    actor: IFormListActor | null;
    impersonated_by: IFormListActor | null;
    restored_from_version: number | null;
    /** The number of fields the revision changed. */
    changed_fields: number;
    is_checkpoint: boolean;
    /**
     * Content that revision was based on (`page:<id>@v<n>|draft` or
     * `res:<type>:<id>@v<n>`). Null when unknown (older revisions).
     */
    content_ref?: string | null;
}

/** A file a revision held; `available` is false once the file was erased. */
export interface IFormListHistoricalFile {
    index: number;
    name: string;
    available: boolean;
    /** Historical-file download route when `available` (list or admin data browser). */
    url?: string;
}

/**
 * Explicit file-field instruction on update (contract 4). Omit the field to keep
 * files; send this object (or its JSON string in multipart) to clear or drop indexes.
 * A new upload then replaces (single-file) or appends (multi-file).
 */
export interface IFormFileFieldOp {
    remove?: boolean;
    remove_indexes?: number[];
}

interface IFormListChangeBase {
    field_key: string;
    field_label: string | null;
    language_id: number;
    truncated: boolean;
}

export interface IFormListValueChange extends IFormListChangeBase {
    change: 'added' | 'changed' | 'removed';
    kind: 'value';
    before: string | null;
    after: string | null;
}

export interface IFormListFileChange extends IFormListChangeBase {
    change: 'added' | 'changed' | 'removed';
    kind: 'file';
    before: null;
    after: null;
    before_files: IFormListHistoricalFile[];
    after_files: IFormListHistoricalFile[];
}

/** A change of a revision or of a comparison. */
export type TFormListChange = IFormListValueChange | IFormListFileChange;

/** A field of the record as it stood after a version. */
export interface IFormListStateField {
    field_key: string;
    field_label: string | null;
    language_id: number;
    kind: 'value' | 'file';
    value: string | null;
    files: IFormListHistoricalFile[];
}

export interface IFormListHistoryQuery extends IFormEffectiveContext {
    page_id: number;
    page?: number;
    /** 1 to 100, default 20. */
    page_size?: number;
}

export interface IFormListHistoryData {
    /** Newest first. */
    items: IFormListRevision[];
    total: number;
    page: number;
    page_size: number;
    current_version: number;
}

export interface IFormListVersionData {
    revision: {
        revision: IFormListRevision;
        changes: TFormListChange[];
    };
    state: {
        version: number;
        current_version: number;
        fields: IFormListStateField[];
    };
}

export interface IFormListCompareQuery extends IFormEffectiveContext {
    page_id: number;
    from: number;
    to: number;
}

export interface IFormListCompareData {
    from_version: number;
    to_version: number;
    current_version: number;
    changes: TFormListChange[];
}

export type TFormListRestoreBlockerReason = 'field_missing' | 'language_missing' | 'file_unavailable' | 'invalid_value';

/** Why one field of an earlier version cannot be written back today. */
export interface IFormListRestoreBlocker {
    field_key: string;
    field_label: string | null;
    language_id: number;
    reason: TFormListRestoreBlockerReason;
    detail: string | null;
}

/** What a restore would write: set a value (and files) or remove what that version did not have. */
export interface IFormListRestoreChange {
    field_key: string;
    field_label: string | null;
    language_id: number;
    action: 'set' | 'remove';
    kind: 'value' | 'file';
    before: string | null;
    after: string | null;
    before_files?: IFormListHistoricalFile[];
    after_files?: IFormListHistoricalFile[];
}

export interface IFormListRestoreRequest extends IFormEffectiveContext {
    page_id: number;
    /** The earlier version to restore. */
    version: number;
    /**
     * The current version the person saw. REQUIRED for a real restore (missing or
     * malformed answers 400, an old one 409); a `dry_run` needs none.
     */
    expected_version?: number;
    /** Restore only these fields (1 to 100) - the way to resolve a blocked restore. */
    field_keys?: string[];
    /** Only report what a restore would change and what blocks it; write nothing. */
    dry_run?: boolean;
}

export interface IFormListRestorePreview {
    dry_run: true;
    restorable: boolean;
    record_id: number;
    from_version: number;
    current_version: number;
    changes: IFormListRestoreChange[];
    blockers: IFormListRestoreBlocker[];
}

export interface IFormListRestoreResult {
    dry_run: false;
    record_id: number;
    restored_from_version: number;
    /** The record's version after the restore (unchanged when nothing differed). */
    version: number;
}

export type TFormListRestoreData = IFormListRestorePreview | IFormListRestoreResult;

/** `data` of the 422 envelope a restore that cannot be applied whole answers with. Nothing was applied. */
export interface IFormListRestoreBlockedData {
    reason: 'restore_blocked';
    record_id: number;
    from_version: number;
    blockers: IFormListRestoreBlocker[];
}

export type IFormListHistoryResponse = IBaseApiResponse<IFormListHistoryData>;
export type IFormListVersionResponse = IBaseApiResponse<IFormListVersionData>;
export type IFormListCompareResponse = IBaseApiResponse<IFormListCompareData>;
export type IFormListRestoreResponse = IBaseApiResponse<TFormListRestoreData>;

// -- admin data-browser history (same payloads, no page_id) -------------------------

/** Restore body for the data browser (contract 6); no page context. */
export interface IAdminDataRecordRestoreRequest {
    version: number;
    expected_version?: number;
    field_keys?: string[];
    dry_run?: boolean;
}

export type IAdminDataRecordHistoryResponse = IFormListHistoryResponse;
export type IAdminDataRecordVersionResponse = IFormListVersionResponse;
export type IAdminDataRecordCompareResponse = IFormListCompareResponse;
export type IAdminDataRecordRestoreResponse = IFormListRestoreResponse;
