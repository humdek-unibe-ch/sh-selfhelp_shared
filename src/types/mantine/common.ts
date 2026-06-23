/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Shared Mantine semantic types used by both web (Mantine v9) and mobile
 * (HeroUI Native + Uniwind, where these are mapped through the theme tokens).
 *
 * Whenever a value here changes, both renderers must update their token
 * mapping in `src/theme/tokens.ts`.
 */

export type TMantineSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TMantineRadius = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
export type TMantineSpacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none' | string;

/**
 * Cross-platform semantic scales — the TRUE common denominator
 * between Mantine (web) and HeroUI Native / React Native (mobile). HeroUI Native
 * only exposes `sm | md | lg`, so the portable unprefixed `size` / `radius` fields
 * use these narrowed scales instead of the full Mantine `xs..xl` range. The
 * backend enforces the same domain (migration `Version20260618195450`), and the
 * semantic mapper (`theme/semantic.ts`) maps these 1:1 without clamping.
 *
 * Genuinely web-specific size/radius fields (typed `TMantineSize` / `TMantineRadius`)
 * keep the full Mantine range.
 */
export type TSharedSize = 'sm' | 'md' | 'lg';
export type TSharedRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type TMantineVariant =
    | 'default'
    | 'filled'
    | 'light'
    | 'outline'
    | 'subtle'
    | 'transparent'
    | 'white'
    | 'gradient';

export type TMantineColor =
    | 'gray'
    | 'red'
    | 'pink'
    | 'grape'
    | 'violet'
    | 'indigo'
    | 'blue'
    | 'cyan'
    | 'teal'
    | 'green'
    | 'lime'
    | 'yellow'
    | 'orange'
    | 'dark'
    | string;

export type TMantineOrientation = 'horizontal' | 'vertical';
export type TMantineDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type TMantineWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type TMantineJustify =
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
export type TMantineAlign = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
export type TMantineColorFormat = 'hex' | 'rgba' | 'rgb' | 'hsl' | 'hsla';
export type TMantineGridSpan = 'auto' | 'content' | string;
export type TMantineGridOverflow = 'visible' | 'hidden';
export type TMantineTabsVariant = 'default' | 'outline' | 'pills';
export type TMantineFileAccept =
    | 'image/*'
    | 'video/*'
    | 'audio/*'
    | 'application/pdf'
    | string;
export type TMantineClampBehavior = 'strict' | 'blur' | 'none';
export type TMantineChipVariant = 'filled' | 'outline' | 'light';
export type TMantineFieldsetVariant = 'default' | 'filled' | 'unstyled';
export type TMantineAccordionVariant = 'default' | 'contained' | 'filled' | 'separated';
export type TMantineAvatarVariant =
    | 'default'
    | 'filled'
    | 'light'
    | 'outline'
    | 'subtle'
    | 'transparent'
    | 'white';
export type TMantineBadgeVariant =
    | 'default'
    | 'filled'
    | 'light'
    | 'outline'
    | 'dot'
    | 'transparent'
    | 'white'
    | 'gradient';
export type TMantineIndicatorPosition =
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'top-center'
    | 'bottom-center'
    | 'middle-start'
    | 'middle-end';
export type TMantineKbdSize = TMantineSize;
export type TMantineThemeIconVariant = TMantineVariant;
export type TMantineTimelineLineVariant = 'solid' | 'dashed' | 'dotted';
export type TMantineTitleOrder = '1' | '2' | '3' | '4' | '5' | '6';
export type TMantineCodeBlock = '0' | '1';
export type TMantineHighlight = string;
export type TMantineSpoilerMaxHeight = string;
export type TMantineRatingCount = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | string;
export type TMantineRatingFractions = '1' | '2' | '3' | '4' | '5' | string;
export type TMantineNotificationWithCloseButton = '0' | '1';
export type TMantineAspectRatio = string;
export type TMantineColorPickerSwatchesPerRow = string;
export type TMantineActionIconLoading = '0' | '1';
export type TMantineGroupWrap = '0' | '1';
export type TMantineGroupGrow = '0' | '1';
export type TMantineGridGrow = '0' | '1';
export type TMantineTabDisabled = '0' | '1';
export type TMantineColorInputSwatches = string;
export type TMantineColorPickerSwatches = string;
export type TMantineFileInputMultiple = '0' | '1';
export type TMantineNumberInputDecimalScale = string;
export type TMantineRangeSliderMarks = string;
export type TMantineChipChecked = '0' | '1';
export type TMantineChipMultiple = '0' | '1';
export type TMantineRatingReadonly = '0' | '1';
export type TMantineSpaceHorizontal = '0' | '1';
export type TMantineCenterInline = '0' | '1';
export type TMantineContainerFluid = '0' | '1';
export type TMantineFullWidth = '0' | '1';
export type TMantineCompact = '0' | '1';
export type TMantineAutoContrast = '0' | '1';
export type TMantineIsLink = '0' | '1';
export type TMantineUseMantineStyle = '0' | '1';
export type TMantineDisabled = '0' | '1';
export type TMantineOpenInNewTab = '0' | '1';
export type TMantineLoading = '0' | '1';
export type TMantineMultiple = '0' | '1';
export type TMantineChecked = '0' | '1';
export type TMantineReadonly = '0' | '1';
export type TMantineWithCloseButton = '0' | '1';
export type TMantineProcessing = '0' | '1';
export type TMantineBlock = '0' | '1';
export type TMantineWithIcon = '0' | '1';
export type TMantineAllowStepClick = '0' | '1';
export type TMantineAllowNextClicks = '0' | '1';
export type TMantineSwatches = string;
export type TMantineGrow = '0' | '1';
export type TMantineInline = '0' | '1';
export type TMantineFluid = '0' | '1';
