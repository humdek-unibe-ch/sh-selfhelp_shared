/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Runtime types used by `definePlugin()` / `defineMobilePlugin()` calls.
 *
 * Plugins are loaded by `PluginRuntime` at boot. The runtime imports the
 * plugin's npm package, calls its exported `register()` function and
 * passes it an `IPluginApi` instance. The plugin returns an
 * `IPluginRegistration` describing what it contributes (styles, admin
 * pages, menu items, health checks, etc.).
 *
 * Frontend (`react`) and mobile (`react-native`) plugins share most of
 * the surface; mobile-only types are suffixed with `Mobile`.
 */

import type { IStyleRegistryEntry } from '../registry/styles.registry';

import type { IPluginSyncEntry } from './sync-map';

/**
 * Generic component renderer. We avoid pulling in React types here to
 * keep the SDK framework-agnostic; the runtime casts to the appropriate
 * component type at registration time.
 */
export type TPluginComponent<TProps = unknown> = (props: TProps) => unknown;

/**
 * Where a plugin item is used (C7). Pages the caller may not read are counted
 * only in `hidden_count`.
 */
export interface IResourceUsage {
    pages: Array<{
        id: number;
        keyword: string;
        title: string | null;
        draft_uses: boolean;
        published_uses: boolean;
    }>;
    actions: Array<{ id: number; name: string }>;
    hidden_count: number;
}

/**
 * One item of `GET /admin/plugins/{pluginId}/settings` (C14). Secrets never
 * carry a clear `value`; `hint` is the last 4 characters when the secret is
 * long enough, otherwise null.
 */
export interface IPluginSettingViewItem {
    key: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'url';
    secret: boolean;
    required: boolean;
    has_value: boolean;
    value: string | number | boolean | null;
    hint: string | null;
    overridden_by_env: boolean;
}

/** The C14 GET settings list for one plugin. */
export type IPluginSettingsView = IPluginSettingViewItem[];

/**
 * Definition of a CMS style contributed by a plugin.
 */
export interface IStyleDefinition extends Omit<IStyleRegistryEntry, 'category'> {
    /** Style name (becomes the `style_name` discriminator). */
    name: string;
    /**
     * Category. Plugins should usually pick `'plugin'`, but may opt into
     * an existing category (e.g. `'forms'`) when the style is a
     * drop-in replacement.
     */
    category: IStyleRegistryEntry['category'];
    /** Style implementation component (React or React Native). */
    component: TPluginComponent;
}

/**
 * The popup a page is shown in, as the host sees it. Outside a popup
 * `inModal` is false and `closeModal()` does nothing, so a plugin can call
 * it unconditionally (for example after a save, like the core form's
 * `close_modal_on_save`).
 */
export interface IPluginPageModal {
    inModal: boolean;
    closeModal: () => void;
}

/**
 * The page a plugin section is drawn on. A plugin endpoint that serves or
 * accepts data for the section names the page and the section in every call
 * (with this language, preview state and route), so the server can check
 * access and read the section's settings itself (rule 7.7), like the core
 * form and form list do.
 */
export interface IPluginStylePage {
    /** Page id; null while the page content is not known yet. */
    id: number | null;
    languageId: number | null;
    /** Whether the page is shown as the editor's draft (preview mode). */
    preview: boolean;
    /** The page's declared route parameters (`page.route_params`). */
    routeParams: Record<string, string>;
}

/**
 * Props the host passes to a plugin style component (the `component` of an
 * {@link IStyleDefinition}). `style` is the section as the page payload
 * carries it (fields keyed by name).
 */
export interface IPluginStyleProps {
    style: Record<string, unknown>;
    styleProps: Record<string, string>;
    cssClass: string;
    parentActive?: number;
    childIndex?: number;
    parentColor?: string;
    /** The popup the page is shown in; a no-op outside one. */
    pageModal: IPluginPageModal;
    /** The page the section is on, to name in plugin calls. */
    page: IPluginStylePage;
}

