/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * TypeScript mirror of `selfhelp.plugins.lock.json`. This file lives at
 * the project root of the backend deployment and is the deterministic
 * source of truth for which plugin versions are installed, what migrations
 * ran, which checksums are pinned, and what mobile packages each EAS
 * profile bundles.
 *
 * The lock file is written atomically by the install/update command. It
 * is NEVER edited by hand.
 */

export interface IPluginLockMigration {
    /** Doctrine migration class name. */
    className: string;
    /** Migration file SHA-256 hash, recorded for tamper detection. */
    sha256: string;
    /** ISO datetime the migration was executed. */
    executedAt: string;
    /** Whether `down()` is declared safe by the plugin. */
    safeDown: boolean;
}

export interface IPluginLockMobileEntry {
    /** EAS profile name (e.g. `production-default`, `production-bern`). */
    profile: string;
    /** npm package + version that this profile bundles for the plugin. */
    package: string;
    version: string;
}

export interface IPluginLockEntry {
    /** Plugin id. */
    id: string;
    /** Pinned plugin version (the manifest version that was installed). */
    version: string;
    /** SDK contract version the plugin targets. */
    pluginApiVersion: string;
    /** Trust level recorded at install time. */
    trustLevel: 'official' | 'reviewed' | 'untrusted';
    /** Capabilities granted at install time. */
    capabilities: string[];
    /** Source descriptor that produced the install. */
    source: {
        kind: 'public-registry' | 'private-registry' | 'git' | 'local';
        url?: string;
        gitSha?: string;
        registryUrl?: string;
    };
    /** Backend Composer package + version, if any. */
    backend?: {
        package: string;
        version: string;
        bundleClass: string;
    };
    /** Frontend npm package + version, if any. */
    frontend?: {
        package: string;
        version: string;
    };
    /** Per-EAS-profile mobile package pin. */
    mobile?: IPluginLockMobileEntry[];
    /** SHA-256 checksum of the published artifact. */
    checksumSha256: string;
    /** Optional Ed25519 signature, base64. */
    signatureEd25519?: string;
    /** Hashes of every migration this plugin has executed. */
    migrations: IPluginLockMigration[];
    /** Plugin-owned style names contributed at install time. */
    ownedStyles: string[];
    /** Plugin-owned API route names contributed at install time. */
    ownedApiRoutes: string[];
    /** Plugin-owned realtime topics contributed at install time. */
    ownedRealtimeTopics: string[];
    /** Plugin-owned lookup type codes (`plugin_owned`) contributed at install time. */
    ownedLookupTypeCodes: string[];
    /** Feature flags shipped with the plugin and their default state. */
    featureFlags: { key: string; defaultEnabled: boolean }[];
    /** Whether the plugin is currently enabled. */
    enabled: boolean;
    /** ISO datetime of the install/update event. */
    installedAt: string;
    /** ISO datetime of the last update. */
    updatedAt: string;
    /** Optional notes that the installer wants to surface. */
    notes?: string;
}

/**
 * Root document of `selfhelp.plugins.lock.json`.
 *
 * Mirrors `plugin-lock.schema.json`. The schema requires
 * `lockfileVersion`, `generatedAt`, `sdk`, and `plugins`. The schema
 * stores plugins as a keyed object (`{ [pluginId]: lockedPlugin }`),
 * but for typed consumers we expose it as an array of entries plus the
 * keyed object so both shapes are usable.
 */
export interface IPluginLock {
    /** Lock-file schema generation. Bumped only on breaking changes. */
    lockfileVersion: number;
    /** ISO datetime the lock file was last written. */
    generatedAt: string;
    /** SDK contract pin captured at write time. */
    sdk: {
        /** SemVer of the `@selfhelp/shared` package that wrote this file. */
        version: string;
        /** Plugin API version the host honors at write time. */
        pluginApiVersion: string;
    };
    /**
     * Installed plugins keyed by plugin id. Each entry follows
     * `IPluginLockEntry`. The schema stores this as an object, not an
     * array, so iteration order is undefined.
     */
    plugins: Record<string, IPluginLockEntry>;
    /**
     * Optional install mode hint, preserved for tooling that already
     * read it from earlier lock-file revisions.
     */
    installMode?: 'development' | 'managed' | 'trusted';
}
