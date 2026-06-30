/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseStyle, IContentField, IStyleWithSpacing } from './base';
import type {
    TMantineColor,
    TSharedSize,
    TSharedRadius,
} from '../mantine/common';

export type TMantineTextInputVariant = 'default' | 'filled' | 'unstyled';
export type TMantineTextareaAutosize = '0' | '1';
export type TMantineTextareaResize = 'none' | 'vertical' | 'both';
export type TMantineTextareaVariant = 'default' | 'filled' | 'unstyled';
export type TMantineUseInputWrapper = '0' | '1';
export type TMantineTranslatable = '0' | '1';
export type TMantineProgressTransition = '150' | '200' | '300' | '400' | '0' | string;
export type TSharedLabelPosition = 'left' | 'right';
// Mobile-only HeroUI Native knobs (no web/Mantine equivalent). The web
// renderer ignores `mobile_*`; only the mobile renderers read these.
export type TMobileSelectPresentation = 'bottom-sheet' | 'dialog' | 'popover';
export type TMobileFieldVariant = 'primary' | 'secondary';

export interface IFormStyle extends IStyleWithSpacing {
    style_name: 'form-log' | 'form-record';
    /** Optional auto-styled heading rendered above the form when set. */
    title?: IContentField<string>;
    /** Optional sub-heading rendered below the title when set. */
    description?: IContentField<string>;
    btn_save_label?: IContentField<string>;
    alert_success?: IContentField<string>;
    /** Translatable heading of the success alert (default "Success"). */
    alert_success_title?: IContentField<string>;
    name?: IContentField<string>;    redirect_at_end?: IContentField<string>;
    btn_cancel_url?: IContentField<string>;
    btn_cancel_label?: IContentField<string>;
    alert_error?: IContentField<string>;
    /** Translatable heading of the error alert (default "Error"). */
    alert_error_title?: IContentField<string>;
    /** When '1', a confirmation dialog is shown before submit. */
    confirm_submit?: IContentField<string>;
    /** Message shown in the confirmation dialog before submit. */
    confirm_message?: IContentField<string>;
    // RF-21: button knobs are portable to the mobile custom form (not a 1:1
    // component map). Promoted web_* -> shared_* so both renderers read them.
    buttons_size?: IContentField<string>;
    buttons_radius?: IContentField<string>;
    buttons_variant?: IContentField<string>;
    buttons_position?: IContentField<string>;
    buttons_order?: IContentField<string>;
    btn_save_color?: IContentField<string>;
    btn_cancel_color?: IContentField<string>;
}

export interface IFormLogStyle extends IFormStyle {
    style_name: 'form-log';
}

export interface IFormRecordStyle extends IFormStyle {
    style_name: 'form-record';
    btn_update_label?: IContentField<string>;
    btn_update_color?: IContentField<string>;
}

export interface IInputStyle extends IBaseStyle {
    style_name: 'input';
    type_input?: IContentField<string>;
    placeholder?: IContentField<string>;
    is_required?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    min?: IContentField<string>;
    max?: IContentField<string>;
    disabled?: IContentField<string>;
    translatable?: IContentField<TMantineTranslatable>;
}

export interface ITextInputStyle extends IStyleWithSpacing {
    style_name: 'text-input';
    label?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    placeholder?: IContentField<string>;
    description?: IContentField<string>;
    is_required?: IContentField<string>;
    disabled?: IContentField<string>;
    web_left_icon?: IContentField<string>;
    web_right_icon?: IContentField<string>;    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    web_text_input_variant?: IContentField<TMantineTextInputVariant>;
    // Capability pass (2026-06-22): max length (web + mobile) + mobile keyboard knobs.
    max_length?: IContentField<string>;
    mobile_keyboard_type?: IContentField<string>;
    mobile_auto_capitalize?: IContentField<string>;
    mobile_secure_entry?: IContentField<string>;
    // Mobile-only HeroUI Native field variant (primary = bordered, secondary = filled).
    mobile_input_variant?: IContentField<TMobileFieldVariant>;
    translatable?: IContentField<TMantineTranslatable>;
}

