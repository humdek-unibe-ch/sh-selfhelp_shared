/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Navigation rendering contract (shared by web + mobile).
 *
 * The page TREE defines navigation STRUCTURE (parent/child + `nav_position`).
 * A per-page render type controls PRESENTATION only — it never changes the
 * structure or the URLs. Web and mobile each pick their own renderer from the
 * stored value, so the same subtree can render differently per platform.
 *
 * - `web_nav_render`  selects the web renderer for a page's children.
 * - `mobile_nav_render` selects the mobile renderer for a page's children.
 *
 * Both fields are OPTIONAL on a page; when unset the platform applies its
 * default (web `tabs`, mobile `segmented-tabs` for a navigation page's
 * children; the GLOBAL app menu defaults to web `header-dropdown` and mobile
 * `bottom-tabs`).
 */

export type TWebNavRender = 'header-dropdown' | 'tabs' | 'sidebar-drawer' | 'hero-cards';

export type TMobileNavRender = 'segmented-tabs' | 'bottom-tabs' | 'drawer' | 'hero-cards';

export const WEB_NAV_RENDER_VALUES: readonly TWebNavRender[] = [
    'header-dropdown',
    'tabs',
    'sidebar-drawer',
    'hero-cards',
] as const;

export const MOBILE_NAV_RENDER_VALUES: readonly TMobileNavRender[] = [
    'segmented-tabs',
    'bottom-tabs',
    'drawer',
    'hero-cards',
] as const;

/** Default renderer for a navigation page's CHILDREN. */
export const DEFAULT_WEB_NAV_RENDER: TWebNavRender = 'tabs';
export const DEFAULT_MOBILE_NAV_RENDER: TMobileNavRender = 'segmented-tabs';

/** Default renderer for the GLOBAL app menu (header / shell). */
export const DEFAULT_WEB_GLOBAL_NAV_RENDER: TWebNavRender = 'header-dropdown';
export const DEFAULT_MOBILE_GLOBAL_NAV_RENDER: TMobileNavRender = 'bottom-tabs';

export interface INavRenderOption<T extends string> {
    value: T;
    /** Friendly label for the admin select. */
    label: string;
    /** Short, plain-language explanation shown under the select. */
    description: string;
}

/** Option metadata for the admin "Web menu style" select. */
export const WEB_NAV_RENDER_OPTIONS: readonly INavRenderOption<TWebNavRender>[] = [
    {
        value: 'header-dropdown',
        label: 'Header dropdown',
        description: 'Classic top menu; child pages appear in a dropdown. Best for the global website menu.',
    },
    {
        value: 'tabs',
        label: 'Tabs',
        description: 'Show child pages as horizontal tabs. Best for a navigation page with a few children.',
    },
    {
        value: 'sidebar-drawer',
        label: 'Sidebar drawer',
        description: 'Side drawer / hamburger menu. Best for large or deep navigation.',
    },
    {
        value: 'hero-cards',
        label: 'Hero cards',
        description: 'Dashboard-style card grid. Best for landing pages and CMS app dashboards.',
    },
] as const;

/** Option metadata for the admin "Mobile menu style" select. */
export const MOBILE_NAV_RENDER_OPTIONS: readonly INavRenderOption<TMobileNavRender>[] = [
    {
        value: 'segmented-tabs',
        label: 'Segmented tabs',
        description: 'Top segmented control for first-level children. Best for a few child pages.',
    },
    {
        value: 'bottom-tabs',
        label: 'Bottom tabs',
        description: 'Bottom tab bar for 3–5 main app-like destinations.',
    },
    {
        value: 'drawer',
        label: 'Drawer',
        description: 'Hamburger / side drawer for larger navigation.',
    },
    {
        value: 'hero-cards',
        label: 'Hero cards',
        description: 'Card grid for dashboards and CMS app pages.',
    },
] as const;

export function isWebNavRender(value: unknown): value is TWebNavRender {
    return typeof value === 'string' && (WEB_NAV_RENDER_VALUES as readonly string[]).includes(value);
}

export function isMobileNavRender(value: unknown): value is TMobileNavRender {
    return typeof value === 'string' && (MOBILE_NAV_RENDER_VALUES as readonly string[]).includes(value);
}

/**
 * Resolve a stored `web_nav_render` value to a concrete renderer, falling back
 * to the supplied default (page-children default by default).
 */
export function resolveWebNavRender(
    value: unknown,
    fallback: TWebNavRender = DEFAULT_WEB_NAV_RENDER,
): TWebNavRender {
    return isWebNavRender(value) ? value : fallback;
}

/**
 * Resolve a stored `mobile_nav_render` value to a concrete renderer, falling
 * back to the supplied default (page-children default by default).
 */
export function resolveMobileNavRender(
    value: unknown,
    fallback: TMobileNavRender = DEFAULT_MOBILE_NAV_RENDER,
): TMobileNavRender {
    return isMobileNavRender(value) ? value : fallback;
}
