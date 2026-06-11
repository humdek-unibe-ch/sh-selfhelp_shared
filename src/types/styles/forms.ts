/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseStyle, IContentField, IStyleWithSpacing } from './base';
import type {
    TMantineSize,
    TMantineColor,
    TMantineRadius,
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
    name?: IContentField<string>;
    is_log?: IContentField<string>;
    redirect_at_end?: IContentField<string>;
    btn_cancel_url?: IContentField<string>;
    btn_cancel_label?: IContentField<string>;
    alert_error?: IContentField<string>;
    buttons_size?: IContentField<string>;
    buttons_radius?: IContentField<string>;
    btn_save_color?: IContentField<string>;
    btn_cancel_color?: IContentField<string>;
    buttons_variant?: IContentField<string>;
    buttons_position?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
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
    mantine_left_icon?: IContentField<string>;
    mantine_right_icon?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_text_input_variant?: IContentField<TMantineTextInputVariant>;
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
    mantine_left_icon?: IContentField<string>;
    mantine_right_icon?: IContentField<string>;
    mantine_textarea_autosize?: IContentField<TMantineTextareaAutosize>;
    mantine_textarea_min_rows?: IContentField<string>;
    mantine_textarea_max_rows?: IContentField<string>;
    mantine_textarea_resize?: IContentField<TMantineTextareaResize>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_textarea_variant?: IContentField<TMantineTextareaVariant>;
    use_mantine_style?: IContentField<string>;
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
    mantine_rich_text_editor_variant?: IContentField<string>;
    mantine_rich_text_editor_placeholder?: IContentField<string>;
    mantine_rich_text_editor_bubble_menu?: IContentField<string>;
    mantine_rich_text_editor_text_color?: IContentField<string>;
    mantine_rich_text_editor_task_list?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
    translatable?: IContentField<TMantineTranslatable>;
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
    mantine_orientation?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_radio_options?: IContentField<string>;
    mantine_radio_label_position?: IContentField<string>;
    mantine_radio_variant?: IContentField<string>;
    mantine_radio_card?: IContentField<string>;
    mantine_tooltip_label?: IContentField<string>;
    mantine_tooltip_position?: IContentField<string>;
    disabled?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
    mantine_use_input_wrapper?: IContentField<string>;
}

export interface ICheckboxStyle extends IStyleWithSpacing {
    style_name: 'checkbox';
    label?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    is_required?: IContentField<string>;
    checkbox_value?: IContentField<string>;
    mantine_checkbox_icon?: IContentField<string>;
    mantine_checkbox_labelPosition?: IContentField<TMantineCheckboxLabelPosition>;
    description?: IContentField<string>;
    disabled?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_color?: IContentField<TMantineColor>;
    use_mantine_style?: IContentField<string>;
    mantine_use_input_wrapper?: IContentField<TMantineUseInputWrapper>;
}

export interface ISliderStyle extends IStyleWithSpacing {
    style_name: 'slider';
    label?: IContentField<string>;
    description?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    mantine_numeric_min?: IContentField<string>;
    mantine_numeric_max?: IContentField<string>;
    mantine_numeric_step?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_radius?: IContentField<TMantineRadius>;
    disabled?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
    mantine_slider_marks_values?: IContentField<string>;
    mantine_slider_show_label?: IContentField<string>;
    mantine_slider_labels_always_on?: IContentField<string>;
    mantine_slider_inverted?: IContentField<string>;
    mantine_slider_thumb_size?: IContentField<string>;
    mantine_slider_required?: IContentField<string>;
}

export interface IRangeSliderStyle extends IStyleWithSpacing {
    style_name: 'range-slider';
    label?: IContentField<string>;
    description?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    mantine_numeric_min?: IContentField<string>;
    mantine_numeric_max?: IContentField<string>;
    mantine_numeric_step?: IContentField<string>;
    mantine_range_slider_marks_values?: IContentField<string>;
    mantine_range_slider_show_label?: IContentField<string>;
    mantine_range_slider_labels_always_on?: IContentField<string>;
    mantine_range_slider_inverted?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_radius?: IContentField<TMantineRadius>;
    disabled?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}

