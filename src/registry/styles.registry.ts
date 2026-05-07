/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * STYLE_REGISTRY — single source of truth for every supported user-facing
 * style. Both the web and mobile renderers import this map and TypeScript
 * forces them to provide an implementation for each key (see
 * `createStyleImplMap` in `index.ts`).
 *
 * Adding a new style:
 *   1. Add the per-style interface in `src/types/styles/<group>.ts`.
 *   2. Extend `TStyle` in `src/types/styles/unknown.ts`.
 *   3. Add the entry below.
 *   4. Both apps will fail to compile until they add an impl.
 */

import type { TStyleName } from '../types/styles/unknown';

export interface IStyleRegistryEntry {
    /** Human description for docs / tooling. */
    description: string;
    /** UX category for grouping in tools / cookbook. */
    category:
        | 'auth'
        | 'layout'
        | 'typography'
        | 'media'
        | 'interactive'
        | 'forms'
        | 'composite';
    /**
     * Whether the style is intended for end-user pages. Mobile renders
     * only `frontendOnly: true` styles. Today every entry below is true;
     * if/when an admin-only style is added it must be marked false.
     */
    frontendOnly: true;
    /**
     * Whether the style can have child sections (mirrors backend
     * `styles.can_have_children`). Renderers use this to short-circuit
     * children traversal.
     */
    canHaveChildren: boolean;
}

/**
 * Single-source registry. Keys here drive `TStyleName` (declared in
 * `types/styles/unknown.ts`); both files must stay in sync.
 */
