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
    MOBILE_RENDERER_VERSION,
    assertPluginApiVersion,
    isPluginApiCompatible,
    isMobileRendererCompatible,
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
    IPluginManifestStyleField,
    IPluginManifestStyleGroup,
    IPluginManifestFieldType,
    IPluginManifestField,
    IPluginManifestAdminPage,
    IPluginManifestApiRoute,
    IPluginManifestScheduledJob,
    IPluginManifestJobConfigSchema,
    IPluginManifestJobConfigProperty,
    IPluginManifestCacheCategory,
    IPluginManifestSetting,
    IPluginManifestRateLimit,
    IPluginManifestJsonLogicOperation,
    IPluginManifestRecurringJob,
    IPluginManifestAsset,
    IPluginManifestMobile,
    IPluginManifestExternalHost,
    IPluginManifestDataAccess,
    IPluginManifestHealth,
    TPluginDomainEventName,
} from './manifest';

export type {
    IPluginRegistry,
    IRegistryReleaseRef,
    IRegistrySignatureBlock,
    IPluginRelease,
    TPluginRegistryChannel,
} from './registry';
export { PLUGIN_REGISTRY_CHANNELS } from './registry';

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
    IFieldRendererDefinition,
    IPluginFieldRendererProps,
    IPluginPageModal,
    IPluginStylePage,
    IPluginStyleProps,
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
    IResourceUsage,
    IPluginSettingViewItem,
    IPluginSettingsView,
} from './types';

export type { IPluginSyncEntry } from './sync-map';
export { matchPluginSyncEntries } from './sync-map';

export { definePlugin, defineMobilePlugin, definePluginRealtimeTopic } from './define';

export type {
    IMobileHostServices,
    IMobileHostRequest,
    IMobileHostResponse,
    TMobileHostMethod,
    IMobileHostUploadFile,
    IMobileHostUploadRequest,
    IMobilePluginStorage,
    TMobileHostPermission,
    TMobileHostPermissionState,
} from './host-services';
export { setMobileHostServices, getMobileHostServices } from './host-services';

// Text helpers for native mobile plugin text (C30). One implementation: the
// same functions core renderers use; not copied.
export { parseInlineRich, stripHtmlToText } from '../content/inlineFormat';
export type { IInlineNode } from '../content/inlineFormat';

export type {
    IRealtimeTransport,
    TRealtimeTransportFactory,
    IUsePluginRealtimeOptions,
    IUsePluginRealtimeResult,
} from './realtime';
export { usePluginRealtime } from './realtime';

export type { TPluginRuntimeShimSpecifier } from './runtime-shim';
export {
    PLUGIN_RUNTIME_SHIM_SPECIFIERS,
    PLUGIN_RUNTIME_SHIM_BASE_PATH,
    PLUGIN_RUNTIME_GLOBAL_KEY,
    PLUGIN_RUNTIME_IMPORT_MAP,
    buildPluginRuntimeShimPath,
    isPluginRuntimeShimSpecifier,
} from './runtime-shim';
