import type { IContentField } from './styles/base';
import type { TStyleName } from './styles/unknown';

/**
 * Comprehensive page type system, single source of truth for both apps.
 */

export interface IBasePageSection {
    id: number;
    section_name: string;
    id_styles: number;
    style_name: TStyleName;
    position: number;
    level: number | { content: string; meta: string | null };
    path: string;
    children: IBasePageSection[];
}

export interface IPageSectionWithFields extends IBasePageSection {
    can_have_children: number | null;
    condition: string | null;
    css: string | null;
    css_mobile: string | null;
    debug: number | null;
    data_config: string | number | null;
    section_data: unknown[];
    fields: Record<string, IContentField<unknown>>;
    children: IPageSectionWithFields[];
}

export interface IBasePageInfo {
    id: number;
    keyword: string;
    url: string | null;
    parent_page_id: number | null;
    is_headless: boolean;
    navPosition: number | null;
    footerPosition: number | null;
    is_system?: boolean;
}

export interface IPageAccessTypeInfo {
    id: number;
    typeCode: string;
    lookupCode: string;
    lookupValue: string;
    lookupDescription: string | null;
}

export interface IPageItem extends IBasePageInfo {
    id_users?: number;
    id_pages?: number;
    acl_select?: 0 | 1;
    acl_insert?: 0 | 1;
    acl_update?: 0 | 1;
    acl_delete?: 0 | 1;
    id_type?: number;
    id_pageAccessTypes?: number;
    title?: string | null;
    description?: string | null;
    children?: IPageItem[];
}

export interface IPageContent {
    id: number;
    keyword: string;
    url: string | null;
    parent_page_id: number | null;
    is_headless: boolean;
    nav_position: number | null;
    footer_position: number | null;
    title?: string | null;
    description?: string | null;
    sections: IPageSectionWithFields[];
}

export interface IPageFieldTranslation {
    language_id: number;
    language_code: string;
    content: string;
}

export interface IPageField {
    id: number;
    name: string;
    title: string | null;
    type: string;
    default_value: string | null;
    help: string;
    display: boolean;
    translations: IPageFieldTranslation[];
    config?: unknown;
}

export interface IPageFieldsData {
    page: unknown;
    fields: IPageField[];
}

export interface IPageSectionsData {
    page_keyword: string;
    sections: IPageSectionWithFields[];
}
