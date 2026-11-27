/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Mobile host-services bridge contract (mobile renderer axis 0.4.0).
 *
 * The shared package only owns the *contract* + the singleton registry; the
 * real 401-refresh / session-expired logic lives in the native host's
 * implementation. These tests assert:
 *   - the singleton is null before a host registers and after it clears,
 *   - a registered host is returned to plugin code,
 *   - the documented response contract (ok / reason / sessionExpired) lets a
 *     plugin branch on lifecycle + refresh outcomes through a representative
 *     fake host that performs a single 401 -> refresh -> retry, and reports
 *     session-expired when the refresh itself fails,
 *   - `isMobileRendererCompatible` covers the bumped 0.4.0 host,
 *   - the host may expose the optional `navigate()` capability a plugin
 *     feature-detects to honour an in-content redirect through the host router,
 *   - the host may expose the optional 0.4.0 `upload`, `requestPermission`,
 *     `openAppSettings` and `getPluginStorage`, and a host without them still
 *     type-checks.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    type IMobileHostRequest,
    type IMobileHostServices,
    type IMobileHostUploadFile,
    type IMobileHostUploadRequest,
    type IMobilePluginStorage,
    type TMobileHostPermission,
    type TMobileHostPermissionState,
    getMobileHostServices,
    setMobileHostServices,
} from '../host-services';
import { MOBILE_RENDERER_VERSION, isMobileRendererCompatible } from '../version';

afterEach(() => {
    setMobileHostServices(null);
});

describe('mobile host-services singleton', () => {
    it('is null until the host registers an implementation', () => {
        expect(getMobileHostServices()).toBeNull();
    });

    it('returns the host implementation the host registered', () => {
        const services: IMobileHostServices = {
            apiBaseUrl: () => 'https://cms.example.com',
            getAccessToken: () => 'token-abc',
            request: () => Promise.resolve({ ok: true, status: 200, data: null }),
        };
        setMobileHostServices(services);
        expect(getMobileHostServices()).toBe(services);
        expect(getMobileHostServices()?.apiBaseUrl()).toBe('https://cms.example.com');
        expect(getMobileHostServices()?.getAccessToken()).toBe('token-abc');
    });

    it('clears back to null when the host deregisters (e.g. server switch)', () => {
        setMobileHostServices({
            apiBaseUrl: () => '',
            getAccessToken: () => null,
            request: () => Promise.resolve({ ok: true, status: 204, data: null }),
        });
        setMobileHostServices(null);
        expect(getMobileHostServices()).toBeNull();
    });

    it('exposes the optional navigate() a renderer-0.3.0 host registers', () => {
        const navigate = vi.fn();
        setMobileHostServices({
            apiBaseUrl: () => 'https://cms.example.com',
            getAccessToken: () => null,
            request: () => Promise.resolve({ ok: true, status: 200, data: null }),
            navigate,
        });
        const host = getMobileHostServices();
        expect(typeof host?.navigate).toBe('function');
        host?.navigate?.('contact', false);
        expect(navigate).toHaveBeenCalledWith('contact', false);
    });

    it('omits navigate on an older host so a plugin must feature-detect it', () => {
        setMobileHostServices({
            apiBaseUrl: () => 'https://cms.example.com',
            getAccessToken: () => null,
            request: () => Promise.resolve({ ok: true, status: 200, data: null }),
        });
        expect(getMobileHostServices()?.navigate).toBeUndefined();
    });
});

describe('host request contract (host owns token + refresh)', () => {
    /**
     * Representative host: the first protected call 401s, the host refreshes
     * once and replays the request; if the refresh fails it reports
     * `sessionExpired`. This mirrors the native axios interceptor so plugin
     * code can be written against the contract.
     */
    function makeHost(options: { refreshSucceeds: boolean }): {
        services: IMobileHostServices;
        calls: () => number;
    } {
        let token = 'expired';
        let attempts = 0;
        const refresh = vi.fn(() => {
            if (!options.refreshSucceeds) return false;
            token = 'fresh';
            return true;
        });
        const services: IMobileHostServices = {
            apiBaseUrl: () => 'https://cms.example.com',
            getAccessToken: () => token,
            request: async <TData>(_req: IMobileHostRequest) => {
                attempts++;
                if (token === 'expired') {
                    const recovered = refresh();
                    if (!recovered) {
                        return { ok: false, status: 401, data: null, sessionExpired: true } as const;
                    }
                    attempts++;
                }
                return { ok: true, status: 200, data: { data: { responseId: 'R_1' } } as TData };
            },
        };
        return { services, calls: () => attempts };
    }

    it('recovers a 401 with a single refresh + retry and returns the payload', async () => {
        const { services, calls } = makeHost({ refreshSucceeds: true });
        setMobileHostServices(services);

        const res = await getMobileHostServices()!.request<{ data: { responseId: string } }>({
            path: '/cms-api/v1/plugins/sh2-shp-survey-js/published/key/submit',
            method: 'POST',
            body: { answers: {} },
        });

        expect(res.ok).toBe(true);
        expect(res.status).toBe(200);
        expect(res.data?.data.responseId).toBe('R_1');
        expect(calls()).toBe(2); // initial 401 + replay
    });

    it('reports sessionExpired when the refresh itself fails', async () => {
        const { services } = makeHost({ refreshSucceeds: false });
        setMobileHostServices(services);

        const res = await getMobileHostServices()!.request({
            path: '/cms-api/v1/plugins/sh2-shp-survey-js/published/key/progress',
            method: 'PUT',
            body: {},
        });

        expect(res.ok).toBe(false);
        expect(res.status).toBe(401);
        expect(res.sessionExpired).toBe(true);
    });
});