/**
 * Props passed by the host's section-field editor to a plugin-supplied
 * field renderer. The host owns the surrounding label / help tooltip /
 * type badge; the plugin only owns the actual input control.
 *
 * `field` is intentionally typed as a loose record because the host's
 * `IFieldData` lives in the frontend repo and must not leak into the
 * shared SDK contract — plugins read only what they need (id, name,
 * config, default_value, etc.).
 */
export interface IPluginFieldRendererProps {
    /** Field id (database row id). */
    fieldId: number;
    /** Field name (DB `fields.name`). */
    fieldName: string;
    /** Field type (`fields.type`, e.g. `select-survey-js`). */
    fieldType: string;
    /** Current string value bound to the section_field translation. */
    value: string;
    /** Persist a new string value on the section_field translation. */
    onChange: (value: string) => void;
    /** Whether the input is disabled by the host. */
    disabled?: boolean;
    /** Loose pass-through of the host field row (config, default, help, ...). */
    field?: Record<string, unknown>;
}

/**
 * Field renderer contributed by a plugin. Replaces the host default
 * editor control for the given `fieldType`. Used by the CMS
 * section-field editor in the frontend repo so plugins can ship custom
 * pickers (e.g. SurveyJS survey select) without the host having to
 * hardcode plugin-specific UI in `FieldRenderer.tsx`.
 *
 * The component receives {@link IPluginFieldRendererProps}.
 */
export interface IFieldRendererDefinition {
    /** Field type discriminator (`fields.type`, e.g. `select-survey-js`). */
    fieldType: string;
    /** React component that renders the input control. */
    component: TPluginComponent<IPluginFieldRendererProps>;
}

/**
 * Admin page contributed by a plugin. Mounted under
 * `/admin/plugins-host/{pluginId}/{slug}` in the frontend.
 */
export interface IAdminPageDefinition {
    /** URL slug relative to the host shell. */
    slug: string;
    /** Display title in tabs / breadcrumbs. */
    title: string;
    /** Required permission key. */
    permission?: string;
    /** Page component (React). */
    component: TPluginComponent;
    /** Optional preloader hook called during SSR/prefetch. */
    prefetch?: () => Promise<void>;
}

/**
 * Menu item contributed by a plugin.
 */
export interface IMenuItemDefinition {
    /** Stable key. */
    key: string;
    /** Display label. */
    label: string;
    /** Optional Tabler icon name. */
    icon?: string;
    /** Target href; defaults to the admin page slug. */
    href?: string;
    /** Required permission key. */
    permission?: string;
    /** Position relative to existing host menus. */
    position?: { section: 'admin' | 'cms' | 'tools'; order: number };
}

/**
 * Health-check declaration. Invoked through the doctor command and the
 * Plugin detail page's Health tab.
 */
export interface IPluginHealthCheck {
    /** Stable key (e.g. `surveyjs.license`). */
    key: string;
    /** Display label. */
    label: string;
    /** Optional severity threshold. */
    severity?: 'info' | 'warning' | 'error';
    /** Runs the check; returns ok/warn/error + detail. */
    run: () => Promise<{ status: 'ok' | 'warn' | 'error'; detail?: string }>;
}

/**
 * Feature-flag declaration. The host installer seeds the flag based on
 * `defaultEnabled`; admins toggle through the Plugin detail page.
 */
export interface IPluginFeatureFlag {
    key: string;
    label: string;
    description?: string;
    defaultEnabled: boolean;
}

/**
 * Realtime topic declared by the plugin. Wraps Mercure topics under the
 * scoped path `selfhelp/plugin/{pluginId}/{topicKey}`. Plugins never
 * talk to Mercure directly.
 */
export interface IPluginRealtimeTopic<TPayload = unknown> {
    /** Topic key, unique within the plugin. */
    key: string;
    /** Optional permission required to subscribe. */
    requiredPermission?: string;
    /**
     * Optional payload validator. Receives the SSE event data and must
     * either return the typed payload or throw. The SDK runs this on
     * the receiving side; the publisher runs the same validator before
     * publishing.
     */
    validate?: (raw: unknown) => TPayload;
}

