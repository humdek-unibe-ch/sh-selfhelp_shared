/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * SDK contract version. Plugins declare which API they target in
 * `plugin.json` under `pluginApiVersion`. The host installer compares
 * declarations against this constant.
 *
 * Versioning rules:
 *   - patch (1.0.0 -> 1.0.1) — additive SDK fix, no contract change.
 *   - minor (1.0.x -> 1.1.0) — additive SDK feature.
 *   - major (1.x   -> 2.0)   — breaking SDK change.
 *
 * Independent from the npm `version` of `@selfhelp/shared`.
 */
export const PLUGIN_API_VERSION = '0.1.0' as const;

/**
 * Mobile renderer contract version. This is the SECOND, mobile-only
 * compatibility axis (independent of `PLUGIN_API_VERSION`): it versions the
 * mobile plugin rendering surface — the `registerMobile()` shape, `IStyleProps`
 * / `TPluginStyleImplMap`, and the mobile host SDK primitives — that a plugin's
 * mobile npm package compiles against.
 *
 * The mobile app and the `selfhelp-mobile-preview` image advertise this value
 * (in `version.json` + the signed `mobile-preview-release.json`). A plugin
 * declares the range it supports in `plugin.json` under `compatibility.mobile`;
 * the SelfHelp Manager gates the plugin against the selected preview image's
 * advertised `mobileRendererVersion` using {@see isMobileRendererCompatible}.
 *
 * Bump rules mirror the SDK contract: patch = additive fix, minor = additive
 * renderer feature, major = breaking mobile renderer change.
 */
export const MOBILE_RENDERER_VERSION = '0.1.0' as const;

export interface ISemver {
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
}

const SEMVER_REGEX = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

export function parseSemver(version: string): ISemver {
    const match = SEMVER_REGEX.exec(version);
    if (!match) {
        throw new Error(`[plugin-sdk] not a valid semver: '${version}'.`);
    }
    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
        prerelease: match[4],
    };
}

export function compareSemver(a: string, b: string): number {
    const pa = parseSemver(a);
    const pb = parseSemver(b);
    if (pa.major !== pb.major) return pa.major - pb.major;
    if (pa.minor !== pb.minor) return pa.minor - pb.minor;
    if (pa.patch !== pb.patch) return pa.patch - pb.patch;
    if (pa.prerelease && pb.prerelease) return pa.prerelease.localeCompare(pb.prerelease);
    if (pa.prerelease) return -1;
    if (pb.prerelease) return 1;
    return 0;
}

/**
 * Very small npm-style range matcher supporting `=`, `>=`, `<=`, `>`,
 * `<`, `^`, `~`, and the simple multi-clause syntax used by
 * `plugin.json` compatibility fields. Not a full semver implementation;
 * the backend uses Composer's resolver for actual install-time checks.
 */
export function satisfiesSemverRange(version: string, range: string): boolean {
    const v = parseSemver(version);
    return range
        .split('||')
        .some((clause) => clause
            .trim()
            .split(/\s+/)
            .every((part) => matchSingle(v, part.trim())));
}

function matchSingle(v: ISemver, part: string): boolean {
    if (!part) return true;
    if (part === '*' || part === 'x') return true;
    if (part.startsWith('^')) {
        const target = parseSemver(part.slice(1));
        if (target.major === 0) {
            if (target.minor === 0) return v.major === 0 && v.minor === 0 && v.patch === target.patch;
            return v.major === 0 && v.minor === target.minor && (v.patch > target.patch || (v.patch === target.patch && !v.prerelease));
        }
        return v.major === target.major && compareSemverObj(v, target) >= 0;
    }
    if (part.startsWith('~')) {
        const target = parseSemver(part.slice(1));
        return v.major === target.major && v.minor === target.minor && v.patch >= target.patch;
    }
    if (part.startsWith('>=')) return compareSemverObj(v, parseSemver(part.slice(2).trim())) >= 0;
    if (part.startsWith('<=')) return compareSemverObj(v, parseSemver(part.slice(2).trim())) <= 0;
    if (part.startsWith('>')) return compareSemverObj(v, parseSemver(part.slice(1).trim())) > 0;
    if (part.startsWith('<')) return compareSemverObj(v, parseSemver(part.slice(1).trim())) < 0;
    if (part.startsWith('=')) return compareSemverObj(v, parseSemver(part.slice(1).trim())) === 0;
    return compareSemverObj(v, parseSemver(part)) === 0;
}

function compareSemverObj(a: ISemver, b: ISemver): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    if (a.patch !== b.patch) return a.patch - b.patch;
    if (a.prerelease && b.prerelease) return a.prerelease.localeCompare(b.prerelease);
    if (a.prerelease) return -1;
    if (b.prerelease) return 1;
    return 0;
}

