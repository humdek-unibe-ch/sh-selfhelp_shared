/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Curated mobile icon set — the SINGLE source of truth shared by the admin
 * `select-icon-mobile` picker (web frontend, drawn with `lucide-react`) and the
 * mobile menu renderers (drawn with `lucide-react-native`).
 *
 * Storing the lucide PascalCase export name keeps the contract stable: both
 * `lucide-react` and `lucide-react-native` expose identical named exports, so a
 * renderer maps `name -> (LucideIcons as Record<string, Component>)[name]`.
 *
 * Keep this list to icons that read well at small sizes in a tab bar / drawer
 * and that exist in BOTH lucide packages. Add entries here (never per-app) so
 * the picker and the renderer never drift.
 */

export interface IMobileIconEntry {
    /** lucide PascalCase export name, e.g. `Home`, `Users`, `LayoutDashboard`. */
    name: string;
    /** Friendly label for the admin picker. */
    label: string;
}

export const MOBILE_ICON_SET: readonly IMobileIconEntry[] = [
    { name: 'House', label: 'Home' },
    { name: 'LayoutDashboard', label: 'Dashboard' },
    { name: 'User', label: 'User' },
    { name: 'Users', label: 'Users / Team' },
    { name: 'Settings', label: 'Settings' },
    { name: 'FileText', label: 'Document' },
    { name: 'Files', label: 'Files' },
    { name: 'Folder', label: 'Folder' },
    { name: 'Info', label: 'Info' },
    { name: 'CircleQuestionMark', label: 'Help' },
    { name: 'Mail', label: 'Mail' },
    { name: 'Phone', label: 'Phone' },
    { name: 'Calendar', label: 'Calendar' },
    { name: 'Bell', label: 'Notifications' },
    { name: 'Search', label: 'Search' },
    { name: 'Star', label: 'Star' },
    { name: 'Heart', label: 'Heart' },
    { name: 'Bookmark', label: 'Bookmark' },
    { name: 'Map', label: 'Map' },
    { name: 'MapPin', label: 'Location' },
    { name: 'Image', label: 'Image' },
    { name: 'Video', label: 'Video' },
    { name: 'Music', label: 'Music' },
    { name: 'ShoppingCart', label: 'Shopping cart' },
    { name: 'CreditCard', label: 'Payment' },
    { name: 'ChartBar', label: 'Bar chart' },
    { name: 'ChartPie', label: 'Pie chart' },
    { name: 'Activity', label: 'Activity' },
    { name: 'Shield', label: 'Shield' },
    { name: 'Lock', label: 'Lock' },
    { name: 'Globe', label: 'Globe' },
    { name: 'Compass', label: 'Compass' },
    { name: 'Flag', label: 'Flag' },
    { name: 'Award', label: 'Award' },
    { name: 'Briefcase', label: 'Work' },
    { name: 'Building', label: 'Building' },
    { name: 'BookOpen', label: 'Book' },
    { name: 'MessageSquare', label: 'Messages' },
    { name: 'ClipboardList', label: 'Tasks' },
    { name: 'CircleCheck', label: 'Check' },
    { name: 'List', label: 'List' },
    { name: 'LayoutGrid', label: 'Grid' },
    { name: 'Menu', label: 'Menu' },
    { name: 'Database', label: 'Data' },
] as const;

/** All valid mobile icon names (for validation / membership checks). */
export const MOBILE_ICON_NAMES: readonly string[] = MOBILE_ICON_SET.map((entry) => entry.name);

/** Neutral fallback used when a page has no `mobile_icon` or an unknown value. */
export const DEFAULT_MOBILE_ICON = 'Circle';

export function isMobileIconName(value: unknown): value is string {
    return typeof value === 'string' && MOBILE_ICON_NAMES.includes(value);
}

/** Resolve a stored `mobile_icon` to a drawable name, falling back to the default. */
export function resolveMobileIcon(value: unknown): string {
    return isMobileIconName(value) ? value : DEFAULT_MOBILE_ICON;
}
