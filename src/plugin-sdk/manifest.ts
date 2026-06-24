/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * TypeScript mirror of `plugin.json` (the schema lives in
 * `sh-selfhelp_backend/docs/plugins/plugin-manifest.schema.json`). When
 * the JSON Schema changes, update these types and bump the
 * `@selfhelp/shared` minor version.
 */

export type IPluginManifestTrustLevel = 'official' | 'reviewed' | 'untrusted';

/** Every privileged capability is deny-by-default. */
export type IPluginManifestCapability =
    | 'backendBundle'
    | 'databaseMigrations'
    | 'readUsers'
    | 'writeUsers'
    | 'deleteUsers'
    | 'readDataTables'
    | 'writeDataTables'
    | 'deleteDataTables'
    | 'externalNetworkAccess'
    | 'scheduledJobs'
    | 'publicCallbacks'
    | 'adminPages'
    | 'frontendStyles'
    | 'mobileStyles'
    | 'realtimePublish'
    | 'fileUploads'
    | 'secretAccess'
    | 'lookupExtend'
    | 'lookupOwnGroup';

export interface IPluginManifestCompatibility {
    /** SemVer range for the SelfHelp CMS version (e.g. `^2.0`). */
    selfhelp: string;
    /** SemVer range for PHP runtime. */
    php?: string;
    /** SemVer range for Node runtime. */
    node?: string;
    /** SemVer range for React (web). */
    react?: string;
    /** SemVer range for React Native (mobile). */
    reactNative?: string;
    /** SemVer range for Expo SDK. */
    expoSdk?: string;
    /**
     * SemVer range for the host mobile renderer contract
     * (`MOBILE_RENDERER_VERSION`) the plugin's mobile package supports. The
     * SelfHelp Manager gates a plugin's mobile package against the selected
     * `selfhelp-mobile-preview` image's advertised `mobileRendererVersion`.
     * Absent for web-only plugins.
     */
    mobile?: string;
}

export interface IPluginManifestDependency {
    /** Plugin id this plugin requires. */
    pluginId: string;
    /** Required SemVer range. */
    version: string;
    /** Optional / required dependency. */
    required: boolean;
    /**
     * When `required: false`, the plugin still works without the dep
     * but enables additional features when present.
     */
    featureFlag?: string;
}

export interface IPluginManifestConflict {
    pluginId: string;
    /** SemVer range that conflicts. */
    version: string;
    reason: string;
}

export interface IPluginManifestExternalHost {
    /** Wildcards allowed, e.g. `cdn.example.com` or `*.example.com`. */
    host: string;
    /** What is loaded — `script`, `style`, `font`, `image`, `iframe`, `fetch`. */
    type: 'script' | 'style' | 'font' | 'image' | 'iframe' | 'fetch';
    /** Reason for the external host (shown in admin UI). */
    reason: string;
}

export interface IPluginManifestSecurity {
    trustLevel: IPluginManifestTrustLevel;
    capabilities: IPluginManifestCapability[];
    /** CSP rules the installer must add (only for `trustLevel !== 'untrusted'`). */
    cspRules?: {
        /** Maps a CSP directive to extra sources. */
        [directive: string]: string[];
    };
    /** External hosts the plugin will load assets/data from. */
    externalHosts?: IPluginManifestExternalHost[];
    /** Path to file containing checksum/signature, optional. */
    signaturePath?: string;
}

export interface IPluginManifestDataAccess {
    /**
     * Dedicated tables the plugin owns (created by its migrations). Must be
     * `lowercase_snake_case` (schema pattern `^[a-z][a-z0-9_]*$`).
     */
    ownedTables?: string[];
    /**
     * Prefix for CMS `data_tables` rows the plugin creates at runtime. Must be
     * `lowercase_snake_case` ending in `_` (schema pattern `^[a-z][a-z0-9_]*_$`).
     */
    ownedDataTablePrefix?: string;
    /**
     * Tables the plugin reads. May be `dataTable:*` for any plugin-owned
     * data table, `lookup:<typeCode>` for lookup reads, `dataTable:my`
     * for tables created by this plugin.
     */
    read?: string[];
    /** Tables the plugin writes. */
    write?: string[];
    /** Tables the plugin deletes (rare; requires capability). */
    delete?: string[];
}

export interface IPluginManifestRealtimeTopic {
    /** Topic key, scoped to this plugin. Example: `survey-response`. */
    key: string;
    /** Human description shown in admin UI. */
    description: string;
    /** Permission required to subscribe; resolved via `PluginRealtimePermissionResolver`. */
    requiredPermission?: string;
    /** JSON Schema path of the topic payload. */
    payloadSchemaPath?: string;
}

export interface IPluginManifestFeatureFlag {
    key: string;
    description: string;
    /** Default state when no `plugin_feature_flags` row exists. */
    defaultEnabled: boolean;
    /** Optional capability gate; flag cannot be turned on without it. */
    capability?: IPluginManifestCapability;
}

