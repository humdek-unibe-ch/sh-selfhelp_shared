/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * TypeScript mirror of `registry.json` served by a plugin registry.
 * The host installer fetches registries (public and private), merges
 * per-channel metadata, and shows update availability + changelogs in
 * the admin UI.
 */

export type TPluginRegistryChannel = 'stable' | 'beta' | 'alpha' | 'nightly';

export interface IPluginRegistryVersionEntry {
    /** SemVer version. */
    version: string;
    /** Channel this version was published to. */
    channel: TPluginRegistryChannel;
    /** ISO datetime the version was published. */
    publishedAt: string;
    /** Whether this version is a breaking change vs the previous one. */
    breaking?: boolean;
    /** Whether the host installer should block this version. */
    blocked?: boolean;
    /** Optional reason for `blocked: true`. */
    blockedReason?: string;
    /** Composer / npm tarball or git source URL. */
    sources: {
        backend?: { type: 'composer' | 'git'; package?: string; ref?: string; url?: string };
        frontend?: { type: 'npm' | 'git'; package?: string; url?: string };
        mobile?: { type: 'npm' | 'git'; package?: string; url?: string };
    };
    /** SHA-256 checksum of the published artifact. */
    checksumSha256: string;
    /** Optional Ed25519 signature, base64. */
    signatureEd25519?: string;
    /** Compatibility metadata mirrored from the manifest. */
    compatibility: {
        selfhelp: string;
        php?: string;
        node?: string;
        react?: string;
        reactNative?: string;
        expoSdk?: string;
        pluginApiVersion: string;
    };
    /** Plain-text changelog. Markdown supported. */
    changelog?: string;
    /** Mirror of `dependencies` from the manifest, for resolver-only consumption. */
    dependencies?: { pluginId: string; version: string; required: boolean }[];
}

export interface IPluginRegistryEntry {
    /** Plugin id (e.g. `sh2-shp-survey-js`). */
    id: string;
    /** Display name. */
    name: string;
    /** Short description. */
    description?: string;
    /** Homepage / repo URL. */
    homepage?: string;
    /** Trust level published by the registry. */
    trustLevel: 'official' | 'reviewed' | 'untrusted';
    /** Available versions. */
    versions: IPluginRegistryVersionEntry[];
    /** Optional public icon URL. */
    iconUrl?: string;
    /** Optional categories. */
    categories?: string[];
}

/**
 * Registry root document.
 */
export interface IPluginRegistry {
    /** Schema version of this registry document. */
    schemaVersion: '1.0';
    /** Registry display name. */
    name: string;
    /** ISO timestamp this registry was generated. */
    generatedAt: string;
    /** Registry maintainer URL. */
    maintainer?: string;
    /** Listed plugins. */
    plugins: IPluginRegistryEntry[];
}