/**
 * Non-throwing version of {@see assertPluginApiVersion} — returns true
 * when the plugin's declared `pluginApiVersion` is compatible with the
 * host SDK. Used by the frontend `PluginRuntime` so an incompatible
 * plugin is skipped (and logged) instead of crashing the host shell.
 */
export function isPluginApiCompatible(required: string, host: string = PLUGIN_API_VERSION): boolean {
    const [reqMajor, reqMinor] = required.split('.').map((p) => Number(p));
    const [hostMajor, hostMinor] = host.split('.').map((p) => Number(p));
    if (Number.isNaN(reqMajor) || Number.isNaN(reqMinor) || Number.isNaN(hostMajor) || Number.isNaN(hostMinor)) {
        return false;
    }
    if (hostMajor !== reqMajor) return false;
    return hostMinor >= reqMinor;
}

/**
 * Throw if the plugin's required `pluginApiVersion` is not compatible
 * with this SDK's `PLUGIN_API_VERSION`. SDK promises:
 *   - same major required.
 *   - host minor >= plugin's required minor.
 */
export function assertPluginApiVersion(required: string): void {
    const [reqMajor, reqMinor] = required.split('.').map((p) => Number(p));
    const [hostMajor, hostMinor] = PLUGIN_API_VERSION.split('.').map((p) => Number(p));
    if (Number.isNaN(reqMajor) || Number.isNaN(reqMinor)) {
        throw new Error(`[plugin-sdk] invalid pluginApiVersion '${required}'.`);
    }
    if (hostMajor !== reqMajor) {
        throw new Error(
            `[plugin-sdk] incompatible pluginApiVersion: plugin wants '${required}' but host is '${PLUGIN_API_VERSION}'.`,
        );
    }
    if (hostMinor < reqMinor) {
        throw new Error(
            `[plugin-sdk] host SDK too old for plugin: plugin wants '${required}', host is '${PLUGIN_API_VERSION}'.`,
        );
    }
}

/**
 * Non-throwing satisfaction check for the mobile-renderer axis: returns true
 * when the host's `mobileRendererVersion` falls inside the plugin's declared
 * `compatibility.mobile` range. Used by the SelfHelp Manager preflight to gate
 * an enabled plugin's mobile package against the selected preview image, and by
 * the mobile/preview runtime to skip an incompatible plugin instead of crashing.
 * An empty/undefined range is treated as "no mobile support declared" → false.
 */
export function isMobileRendererCompatible(
    requiredRange: string | undefined,
    host: string = MOBILE_RENDERER_VERSION,
): boolean {
    if (!requiredRange) return false;
    try {
        return satisfiesSemverRange(host, requiredRange);
    } catch {
        return false;
    }
}

/**
 * Throw if the running CMS version is not in the plugin's declared
 * compatibility range.
 */
export function assertCmsCompatibility(cmsVersion: string, range: string): void {
    if (!satisfiesSemverRange(cmsVersion, range)) {
        throw new Error(
            `[plugin-sdk] CMS version '${cmsVersion}' does not satisfy plugin compatibility range '${range}'.`,
        );
    }
}

/**
 * Enforce the plugin version-semantics rule:
 *   - patch (1.0.0 -> 1.0.1) -- no DB change, no migration shipped.
 *   - minor (1.0.x -> 1.1.0) -- always carries a DB change/migration.
 *   - major (1.x   -> 2.x)   -- breaking change.
 *
 * The host installer + plugin CI call this with the lock-file `version`
 * and the candidate `version` to verify that what is being shipped
 * matches the semver bump.
 */
export function assertPluginVersionSemantics(
    prevVersion: string | undefined,
    nextVersion: string,
    options: { hasMigration: boolean },
): void {
    const next = parseSemver(nextVersion);

    if (!prevVersion) {
        // first install — any version, but if hasMigration=false and
        // it claims to be 0.0.x we cannot really verify the rule.
        return;
    }

    const prev = parseSemver(prevVersion);

    const bumpedMajor = next.major > prev.major;
    const bumpedMinor = next.minor > prev.minor && next.major === prev.major;
    const bumpedPatch = next.patch > prev.patch && next.minor === prev.minor && next.major === prev.major;

    if (bumpedMajor) {
        // breaking — migration optional but allowed.
        return;
    }
    if (bumpedMinor) {
        if (!options.hasMigration) {
            throw new Error(
                `[plugin-sdk] plugin minor bump (${prevVersion} -> ${nextVersion}) must ship a DB migration.`,
            );
        }
        return;
    }
    if (bumpedPatch) {
        if (options.hasMigration) {
            throw new Error(
                `[plugin-sdk] plugin patch bump (${prevVersion} -> ${nextVersion}) must not ship a DB migration.`,
            );
        }
        return;
    }

    if (compareSemver(nextVersion, prevVersion) <= 0) {
        throw new Error(
            `[plugin-sdk] plugin version did not increase: prev '${prevVersion}', next '${nextVersion}'.`,
        );
    }
}