export interface IPluginManifestLookupExtension {
    /** Lookup type code, e.g. `survey_question_type`. */
    typeCode: string;
    /** Whether the plugin OWNS the type code or only extends it. */
    ownership: 'plugin_extendable' | 'plugin_owned';
    entries: {
        code: string;
        value: string;
        description?: string;
    }[];
}

export interface IPluginManifestPermission {
    /** Permission key, namespaced like `surveyjs.surveys.manage`. */
    key: string;
    description: string;
    /** Optional default role keys the permission is granted to. */
    defaultRoles?: string[];
}

export interface IPluginManifestStyle {
    /** Style name (used as `style_name` discriminator). */
    name: string;
    description: string;
    canHaveChildren: boolean;
    /** Optional capability requirement (e.g. `frontendStyles`). */
    capability?: IPluginManifestCapability;
}

export interface IPluginManifestAdminPage {
    /** Slug under `/admin/plugins-host/{pluginId}/`. */
    slug: string;
    /** Menu label. */
    label: string;
    /** Required permission key. */
    permission: string;
    /** Optional menu icon (Tabler icon name). */
    icon?: string;
}

export interface IPluginManifestApiRoute {
    /** Symfony route name (must be namespaced with the plugin id). */
    name: string;
    /** HTTP path under `/cms-api/v1/plugins/{pluginId}/...`. */
    path: string;
    methods: ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')[];
    /** Permission key required. */
    permission?: string;
}

export interface IPluginManifestScheduledJob {
    /** Job type key. */
    type: string;
    description: string;
    /** Capability gate (always requires `scheduledJobs`). */
    capability: 'scheduledJobs';
}

export interface IPluginManifestAsset {
    /** Source path within the plugin package. */
    src: string;
    /** Destination path under `/assets/plugins/{pluginId}/...`. */
    dest: string;
    /** Asset type. */
    type: 'script' | 'style' | 'font' | 'image' | 'other';
}

export interface IPluginManifestHealth {
    /** Optional health-check endpoint name. */
    endpoint?: string;
    /** Health-check service id (resolved through Symfony). */
    serviceId?: string;
}

export interface IPluginManifestMobile {
    /** npm package name of the mobile component bundle. */
    package: string;
    /** Required SemVer range. */
    version: string;
    /** Whether the mobile package only renders payloads (readonly). */
    readonly: boolean;
}

/**
 * Full `plugin.json` shape.
 */
export interface IPluginManifest {
    /** Plugin identifier, e.g. `sh2-shp-survey-js`. */
    id: string;
    /** Human-readable display name. */
    name: string;
    /** Short description. */
    description?: string;
    /** Plugin SemVer version. */
    version: string;
    /** Author / vendor. */
    author?: { name: string; email?: string; url?: string };
    /** SPDX license id. */
    license?: string;
    /** Plugin homepage / repo URL. */
    homepage?: string;
    /** SDK contract version the plugin targets (e.g. `1.0`). */
    pluginApiVersion: string;

    /** Compatibility with the host stack. */
    compatibility: IPluginManifestCompatibility;

    /** Required + optional plugin dependencies. */
    dependencies?: IPluginManifestDependency[];

    /** Plugin conflicts. */
    conflicts?: IPluginManifestConflict[];

    /** Composer package (only for `trustLevel !== 'untrusted'`). */
    backend?: {
        package: string;
        bundleClass: string;
        migrationsNamespace?: string;
    };

    /** npm package for frontend. */
    frontend?: {
        package: string;
        version: string;
    };

    /** Optional mobile package. */
    mobile?: IPluginManifestMobile;

    /** Required security declarations. */
    security: IPluginManifestSecurity;

    /** Permissions the plugin contributes. */
    permissions?: IPluginManifestPermission[];

    /** Manifest-declared data access. */
    dataAccess?: IPluginManifestDataAccess;

    /** Realtime topics. */
    realtimeTopics?: IPluginManifestRealtimeTopic[];

    /** Feature flags. */
    featureFlags?: IPluginManifestFeatureFlag[];

    /** Lookup contributions. */
    lookups?: {
        extends?: IPluginManifestLookupExtension[];
    };

    /** Styles contributed to the registry. */
    styles?: IPluginManifestStyle[];

    /** Admin pages mounted under `/admin/plugins-host/{pluginId}/`. */
    adminPages?: IPluginManifestAdminPage[];

    /** Plugin-owned API routes. */
    apiRoutes?: IPluginManifestApiRoute[];

    /** Scheduled jobs. */
    scheduledJobs?: IPluginManifestScheduledJob[];

    /** Vendored assets. */
    assets?: IPluginManifestAsset[];

    /** Health-check declaration. */
    health?: IPluginManifestHealth;

    /** Optional metadata / labels. */
    labels?: Record<string, string>;
}
