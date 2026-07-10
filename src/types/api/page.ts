/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseApiResponse } from './envelope';
import type { IPageContent, IPageItem } from '../pages';

export type IGetPageResponse = IBaseApiResponse<{ page: IPageContent }>;
export type IGetPagesResponse = IBaseApiResponse<IPageItem[]>;

/**
 * Response of `GET /cms-api/v1/pages/resolve?path=...` (issue #30). Identical
 * envelope to {@link IGetPageResponse}; the resolved `page` additionally carries
 * `route_params`, `matched_url_pattern`, and `canonical_url`.
 */
export type IResolvePageResponse = IBaseApiResponse<{ page: IPageContent }>;
