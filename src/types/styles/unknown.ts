/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IContentField } from './base';
import type {
    ILoginStyle,
    IRegisterStyle,
    IValidateStyle,
    IResetPasswordStyle,
    ITwoFactorAuthStyle,
    IProfileStyle,
} from './auth';
import type {
    IContainerStyle,
    IBoxStyle,
    IFlexStyle,
    IGroupStyle,
    IStackStyle,
    ISimpleGridStyle,
    IGridStyle,
    IGridColumnStyle,
    ISpaceStyle,
    IDividerStyle,
    IPaperStyle,
    ICenterStyle,
    IScrollAreaStyle,
    ICardStyle,
    ICardSegmentStyle,
    IAspectRatioStyle,
    IBackgroundImageStyle,
    IRefContainerStyle,
    IDataContainerStyle,
} from './layout';
import type {
    ITitleStyle,
    ITextStyle,
    ICodeStyle,
    IHighlightStyle,
    IBlockquoteStyle,
    IHtmlTagStyle,
    IKbdStyle,
    ITypographyStyle,
    IFieldsetStyle,
    ISpoilerStyle,
} from './typography';
import type {
    IImageStyle,
    IVideoStyle,
    IAudioStyle,
    IFigureStyle,
    ICarouselStyle,
} from './media';
import type {
    IButtonStyle,
    ILinkStyle,
    IActionIconStyle,
    IAlertStyle,
    IBadgeStyle,
    IAvatarStyle,
    IChipStyle,
    IIndicatorStyle,
    IThemeIconStyle,
    INotificationStyle,
} from './interactive';
import type {
    IFormLogStyle,
    IFormRecordStyle,
    IInputStyle,
    ITextInputStyle,
    ITextareaStyle,
    IRichTextEditorStyle,
    ISelectStyle,
    IRadioStyle,
    ICheckboxStyle,
    ISliderStyle,
    IRangeSliderStyle,
    IDatePickerStyle,
    ISwitchStyle,
    IComboboxStyle,
    IColorInputStyle,
    IColorPickerStyle,
    IFileInputStyle,
    INumberInputStyle,
    ISegmentedControlStyle,
    IRatingStyle,
    IProgressStyle,
    IProgressRootStyle,
    IProgressSectionStyle,
    IShowUserInputStyle,
} from './forms';
import type {
    IAccordionStyle,
    IAccordionItemStyle,
    ITabsStyle,
    ITabStyle,
    ITimelineStyle,
    ITimelineItemStyle,
    IListStyle,
    IListItemStyle,
    IEntryListStyle,
    IEntryRecordStyle,
    IEntryRecordDeleteStyle,
    ILoopStyle,
} from './composite';
import type {
    INoAccessStyle,
    INotFoundStyle,
    IMissingStyle,
    IVersionStyle,
} from './error';

/**
 * Discriminated union of every supported user-facing style. Adding a new
 * style means adding its interface AND extending this union AND registering
 * it in `STYLE_REGISTRY`.
 *
 * Admin/CMS-only styles are intentionally NOT in this union — the mobile
 * app does not render them.
 */
export type TStyle =
    | ILoginStyle
    | IRegisterStyle
    | IValidateStyle
    | IResetPasswordStyle
    | ITwoFactorAuthStyle
    | IProfileStyle
    | IContainerStyle
    | IBoxStyle
    | IFlexStyle
    | IGroupStyle
    | IStackStyle
    | ISimpleGridStyle
    | IGridStyle
    | IGridColumnStyle
    | ISpaceStyle
    | IDividerStyle
    | IPaperStyle
    | ICenterStyle
    | IScrollAreaStyle
    | ICardStyle
    | ICardSegmentStyle
    | IAspectRatioStyle
    | IBackgroundImageStyle
    | ITitleStyle
    | ITextStyle
    | ICodeStyle
    | IHighlightStyle
    | IBlockquoteStyle
    | IHtmlTagStyle
    | IKbdStyle
    | ITypographyStyle
    | IFieldsetStyle
    | ISpoilerStyle
    | IImageStyle
    | IVideoStyle
    | IAudioStyle
    | IFigureStyle
    | ICarouselStyle
    | IButtonStyle
    | ILinkStyle
    | IActionIconStyle
    | IAlertStyle
    | IBadgeStyle
    | IAvatarStyle
    | IChipStyle
    | IIndicatorStyle
    | IThemeIconStyle
    | INotificationStyle
    | IFormLogStyle
    | IFormRecordStyle
    | IInputStyle
    | ITextInputStyle
    | ITextareaStyle
    | IRichTextEditorStyle
    | ISelectStyle
    | IRadioStyle
    | ICheckboxStyle
    | ISliderStyle
    | IRangeSliderStyle
    | IDatePickerStyle
    | ISwitchStyle
    | IComboboxStyle
    | IColorInputStyle
    | IColorPickerStyle
    | IFileInputStyle
    | INumberInputStyle
    | ISegmentedControlStyle
    | IRatingStyle
    | IProgressStyle
    | IProgressRootStyle
    | IProgressSectionStyle
    | IAccordionStyle
    | IAccordionItemStyle
    | ITabsStyle
    | ITabStyle
    | ITimelineStyle
    | IListStyle
    | IListItemStyle
    | IEntryListStyle
    | IEntryRecordStyle
    | IEntryRecordDeleteStyle
    | ILoopStyle
    | ITimelineItemStyle
    | INoAccessStyle
    | INotFoundStyle
    | IMissingStyle
    | IVersionStyle
    | IRefContainerStyle
    | IDataContainerStyle
    | IShowUserInputStyle;

/**
 * Discriminator — name of every supported style. Derived from the
 * `STYLE_REGISTRY` keys (declared in `src/registry/styles.registry.ts`).
 *
 * NOTE: Keep in sync with `STYLE_REGISTRY`. The registry is the source of
 * truth at runtime; this type is the source of truth at compile time.
 */
export type TStyleName = TStyle['style_name'];

/**
 * Catch-all for styles a renderer doesn't know about (yet). Keeps the
 * tree alive and lets the renderer surface debug info.
 */
export interface IUnknownStyle {
    id: number;
    id_styles: number;
    style_name: string;
    can_have_children: number | null;
    position: number;
    path: string;
    children?: TStyle[];
    fields: Record<string, IContentField<unknown>>;
    css?: string;
    css_mobile?: string;}
