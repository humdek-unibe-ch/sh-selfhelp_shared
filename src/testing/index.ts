/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * `@selfhelp/shared/testing` — the plugin certification kit.
 *
 * Every plugin's certification suite imports from this subpath so the
 * "standard suite every plugin must pass" stays identical across plugins
 * (canonical Testing Rule: plugin certification).
 *
 * Scope: this kit performs the **static manifest certification** — pure,
 * deterministic checks a plugin's CI (and any TS consumer) can run against a
 * parsed `plugin.json` without a database or a running host:
 *
 *   - manifest-valid              required fields + semver/version-format sanity
 *   - capabilities-vs-trust-level known capabilities, trust-level limits,
 *                                 and declared-surface ↔ capability completeness
 *   - compatibility-shape         the adopted single-range compatibility shape
 *   - lookup-ownership            lookup extension ownership + entries
 *   - db-naming                   owned table / data-table-prefix naming rules
 *
 * The **runtime** lifecycle (install → update → rollback → uninstall → purge,
 * realtime-topic registration, cleanup) is enforced by the backend host
 * certification (`tests/Certification/*` + `PluginCapabilityValidator` /
 * `PluginApiRouteSynchronizer` etc.), not here — a TS unit kit cannot install a
 * Composer package or run Doctrine migrations. The two layers are
 * complementary: this kit gates the manifest before publishing; the host gates
 * the actual install.
 *
 * Checks are built on the existing plugin SDK (`IPluginManifest`, the capability
 * union, and the semver helpers) so the kit never re-implements manifest typing
 * or range parsing.
 */

import {
    parseSemver,
    type IPluginManifest,
    type IPluginManifestCapability,
} from '../plugin-sdk';

/** Version of the certification kit contract (asserted by a stability test). */
export const CERTIFICATION_KIT_VERSION = '1.0.0';

// ---------------------------------------------------------------------------
// Check result + report shapes
// ---------------------------------------------------------------------------

export interface ICertificationCheckResult {
    /** Stable check name (one of {@link CERTIFICATION_CHECKS}). */
    readonly name: string;
    readonly passed: boolean;
    /** Human-readable failures; empty when the check passed. */
    readonly errors: readonly string[];
}

export interface IPluginCertificationReport {
    readonly pluginId: string;
    readonly kitVersion: string;
    /** True only when every check passed. */
    readonly passed: boolean;
    readonly results: readonly ICertificationCheckResult[];
}

// ---------------------------------------------------------------------------
// definePluginCertification — declares + runs the standard certification suite.
// ---------------------------------------------------------------------------

export interface IPluginCertificationConfig {
    /** Plugin id under test, e.g. `sh2-shp-survey-js`. */
    pluginId: string;
    /** Path to the plugin's `plugin.json` manifest (for reporter context). */
    manifestPath?: string;
    /** Path to the lock file the certification seeds from. */
    lockFilePath?: string;
    /** Capabilities the plugin declares; the runner asserts they are granted. */
    capabilities?: readonly string[];
    /** Mercure topics the plugin owns; verified through {@link mockMercureHub}. */
    realtimeTopics?: readonly string[];
}

export interface IPluginCertificationSuite {
    readonly pluginId: string;
    readonly kitVersion: string;
    readonly config: IPluginCertificationConfig;
    /** The ordered static checks every plugin manifest must pass. */
    readonly checks: readonly string[];
    /** Run all static checks against a parsed manifest and return a report. */
    run(manifest: IPluginManifest): IPluginCertificationReport;
}

/** The canonical, ordered certification checks (names are the stable contract). */
export const CERTIFICATION_CHECKS: readonly string[] = [
    'manifest-valid',
    'capabilities-vs-trust-level',
    'compatibility-shape',
    'lookup-ownership',
    'db-naming',
];

/** Every privileged capability the host knows about (mirrors the manifest schema enum). */
const KNOWN_CAPABILITIES: ReadonlySet<string> = new Set<IPluginManifestCapability>([
    'backendBundle',
    'databaseMigrations',
    'readUsers',
    'writeUsers',
    'deleteUsers',
    'readDataTables',
    'writeDataTables',
    'deleteDataTables',
    'externalNetworkAccess',
    'scheduledJobs',
    'publicCallbacks',
    'adminPages',
    'frontendStyles',
    'mobileStyles',
    'realtimePublish',
    'fileUploads',
    'secretAccess',
    'lookupExtend',
    'lookupOwnGroup',
]);

/**
 * Capabilities an `untrusted` plugin may NOT declare (AGENTS.md: untrusted
 * plugins cannot ship a bundle, migrations, scheduled jobs, direct user/data
 * access, secrets, or outbound network).
 */
