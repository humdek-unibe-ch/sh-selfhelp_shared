/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Mobile host-services bridge contract (mobile renderer axis 0.2.0).
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
 *   - `isMobileRendererCompatible` covers the bumped 0.2.0 host.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    type IMobileHostRequest,
    type IMobileHostServices,
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

describe('mobile renderer compatibility at the bumped version', () => {
    it('advertises 0.2.0 and gates plugin compatibility.mobile ranges against it', () => {
        expect(MOBILE_RENDERER_VERSION).toBe('0.2.0');
        expect(isMobileRendererCompatible('^0.2.0')).toBe(true);
        expect(isMobileRendererCompatible('^0.1.0')).toBe(false);
    });
});
