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
export type TMantineCheckboxLabelPosition = 'left' | 'right';

export interface IFormStyle extends IStyleWithSpacing {
    style_name: 'form-log' | 'form-record';
    btn_save_label?: IContentField<string>;
    alert_success?: IContentField<string>;
    name?: IContentField<string>;    redirect_at_end?: IContentField<string>;
    btn_cancel_url?: IContentField<string>;
    btn_cancel_label?: IContentField<string>;
    alert_error?: IContentField<string>;
    buttons_size?: IContentField<string>;
    buttons_radius?: IContentField<string>;
    btn_save_color?: IContentField<string>;
    btn_cancel_color?: IContentField<string>;
    buttons_variant?: IContentField<string>;
    buttons_position?: IContentField<string>;}

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
    web_right_icon?: IContentField<string>;    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;
    web_text_input_variant?: IContentField<TMantineTextInputVariant>;
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
    web_textarea_autosize?: IContentField<TMantineTextareaAutosize>;
    web_textarea_min_rows?: IContentField<string>;
    web_textarea_max_rows?: IContentField<string>;
    web_textarea_resize?: IContentField<TMantineTextareaResize>;
    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;
    web_textarea_variant?: IContentField<TMantineTextareaVariant>;    translatable?: IContentField<TMantineTranslatable>;
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
    web_rich_text_editor_placeholder?: IContentField<string>;
    web_rich_text_editor_bubble_menu?: IContentField<string>;
    web_rich_text_editor_text_color?: IContentField<string>;
    web_rich_text_editor_task_list?: IContentField<string>;    translatable?: IContentField<TMantineTranslatable>;
}

export interface ISelectStyle extends IBaseStyle {
    style_name: 'select';
    alt?: IContentField<string>;
    is_required?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    placeholder?: IContentField<string>;
    options?: IContentField<string>;
    is_multiple?: IContentField<string>;
    max?: IContentField<string>;
    live_search?: IContentField<string>;
    disabled?: IContentField<string>;
    image_selector?: IContentField<string>;
    allow_clear?: IContentField<string>;
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
    shared_orientation?: IContentField<string>;
    shared_size?: IContentField<TSharedSize>;
    web_color?: IContentField<TMantineColor>;
    web_radio_options?: IContentField<string>;
    web_radio_label_position?: IContentField<string>;
    web_radio_variant?: IContentField<string>;
    web_radio_card?: IContentField<string>;
    web_tooltip_label?: IContentField<string>;
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
    web_checkbox_labelPosition?: IContentField<TMantineCheckboxLabelPosition>;
    description?: IContentField<string>;
    disabled?: IContentField<string>;
    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;
    web_color?: IContentField<TMantineColor>;    web_use_input_wrapper?: IContentField<TMantineUseInputWrapper>;
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
    shared_size?: IContentField<TSharedSize>;
    web_color?: IContentField<TMantineColor>;
    shared_radius?: IContentField<TSharedRadius>;
    disabled?: IContentField<string>;    web_slider_marks_values?: IContentField<string>;
    web_slider_show_label?: IContentField<string>;
    web_slider_labels_always_on?: IContentField<string>;
    web_slider_inverted?: IContentField<string>;
    web_slider_thumb_size?: IContentField<string>;
    web_slider_required?: IContentField<string>;
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
    web_range_slider_marks_values?: IContentField<string>;
    web_range_slider_show_label?: IContentField<string>;
    web_range_slider_labels_always_on?: IContentField<string>;
    web_range_slider_inverted?: IContentField<string>;
    shared_size?: IContentField<TSharedSize>;
    web_color?: IContentField<TMantineColor>;
    shared_radius?: IContentField<TSharedRadius>;
    disabled?: IContentField<string>;}

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
    web_datepicker_placeholder?: IContentField<string>;
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
    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;}

