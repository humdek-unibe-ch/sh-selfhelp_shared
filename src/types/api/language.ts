import type { IBaseApiResponse } from './envelope';
import type { ILanguagePreference } from '../auth';

export interface ILanguageItem extends ILanguagePreference {
    is_default?: boolean;
}

export type ILanguagesResponse = IBaseApiResponse<ILanguageItem[]>;
