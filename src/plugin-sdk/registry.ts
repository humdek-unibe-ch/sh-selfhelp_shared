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
 *
 * Mirrors `plugin-registry.schema.json`. The version field is named
 * `registryVersion` (integer, bumped only on breaking registry-document
 * changes).
 */
export interface IPluginRegistry {
    /** Registry schema generation. Bumped only on breaking registry-document changes. */
    registryVersion: number;
    /** Registry display name. */
    name: string;
    /** Registry homepage / maintainer URL. */
    homepage?: string;
    /** ISO timestamp this registry was published. */
    publishedAt?: string;
    /** Public key used to verify per-version signatures. */
    trustKey?: { algo: 'ed25519'; publicKeyId: string; publicKey: string };
    /** Channels this registry exposes (subset of stable/beta/alpha/nightly). */
    channels?: TPluginRegistryChannel[];
    /** Listed plugins. */
    plugins: IPluginRegistryEntry[];
}