export interface ITextareaStyle extends IStyleWithSpacing {
    style_name: 'textarea';
    label?: IContentField<string>;
    placeholder?: IContentField<string>;
    is_required?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    min?: IContentField<string>;
    max?: IContentField<string>;
    markdown_editor?: IContentField<string>;
    description?: IContentField<string>;
    disabled?: IContentField<string>;
    web_left_icon?: IContentField<string>;
    web_right_icon?: IContentField<string>;
    // RF-18: row sizing is portable (mobile maps to numberOfLines / auto-grow).
    autosize?: IContentField<TMantineTextareaAutosize>;
    min_rows?: IContentField<string>;
    max_rows?: IContentField<string>;
    // RF-16: resize/variant have no clean React Native peer — stay web-only.
    web_textarea_resize?: IContentField<TMantineTextareaResize>;
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    web_textarea_variant?: IContentField<TMantineTextareaVariant>;
    // Capability pass (2026-06-22): max length (web + mobile) + mobile auto-capitalize.
    max_length?: IContentField<string>;
    mobile_auto_capitalize?: IContentField<string>;
    // Mobile-only HeroUI Native field variant (primary = bordered, secondary = filled).
    mobile_textarea_variant?: IContentField<TMobileFieldVariant>;
    translatable?: IContentField<TMantineTranslatable>;
}

export interface IRichTextEditorStyle extends IStyleWithSpacing {
    style_name: 'rich-text-editor';
    label?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    placeholder?: IContentField<string>;
    description?: IContentField<string>;
    is_required?: IContentField<string>;
    disabled?: IContentField<string>;
    web_rich_text_editor_variant?: IContentField<string>;
    rich_text_editor_placeholder?: IContentField<string>;
    web_rich_text_editor_bubble_menu?: IContentField<string>;
    web_rich_text_editor_text_color?: IContentField<string>;
    web_rich_text_editor_task_list?: IContentField<string>;    translatable?: IContentField<TMantineTranslatable>;
}

export interface ISelectStyle extends IBaseStyle {
    style_name: 'select';
    label?: IContentField<string>;
    is_required?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    placeholder?: IContentField<string>;
    options?: IContentField<string>;
    is_multiple?: IContentField<string>;
    max?: IContentField<string>;
    // RF-17: searchable/clearable are portable behaviour (was the stale
    // web-only `live_search` / `allow_clear`; mobile maps to search-field /
    // clear affordance where the adapter supports it).
    searchable?: IContentField<string>;
    disabled?: IContentField<string>;
    image_selector?: IContentField<string>;
    clearable?: IContentField<string>;
    // Mobile-only: how the option list opens (HeroUI Native Select.Content
    // presentation). Empty = renderer default (bottom-sheet).
    mobile_select_presentation?: IContentField<TMobileSelectPresentation>;
}

export interface IRadioStyle extends IStyleWithSpacing {
    style_name: 'radio';
    label?: IContentField<string>;
    description?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    is_required?: IContentField<string>;
    items?: IContentField<unknown[]>;
    is_inline?: IContentField<string>;
    orientation?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    color?: IContentField<TMantineColor>;
    radio_options?: IContentField<string>;
    web_radio_label_position?: IContentField<string>;
    web_radio_variant?: IContentField<string>;
    web_radio_card?: IContentField<string>;
    tooltip_label?: IContentField<string>;
    web_tooltip_position?: IContentField<string>;
    disabled?: IContentField<string>;    web_use_input_wrapper?: IContentField<string>;
}

export interface ICheckboxStyle extends IStyleWithSpacing {
    style_name: 'checkbox';
    label?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    is_required?: IContentField<string>;
    checkbox_value?: IContentField<string>;
    web_checkbox_icon?: IContentField<string>;
    // Label side (left/right) honoured on both platforms.
    label_position?: IContentField<TSharedLabelPosition>;
    description?: IContentField<string>;
    disabled?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    color?: IContentField<TMantineColor>;    web_use_input_wrapper?: IContentField<TMantineUseInputWrapper>;
    // Mobile-only HeroUI Native checkbox variant (primary / secondary).
    mobile_checkbox_variant?: IContentField<TMobileFieldVariant>;
}

