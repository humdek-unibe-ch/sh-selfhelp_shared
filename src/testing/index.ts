/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * `@selfhelp/shared/testing` — the plugin certification kit.
 *
 * Every plugin's certification suite imports from this subpath so the
 * "standard suite every plugin must pass" stays identical across plugins
 * (canonical Testing Rule: plugin certification). This is the Slice 5
 * SCAFFOLD: the public API SHAPE is frozen here and `mockMercureHub` is
 * fully implemented; `definePluginCertification` and `seedFromLockFile`
 * carry minimal deterministic behaviour and are completed in Slice 8A.
 *
 * Keeping the surface stable now lets plugin repos start importing it
 * without churn when the full runner lands.
 */

/** Version of the certification kit contract (asserted by a stability test). */
export const CERTIFICATION_KIT_VERSION = '0.1.0-scaffold';

// ---------------------------------------------------------------------------
// definePluginCertification — declares the standard certification suite.
// ---------------------------------------------------------------------------

export interface IPluginCertificationConfig {
    /** Plugin id under test, e.g. `sh2-shp-survey-js`. */
    pluginId: string;
    /** Path to the plugin's `plugin.json` manifest (resolved by the runner). */
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
    /**
     * The ordered checks every plugin must pass. Slice 8A replaces these
     * placeholders with executable assertions; the names are the stable
     * contract certification reporters key on.
     */
    readonly checks: readonly string[];
}

/** The canonical, ordered certification checks (names are the stable contract). */
export const CERTIFICATION_CHECKS: readonly string[] = [
    'manifest-valid',
    'capabilities-declared',
    'install-lifecycle',
    'realtime-topics-registered',
    'cleanup-on-uninstall',
];

/**
 * Declare a plugin certification suite. Slice 5 returns the frozen
 * descriptor; Slice 8A adds the executable runner that consumes it.
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
 * deterministic seed list. Tolerant of partial documents (Slice 5 scope);
 * Slice 8A validates against the lock JSON Schema.
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
