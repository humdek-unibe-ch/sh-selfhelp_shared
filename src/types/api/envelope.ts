/**
 * Common API envelope returned by the Symfony backend's ApiResponseFormatter.
 */

export interface IApiMeta {
    version: string;
    timestamp: string;
}

export type IMeta = IApiMeta;

export interface IBaseApiResponse<TData> {
    status: number;
    message: string;
    error: null | string;
    error_type?: string;
    logged_in: boolean;
    meta: IApiMeta;
    data: TData;
}

export interface IApiError {
    status: number;
    message: string;
    error: string;
    error_type?: string;
    logged_in?: boolean;
    meta?: IApiMeta;
    data?: unknown;
}
