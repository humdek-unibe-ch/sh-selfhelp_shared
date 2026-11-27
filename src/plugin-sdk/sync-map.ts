/*
 * SPDX-FileCopyrightText: 2026 Humdek, University of Bern
 * SPDX-License-Identifier: MPL-2.0
 */
/**
 * Declarative plugin sync map (contract C10).
 *
 * A plugin lists tags (exact, or a prefix ending in `*`) and the React Query
 * key each tag should invalidate. Hosts call {@link matchPluginSyncEntries}
 * from `applySyncTags` and invalidate each returned key as a prefix.
 */

/** One entry of a plugin's optional `sync` map. */
export interface IPluginSyncEntry {
    /** Exact tags, or a prefix ending in `*` (`res:surveyjs_survey:*`, `table:*`). */
    tags: string[];
    /** React Query key the host invalidates as a prefix when a listed tag matches. */
    queryKey: readonly unknown[];
}

/**
 * Returns the unique `queryKey` values whose `tags` match any of the message
 * tags. A pattern ending in `*` matches by prefix; every other tag must equal.
 * Uniqueness is by `JSON.stringify(queryKey)`.
 */
export function matchPluginSyncEntries(
    entries: readonly IPluginSyncEntry[] | null | undefined,
    tags: readonly string[],
): readonly unknown[][] {
    if (!entries?.length || tags.length === 0) {
        return [];
    }

    const seen = new Set<string>();
    const keys: unknown[][] = [];

    for (const entry of entries) {
        if (!entry.tags?.length || !Array.isArray(entry.queryKey)) {
            continue;
        }
        const matched = tags.some((tag) => entry.tags.some((pattern) => tagMatchesPattern(tag, pattern)));
        if (!matched) {
            continue;
        }
        const serialized = JSON.stringify(entry.queryKey);
        if (seen.has(serialized)) {
            continue;
        }
        seen.add(serialized);
        keys.push(entry.queryKey.slice());
    }

    return keys;
}

function tagMatchesPattern(tag: string, pattern: string): boolean {
    if (pattern.endsWith('*')) {
        return tag.startsWith(pattern.slice(0, -1));
    }
    return tag === pattern;
}
