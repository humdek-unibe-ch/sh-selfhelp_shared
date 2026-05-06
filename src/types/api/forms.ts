import type { IBaseApiResponse } from './envelope';

export interface IFormSubmitRequest {
    section_id: number;
    page_id?: number;
    record_id?: number;
    form_data: Record<string, unknown>;
}

export interface IFormUpdateRequest {
    section_id: number;
    page_id?: number;
    record_id?: number;
    form_data: Record<string, unknown>;
    update_based_on?: Record<string, unknown>;
}

export interface IFormDeleteRequest {
    record_id: number;
    page_id?: number;
    section_id: number;
}

export interface IFormSubmitData {
    record_id?: number;
    success: boolean;
    redirect_url?: string;
    message?: string;
    field_errors?: Record<string, string>;
}

export type IFormSubmitResponse = IBaseApiResponse<IFormSubmitData>;
export type IFormUpdateResponse = IBaseApiResponse<IFormSubmitData>;
export type IFormDeleteResponse = IBaseApiResponse<{ success: boolean; message?: string }>;