export interface IDatePickerStyle extends IStyleWithSpacing {
    style_name: 'datepicker';
    label?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    is_required?: IContentField<string>;
    disabled?: IContentField<string>;
    description?: IContentField<string>;
    mantine_datepicker_type?: IContentField<string>;
    mantine_datepicker_format?: IContentField<string>;
    mantine_datepicker_locale?: IContentField<string>;
    mantine_datepicker_placeholder?: IContentField<string>;
    mantine_datepicker_min_date?: IContentField<string>;
    mantine_datepicker_max_date?: IContentField<string>;
    mantine_datepicker_first_day_of_week?: IContentField<string>;
    mantine_datepicker_weekend_days?: IContentField<string>;
    mantine_datepicker_clearable?: IContentField<string>;
    mantine_datepicker_allow_deselect?: IContentField<string>;
    mantine_datepicker_readonly?: IContentField<string>;
    mantine_datepicker_with_time_grid?: IContentField<string>;
    mantine_datepicker_consistent_weeks?: IContentField<string>;
    mantine_datepicker_hide_outside_dates?: IContentField<string>;
    mantine_datepicker_hide_weekends?: IContentField<string>;
    mantine_datepicker_time_step?: IContentField<string>;
    mantine_datepicker_time_format?: IContentField<string>;
    mantine_datepicker_date_format?: IContentField<string>;
    mantine_datepicker_time_grid_config?: IContentField<string>;
    mantine_datepicker_with_seconds?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    use_mantine_style?: IContentField<string>;
}

export interface ISwitchStyle extends IStyleWithSpacing {
    style_name: 'switch';
    label?: IContentField<string>;
    description?: IContentField<string>;
    mantine_switch_on_label?: IContentField<string>;
    mantine_switch_off_label?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_radius?: IContentField<TMantineRadius>;
    disabled?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
    name?: IContentField<string>;
    is_required?: IContentField<string>;
    mantine_label_position?: IContentField<string>;
    value?: IContentField<string>;
    mantine_switch_on_value?: IContentField<string>;
    mantine_use_input_wrapper?: IContentField<string>;
    mantine_switch_off_value?: IContentField<string>;
}

export interface IComboboxStyle extends IStyleWithSpacing {
    style_name: 'combobox';
    placeholder?: IContentField<string>;
    mantine_combobox_options?: IContentField<string>;
    disabled?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
    label?: IContentField<string>;
    description?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    is_required?: IContentField<string>;
    mantine_combobox_multi_select?: IContentField<string>;
    mantine_combobox_searchable?: IContentField<string>;
    mantine_combobox_creatable?: IContentField<string>;
    mantine_combobox_clearable?: IContentField<string>;
    mantine_combobox_separator?: IContentField<string>;
    mantine_multi_select_max_values?: IContentField<string>;
}

export interface IColorInputStyle extends IStyleWithSpacing {
    style_name: 'color-input';
    label?: IContentField<string>;
    mantine_color_format?: IContentField<string>;
    mantine_color_input_swatches?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    placeholder?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    description?: IContentField<string>;
    is_required?: IContentField<string>;
    disabled?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}

export interface IColorPickerStyle extends IStyleWithSpacing {
    style_name: 'color-picker';
    label?: IContentField<string>;
    mantine_color_format?: IContentField<string>;
    mantine_color_picker_swatches_per_row?: IContentField<string>;
    mantine_color_picker_swatches?: IContentField<string>;
    mantine_color_picker_with_picker?: IContentField<string>;
    mantine_color_picker_saturation_label?: IContentField<string>;
    mantine_color_picker_hue_label?: IContentField<string>;
    mantine_color_picker_alpha_label?: IContentField<string>;
    mantine_color_picker_as_button?: IContentField<string>;
    mantine_color_picker_button_label?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_fullwidth?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    description?: IContentField<string>;
    is_required?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}