export interface ISwitchStyle extends IStyleWithSpacing {
    style_name: 'switch';
    label?: IContentField<string>;
    description?: IContentField<string>;
    web_switch_on_label?: IContentField<string>;
    web_switch_off_label?: IContentField<string>;
    shared_size?: IContentField<TSharedSize>;
    web_color?: IContentField<TMantineColor>;
    shared_radius?: IContentField<TSharedRadius>;
    disabled?: IContentField<string>;    name?: IContentField<string>;
    is_required?: IContentField<string>;
    web_label_position?: IContentField<string>;
    value?: IContentField<string>;
    web_switch_on_value?: IContentField<string>;
    web_use_input_wrapper?: IContentField<string>;
    web_switch_off_value?: IContentField<string>;
}

export interface IComboboxStyle extends IStyleWithSpacing {
    style_name: 'combobox';
    placeholder?: IContentField<string>;
    web_combobox_options?: IContentField<string>;
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
}

export interface IColorInputStyle extends IStyleWithSpacing {
    style_name: 'color-input';
    label?: IContentField<string>;
    web_color_format?: IContentField<string>;
    web_color_input_swatches?: IContentField<string>;
    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;
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
    web_color_picker_saturation_label?: IContentField<string>;
    web_color_picker_hue_label?: IContentField<string>;
    web_color_picker_alpha_label?: IContentField<string>;
    web_color_picker_as_button?: IContentField<string>;
    web_color_picker_button_label?: IContentField<string>;
    shared_size?: IContentField<TSharedSize>;
    shared_full_width?: IContentField<string>;
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
    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;
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
    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;
    placeholder?: IContentField<string>;
    label?: IContentField<string>;
    description?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    is_required?: IContentField<string>;
    disabled?: IContentField<string>;}

export interface ISegmentedControlStyle extends IStyleWithSpacing {
    style_name: 'segmented-control';
    web_segmented_control_data?: IContentField<string>;
    shared_orientation?: IContentField<string>;
    shared_size?: IContentField<TSharedSize>;
    shared_radius?: IContentField<TSharedRadius>;
    web_color?: IContentField<TMantineColor>;
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
    shared_size?: IContentField<TSharedSize>;
    web_color?: IContentField<TMantineColor>;}

export interface IProgressStyle extends IStyleWithSpacing {
    style_name: 'progress';
    value?: IContentField<string>;
    web_color?: IContentField<TMantineColor>;
    shared_radius?: IContentField<TSharedRadius>;
    shared_size?: IContentField<TSharedSize>;
    web_progress_striped?: IContentField<string>;
    web_progress_animated?: IContentField<string>;
    web_progress_transition_duration?: IContentField<TMantineProgressTransition>;}

export interface IProgressRootStyle extends IBaseStyle {
    style_name: 'progress-root';
    shared_size?: IContentField<TSharedSize>;
    web_progress_auto_contrast?: IContentField<string>;}

export interface IProgressSectionStyle extends IBaseStyle {
    style_name: 'progress-section';
    value?: IContentField<string>;
    web_color?: IContentField<TMantineColor>;
    web_progress_striped?: IContentField<string>;
    web_progress_animated?: IContentField<string>;
    label?: IContentField<string>;
    web_tooltip_label?: IContentField<string>;
    web_tooltip_position?: IContentField<string>;}

export interface IShowUserInputEntry {
    record_id: number;
    id_users: number;
    _can_delete?: boolean;
    [key: string]: unknown;
}

export interface IShowUserInputStyle extends IBaseStyle {
    style_name: 'show-user-input';
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
    shared_spacing?: IContentField<string>;
    web_table_striped?: IContentField<string>;
    web_table_highlight_on_hover?: IContentField<string>;
    web_table_with_table_border?: IContentField<string>;
    web_table_with_column_borders?: IContentField<string>;
    web_table_with_row_borders?: IContentField<string>;
    web_table_sticky_header?: IContentField<string>;
    web_table_caption_side?: IContentField<string>;
    entries?: IShowUserInputEntry[];
}