export interface ISliderStyle extends IStyleWithSpacing {
    style_name: 'slider';
    label?: IContentField<string>;
    description?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    web_numeric_min?: IContentField<string>;
    web_numeric_max?: IContentField<string>;
    web_numeric_step?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    color?: IContentField<TMantineColor>;
    radius?: IContentField<TSharedRadius>;
    disabled?: IContentField<string>;    slider_marks_values?: IContentField<string>;
    web_slider_show_label?: IContentField<string>;
    web_slider_labels_always_on?: IContentField<string>;
    web_slider_inverted?: IContentField<string>;
    web_slider_thumb_size?: IContentField<string>;
    web_slider_required?: IContentField<string>;
    // Mobile-only: toggle the HeroUI Native Slider.Output value bubble.
    mobile_slider_show_value?: IContentField<string>;
}

export interface IRangeSliderStyle extends IStyleWithSpacing {
    style_name: 'range-slider';
    label?: IContentField<string>;
    description?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    web_numeric_min?: IContentField<string>;
    web_numeric_max?: IContentField<string>;
    web_numeric_step?: IContentField<string>;
    range_slider_marks_values?: IContentField<string>;
    web_range_slider_show_label?: IContentField<string>;
    web_range_slider_labels_always_on?: IContentField<string>;
    web_range_slider_inverted?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    color?: IContentField<TMantineColor>;
    radius?: IContentField<TSharedRadius>;
    disabled?: IContentField<string>;
    // Mobile-only: toggle the HeroUI Native Slider.Output value bubble.
    mobile_range_slider_show_value?: IContentField<string>;
}

export interface IDatePickerStyle extends IStyleWithSpacing {
    style_name: 'datepicker';
    label?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    is_required?: IContentField<string>;
    disabled?: IContentField<string>;
    description?: IContentField<string>;
    web_datepicker_type?: IContentField<string>;
    web_datepicker_format?: IContentField<string>;
    web_datepicker_locale?: IContentField<string>;
    datepicker_placeholder?: IContentField<string>;
    web_datepicker_min_date?: IContentField<string>;
    web_datepicker_max_date?: IContentField<string>;
    web_datepicker_first_day_of_week?: IContentField<string>;
    web_datepicker_weekend_days?: IContentField<string>;
    web_datepicker_clearable?: IContentField<string>;
    web_datepicker_allow_deselect?: IContentField<string>;
    web_datepicker_readonly?: IContentField<string>;
    web_datepicker_with_time_grid?: IContentField<string>;
    web_datepicker_consistent_weeks?: IContentField<string>;
    web_datepicker_hide_outside_dates?: IContentField<string>;
    web_datepicker_hide_weekends?: IContentField<string>;
    web_datepicker_time_step?: IContentField<string>;
    web_datepicker_time_format?: IContentField<string>;
    web_datepicker_date_format?: IContentField<string>;
    web_datepicker_time_grid_config?: IContentField<string>;
    web_datepicker_with_seconds?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;}

export interface ISwitchStyle extends IStyleWithSpacing {
    style_name: 'switch';
    label?: IContentField<string>;
    description?: IContentField<string>;
    switch_on_label?: IContentField<string>;
    switch_off_label?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    color?: IContentField<TMantineColor>;
    radius?: IContentField<TSharedRadius>;
    disabled?: IContentField<string>;    name?: IContentField<string>;
    is_required?: IContentField<string>;
    web_label_position?: IContentField<string>;
    value?: IContentField<string>;
    web_switch_on_value?: IContentField<string>;
    web_use_input_wrapper?: IContentField<string>;
    web_switch_off_value?: IContentField<string>;
    // Capability pass (2026-06-22): thumb indicator + optional thumb icon.
    web_switch_with_thumb_indicator?: IContentField<string>;
    web_switch_thumb_icon?: IContentField<string>;
}

