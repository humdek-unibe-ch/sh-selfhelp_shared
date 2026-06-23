/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * `definePlugin()` / `defineMobilePlugin()` are the only entry points
 * plugins call. They validate the SDK version, register style entries
 * in the shared registry, and return the registration object the host
 * `PluginRuntime` reads.
 */

import {
    extendStyleRegistry,
    type IStyleRegistryEntry,
} from '../registry/styles.registry';

import type {
    IMobilePluginRegistration,
    IPluginRealtimeTopic,
    IPluginRegistration,
    IStyleDefinition,
} from './types';

import { assertPluginApiVersion } from './version';

/**
 * Plugin frontend / admin entry point.
 *
 * Example:
 *   export const register = definePlugin({
 *       id: 'sh2-shp-survey-js',
 *       version: '1.0.0',
 *       pluginApiVersion: '1.0',
 *       styles: [{ name: 'surveyjs', component: SurveyJsStyle, ... }],
 *   });
 */
export function definePlugin(registration: IPluginRegistration): IPluginRegistration {
    assertPluginApiVersion(registration.pluginApiVersion);
    if (registration.styles?.length) {
        extendStyleRegistry(toRegistryRecord(registration.styles), {
            pluginId: registration.id,
            pluginVersion: registration.version,
        });
    }
    return registration;
}

/**
 * Plugin mobile entry point. Same contract as `definePlugin()` but
 * mobile-only. Mobile builds bundle plugin packages per EAS profile,
 * so this runs inside the mobile Metro bundle at app boot.
 */
export function defineMobilePlugin(
    registration: IMobilePluginRegistration,
): IMobilePluginRegistration {
    assertPluginApiVersion(registration.pluginApiVersion);
    if (registration.styles?.length) {
        extendStyleRegistry(toRegistryRecord(registration.styles), {
            pluginId: registration.id,
            pluginVersion: registration.version,
        });
    }
    return registration;
}

/**
 * Declare a realtime topic for type-safe publish/subscribe. Returns the
 * topic descriptor; the host installer registers it through
 * `PluginRealtimeTopicRegistryEvent` so admins can audit topics in the
 * Plugin detail page.
 */
export function definePluginRealtimeTopic<TPayload>(
    descriptor: IPluginRealtimeTopic<TPayload>,
): IPluginRealtimeTopic<TPayload> {
    return descriptor;
}

function toRegistryRecord(styles: IStyleDefinition[]): Record<string, IStyleRegistryEntry> {
    const out: Record<string, IStyleRegistryEntry> = {};
    for (const style of styles) {
        out[style.name] = {
            description: style.description,
            category: style.category,
            canHaveChildren: style.canHaveChildren,
        };
    }
    return out;
}
