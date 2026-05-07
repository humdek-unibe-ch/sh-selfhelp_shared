/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * @selfhelp/shared — public surface.
 *
 * Each subpath also has its own export:
 *   - `@selfhelp/shared/registry`
 *   - `@selfhelp/shared/theme`
 *   - `@selfhelp/shared/tailwind`
 *
 * The default export aggregates everything so consumers can do:
 *   import { STYLE_REGISTRY, replaceCalcedValues, ENDPOINTS } from '@selfhelp/shared';
 */

export * from './types';
export * from './registry';
export * from './api';
export * from './theme';
export * from './interpolation';
export * from './condition';
export * from './cms-classes';
export * from './assets';
export * from './utils';
