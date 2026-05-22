/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * `@selfhelp/shared/plugin-sdk` — public SDK consumed by every SelfHelp
 * plugin's frontend and mobile package.
 *
 * Plugins import from this subpath ONLY. Importing from other internal
 * paths of `@selfhelp/shared` is not supported.
 *
 * The SDK has its own `pluginApiVersion` (see `version.ts`). Plugins
 * declare which `pluginApiVersion` they target in `plugin.json`; the
 * host installer compares the declaration with `PLUGIN_API_VERSION`
 * before allowing the plugin to load.
 */

export {
    PLUGIN_API_VERSION,
    assertPluginApiVersion,
    isPluginApiCompatible,
    assertCmsCompatibility,
    assertPluginVersionSemantics,
    parseSemver,
    compareSemver,
    satisfiesSemverRange,
} from './version';

export type {
    IPluginManifest,
    IPluginManifestCompatibility,
    IPluginManifestDependency,
    IPluginManifestConflict,
    IPluginManifestSecurity,
    IPluginManifestCapability,
    IPluginManifestTrustLevel,
    IPluginManifestRealtimeTopic,
    IPluginManifestFeatureFlag,
    IPluginManifestLookupExtension,
    IPluginManifestPermission,
    IPluginManifestStyle,
    IPluginManifestAdminPage,
    IPluginManifestApiRoute,
    IPluginManifestScheduledJob,
    IPluginManifestAsset,
    IPluginManifestMobile,
    IPluginManifestExternalHost,
    IPluginManifestDataAccess,
    IPluginManifestHealth,
} from './manifest';

export type {
    IPluginRegistry,
    IPluginRegistryEntry,
    IPluginRegistryVersionEntry,
    TPluginRegistryChannel,
} from './registry';

export type {
    IPluginLock,
    IPluginLockEntry,
    IPluginLockMobileEntry,
    IPluginLockMigration,
} from './lock';

export type {
    IPluginRegistration,
    IMobilePluginRegistration,
    IStyleDefinition,
    IAdminPageDefinition,
    IMenuItemDefinition,
    IPluginApi,
    IMobilePluginApi,
    IPluginHealthCheck,
    IPluginFeatureFlag,
    IPluginRealtimeTopic,
    IPluginRealtimePublisher,
    IRichTextEditorAdapter,
    IRichTextEditorAdapterOptions,
    IRichTextEditorValue,
} from './types';

export { definePlugin, defineMobilePlugin, definePluginRealtimeTopic } from './define';