const UNTRUSTED_FORBIDDEN_CAPABILITIES: readonly string[] = [
    'backendBundle',
    'databaseMigrations',
    'scheduledJobs',
    'readUsers',
    'writeUsers',
    'deleteUsers',
    'readDataTables',
    'writeDataTables',
    'deleteDataTables',
    'secretAccess',
    'externalNetworkAccess',
];

const COMPATIBILITY_KEYS: readonly string[] = ['selfhelp', 'php', 'node', 'react', 'reactNative', 'expoSdk'];
const OWNED_TABLE_PATTERN = /^[a-z][a-z0-9_]*$/;
const OWNED_PREFIX_PATTERN = /^[a-z][a-z0-9_]*_$/;
const PLUGIN_ID_PATTERN = /^[a-z][a-z0-9-]*$/;
const PLUGIN_API_VERSION_PATTERN = /^\d+\.\d+$/;

/**
 * A single npm-style range token: optional operator + a partial-or-full
 * version (e.g. `^8.4`, `>=8.0.0-dev`, `<9.0.0`, `~1.2.0`, `*`). Intentionally
 * tolerant of the partial `major` / `major.minor` forms plugins use for
 * platform ranges — this validates the SHAPE, not exact resolvability (the
 * backend's Composer resolver does the real check at install time).
 */
const RANGE_TOKEN_PATTERN = /^(\*|x|(\^|~|>=|<=|>|<|=)?\d+(\.\d+)?(\.\d+)?(-[0-9A-Za-z.-]+)?)$/;

function makeResult(name: string, errors: string[]): ICertificationCheckResult {
    return { name, passed: errors.length === 0, errors };
}

/** True when every clause/token of `range` looks like an npm-style range. */
function isValidRange(range: string): boolean {
    const clauses = range.split('||').map((c) => c.trim()).filter((c) => c !== '');
    if (clauses.length === 0) {
        return false;
    }
    return clauses.every((clause) =>
        clause
            .split(/\s+/)
            .filter((t) => t !== '')
            .every((token) => RANGE_TOKEN_PATTERN.test(token)),
    );
}

function asCapabilityList(manifest: IPluginManifest): string[] {
    const caps = manifest.security?.capabilities;
    return Array.isArray(caps) ? caps.map((c) => String(c)) : [];
}

/** manifest-valid: required fields are present and well-formed. */
export function checkManifestValid(manifest: IPluginManifest): ICertificationCheckResult {
    const errors: string[] = [];

    if (!manifest.id || typeof manifest.id !== 'string') {
        errors.push('id is required.');
    } else if (!PLUGIN_ID_PATTERN.test(manifest.id)) {
        errors.push(`id '${manifest.id}' must match ${PLUGIN_ID_PATTERN}.`);
    }

    if (!manifest.name || typeof manifest.name !== 'string') {
        errors.push('name is required.');
    }

    if (!manifest.version || typeof manifest.version !== 'string') {
        errors.push('version is required.');
    } else {
        try {
            parseSemver(manifest.version);
        } catch {
            errors.push(`version '${manifest.version}' is not valid semver.`);
        }
    }

    if (!manifest.pluginApiVersion || typeof manifest.pluginApiVersion !== 'string') {
        errors.push('pluginApiVersion is required.');
    } else if (!PLUGIN_API_VERSION_PATTERN.test(manifest.pluginApiVersion)) {
        errors.push(`pluginApiVersion '${manifest.pluginApiVersion}' must look like '<major>.<minor>'.`);
    }

    if (!manifest.compatibility || typeof manifest.compatibility !== 'object') {
        errors.push('compatibility is required.');
    }

    if (!manifest.security || typeof manifest.security !== 'object') {
        errors.push('security is required.');
    } else {
        if (!manifest.security.trustLevel) {
            errors.push('security.trustLevel is required.');
        }
        if (!Array.isArray(manifest.security.capabilities)) {
            errors.push('security.capabilities must be an array.');
        }
    }

    return makeResult('manifest-valid', errors);
}

/**
 * capabilities-vs-trust-level: capabilities are known, respect the trust-level
 * limits, and every declared surface has the capability that gates it.
 */
