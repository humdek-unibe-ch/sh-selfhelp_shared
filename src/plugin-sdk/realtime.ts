/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * `usePluginRealtime` — universal React hook for plugin Mercure topic
 * subscription.
 *
 * Implements the contract laid out in the plan section 10 "Realtime
 * infrastructure & no-polling policy":
 *
 *   const { data, isOnline, lastEventAt, error } = usePluginRealtime<TPayload>({
 *       pluginId: 'sh2-shp-survey-js',
 *       topic: 'surveys/{surveyId}/responses',
 *       topicParams: { surveyId: 42 },
 *   });
 *
 * The hook:
 *
 *   - opens a same-origin `EventSource` against
 *     `/api/plugins/events?pluginId=…&topic=…` (the host BFF route),
 *   - listens for messages on the requested topic event-name,
 *   - exposes the latest payload + connection state,
 *   - reconnects with exponential backoff on transient errors,
 *   - is a no-op in environments without `EventSource` (server / RN).
 *
 * Mobile apps must inject their own `react-native-sse`-backed
 * implementation through the optional `transportFactory` argument;
 * this keeps the shared SDK free of React Native imports while still
 * letting the same plugin code re-use the same hook signature on web
 * and on device. The mobile package documents the wrapper.
 *
 * IMPORTANT: this hook never polls. If `EventSource` cannot connect, it
 * surfaces `isOnline = false` and the consumer is expected to show an
 * "offline" banner — not to set up a `setInterval` fallback.
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Subset of the WHATWG `EventSource` API the hook actually relies on.
 * Declared inline so the SDK does not pull DOM types into projects that
 * disable `dom` (e.g. some Expo TypeScript setups).
 */
export interface IRealtimeTransport {
    addEventListener(type: 'open' | 'error' | string, listener: (evt: unknown) => void): void;
    removeEventListener(type: 'open' | 'error' | string, listener: (evt: unknown) => void): void;
    close(): void;
    readyState: number;
}

export type TRealtimeTransportFactory = (url: string) => IRealtimeTransport;

export interface IUsePluginRealtimeOptions<TPayload = unknown> {
    /** Plugin id (`plugin.json#id`). */
    pluginId: string;
    /** Topic key as declared in the manifest (e.g. `surveys/{surveyId}/responses`). */
    topic: string;
    /** Values that fill the `{placeholders}` in `topic`. */
    topicParams?: Record<string, string | number>;
    /** Disable subscription without unmounting the consumer. */
    enabled?: boolean;
    /**
     * Override the SSE endpoint. Defaults to `/api/plugins/events`. The
     * host BFF proxies it through to Symfony's per-plugin Mercure
     * bootstrap so the subscriber JWT never reaches the browser.
     */
    endpoint?: string;
    /**
     * Optional transport factory. Used by the mobile package to plug in
     * `react-native-sse` (or any other SSE-compatible client) without
     * pulling RN imports into the shared SDK.
     */
    transportFactory?: TRealtimeTransportFactory;
    /** Parser for the event payload. Defaults to `JSON.parse`. */
    parse?: (raw: string) => TPayload;
}

export interface IUsePluginRealtimeResult<TPayload = unknown> {
    /** Latest payload emitted on the topic, or `null` before the first event. */
    data: TPayload | null;
    /** `true` once the SSE handshake has succeeded for the current subscription. */
    isOnline: boolean;
    /** Wall-clock time of the last successful event, or `null`. */
    lastEventAt: Date | null;
    /** Most recent transport-level error, or `null` when healthy. */
    error: Error | null;
}

const DEFAULT_ENDPOINT = '/api/plugins/events';
const MAX_RECONNECT_DELAY_MS = 30_000;
const INITIAL_RECONNECT_DELAY_MS = 1_000;

/**
 * Replace `{placeholders}` in the topic key with the provided params and
 * URL-encode every value. Throws if any placeholder is unresolved so
 * misuse fails loudly rather than subscribing to a wildcard topic.
 */
function expandTopic(topic: string, params: Record<string, string | number>): string {
    return topic.replace(/\{([^}]+)\}/g, (_match, name: string) => {
        const value = params[name];
        if (value === undefined) {
            throw new Error(
                `usePluginRealtime: topic "${topic}" references {${name}} but topicParams.${name} was not provided.`,
            );
        }
        return encodeURIComponent(String(value));
    });
}

