/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Cross-repo SelfHelp distribution contracts: registry index + release metadata
 * (core / frontend / scheduler / worker / plugin), security advisories,
 * compatibility rules, signed trusted keys, the per-instance manifest + lock +
 * inventory, update preflight, backup manifest, and support-bundle metadata.
 *
 * `@selfhelp/shared` is the cross-repo contract SOURCE for these shapes so the
 * web frontend, mobile app, and plugins can consume them without importing the
 * manager. The SelfHelp Manager (`sh-manager/packages/schemas`) keeps the
 * runtime Zod validators + JSON schemas; both MUST stay in parity (verified by
 * `src/types/__tests__/distribution.test.ts` against the manager's example
 * fixtures). The shapes mirror
 * `sh-selfhelp_backend/docs/archive/core-installation-and-distribution-plan.md`.
 *
 * These files are written by the manager as camelCase JSON, so (unlike the
 * snake_case CMS API contracts in `./api/system`) these contracts are camelCase.
 */

/**
 * Canonical release channels, shared verbatim across the registry wire schema
 * (`sh2-plugin-registry/registry.schema.json`), the SelfHelp Manager
 * (`@shm/schemas`), and the backend (`RegistryReleaseRef::CHANNELS`). `test` is
 * the staging/rehearsal channel used to dry-run a publish→install→update before
 * promoting to `stable`. Kept as a runtime tuple so cross-repo parity can be
 * asserted (see `__tests__/channel-parity.test.ts`).
 */
export const RELEASE_CHANNELS = ['stable', 'beta', 'nightly', 'test'] as const;
export type ReleaseChannel = (typeof RELEASE_CHANNELS)[number];
export type InstanceMode = 'production' | 'local';
export type TrustLevel = 'official' | 'reviewed' | 'untrusted';
export type AdvisorySeverity = 'low' | 'medium' | 'high' | 'critical';

/** Ed25519 detached-signature block shared by every signed registry payload. */
export interface SignatureBlock {
    signature: string;
    keyId: string;
    signedPayload?: string;
    signedPayloadSha256?: string;
}

// ---------------------------------------------------------------------------
// Server inventory (/opt/selfhelp/selfhelp.server.json)
// ---------------------------------------------------------------------------

export type InstanceStatus =
    | 'active'
    | 'disabled'
    | 'removed_keep_data'
    | 'installing'
    | 'updating'
    | 'error';

export interface InventoryInstanceEntry {
    instanceId: string;
    domain: string;
    path: string;
    composeProject: string;
    status: InstanceStatus;
}

export interface ServerInventory {
    inventoryVersion: number;
    serverId: string;
    manager: {
        name: string;
        repository: string;
        version: string;
    };
    proxy: {
        type: 'traefik';
        network: string;
        composePath: string;
    };
    instances: InventoryInstanceEntry[];
}

// ---------------------------------------------------------------------------
// Instance manifest (selfhelp.instance.json)
// ---------------------------------------------------------------------------

export interface InstanceVersions {
    selfhelp: string;
    backend: string;
    frontend: string;
    scheduler: string;
    worker: string;
    /** Mobile-preview web image version pinned for this instance (additive). */
    mobilePreview?: string;
    pluginApi: string;
}

export interface InstanceImages {
    backend: string;
    frontend: string;
    scheduler: string;
    worker: string;
    mysql: string;
    redis: string;
    mercure: string;
    /** Mobile-preview web image reference (additive). */
    mobilePreview?: string;
}

export interface InstanceRouting {
    publicFrontendUrl: string;
    browserApiPrefix: string;
    internalSymfonyUrl: string;
    symfonyApiPrefix: string;
}

export interface InstalledPlugin {
    id: string;
    version: string;
}

export interface InstanceResourceConfig {
    memoryLimitMb?: number;
    cpuLimit?: number;
    diskWarnThresholdGb?: number;
    logMaxSizeMb?: number;
    logMaxFiles?: number;
}