/**
 * Realtime publisher exposed to plugin server-side code (mostly inside
 * the plugin's Symfony bundle). Plugins must never instantiate Mercure
 * clients directly.
 */
export interface IPluginRealtimePublisher {
    /** Publish a payload to a topic registered by the plugin. */
    publish<TPayload>(topicKey: string, payload: TPayload, options?: {
        /** Audience scope. Defaults to `permission`. */
        audience?: 'permission' | 'broadcast' | 'admins';
        /** Per-publish topic parameters (e.g. survey id). */
        topicParams?: Record<string, string | number>;
    }): Promise<void>;
}

/**
 * Rich text editor adapter. Both the SurveyJS plugin's `rich-text`
 * question type and the CMS core's `rich-text-editor` style consume
 * this adapter so a single Tiptap-based editor backs both.
 *
 * Plugins must provide a sanitization step on the backend; this
 * adapter only owns the editor UI.
 */
export interface IRichTextEditorAdapterOptions {
    /** Optional editor mode hint. */
    mode?: 'inline' | 'block';
    /**
     * Allowed format for the stored value:
     *   - `markdown`         — string of Markdown.
     *   - `sanitized-html`   — HTML string passed through DOMPurify on the
     *                          backend.
     *   - `prosemirror-json` — JSON shape produced by Tiptap.
     */
    format: 'markdown' | 'sanitized-html' | 'prosemirror-json';
    /** Optional toolbar restriction. */
    toolbar?: ('bold' | 'italic' | 'underline' | 'strike' | 'code' | 'link' | 'heading' | 'bulletList' | 'orderedList' | 'blockquote' | 'image')[];
    /** Whether to allow image upload. */
    allowImages?: boolean;
    /** Whether to allow links. */
    allowLinks?: boolean;
    /** Custom placeholder text. */
    placeholder?: string;
}

export interface IRichTextEditorValue {
    /** Versioned format token, matches the adapter `format`. */
    format: 'markdown' | 'sanitized-html' | 'prosemirror-json';
    /** Stringified content (Markdown / HTML) or stringified JSON. */
    content: string;
}

/**
 * The host-side editor adapter passed to plugins through `IPluginApi`.
 */
export interface IRichTextEditorAdapter {
    /**
     * Mount the editor at the given DOM node (web) or component node
     * (mobile) with the initial value. The returned object exposes a
     * setter and a destroyer.
     */
    mount(target: unknown, options: IRichTextEditorAdapterOptions & {
        initialValue?: IRichTextEditorValue;
        onChange?: (value: IRichTextEditorValue) => void;
    }): {
        setValue(value: IRichTextEditorValue): void;
        destroy(): void;
    };
}

/**
 * Host API passed to plugins at registration time.
 */
export interface IPluginApi {
    /** Plugin id (provided by the host so the plugin does not duplicate it). */
    pluginId: string;
    /** Plugin version, mirrored from the manifest. */
    pluginVersion: string;
    /** Live feature-flag accessor. */
    isFeatureEnabled(flagKey: string): boolean;
    /** Host realtime publisher (only available on the backend side). */
    realtime?: IPluginRealtimePublisher;
    /** Host rich-text editor adapter. */
    richTextEditor: IRichTextEditorAdapter;
    /**
     * The host's HTML sanitizer, with the same rules core pages use (web:
     * DOMPurify, plus the host's link rewrites). Call it before rendering any
     * CMS or user HTML; never bundle a sanitizer of your own. `inline` keeps
     * inline markup only, `block` also keeps headings, lists and paragraphs.
     */
    sanitizeHtml(html: string, mode: 'inline' | 'block'): string;
    /**
     * CSS selector for a rendered section element (C23). Returns
     * `.section-<id>`. Web only.
     */
    sectionAnchor(sectionId: number): string;
    /** Where-used for a plugin item the caller may view (C7, C11). */
    resources: {
        usage(type: string, id: number): Promise<IResourceUsage>;
    };
    /**
     * Optional host UI parts. `ResourceUsageList` is offered when the host
     * ships a shared where-used list for delete warnings.
     */
    ui?: {
        ResourceUsageList: TPluginComponent<{
            type: string;
            id: number;
            warnBeforeDelete?: boolean;
        }>;
    };
    /**
     * This plugin's settings as the host stores them (C14). Secrets show
     * `has_value` only; clear values are never returned for secrets.
     */
    settings: {
        get(): Promise<IPluginSettingsView>;
    };
    /**
     * Logger that respects the host's debug config. Avoid `console.log`
     * in plugin code; route everything through this.
     */
    log: {
        debug(message: string, context?: Record<string, unknown>): void;
        info(message: string, context?: Record<string, unknown>): void;
        warn(message: string, context?: Record<string, unknown>): void;
        error(message: string, context?: Record<string, unknown>): void;
    };
}