function buildSseUrl(
    endpoint: string,
    pluginId: string,
    expandedTopic: string,
): string {
    const params = new URLSearchParams({
        pluginId,
        topic: expandedTopic,
    });
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${separator}${params.toString()}`;
}

function isEventSourceAvailable(): boolean {
    return typeof globalThis !== 'undefined' && typeof (globalThis as Record<string, unknown>).EventSource !== 'undefined';
}

function defaultTransportFactory(url: string): IRealtimeTransport {
    const Ctor = (globalThis as Record<string, unknown>).EventSource as new (url: string) => IRealtimeTransport;
    return new Ctor(url);
}

/**
 * Subscribe a React/React-Native component to one Mercure plugin topic
 * and re-render whenever a new payload arrives.
 *
 * Returns `{ data, isOnline, lastEventAt, error }`. Always cleans up on
 * unmount and on prop change.
 */
export function usePluginRealtime<TPayload = unknown>(
    options: IUsePluginRealtimeOptions<TPayload>,
): IUsePluginRealtimeResult<TPayload> {
    const {
        pluginId,
        topic,
        topicParams = {},
        enabled = true,
        endpoint = DEFAULT_ENDPOINT,
        transportFactory,
        parse,
    } = options;

    const [data, setData] = useState<TPayload | null>(null);
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [lastEventAt, setLastEventAt] = useState<Date | null>(null);
    const [error, setError] = useState<Error | null>(null);

    // Stable refs so the effect closures always read the latest callback /
    // parser without forcing a reconnection on every render.
    const parseRef = useRef(parse);
    parseRef.current = parse;

    // Stringify topicParams once so React effect dependency comparison is
    // deterministic regardless of object identity churn in the caller.
    const topicParamsKey = JSON.stringify(topicParams);

    useEffect(() => {
        if (!enabled) {
            setIsOnline(false);
            return;
        }

        const factory = transportFactory ?? (isEventSourceAvailable() ? defaultTransportFactory : null);
        if (factory === null) {
            // No transport available (e.g. SSR or RN without injected
            // `react-native-sse`). Stay quiet — the plan forbids polling
            // here; the consumer must render an offline banner instead.
            setIsOnline(false);
            return;
        }

        let cancelled = false;
        let transport: IRealtimeTransport | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        let reconnectDelay = INITIAL_RECONNECT_DELAY_MS;

        let expandedTopic: string;
        try {
            expandedTopic = expandTopic(topic, JSON.parse(topicParamsKey) as Record<string, string | number>);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            setIsOnline(false);
            return;
        }

        const eventName = `plugin/${pluginId}/${expandedTopic}`;
        const url = buildSseUrl(endpoint, pluginId, expandedTopic);

        const onOpen = (): void => {
            if (cancelled) return;
            reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
            setIsOnline(true);
            setError(null);
        };

        const onEvent = (evt: unknown): void => {
            if (cancelled) return;
            const raw = (evt as { data?: string }).data;
            if (typeof raw !== 'string') return;
            try {
                const payload = parseRef.current
                    ? parseRef.current(raw)
                    : (JSON.parse(raw) as TPayload);
                setData(payload);
                setLastEventAt(new Date());
            } catch (parseErr) {
                setError(parseErr instanceof Error ? parseErr : new Error(String(parseErr)));
            }
        };

        const onError = (evt: unknown): void => {
            if (cancelled || !transport) return;
            setIsOnline(false);
            setError(evt instanceof Error ? evt : new Error('Plugin realtime transport error'));
            // readyState === 2 (CLOSED) means the browser will NOT
            // auto-reconnect (4xx/network); restart manually with backoff.
            if (transport.readyState === 2) {
                try {
                    transport.close();
                } catch {
                    // ignore — already closed.
                }
                transport = null;
                reconnectTimer = setTimeout(connect, reconnectDelay);
                reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
            }
        };

        const connect = (): void => {
            if (cancelled) return;
            try {
                transport = factory(url);
            } catch (createErr) {
                setError(createErr instanceof Error ? createErr : new Error(String(createErr)));
                setIsOnline(false);
                return;
            }
            transport.addEventListener('open', onOpen);
            transport.addEventListener(eventName, onEvent);
            transport.addEventListener('message', onEvent);
            transport.addEventListener('error', onError);
        };

        connect();

        return (): void => {
            cancelled = true;
            if (reconnectTimer !== null) {
                clearTimeout(reconnectTimer);
            }
            if (transport) {
                try {
                    transport.removeEventListener('open', onOpen);
                    transport.removeEventListener(eventName, onEvent);
                    transport.removeEventListener('message', onEvent);
                    transport.removeEventListener('error', onError);
                    transport.close();
                } catch {
                    // ignore — best-effort cleanup.
                }
                transport = null;
            }
        };
    }, [enabled, endpoint, pluginId, topic, topicParamsKey, transportFactory]);

    return { data, isOnline, lastEventAt, error };
}