/**
 * GFS (grandfather-father-son) retention numbers for SCHEDULED backups.
 * Mirrors the manager's authoritative `BackupRetentionPolicy`
 * (sh-manager/packages/schemas/src/types.ts).
 */
export interface BackupRetentionPolicy {
    daily: number;
    weekly: number;
    monthly: number;
    maxAgeDays: number;
}

/**
 * Per-instance nightly backup schedule stored in the instance manifest.
 * Mirrors the manager's authoritative `BackupSchedulePolicy`.
 */
export interface BackupSchedulePolicy {
    enabled: boolean;
    /** Daily run time as `HH:MM` in the manager server's local time. */
    time: string;
    retention: BackupRetentionPolicy;
}

export interface InstanceManifest {
    manifestVersion: number;
    instanceId: string;
    displayName: string;
    domain: string;
    mode: InstanceMode;
    createdAt: string;
    updatedAt: string;
    registry: {
        id: string;
        url: string;
        channel: ReleaseChannel;
    };
    versions: InstanceVersions;
    images: InstanceImages;
    routing: InstanceRouting;
    installedPlugins: InstalledPlugin[];
    resources?: InstanceResourceConfig;
    /** Optional scheduled-backup policy; absent = no scheduled backups. */
    backupSchedule?: BackupSchedulePolicy;
    /**
     * Operator-set non-secret environment overrides merged on top of the
     * generated `.env`. Manager-controlled structural keys and secrets are
     * never stored here. Mirrors the manager's authoritative manifest contract.
     */
    envOverrides?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Instance lock file (selfhelp.lock.json)
// ---------------------------------------------------------------------------

export interface LockServiceEntry {
    image: string;
    digest: string;
}

export interface LockPluginEntry {
    version: string;
    artifactSha256: string;
    signature: string;
    keyId: string;
    compatibility: {
        core: string;
        pluginApi: string;
    };
}

export interface InstanceLock {
    lockfileVersion: number;
    generatedAt: string;
    operationId?: string;
    registry: {
        id: string;
        url: string;
        metadataSha256: string;
    };
    core: {
        version: string;
        backendImageDigest: string;
        frontendImageDigest: string;
        /** Mobile-preview web image digest pinned for this instance (additive). */
        mobilePreviewImageDigest?: string;
        schedulerImageDigest: string;
        workerImageDigest: string;
        migrationVersion: string;
        pluginApiVersion: string;
        signedPayloadSha256: string;
    };
    services: {
        mysql: LockServiceEntry;
        redis: LockServiceEntry;
        mercure: LockServiceEntry;
    };
    plugins: Record<string, LockPluginEntry>;
}

// ---------------------------------------------------------------------------
// Registry index + release metadata
// ---------------------------------------------------------------------------

export interface RegistryReleaseRef {
    id: string;
    version: string;
    channel: ReleaseChannel;
    releaseUrl: string;
    blocked?: boolean;
}

export interface RegistryIndex {
    schemaVersion: string;
    requiresManager: string;
    publishedAt: string;
    baseUrl: string;
    publisher: {
        name: string;
        url: string;
    };
    core: RegistryReleaseRef[];
    frontend: RegistryReleaseRef[];
    scheduler: RegistryReleaseRef[];
    worker: RegistryReleaseRef[];
    plugins: RegistryReleaseRef[];
    /** Mobile-preview web image release refs (additive; older managers ignore). */
    mobilePreview?: RegistryReleaseRef[];
    advisoriesUrl?: string;
    compatibilityUrl?: string;
    trustedKeysUrl?: string;
}

export interface DatabaseMigrationMetadata {
    migrationRange: string;
    destructive: boolean;
    requiresBackup: boolean;
    manualConfirmationRequired: boolean;
    minimumSafeRollbackPoint?: string;
    automaticRollback?: string;
}

export interface ImageRef {
    image: string;
    digest: string;
    phpVersion?: string;
}

export interface RuntimeServiceRange {
    supportedVersions: string;
    minimumRequired?: string;
    recommendedVersion?: string;
    recommendedImage: string;
    recommendedDigest?: string;
    updateRequired?: boolean;
    majorUpgradeRequiresManualApproval?: boolean;
}

export interface RuntimeServicePolicy {
    php?: { backendImagePhpVersion: string };
    mysql: RuntimeServiceRange;
    redis: RuntimeServiceRange;
    mercure: RuntimeServiceRange;
    traefik?: RuntimeServiceRange;
}

export interface CoreRelease {
    kind: 'selfhelp-core-release';
    id: string;
    version: string;
    channel: ReleaseChannel;
    releasedAt: string;
    minimumDirectUpgradeFrom: string;
    pluginApiVersion: string;
    backend: ImageRef;
    worker: ImageRef;
    scheduler: ImageRef;
    frontendCompatibility: { requiredFrontendRange: string };
    database: DatabaseMigrationMetadata;
    runtime?: RuntimeServicePolicy;
    artifacts?: { sbom?: { url: string; sha256: string } };
    security: SignatureBlock;
    blocked?: boolean;
}

export interface FrontendRelease {
    kind: 'selfhelp-frontend-release';
    id: string;
    version: string;
    channel: ReleaseChannel;
    image: string;
    digest: string;
    builtFrom?: { nextStandalone: boolean; sharedPackageVersion: string };
    backendCompatibility: { requiredCoreRange: string; requiredApiVersion: string };
    security: SignatureBlock;
    blocked?: boolean;
}

/** Compatibility descriptor shared by core-coupled service releases. */
export interface ServiceBackendCompatibility {
    requiredCoreRange: string;
    requiredApiVersion?: string;
}

/** Scheduled-jobs runner release, resolved/pinned as a first-class artifact. */
export interface SchedulerRelease {
    kind: 'selfhelp-scheduler-release';
    id: string;
    version: string;
    channel: ReleaseChannel;
    image: string;
    digest: string;
    builtFrom?: Record<string, unknown>;
    backendCompatibility: ServiceBackendCompatibility;
    security: SignatureBlock;
    blocked?: boolean;
}

/** Messenger worker release, resolved/pinned as a first-class artifact. */
export interface WorkerRelease {
    kind: 'selfhelp-worker-release';
    id: string;
    version: string;
    channel: ReleaseChannel;
    image: string;
    digest: string;
    builtFrom?: Record<string, unknown>;
    backendCompatibility: ServiceBackendCompatibility;
    security: SignatureBlock;
    blocked?: boolean;
}

/**
 * One plugin mobile package baked into a mobile-preview image at build time.
 * The preview CI runs `plugins-sync.mjs` against a curated official-plugin set
 * and records the result here so the manager can compute coverage (which
 * enabled plugins render natively vs. fall back to open-on-web in the preview)
 * without inspecting the image.
 */
export interface BundledPluginRef {
    id: string;
    version: string;
    mobilePackage: string;
    mobilePackageVersion: string;
}

/**
 * Mobile-preview web image release, resolved/pinned as a first-class artifact
 * (peer of the frontend release). The image serves the Expo web export at
 * `/mobile-preview` and proxies a narrow `/mobile-preview/api` allowlist to the
 * private backend. `mobileRendererVersion` is the mobile renderer contract the
 * image was built against (what plugin `compatibility.mobile` ranges target);
 * `bundledPlugins` is the curated official-plugin set baked into the image.
 */
export interface MobilePreviewRelease {
    kind: 'selfhelp-mobile-preview-release';
    id: string;
    version: string;
    channel: ReleaseChannel;
    image: string;
    digest: string;
    builtFrom?: { sharedPackageVersion?: string; expoSdk?: string; reactNative?: string };
    backendCompatibility: ServiceBackendCompatibility;
    /** Mobile renderer contract version advertised by this image (semver). */
    mobileRendererVersion: string;
    /**
     * React Native version the preview image was built with. Top-level canonical
     * value the SelfHelp Manager gates a plugin's `compatibility.reactNative`
     * range against (the `builtFrom.reactNative` provenance field mirrors it).
     */
    reactNativeVersion?: string;
    /**
     * Expo SDK version the preview image was built with. Gated against a plugin's
     * `compatibility.expoSdk` range (mirrors `builtFrom.expoSdk`).
     */
    expoSdkVersion?: string;
    /** Curated plugin mobile packages baked into the image. */
    bundledPlugins: BundledPluginRef[];
    security: SignatureBlock;
    blocked?: boolean;
}

export interface PluginRelease {
    kind: 'selfhelp-plugin-release';
    id: string;
    version: string;
    channel: ReleaseChannel;
    official: boolean;
    /**
     * Compatibility ranges the host must satisfy. `mobile` (additive) is the
     * mobile-renderer axis: the range of host `mobileRendererVersion` the
     * plugin's mobile package supports (parallel to `pluginApi`). `reactNative`
     * and `expoSdk` (additive) are gated against the resolved
     * `selfhelp-mobile-preview` image's `reactNativeVersion` / `expoSdkVersion`.
     * All three are absent for web-only plugins.
     */
    compatibility: { core: string; pluginApi: string; mobile?: string; reactNative?: string; expoSdk?: string };
    dependencies?: { plugins: { id: string; range: string }[] };
    artifacts: { manifestUrl: string; archiveUrl: string; sha256: string };
    security: SignatureBlock;
    blocked?: boolean;
}

// ---------------------------------------------------------------------------
// Compatibility + advisories
// ---------------------------------------------------------------------------

export interface CompatibilityRules {
    schemaVersion: string;
    rules: {
        selfhelp: string;
        runtime: RuntimeServicePolicy;
    }[];
}

export interface AdvisoryAffected {
    kind: 'core' | 'frontend' | 'plugin';
    id?: string;
    versions: string;
}

export interface SecurityAdvisory {
    id: string;
    severity: AdvisorySeverity;
    affected: AdvisoryAffected[];
    fixed: { kind: 'core' | 'frontend' | 'plugin'; id?: string; version: string }[];
    recommendedAction: string;
    blocked: boolean;
    detailsUrl?: string;
}

export interface AdvisoryFeed {
    schemaVersion: string;
    advisories: SecurityAdvisory[];
}

export interface TrustedKey {
    keyId: string;
    publicKey: string;
    algorithm: 'ed25519';
    status: 'active' | 'revoked';
}

export interface TrustedKeysFile {
    schemaVersion: string;
    keys: TrustedKey[];
}

// ---------------------------------------------------------------------------
// Preflight / update plan
// ---------------------------------------------------------------------------

export type PreflightStatus = 'ok' | 'warning' | 'blocked';
export type CheckSeverity = 'info' | 'warning' | 'error';

export interface PreflightCheck {
    code: string;
    severity: CheckSeverity;
    message: string;
}

export interface PreflightOption {
    type: string;
    version?: string;
    label: string;
}

export interface UpdatePreflightResult {
    preflightVersion: number;
    status: PreflightStatus;
    instanceId: string;
    currentVersion: string;
    targetVersion: string;
    checks: PreflightCheck[];
    options: PreflightOption[];
    database: {
        destructive: boolean;
        requiresBackup: boolean;
        manualConfirmationRequired: boolean;
    };
    rollback: {
        automaticBeforeMigrations: boolean;
        /**
         * MVP policy: automatic rollback is NEVER promised after a destructive
         * migration (the only recovery is restoring the verified backup).
         */
        automaticAfterDestructiveMigrations: boolean;
    };
}

// ---------------------------------------------------------------------------
// Backup manifest + support bundle
// ---------------------------------------------------------------------------

export interface BackupManifest {
    backupManifestVersion: number;
    backupId: string;
    instanceId: string;
    createdAt: string;
    mode: 'maintenance' | 'online';
    selfhelpVersion: string;
    migrationVersion: string;
    plugins: InstalledPlugin[];
    includedAreas: string[];
    files: { path: string; sha256: string; bytes: number }[];
}

export interface SupportBundleMeta {
    supportBundleVersion: number;
    instanceId: string;
    createdAt: string;
    managerVersion: string;
    schemaVersions: Record<string, number | string>;
    redactionApplied: true;
    contents: string[];
}