export function checkCapabilitiesVsTrustLevel(manifest: IPluginManifest): ICertificationCheckResult {
    const errors: string[] = [];
    const caps = asCapabilityList(manifest);
    const capSet = new Set(caps);
    const trustLevel = manifest.security?.trustLevel;

    for (const cap of caps) {
        if (!KNOWN_CAPABILITIES.has(cap)) {
            errors.push(`unknown capability '${cap}'.`);
        }
    }

    if (trustLevel === 'untrusted') {
        for (const cap of UNTRUSTED_FORBIDDEN_CAPABILITIES) {
            if (capSet.has(cap)) {
                errors.push(`untrusted plugins may not declare capability '${cap}'.`);
            }
        }
    }

    const require = (condition: boolean, capability: string, surface: string): void => {
        if (condition && !capSet.has(capability)) {
            errors.push(`${surface} requires the '${capability}' capability.`);
        }
    };

    require(Boolean(manifest.backend?.bundleClass), 'backendBundle', 'declaring a backend bundle');
    require(Boolean(manifest.backend?.migrationsNamespace), 'databaseMigrations', 'declaring a migrations namespace');
    require((manifest.scheduledJobs?.length ?? 0) > 0, 'scheduledJobs', 'declaring scheduled jobs');
    require((manifest.adminPages?.length ?? 0) > 0, 'adminPages', 'declaring admin pages');
    require((manifest.realtimeTopics?.length ?? 0) > 0, 'realtimePublish', 'declaring realtime topics');

    if ((manifest.styles?.length ?? 0) > 0 && !capSet.has('frontendStyles') && !capSet.has('mobileStyles')) {
        errors.push("declaring styles requires the 'frontendStyles' or 'mobileStyles' capability.");
    }

    for (const ext of manifest.lookups?.extends ?? []) {
        if (ext.ownership === 'plugin_owned') {
            require(true, 'lookupOwnGroup', `owning lookup group '${ext.typeCode}'`);
        } else if (ext.ownership === 'plugin_extendable') {
            require(true, 'lookupExtend', `extending lookup group '${ext.typeCode}'`);
        }
    }

    require((manifest.dataAccess?.write?.length ?? 0) > 0, 'writeDataTables', 'declaring data-table writes');
    require((manifest.dataAccess?.delete?.length ?? 0) > 0, 'deleteDataTables', 'declaring data-table deletes');

    return makeResult('capabilities-vs-trust-level', errors);
}

/**
 * compatibility-shape: the adopted single-range compatibility shape —
 * `compatibility.selfhelp` is a SemVer **range string** (not the rejected
 * per-surface object), with optional platform ranges, and no unknown keys.
 */
export function checkCompatibilityShape(manifest: IPluginManifest): ICertificationCheckResult {
    const errors: string[] = [];
    const compatibility = manifest.compatibility as unknown as Record<string, unknown> | undefined;

    if (!compatibility || typeof compatibility !== 'object') {
        return makeResult('compatibility-shape', ['compatibility is required.']);
    }

    const selfhelp = compatibility.selfhelp;
    if (typeof selfhelp !== 'string') {
        errors.push(
            'compatibility.selfhelp must be a SemVer range string (single-range shape), not an object or missing.',
        );
    } else if (selfhelp.trim() === '' || !isValidRange(selfhelp)) {
        errors.push(`compatibility.selfhelp '${selfhelp}' is not a valid SemVer range.`);
    }

    for (const key of Object.keys(compatibility)) {
        if (!COMPATIBILITY_KEYS.includes(key)) {
            errors.push(`compatibility has unknown key '${key}'.`);
            continue;
        }
        if (key === 'selfhelp') {
            continue;
        }
        const value = compatibility[key];
        if (typeof value !== 'string' || !isValidRange(value)) {
            errors.push(`compatibility.${key} must be a valid SemVer range string.`);
        }
    }

    return makeResult('compatibility-shape', errors);
}

/** lookup-ownership: lookup extensions declare a valid ownership + entries. */
export function checkLookupOwnership(manifest: IPluginManifest): ICertificationCheckResult {
    const errors: string[] = [];

    for (const ext of manifest.lookups?.extends ?? []) {
        const label = ext.typeCode || '<missing typeCode>';
        if (!ext.typeCode) {
            errors.push('lookup extension is missing typeCode.');
        }
        if (ext.ownership !== 'plugin_owned' && ext.ownership !== 'plugin_extendable') {
            errors.push(`lookup '${label}' has invalid ownership '${String(ext.ownership)}'.`);
        }
        if (!Array.isArray(ext.entries) || ext.entries.length === 0) {
            errors.push(`lookup '${label}' must declare at least one entry.`);
            continue;
        }
        for (const entry of ext.entries) {
            if (!entry.code || !entry.value) {
                errors.push(`lookup '${label}' has an entry missing code/value.`);
            }
        }
    }

    return makeResult('lookup-ownership', errors);
}

