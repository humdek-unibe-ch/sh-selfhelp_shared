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

/**
 * Generic component renderer. We avoid pulling in React types here to
 * keep the SDK framework-agnostic; the runtime casts to the appropriate
 * component type at registration time.
 */
export type TPluginComponent<TProps = unknown> = (props: TProps) => unknown;

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
 * plugin only supports read-only mobile rendering.
 */
export interface IMobilePluginApi extends Omit<IPluginApi, 'richTextEditor'> {
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
}
