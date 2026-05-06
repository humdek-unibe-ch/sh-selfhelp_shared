import type { IContentField, IStyleWithSpacing } from './base';
import type { TMantineRadius } from '../mantine/common';

export interface ILoginStyle extends IStyleWithSpacing {
    style_name: 'login';
    label_user?: IContentField<string>;
    label_pw?: IContentField<string>;
    label_login?: IContentField<string>;
    label_pw_reset?: IContentField<string>;
    alert_fail?: IContentField<string>;
    login_title?: IContentField<string>;
    type?: IContentField<string>;
}

export interface IRegisterStyle extends IStyleWithSpacing {
    style_name: 'register';
    label_user?: IContentField<string>;
    label_pw?: IContentField<string>;
    label_submit?: IContentField<string>;
    alert_fail?: IContentField<string>;
    alert_success?: IContentField<string>;
    title?: IContentField<string>;
    success?: IContentField<string>;
}

export interface IValidateStyle extends IStyleWithSpacing {
    style_name: 'validate';
    label_pw?: IContentField<string>;
    label_login?: IContentField<string>;
    alert_fail?: IContentField<string>;
    label_pw_confirm?: IContentField<string>;
    title?: IContentField<string>;
    subtitle?: IContentField<string>;
    alert_success?: IContentField<string>;
    label_name?: IContentField<string>;
    name_placeholder?: IContentField<string>;
    name_description?: IContentField<string>;
    label_activate?: IContentField<string>;
    pw_placeholder?: IContentField<string>;
    success?: IContentField<string>;
    name?: IContentField<string>;
    page_keyword?: IContentField<string>;
    value_name?: IContentField<string>;
    anonymous_user_name_description?: IContentField<string>;
    redirect_at_end?: IContentField<string>;
    cancel_url?: IContentField<string>;
    label_save?: IContentField<string>;
    label_update?: IContentField<string>;
    label_cancel?: IContentField<string>;
    mantine_buttons_size?: IContentField<string>;
    mantine_buttons_radius?: IContentField<string>;
    mantine_buttons_variant?: IContentField<string>;
    mantine_buttons_position?: IContentField<string>;
    mantine_buttons_order?: IContentField<string>;
    mantine_btn_save_color?: IContentField<string>;
    mantine_btn_cancel_color?: IContentField<string>;
    mantine_card_shadow?: IContentField<string>;
    mantine_card_padding?: IContentField<string>;
    mantine_radius?: IContentField<TMantineRadius>;
    mantine_border?: IContentField<string>;
}

export interface IResetPasswordStyle extends IStyleWithSpacing {
    style_name: 'resetPassword';
    label_pw_reset?: IContentField<string>;
    text_md?: IContentField<string>;
    type?: IContentField<string>;
    alert_success?: IContentField<string>;
    placeholder?: IContentField<string>;
    email_user?: IContentField<string>;
    subject_user?: IContentField<string>;
    is_html?: IContentField<string>;
}

export interface ITwoFactorAuthStyle extends IStyleWithSpacing {
    style_name: 'twoFactorAuth';
    label_code?: IContentField<string>;
    label_submit?: IContentField<string>;
    alert_fail?: IContentField<string>;
    title?: IContentField<string>;
    text_md?: IContentField<string>;
    label_expiration_2fa?: IContentField<string>;
}

export interface IProfileStyle extends IStyleWithSpacing {
    style_name: 'profile';

    profile_title?: IContentField<string>;
    profile_account_info_title?: IContentField<string>;
    profile_label_email?: IContentField<string>;
    profile_label_username?: IContentField<string>;
    profile_label_name?: IContentField<string>;
    profile_label_created?: IContentField<string>;
    profile_label_last_login?: IContentField<string>;
    profile_label_timezone?: IContentField<string>;

    profile_name_change_title?: IContentField<string>;
    profile_name_change_description?: IContentField<string>;
    profile_name_change_label?: IContentField<string>;
    profile_name_change_placeholder?: IContentField<string>;
    profile_name_change_button?: IContentField<string>;
    profile_name_change_success?: IContentField<string>;
    profile_name_change_error_required?: IContentField<string>;
    profile_name_change_error_invalid?: IContentField<string>;
    profile_name_change_error_general?: IContentField<string>;

    profile_timezone_change_title?: IContentField<string>;
    profile_timezone_change_description?: IContentField<string>;
    profile_timezone_change_label?: IContentField<string>;
    profile_timezone_change_placeholder?: IContentField<string>;
    profile_timezone_change_button?: IContentField<string>;
    profile_timezone_change_success?: IContentField<string>;
    profile_timezone_change_error_required?: IContentField<string>;
    profile_timezone_change_error_general?: IContentField<string>;

    profile_password_reset_title?: IContentField<string>;
    profile_password_reset_description?: IContentField<string>;
    profile_password_reset_label_current?: IContentField<string>;
    profile_password_reset_label_new?: IContentField<string>;
    profile_password_reset_label_confirm?: IContentField<string>;
    profile_password_reset_placeholder_current?: IContentField<string>;
    profile_password_reset_placeholder_new?: IContentField<string>;
    profile_password_reset_placeholder_confirm?: IContentField<string>;
    profile_password_reset_button?: IContentField<string>;
    profile_password_reset_success?: IContentField<string>;
    profile_password_reset_error_current_required?: IContentField<string>;
    profile_password_reset_error_current_wrong?: IContentField<string>;
    profile_password_reset_error_new_required?: IContentField<string>;
    profile_password_reset_error_confirm_required?: IContentField<string>;
    profile_password_reset_error_mismatch?: IContentField<string>;
    profile_password_reset_error_weak?: IContentField<string>;
    profile_password_reset_error_general?: IContentField<string>;

    profile_delete_title?: IContentField<string>;
    profile_delete_description?: IContentField<string>;
    profile_delete_alert_text?: IContentField<string>;
    profile_delete_modal_warning?: IContentField<string>;
    profile_delete_label_email?: IContentField<string>;
    profile_delete_placeholder_email?: IContentField<string>;
    profile_delete_button?: IContentField<string>;
    profile_delete_success?: IContentField<string>;
    profile_delete_error_email_required?: IContentField<string>;
    profile_delete_error_email_mismatch?: IContentField<string>;
    profile_delete_error_general?: IContentField<string>;

    profile_gap?: IContentField<string>;
    profile_use_accordion?: IContentField<string>;
    profile_accordion_multiple?: IContentField<string>;
    profile_accordion_default_opened?: IContentField<string>;

    profile_variant?: IContentField<string>;
    profile_radius?: IContentField<string>;
    profile_shadow?: IContentField<string>;

    profile_columns?: IContentField<string>;

    alert_fail?: IContentField<string>;
    alert_del_fail?: IContentField<string>;
    alert_del_success?: IContentField<string>;
    alert_success?: IContentField<string>;
}
