import type { IBaseApiResponse } from './envelope';
import type { IPageContent, IPageItem } from '../pages';

export type IGetPageResponse = IBaseApiResponse<{ page: IPageContent }>;
export type IGetPagesResponse = IBaseApiResponse<IPageItem[]>;
