/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Mobile UI adapter contract — the SINGLE public source of the capability
 * shape both mobile tiers implement (mobile rendering plan, sections 8.3 / 9).
 *
 * The public mobile app renders CMS styles through these `Mobile*` capability
 * interfaces only, never directly against a UI library, so the build can swap
 * the implementation behind the `@selfhelp/mobile-pro-ui` specifier:
 *   - OSS tier -> the public app's in-repo adapters on open `heroui-native` +
 *     React Native primitives.
 *   - Pro tier -> the private `@selfhelp/mobile-pro-ui` package built on paid
 *     HeroUI Pro components.
 *
 * It lives here (not copied into each consumer) so the public app and the Pro
 * package consume ONE contract and cannot silently drift. This module is
 * type-only: it imports `react` types and the shared semantic scales, and
 * pulls in NO React Native runtime dependency, which is why it belongs in
 * `@selfhelp/shared` rather than a separate contract package (plan 8.3).
 *
 * Props are normalized + renderer-agnostic (driven by the shared semantic
 * mapper in this package), NOT raw library props, so both tiers share one
 * contract.
 */
import type { ComponentType, ReactNode } from 'react';
import type { THeroUiButtonVariant, THeroUiSize } from '../theme/semantic';

/** Props shared by every adapter (styling + accessibility passthrough). */
export interface IMobileAdapterBaseProps {
    /** Uniwind/Tailwind class string (from `css_mobile` + spacing). */
    className?: string;
    /** Accessibility label for assistive tech. */
    accessibilityLabel?: string;
    testID?: string;
}

export interface IMobileButtonProps extends IMobileAdapterBaseProps {
    label?: string;
    onPress?: () => void;
    variant?: THeroUiButtonVariant;
    size?: THeroUiSize;
    isDisabled?: boolean;
    isLoading?: boolean;
    isIconOnly?: boolean;
    fullWidth?: boolean;
    /**
     * Optional concrete background colour (resolved hex) that overrides the
     * variant's themed fill, used for cross-platform parity when a CMS style
     * exposes an authored colour (e.g. `login`'s `shared_color`, which Mantine
     * applies to the web button via `color`). The adapter keeps the variant's
     * readable foreground (white on a filled button). Leave undefined to use the
     * variant's default themed colour. Resolve it through the shared mapper
     * (`resolveMantineVariant(...).accent`), never a hard-coded hex in a renderer.
     */
    accentColor?: string;
    children?: ReactNode;
}

export interface IMobileTextProps extends IMobileAdapterBaseProps {
    children?: ReactNode;
    /** Map to a heading level / emphasis; renderer decides exact styling. */
    emphasis?: 'title' | 'body' | 'muted';
    numberOfLines?: number;
}

export interface IMobileContainerProps extends IMobileAdapterBaseProps {
    children?: ReactNode;
    fullWidth?: boolean;
    /** Resolved padding in px (from shared spacing). */
    paddingPx?: number;
}

export interface IMobileCardProps extends IMobileAdapterBaseProps {
    children?: ReactNode;
    /** Resolved corner radius in px (from shared radius). */
    radiusPx?: number;
}

export interface IMobileInputProps extends IMobileAdapterBaseProps {
    value?: string;
    onChangeText?: (next: string) => void;
    placeholder?: string;
    label?: string;
    isDisabled?: boolean;
    isInvalid?: boolean;
    isRequired?: boolean;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export interface IMobileTextareaProps extends IMobileAdapterBaseProps {
    value?: string;
    onChangeText?: (next: string) => void;
    placeholder?: string;
    label?: string;
    isDisabled?: boolean;
    isInvalid?: boolean;
    isRequired?: boolean;
    /** Minimum visible rows (maps to RN `numberOfLines`). */
    numberOfLines?: number;
}

export interface IMobileSwitchProps extends IMobileAdapterBaseProps {
    isSelected?: boolean;
    onSelectedChange?: (next: boolean) => void;
    isDisabled?: boolean;
    label?: string;
}

export interface IMobileCheckboxProps extends IMobileAdapterBaseProps {
    isSelected?: boolean;
    onSelectedChange?: (next: boolean) => void;
    isDisabled?: boolean;
    label?: string;
}

export interface IMobileSelectOption {
    value: string;
    label: string;
}

export interface IMobileSelectProps extends IMobileAdapterBaseProps {
    value?: string;
    onValueChange?: (next: string) => void;
    options: readonly IMobileSelectOption[];
    placeholder?: string;
    isDisabled?: boolean;
}

export interface IMobileModalProps extends IMobileAdapterBaseProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children?: ReactNode;
}

/**
 * The full adapter set every tier must provide. Both the public app's OSS
 * index and the private Pro package satisfy this exact shape.
 */
export interface IMobileUiAdapters {
    MobileButton: ComponentType<IMobileButtonProps>;
    MobileText: ComponentType<IMobileTextProps>;
    MobileContainer: ComponentType<IMobileContainerProps>;
    MobileCard: ComponentType<IMobileCardProps>;
    MobileInput: ComponentType<IMobileInputProps>;
    MobileTextarea: ComponentType<IMobileTextareaProps>;
    MobileSwitch: ComponentType<IMobileSwitchProps>;
    MobileCheckbox: ComponentType<IMobileCheckboxProps>;
    MobileSelect: ComponentType<IMobileSelectProps>;
    MobileModal: ComponentType<IMobileModalProps>;
}
