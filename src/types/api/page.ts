/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseApiResponse } from './envelope';
import type { IPageContent, IPageItem } from '../pages';

export type IGetPageResponse = IBaseApiResponse<{ page: IPageContent }>;
export type IGetPagesResponse = IBaseApiResponse<IPageItem[]>;