export interface IFileInputStyle extends IStyleWithSpacing {
    style_name: 'file-input';
    mantine_file_input_multiple?: IContentField<string>;
    mantine_file_input_accept?: IContentField<string>;
    mantine_file_input_clearable?: IContentField<string>;
    mantine_file_input_max_size?: IContentField<string>;
    mantine_file_input_max_files?: IContentField<string>;
    mantine_file_input_drag_drop?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_left_icon?: IContentField<string>;
    mantine_right_icon?: IContentField<string>;
    placeholder?: IContentField<string>;
    disabled?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
    is_required?: IContentField<string>;
    name?: IContentField<string>;
    label?: IContentField<string>;
    description?: IContentField<string>;
}

export interface INumberInputStyle extends IStyleWithSpacing {
    style_name: 'number-input';
    mantine_numeric_min?: IContentField<string>;
    mantine_numeric_max?: IContentField<string>;
    mantine_numeric_step?: IContentField<string>;
    mantine_number_input_decimal_scale?: IContentField<string>;
    mantine_number_input_clamp_behavior?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    placeholder?: IContentField<string>;
    label?: IContentField<string>;
    description?: IContentField<string>;
    name?: IContentField<string>;
    value?: IContentField<string>;
    is_required?: IContentField<string>;
    disabled?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}

export interface ISegmentedControlStyle extends IStyleWithSpacing {
    style_name: 'segmented-control';
    mantine_segmented_control_data?: IContentField<string>;
    mantine_orientation?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_color?: IContentField<TMantineColor>;
    fullwidth?: IContentField<string>;
    disabled?: IContentField<string>;
    readonly?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
    mantine_segmented_control_item_border?: IContentField<string>;
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
    mantine_rating_count?: IContentField<string>;
    mantine_rating_fractions?: IContentField<string>;
    mantine_rating_use_smiles?: IContentField<string>;
    mantine_rating_empty_icon?: IContentField<string>;
    mantine_rating_full_icon?: IContentField<string>;
    mantine_rating_highlight_selected_only?: IContentField<string>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_color?: IContentField<TMantineColor>;
    use_mantine_style?: IContentField<string>;
}

export interface IProgressStyle extends IStyleWithSpacing {
    style_name: 'progress';
    value?: IContentField<string>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_size?: IContentField<TMantineSize>;
    mantine_progress_striped?: IContentField<string>;
    mantine_progress_animated?: IContentField<string>;
    mantine_progress_transition_duration?: IContentField<TMantineProgressTransition>;
    use_mantine_style?: IContentField<string>;
}

export interface IProgressRootStyle extends IBaseStyle {
    style_name: 'progress-root';
    mantine_size?: IContentField<TMantineSize>;
    mantine_progress_auto_contrast?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}

export interface IProgressSectionStyle extends IBaseStyle {
    style_name: 'progress-section';
    value?: IContentField<string>;
    mantine_color?: IContentField<TMantineColor>;
    mantine_progress_striped?: IContentField<string>;
    mantine_progress_animated?: IContentField<string>;
    label?: IContentField<string>;
    mantine_tooltip_label?: IContentField<string>;
    mantine_tooltip_position?: IContentField<string>;
    use_mantine_style?: IContentField<string>;
}

export interface IShowUserInputStyle extends IBaseStyle {
    style_name: 'showUserInput';
    data_table?: IContentField<string>;
    own_entries_only?: IContentField<string>;
    show_timestamp?: IContentField<string>;
    anchor?: IContentField<string>;
    fields_map?: IContentField<string>;
    dt_sortable?: IContentField<string>;
    dt_searching?: IContentField<string>;
    dt_paginate?: IContentField<string>;
    dt_info?: IContentField<string>;
    dt_default_order_column?: IContentField<string>;
    dt_default_order_dir?: IContentField<string>;
    csv_export?: IContentField<string>;
    delete_entry?: IContentField<string>;
    delete_modal_title?: IContentField<string>;
    delete_modal_body?: IContentField<string>;
    mantine_spacing_margin_padding?: IContentField<string>;
    mantine_table_striped?: IContentField<string>;
    mantine_table_highlight_on_hover?: IContentField<string>;
    mantine_table_with_table_border?: IContentField<string>;
    mantine_table_with_column_borders?: IContentField<string>;
    mantine_table_with_row_borders?: IContentField<string>;
    mantine_table_sticky_header?: IContentField<string>;
    mantine_table_caption_side?: IContentField<string>;
    entries?: Array<Record<string, unknown>>;
}
