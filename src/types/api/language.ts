/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import type { IBaseApiResponse } from './envelope';
import type { ILanguagePreference } from '../auth';

export interface ILanguageItem extends ILanguagePreference {
    is_default?: boolean;
}

export type ILanguagesResponse = IBaseApiResponse<ILanguageItem[]>;
