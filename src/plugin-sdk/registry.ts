/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * TypeScript mirror of the UNIFIED `registry.json` served by a SelfHelp plugin
 * registry.
 *
 * The registry is a single catalogue consumed by BOTH installers: the SelfHelp
 * Manager (core/frontend/scheduler/worker Docker releases) and the CMS/backend
 * (plugin releases). Every component array is a list of release REFS
 * (`{id, version, channel, releaseUrl}`) pointing at standalone signed release
 * documents; a plugin with several published versions appears as several refs, so
 * the host can resolve the newest COMPATIBLE version per plugin.
 *
 * Mirrors the backend JSON Schemas in the sibling repo
 * (`sh-selfhelp_backend/docs/plugins/plugin-registry.schema.json` +
 * `config/schemas/registry/plugin-release.schema.json`) and the SelfHelp Manager
 * Zod schema. Keep all three in sync (see AGENTS.md).
 */

/**
 * Registry channels, kept in parity with the canonical `ReleaseChannel` set
 * (`stable | beta | nightly | test`) used by the unified distribution registry
 * wire schema, the SelfHelp Manager, and the backend. Exposed as a runtime tuple
 * so the cross-repo parity test can assert the sets match.
 */
export const PLUGIN_REGISTRY_CHANNELS = ['stable', 'beta', 'nightly', 'test'] as const;
export type TPluginRegistryChannel = (typeof PLUGIN_REGISTRY_CHANNELS)[number];

/**
 * One published (component, version) entry in the unified index. Identical shape
 * for plugins and the platform components (core/frontend/scheduler/worker) — the
 * `releaseUrl` resolves (against the index `baseUrl`) to the signed release
 * document validated by `plugin-release.schema.json` / `core-release.schema.json`.
 */
export interface IRegistryReleaseRef {
    /** Component id (e.g. `sh2-shp-survey-js`, `selfhelp-core`). */
    id: string;
    /** SemVer version of this release. */
    version: string;
    /** Channel this version was published to. */
    channel: TPluginRegistryChannel;
    /** Absolute or `baseUrl`-relative URL of the signed release document. */
    releaseUrl: string;
    /** When true the host installer must not offer this version. */
    blocked?: boolean;
}

/** Ed25519 signature block carried by every signed release document. */
export interface IRegistrySignatureBlock {
    /** Base64 detached Ed25519 signature of the canonical payload. */
    signature: string;
    /** Publisher key identifier, resolved against the trusted-keys file. */
    keyId: string;
    /** Optional inline canonical payload (omitted when the verifier recomputes it). */
    signedPayload?: string;
    /** Optional SHA-256 of the canonical payload (`sha256:` prefix allowed). */
    signedPayloadSha256?: string;
}

/**
 * A standalone signed plugin release document (the target of a `plugins[]` ref).
 *
 * Mirrors `plugin-release.schema.json`. The release expresses compatibility on
 * two axes (`compatibility.core` + `compatibility.pluginApi`); the author-facing
 * `plugin.json` manifest keeps `compatibility.selfhelp` + `pluginApiVersion`,
 * which the publish tooling maps onto these ranges.
 */
export interface IPluginRelease {
    /** Discriminator — always `selfhelp-plugin-release`. */
    kind: 'selfhelp-plugin-release';
    /** Plugin id (matches the ref in the index). */
    id: string;
    /** SemVer version (matches the ref in the index). */
    version: string;
    /** Channel (matches the ref in the index). */
    channel: TPluginRegistryChannel;
    /** True when the manifest declared `security.trustLevel: "official"`. */
    official: boolean;
    /** Compatibility ranges the host must satisfy. */
    compatibility: {
        /** Semver range of SelfHelp core versions this plugin runs on. */
        core: string;
        /** Semver range of host plugin-API versions this plugin runs on. */
        pluginApi: string;
    };
    /** Optional other-plugin requirements consumed by the resolver. */
    dependencies?: {
        plugins?: { id: string; range: string }[];
    };
    /** The install artifact + canonical manifest the host fetches. */
    artifacts: {
        /** URL of the full `plugin.json` snapshot. */
        manifestUrl: string;
        /** URL of the signed `.shplugin` archive the backend downloads. */
        archiveUrl: string;
        /** SHA-256 of the `.shplugin` (`sha256:` prefix allowed). */
        sha256: string;
    };
    /** Ed25519 signature block. */
    security: IRegistrySignatureBlock;
    /** When true the host installer must not offer this version. */
    blocked?: boolean;
}

/**
 * Unified registry root document (`registry.json`).
 *
 * Mirrors `plugin-registry.schema.json` in the host repository. Required:
 * `schemaVersion`, `requiresManager`, `baseUrl`, and the five release-ref arrays
 * `core` / `frontend` / `scheduler` / `worker` / `plugins`.
 */
export interface IPluginRegistry {
    /** Canonical registry schema version. */
    schemaVersion: string;
    /** Semver range of SelfHelp Manager versions that can consume this registry. */
    requiresManager: string;
    /** ISO timestamp this registry was published. */
    publishedAt?: string;
    /** Base URL used to resolve relative `releaseUrl` / artifact paths (with trailing slash). */
    baseUrl: string;
    /** Publisher metadata shown in the admin UI. */
    publisher?: { name: string; url?: string };
    /** SelfHelp core Docker release refs (Manager-installed). */
    core: IRegistryReleaseRef[];
    /** SelfHelp frontend Docker release refs (Manager-installed). */
    frontend: IRegistryReleaseRef[];
    /** Scheduled-jobs-runner release refs (Manager-installed). */
    scheduler: IRegistryReleaseRef[];
    /** Messenger-worker release refs (Manager-installed). */
    worker: IRegistryReleaseRef[];
    /** Plugin release refs (CMS-installed) — multi-version, one ref per published version. */
    plugins: IRegistryReleaseRef[];
    /** Optional path to the security advisory feed. */
    advisoriesUrl?: string;
    /** Optional path to the cross-component compatibility feed. */
    compatibilityUrl?: string;
    /** Optional path to the public trusted-keys file. */
    trustedKeysUrl?: string;
}
