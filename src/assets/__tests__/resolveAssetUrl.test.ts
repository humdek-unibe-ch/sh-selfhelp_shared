/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, it, expect } from 'vitest';
import { resolveAssetUrl, resolveAssetSources } from '../resolveAssetUrl';

describe('resolveAssetUrl', () => {
    const base = 'https://api.example.com';

    it('prefixes a root-relative path with the base url', () => {
        expect(resolveAssetUrl('/assets/img/foo.png', base)).toBe('https://api.example.com/assets/img/foo.png');
    });

    it('adds a leading slash for paths that lack one', () => {
        expect(resolveAssetUrl('assets/foo.png', base)).toBe('https://api.example.com/assets/foo.png');
    });

    it('strips trailing slashes from the base url', () => {
        expect(resolveAssetUrl('/foo.png', 'https://api.example.com/')).toBe('https://api.example.com/foo.png');
    });

    it('passes absolute http(s) urls through unchanged', () => {
        expect(resolveAssetUrl('https://cdn.example.com/foo.png', base)).toBe('https://cdn.example.com/foo.png');
    });

    it('passes protocol-relative urls through unchanged', () => {
        expect(resolveAssetUrl('//cdn.example.com/foo.png', base)).toBe('//cdn.example.com/foo.png');
    });

    it('passes data/blob/file uris through unchanged', () => {
        expect(resolveAssetUrl('data:image/png;base64,AAAA', base)).toBe('data:image/png;base64,AAAA');
        expect(resolveAssetUrl('blob:abc', base)).toBe('blob:abc');
    });

    it('returns an empty string for null/undefined/empty input', () => {
        expect(resolveAssetUrl(null, base)).toBe('');
        expect(resolveAssetUrl(undefined, base)).toBe('');
        expect(resolveAssetUrl('', base)).toBe('');
    });
});

describe('resolveAssetSources', () => {
    it('resolves the src of each source and keeps other fields', () => {
        const resolved = resolveAssetSources(
            [
                { src: '/a.mp4', type: 'video/mp4' },
                { src: 'https://cdn/b.webm', type: 'video/webm' },
            ],
            'https://api.example.com',
        );
        expect(resolved).toEqual([
            { src: 'https://api.example.com/a.mp4', type: 'video/mp4' },
            { src: 'https://cdn/b.webm', type: 'video/webm' },
        ]);
    });

    it('returns an empty array for undefined sources', () => {
        expect(resolveAssetSources(undefined, 'https://api.example.com')).toEqual([]);
    });
});