export interface IComboboxStyle extends IStyleWithSpacing {
    style_name: 'combobox';
    placeholder?: IContentField<string>;
    combobox_options?: IContentField<string>;
    disabled?: IContentField<string>;    label?: IContentField<string>;
    description?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    is_required?: IContentField<string>;
    web_combobox_multi_select?: IContentField<string>;
    web_combobox_searchable?: IContentField<string>;
    web_combobox_creatable?: IContentField<string>;
    web_combobox_clearable?: IContentField<string>;
    web_combobox_separator?: IContentField<string>;
    web_multi_select_max_values?: IContentField<string>;
    // Mobile-only: reuses the select renderer; how the option list opens
    // (HeroUI Native Select.Content presentation). Empty = default bottom-sheet.
    mobile_select_presentation?: IContentField<TMobileSelectPresentation>;
}

export interface IColorInputStyle extends IStyleWithSpacing {
    style_name: 'color-input';
    label?: IContentField<string>;
    web_color_format?: IContentField<string>;
    web_color_input_swatches?: IContentField<string>;
    // Capability pass (2026-06-22): picker behaviour toggles.
    web_color_input_with_eye_dropper?: IContentField<string>;
    web_color_input_disallow_input?: IContentField<string>;
    web_color_input_with_preview?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    placeholder?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    description?: IContentField<string>;
    is_required?: IContentField<string>;
    disabled?: IContentField<string>;}

export interface IColorPickerStyle extends IStyleWithSpacing {
    style_name: 'color-picker';
    label?: IContentField<string>;
    web_color_format?: IContentField<string>;
    web_color_picker_swatches_per_row?: IContentField<string>;
    web_color_picker_swatches?: IContentField<string>;
    web_color_picker_with_picker?: IContentField<string>;
    color_picker_saturation_label?: IContentField<string>;
    color_picker_hue_label?: IContentField<string>;
    color_picker_alpha_label?: IContentField<string>;
    web_color_picker_as_button?: IContentField<string>;
    web_color_picker_button_label?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    full_width?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    description?: IContentField<string>;
    is_required?: IContentField<string>;}

export interface IFileInputStyle extends IStyleWithSpacing {
    style_name: 'file-input';
    web_file_input_multiple?: IContentField<string>;
    web_file_input_accept?: IContentField<string>;
    web_file_input_clearable?: IContentField<string>;
    web_file_input_max_size?: IContentField<string>;
    web_file_input_max_files?: IContentField<string>;
    web_file_input_drag_drop?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    web_left_icon?: IContentField<string>;
    web_right_icon?: IContentField<string>;
    placeholder?: IContentField<string>;
    disabled?: IContentField<string>;    is_required?: IContentField<string>;
    name?: IContentField<string>;
    label?: IContentField<string>;
    description?: IContentField<string>;
}

export interface INumberInputStyle extends IStyleWithSpacing {
    style_name: 'number-input';
    web_numeric_min?: IContentField<string>;
    web_numeric_max?: IContentField<string>;
    web_numeric_step?: IContentField<string>;
    web_number_input_decimal_scale?: IContentField<string>;
    web_number_input_clamp_behavior?: IContentField<string>;
    // Capability pass (2026-06-22): currency/units prefix-suffix + formatting.
    web_number_input_prefix?: IContentField<string>;
    web_number_input_suffix?: IContentField<string>;
    web_number_input_thousand_separator?: IContentField<string>;
    web_number_input_allow_negative?: IContentField<string>;
    web_number_input_hide_controls?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    placeholder?: IContentField<string>;
    label?: IContentField<string>;
    description?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    is_required?: IContentField<string>;
    disabled?: IContentField<string>;}

export interface ISegmentedControlStyle extends IStyleWithSpacing {
    style_name: 'segmented-control';
    segmented_control_data?: IContentField<string>;
    orientation?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    color?: IContentField<TMantineColor>;
    fullwidth?: IContentField<string>;
    disabled?: IContentField<string>;
    readonly?: IContentField<string>;    web_segmented_control_item_border?: IContentField<string>;
    label?: IContentField<string>;
    description?: IContentField<string>;
    value?: IContentField<string>;
    is_required?: IContentField<string>;
    name?: IContentField<string>;
}

