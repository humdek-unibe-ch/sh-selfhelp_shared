/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * Language-independent sentinel (backend `languages` row id 1, locale `all`).
 *
 * That row holds values that are the same in every language: page and section
 * properties, plain-text form cells, and the `all` entries of bundles. It is
 * not a real language and must not be chosen as a user's language or the CMS
 * default. Clients refer to it only through these constants — never a bare `1`.
 *
 * Mirrors backend `App\Entity\Language::INDEPENDENT_ID` / `INDEPENDENT_LOCALE`.
 */

/** Fixed id of the language-independent sentinel row. */
export const LANGUAGE_INDEPENDENT_ID = 1;

/** Locale token of the language-independent sentinel row (`all` in bundles). */
export const LANGUAGE_INDEPENDENT_LOCALE = 'all';

/** True when `languageId` is the language-independent sentinel. */
export function isLanguageIndependent(
    languageId: number | null | undefined,
): boolean {
    return languageId === LANGUAGE_INDEPENDENT_ID;
}