/** db-naming: owned tables + data-table prefix follow lowercase_snake_case. */
export function checkDbNaming(manifest: IPluginManifest): ICertificationCheckResult {
    const errors: string[] = [];
    const dataAccess = manifest.dataAccess;

    for (const table of dataAccess?.ownedTables ?? []) {
        if (!OWNED_TABLE_PATTERN.test(table)) {
            errors.push(`owned table '${table}' must be lowercase_snake_case (${OWNED_TABLE_PATTERN}).`);
        }
    }

    const prefix = dataAccess?.ownedDataTablePrefix;
    if (prefix !== undefined && prefix !== '' && !OWNED_PREFIX_PATTERN.test(prefix)) {
        errors.push(`ownedDataTablePrefix '${prefix}' must be lowercase_snake_case ending in '_' (${OWNED_PREFIX_PATTERN}).`);
    }

    return makeResult('db-naming', errors);
}

/** Run the full ordered static certification against a parsed manifest. */
export function runCertificationChecks(manifest: IPluginManifest): ICertificationCheckResult[] {
    return [
        checkManifestValid(manifest),
        checkCapabilitiesVsTrustLevel(manifest),
        checkCompatibilityShape(manifest),
        checkLookupOwnership(manifest),
        checkDbNaming(manifest),
    ];
}

/**
 * Declare a plugin certification suite. The returned suite exposes the stable
 * ordered check names plus an executable {@link IPluginCertificationSuite.run}
 * that validates a parsed manifest and returns a typed report.
 */
export function definePluginCertification(config: IPluginCertificationConfig): IPluginCertificationSuite {
    if (!config.pluginId || config.pluginId.trim() === '') {
        throw new Error('definePluginCertification: pluginId is required.');
    }

    return {
        pluginId: config.pluginId,
        kitVersion: CERTIFICATION_KIT_VERSION,
        config,
        checks: CERTIFICATION_CHECKS,
        run(manifest: IPluginManifest): IPluginCertificationReport {
            const results = runCertificationChecks(manifest);
            return {
                pluginId: config.pluginId,
                kitVersion: CERTIFICATION_KIT_VERSION,
                passed: results.every((r) => r.passed),
                results,
            };
        },
    };
}

// ---------------------------------------------------------------------------
// mockMercureHub — in-memory Mercure recorder (mirrors backend MercureTestRecorder).
// ---------------------------------------------------------------------------

export interface IRecordedMercureUpdate {
    topic: string;
    data: unknown;
}

export interface IMockMercureHub {
    /** Record a publish call (drop-in for the real hub's publish). */
    publish(topic: string, data?: unknown): void;
    /** All recorded updates in publish order. */
    readonly updates: readonly IRecordedMercureUpdate[];
    /** Distinct topics that were published to. */
    publishedTopics(): string[];
    /** Number of updates published to a given topic. */
    countForTopic(topic: string): number;
    /** Clear all recorded updates (use in afterEach). */
    reset(): void;
}

/**
 * Create an in-memory Mercure hub spy. Plugins assert published topics /
 * payloads against it instead of polling a real hub (canonical Testing
 * Rule 13: Mercure verified via a recorder, never polling).
 */
export function mockMercureHub(): IMockMercureHub {
    const updates: IRecordedMercureUpdate[] = [];
    return {
        updates,
        publish(topic: string, data: unknown = null): void {
            updates.push({ topic, data });
        },
        publishedTopics(): string[] {
            return [...new Set(updates.map((u) => u.topic))];
        },
        countForTopic(topic: string): number {
            return updates.filter((u) => u.topic === topic).length;
        },
        reset(): void {
            updates.length = 0;
        },
    };
}

// ---------------------------------------------------------------------------
// seedFromLockFile — read installed-plugin info from a lock file (subset).
// ---------------------------------------------------------------------------

export interface ILockFilePluginEntry {
    pluginId: string;
    version: string;
}

export interface ILockFileSeed {
    plugins: ILockFilePluginEntry[];
}

/**
 * Parse the `plugins` map of a `selfhelp.plugins.lock.json` document into a
 * deterministic seed list. Tolerant of partial documents.
 */
export function seedFromLockFile(lockJson: unknown): ILockFileSeed {
    const plugins: ILockFilePluginEntry[] = [];
    if (lockJson && typeof lockJson === 'object' && 'plugins' in lockJson) {
        const raw = (lockJson as { plugins: unknown }).plugins;
        if (raw && typeof raw === 'object') {
            for (const [pluginId, entry] of Object.entries(raw as Record<string, unknown>)) {
                const version =
                    entry && typeof entry === 'object' && 'version' in entry
                        ? String((entry as { version: unknown }).version)
                        : '0.0.0';
                plugins.push({ pluginId, version });
            }
        }
    }
    return { plugins };
}