export interface IRatingStyle extends IStyleWithSpacing {
    style_name: 'rating';
    label?: IContentField<string>;
    description?: IContentField<string>;
    name?: IContentField<string>;
    disabled?: IContentField<string>;
    value?: IContentField<string>;
    readonly?: IContentField<string>;
    web_rating_count?: IContentField<string>;
    web_rating_fractions?: IContentField<string>;
    web_rating_use_smiles?: IContentField<string>;
    web_rating_empty_icon?: IContentField<string>;
    web_rating_full_icon?: IContentField<string>;
    web_rating_highlight_selected_only?: IContentField<string>;
    size?: IContentField<TSharedSize>;
    color?: IContentField<TMantineColor>;}

export interface IProgressStyle extends IStyleWithSpacing {
    style_name: 'progress';
    value?: IContentField<string>;
    color?: IContentField<TMantineColor>;
    radius?: IContentField<TSharedRadius>;
    size?: IContentField<TSharedSize>;
    web_progress_striped?: IContentField<string>;
    web_progress_animated?: IContentField<string>;
    web_progress_transition_duration?: IContentField<TMantineProgressTransition>;}

export interface IProgressRootStyle extends IBaseStyle {
    style_name: 'progress-root';
    size?: IContentField<TSharedSize>;
    radius?: IContentField<TSharedRadius>;
    web_progress_auto_contrast?: IContentField<string>;}

export interface IProgressSectionStyle extends IBaseStyle {
    style_name: 'progress-section';
    value?: IContentField<string>;
    color?: IContentField<TMantineColor>;
    web_progress_striped?: IContentField<string>;
    web_progress_animated?: IContentField<string>;
    label?: IContentField<string>;
    tooltip_label?: IContentField<string>;
    web_tooltip_position?: IContentField<string>;}

export interface IShowUserInputEntry {
    record_id: number;
    id_users: number;
    _can_delete?: boolean;
    [key: string]: unknown;
}

export interface IShowUserInputStyle extends IBaseStyle {
    style_name: 'show-user-input';
    /** Optional auto-styled heading rendered above the entries when set. */
    title?: IContentField<string>;
    /** Message shown when there are no entries to display (default "No entries found."). */
    empty_text?: IContentField<string>;
    /** Source data table the form entries are read from (backend data binding). */
    data_table?: IContentField<string>;
    own_entries_only?: IContentField<string>;
    show_timestamp?: IContentField<string>;
    dt_sortable?: IContentField<string>;
    dt_searching?: IContentField<string>;
    dt_paginate?: IContentField<string>;
    dt_info?: IContentField<string>;
    dt_default_order_column?: IContentField<string>;
    dt_default_order_dir?: IContentField<string>;
    csv_export?: IContentField<string>;
    delete_entry?: IContentField<string>;
    fields_map?: IContentField<string>;
    delete_modal_title?: IContentField<string>;
    delete_modal_body?: IContentField<string>;
    spacing?: IContentField<string>;
    web_table_striped?: IContentField<string>;
    web_table_highlight_on_hover?: IContentField<string>;
    web_table_with_table_border?: IContentField<string>;
    web_table_with_column_borders?: IContentField<string>;
    web_table_with_row_borders?: IContentField<string>;
    web_table_sticky_header?: IContentField<string>;
    web_table_caption_side?: IContentField<string>;
    /**
     * show-user-input rows, each keyed by the immutable data-column `field_key`
     * (issue #56 v2). Header labels come from {@link field_labels}, not the keys.
     */
    entries?: IShowUserInputEntry[];
    /**
     * Header map `field_key => display_name` for {@link entries} (issue #56 v2).
     * Lets the table show the human column label while rows stay keyed by the
     * stable `field_key`, so renaming a column relabels the header automatically.
     * `fields_map` still overrides individual headers when set.
     */
    field_labels?: Record<string, string>;
}