describe('renderer 0.4.0 optional host services (C27 to C29)', () => {
    it('returns a host with upload, requestPermission, openAppSettings and getPluginStorage', async () => {
        const store = new Map<string, string>();
        const upload = vi.fn(() => Promise.resolve({ ok: true, status: 201, data: null }));
        const requestPermission = vi.fn(() => Promise.resolve<TMobileHostPermissionState>('blocked'));
        const openAppSettings = vi.fn();
        const storage: IMobilePluginStorage = {
            getItem: (key) => Promise.resolve(store.get(key) ?? null),
            setItem: (key, value) => {
                store.set(key, value);
                return Promise.resolve();
            },
            removeItem: (key) => {
                store.delete(key);
                return Promise.resolve();
            },
            clear: () => {
                store.clear();
                return Promise.resolve();
            },
        };
        const getPluginStorage = vi.fn((_pluginId: string) => storage);
        setMobileHostServices({
            apiBaseUrl: () => 'https://cms.example.com',
            getAccessToken: () => null,
            request: () => Promise.resolve({ ok: true, status: 200, data: null }),
            upload,
            requestPermission,
            openAppSettings,
            getPluginStorage,
        });

        const host = getMobileHostServices();
        expect(host?.upload).toBe(upload);

        const file: IMobileHostUploadFile = { field: 'file', name: 'a.m4a', type: 'audio/m4a', base64: 'AAAA' };
        const res = await host?.upload?.({ path: '/cms-api/v1/plugins/x/upload', files: [file] });
        expect(res?.status).toBe(201);
        expect(upload).toHaveBeenCalledWith({ path: '/cms-api/v1/plugins/x/upload', files: [file] });

        expect(await host?.requestPermission?.('microphone')).toBe('blocked');
        host?.openAppSettings?.();
        expect(openAppSettings).toHaveBeenCalledTimes(1);

        const plugin = host?.getPluginStorage?.('sh2-shp-survey-js');
        expect(getPluginStorage).toHaveBeenCalledWith('sh2-shp-survey-js');
        await plugin?.setItem('draft', '{"a":1}');
        expect(await plugin?.getItem('draft')).toBe('{"a":1}');
        await plugin?.clear();
        expect(await plugin?.getItem('draft')).toBeNull();
    });

    it('keeps the new members optional: a renderer-0.3.0 host still type-checks and a plugin feature-detects', () => {
        const legacy: IMobileHostServices = {
            apiBaseUrl: () => 'https://cms.example.com',
            getAccessToken: () => null,
            request: () => Promise.resolve({ ok: true, status: 200, data: null }),
        };
        setMobileHostServices(legacy);
        const host = getMobileHostServices();
        expect(host?.upload).toBeUndefined();
        expect(host?.requestPermission).toBeUndefined();
        expect(host?.openAppSettings).toBeUndefined();
        expect(host?.getPluginStorage).toBeUndefined();
    });

    it('describes an upload request with text fields, files and a method', () => {
        const req: IMobileHostUploadRequest = {
            path: '/cms-api/v1/plugins/x/upload',
            method: 'PUT',
            fields: { survey: 'k' },
            files: [{ field: 'file', name: 'a.png', type: 'image/png', uri: 'file:///tmp/a.png' }],
            query: { draft: true },
        };
        const permission: TMobileHostPermission = 'camera';
        expect(req.files).toHaveLength(1);
        expect(permission).toBe('camera');
    });
});

describe('mobile renderer compatibility at the bumped version', () => {
    it('advertises 0.4.0 and gates plugin compatibility.mobile ranges against it', () => {
        expect(MOBILE_RENDERER_VERSION).toBe('0.4.0');
        expect(isMobileRendererCompatible('>=0.2.0')).toBe(true);
        expect(isMobileRendererCompatible('>=0.4.0')).toBe(true);
        expect(isMobileRendererCompatible('^0.4.0')).toBe(true);
        expect(isMobileRendererCompatible('^0.3.0')).toBe(false);
        expect(isMobileRendererCompatible('^0.1.0')).toBe(false);
    });
});