/**
 * Same shape on mobile, minus the rich-text editor adapter when the
 * plugin only supports read-only mobile rendering. Web-only C11 / C23 members
 * are omitted. React Native does not render HTML, so there is no
 * `sanitizeHtml` on mobile. HTML rule for mobile plugins:
 *   - Native React Native text: `parseInlineRich` (inline formatting and
 *     links) and `stripHtmlToText` (plain text), both exported from
 *     `@selfhelp/shared/plugin-sdk`.
 *   - HTML inside the plugin's own WebView: the plugin bundles a sanitizer into
 *     the WebView runtime and keeps a strict CSP. The host offers no sanitizer
 *     on mobile.
 *   - Web part: `api.sanitizeHtml`; never bundle a sanitizer there.
 */
export interface IMobilePluginApi extends Omit<
    IPluginApi,
    'richTextEditor' | 'sanitizeHtml' | 'sectionAnchor' | 'resources' | 'ui' | 'settings'
> {
    /** Mobile builds without rich-text support set this to `null`. */
    richTextEditor: IRichTextEditorAdapter | null;
}

/**
 * Returned by `definePlugin()` for the frontend / admin side of a
 * plugin.
 */
export interface IPluginRegistration {
    /** Plugin id, must match the manifest. */
    id: string;
    /** Plugin version, must match the manifest. */
    version: string;
    /** SDK contract version the plugin targets. */
    pluginApiVersion: string;
    /** CMS styles the plugin contributes. */
    styles?: IStyleDefinition[];
    /** Admin pages the plugin contributes. */
    adminPages?: IAdminPageDefinition[];
    /** Menu items the plugin contributes. */
    menuItems?: IMenuItemDefinition[];
    /** Health checks the plugin exposes to the host. */
    healthChecks?: IPluginHealthCheck[];
    /** Feature flags the plugin declares. */
    featureFlags?: IPluginFeatureFlag[];
    /** Realtime topics the plugin publishes / subscribes to. */
    realtimeTopics?: IPluginRealtimeTopic[];
    /**
     * CMS section-field editor renderers contributed by the plugin.
     * Allows plugins to ship custom pickers for plugin-owned field types
     * (declared in the plugin's Doctrine migration as new rows in
     * `field_types`) without the host having to hardcode the renderer.
     */
    fieldRenderers?: IFieldRendererDefinition[];
    /**
     * Declarative sync map (C10). The host invalidates each matching
     * `queryKey` as a prefix when a change notice carries a listed tag.
     */
    sync?: IPluginSyncEntry[];
}

/**
 * Returned by `defineMobilePlugin()` for the mobile side of a plugin.
 */
export interface IMobilePluginRegistration {
    id: string;
    version: string;
    pluginApiVersion: string;
    /** Mobile-only style implementations. */
    styles?: IStyleDefinition[];
    /** Mobile-only realtime topics. */
    realtimeTopics?: IPluginRealtimeTopic[];
    /** Mobile feature flags (mirror of the manifest flags). */
    featureFlags?: IPluginFeatureFlag[];
    /**
     * Declarative sync map (C10). Same shape as the web registration; the
     * mobile host invalidates matching query keys from `applySyncTags`.
     */
    sync?: IPluginSyncEntry[];
}