export const STYLE_REGISTRY = {
    // ===== auth =====
    login: { description: 'User login form', category: 'auth', frontendOnly: true, canHaveChildren: false },
    register: { description: 'User registration form', category: 'auth', frontendOnly: true, canHaveChildren: false },
    validate: { description: 'Email/account validation flow', category: 'auth', frontendOnly: true, canHaveChildren: true },
    resetPassword: { description: 'Reset password form', category: 'auth', frontendOnly: true, canHaveChildren: false },
    twoFactorAuth: { description: 'Two-factor auth code form', category: 'auth', frontendOnly: true, canHaveChildren: false },
    profile: { description: 'User profile management', category: 'auth', frontendOnly: true, canHaveChildren: false },

    // ===== layout =====
    container: { description: 'Mantine Container with responsive max-width', category: 'layout', frontendOnly: true, canHaveChildren: true },
    box: { description: 'Generic Mantine Box wrapper', category: 'layout', frontendOnly: true, canHaveChildren: true },
    flex: { description: 'Mantine Flex layout', category: 'layout', frontendOnly: true, canHaveChildren: true },
    group: { description: 'Mantine Group horizontal layout', category: 'layout', frontendOnly: true, canHaveChildren: true },
    stack: { description: 'Mantine Stack vertical layout', category: 'layout', frontendOnly: true, canHaveChildren: true },
    'simple-grid': { description: 'Mantine SimpleGrid', category: 'layout', frontendOnly: true, canHaveChildren: true },
    grid: { description: 'Mantine Grid', category: 'layout', frontendOnly: true, canHaveChildren: true },
    'grid-column': { description: 'Mantine Grid.Col', category: 'layout', frontendOnly: true, canHaveChildren: true },
    space: { description: 'Mantine Space spacer', category: 'layout', frontendOnly: true, canHaveChildren: false },
    divider: { description: 'Mantine Divider', category: 'layout', frontendOnly: true, canHaveChildren: false },
    paper: { description: 'Mantine Paper surface', category: 'layout', frontendOnly: true, canHaveChildren: true },
    center: { description: 'Mantine Center alignment', category: 'layout', frontendOnly: true, canHaveChildren: true },
    'scroll-area': { description: 'Mantine ScrollArea', category: 'layout', frontendOnly: true, canHaveChildren: true },
    card: { description: 'Mantine Card', category: 'layout', frontendOnly: true, canHaveChildren: true },
    'card-segment': { description: 'Mantine Card.Section', category: 'layout', frontendOnly: true, canHaveChildren: true },
    'aspect-ratio': { description: 'Mantine AspectRatio wrapper', category: 'layout', frontendOnly: true, canHaveChildren: true },
    'background-image': { description: 'Mantine BackgroundImage', category: 'layout', frontendOnly: true, canHaveChildren: true },

    // ===== typography =====
    title: { description: 'Mantine Title', category: 'typography', frontendOnly: true, canHaveChildren: false },
    text: { description: 'Mantine Text', category: 'typography', frontendOnly: true, canHaveChildren: false },
    code: { description: 'Mantine Code (inline / block)', category: 'typography', frontendOnly: true, canHaveChildren: false },
    highlight: { description: 'Mantine Highlight', category: 'typography', frontendOnly: true, canHaveChildren: false },
    blockquote: { description: 'Mantine Blockquote', category: 'typography', frontendOnly: true, canHaveChildren: false },
    'html-tag': { description: 'Generic HTML tag wrapper (web), maps to View on RN', category: 'typography', frontendOnly: true, canHaveChildren: true },
    kbd: { description: 'Mantine Kbd', category: 'typography', frontendOnly: true, canHaveChildren: false },
    typography: { description: 'Mantine Typography wrapper', category: 'typography', frontendOnly: true, canHaveChildren: true },
    fieldset: { description: 'Mantine Fieldset', category: 'typography', frontendOnly: true, canHaveChildren: true },
    spoiler: { description: 'Mantine Spoiler reveal', category: 'typography', frontendOnly: true, canHaveChildren: true },

    // ===== media =====
    image: { description: 'Mantine Image / RN Image', category: 'media', frontendOnly: true, canHaveChildren: false },
    video: { description: 'HTML5 video / expo-video', category: 'media', frontendOnly: true, canHaveChildren: false },
    audio: { description: 'HTML5 audio / expo-audio', category: 'media', frontendOnly: true, canHaveChildren: false },
    figure: { description: 'Figure with caption', category: 'media', frontendOnly: true, canHaveChildren: true },
    carousel: { description: 'Embla on web, reanimated-carousel on RN', category: 'media', frontendOnly: true, canHaveChildren: true },

    // ===== interactive =====
    button: { description: 'Mantine Button / HeroUI Button', category: 'interactive', frontendOnly: true, canHaveChildren: false },
    link: { description: 'Anchor / Pressable navigation', category: 'interactive', frontendOnly: true, canHaveChildren: false },
    'action-icon': { description: 'Mantine ActionIcon', category: 'interactive', frontendOnly: true, canHaveChildren: false },
    alert: { description: 'Mantine Alert', category: 'interactive', frontendOnly: true, canHaveChildren: true },
    badge: { description: 'Mantine Badge', category: 'interactive', frontendOnly: true, canHaveChildren: false },
    avatar: { description: 'Mantine Avatar', category: 'interactive', frontendOnly: true, canHaveChildren: false },
    chip: { description: 'Mantine Chip', category: 'interactive', frontendOnly: true, canHaveChildren: false },
    indicator: { description: 'Mantine Indicator dot', category: 'interactive', frontendOnly: true, canHaveChildren: true },
    'theme-icon': { description: 'Mantine ThemeIcon', category: 'interactive', frontendOnly: true, canHaveChildren: false },
    notification: { description: 'Mantine Notification', category: 'interactive', frontendOnly: true, canHaveChildren: false },

    // ===== forms =====
    'form-log': { description: 'Append-only form (one row per submit)', category: 'forms', frontendOnly: true, canHaveChildren: true },
    'form-record': { description: 'Per-user record form', category: 'forms', frontendOnly: true, canHaveChildren: true },
    input: { description: 'Plain HTML input', category: 'forms', frontendOnly: true, canHaveChildren: false },
    'text-input': { description: 'Mantine TextInput', category: 'forms', frontendOnly: true, canHaveChildren: false },
    textarea: { description: 'Mantine Textarea', category: 'forms', frontendOnly: true, canHaveChildren: false },
    'rich-text-editor': { description: 'Tiptap editor on web; READ-ONLY viewer on mobile v1', category: 'forms', frontendOnly: true, canHaveChildren: false },
    select: { description: 'HTML select / Mantine Select', category: 'forms', frontendOnly: true, canHaveChildren: false },
    radio: { description: 'Mantine Radio / RadioGroup', category: 'forms', frontendOnly: true, canHaveChildren: false },
    checkbox: { description: 'Mantine Checkbox', category: 'forms', frontendOnly: true, canHaveChildren: false },
    slider: { description: 'Mantine Slider', category: 'forms', frontendOnly: true, canHaveChildren: false },
    'range-slider': { description: 'Mantine RangeSlider', category: 'forms', frontendOnly: true, canHaveChildren: false },
    datepicker: { description: 'Mantine DatePicker', category: 'forms', frontendOnly: true, canHaveChildren: false },
    switch: { description: 'Mantine Switch', category: 'forms', frontendOnly: true, canHaveChildren: false },
    combobox: { description: 'Mantine Combobox', category: 'forms', frontendOnly: true, canHaveChildren: false },
    'color-input': { description: 'Mantine ColorInput', category: 'forms', frontendOnly: true, canHaveChildren: false },
    'color-picker': { description: 'Mantine ColorPicker', category: 'forms', frontendOnly: true, canHaveChildren: false },
    'file-input': { description: 'Mantine FileInput / DocumentPicker on RN', category: 'forms', frontendOnly: true, canHaveChildren: false },
    'number-input': { description: 'Mantine NumberInput', category: 'forms', frontendOnly: true, canHaveChildren: false },
    'segmented-control': { description: 'Mantine SegmentedControl', category: 'forms', frontendOnly: true, canHaveChildren: false },
    rating: { description: 'Mantine Rating', category: 'forms', frontendOnly: true, canHaveChildren: false },
    progress: { description: 'Mantine Progress', category: 'forms', frontendOnly: true, canHaveChildren: false },
    'progress-root': { description: 'Mantine Progress.Root', category: 'forms', frontendOnly: true, canHaveChildren: true },
    'progress-section': { description: 'Mantine Progress.Section', category: 'forms', frontendOnly: true, canHaveChildren: false },

    // ===== composite =====
    accordion: { description: 'Mantine Accordion', category: 'composite', frontendOnly: true, canHaveChildren: true },
    'accordion-item': { description: 'Mantine Accordion.Item', category: 'composite', frontendOnly: true, canHaveChildren: true },
    tabs: { description: 'Mantine Tabs', category: 'composite', frontendOnly: true, canHaveChildren: true },
    tab: { description: 'Mantine Tabs.Tab + Tabs.Panel pair', category: 'composite', frontendOnly: true, canHaveChildren: true },
    timeline: { description: 'Mantine Timeline', category: 'composite', frontendOnly: true, canHaveChildren: true },
    list: { description: 'Mantine List', category: 'composite', frontendOnly: true, canHaveChildren: true },
    'list-item': { description: 'Mantine List.Item', category: 'composite', frontendOnly: true, canHaveChildren: true },
    entryList: { description: 'Data-driven list of entries (form-log table)', category: 'composite', frontendOnly: true, canHaveChildren: true },
    entryRecord: { description: 'Single-record container', category: 'composite', frontendOnly: true, canHaveChildren: true },
    entryRecordDelete: { description: 'Inline delete confirmation for an entry', category: 'composite', frontendOnly: true, canHaveChildren: false },
    loop: { description: 'Loop / repeater over backend-provided rows', category: 'composite', frontendOnly: true, canHaveChildren: true },
} as const satisfies Record<string, IStyleRegistryEntry>;

export type TStyleRegistryKey = keyof typeof STYLE_REGISTRY;

/**
 * Compile-time guard: every key in the registry must be a valid TStyleName,
 * and every TStyleName must be a registry key.
 */
export type _AssertRegistryMatchesStyleName = TStyleName extends TStyleRegistryKey
    ? TStyleRegistryKey extends TStyleName
        ? true
        : never
    : never;
