/**
 * Client-side mirror of the backend `ConditionService::evaluateCondition`.
 * Uses `json-logic-js` so the same JSON-Logic expressions evaluated on
 * the server are evaluated identically here.
 *
 * Backend system variables (see ConditionService docblock):
 *   - language: ISO locale code, e.g. 'de-CH'
 *   - current_date / current_datetime / current_time
 *   - page_keyword
 *   - platform: 'web' | 'mobile'
 *
 * Anything else passed in `extraVars` is merged on top.
 */

import jsonLogic from 'json-logic-js';

export type TPlatform = 'web' | 'mobile';

export interface IConditionContext {
    platform: TPlatform;
    language?: string;
    page_keyword?: string;
    current_date?: string;
    current_datetime?: string;
    current_time?: string;
    [extraKey: string]: unknown;
}

export interface IEvaluatedCondition {
    /** Whether the condition allowed the section to render. */
    visible: boolean;
    /** Optional debug payload (only set when `withDebug` is true). */
    debug?: {
        condition: string | null;
        result: boolean;
        variables: Record<string, unknown>;
        error?: string;
    };
}

/**
 * Build a default context with current date/time + the platform
 * variable. Pass any extra vars (data-bound section variables, etc).
 */
export function buildConditionContext(
    platform: TPlatform,
    extraVars: Record<string, unknown> = {},
    now: Date = new Date()
): IConditionContext {
    const pad = (n: number): string => String(n).padStart(2, '0');
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    return {
        platform,
        current_date: date,
        current_time: time,
        current_datetime: `${date} ${time}`,
        ...extraVars,
    };
}

/**
 * Evaluate a JSON-Logic condition string. A null/empty/whitespace
 * condition is treated as `visible: true` (no condition).
 */
export function evaluateCondition(
    condition: string | null | undefined,
    context: IConditionContext,
    options: { withDebug?: boolean } = {}
): IEvaluatedCondition {
    const trimmed = (condition ?? '').toString().trim();
    if (!trimmed) {
        return options.withDebug
            ? { visible: true, debug: { condition: null, result: true, variables: { ...context } } }
            : { visible: true };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(trimmed);
    } catch (err) {
        return options.withDebug
            ? {
                  visible: false,
                  debug: {
                      condition: trimmed,
                      result: false,
                      variables: { ...context },
                      error: `Invalid JSON: ${(err as Error).message}`,
                  },
              }
            : { visible: false };
    }

    try {
        // jsonLogic typings are loose; the result of any boolean rule is
        // a boolean, but rules like {var: 'x'} can return raw values, so
        // we coerce.
        const raw = jsonLogic.apply(parsed as jsonLogic.RulesLogic, context as Record<string, unknown>);
        const visible = Boolean(raw);
        return options.withDebug
            ? { visible, debug: { condition: trimmed, result: visible, variables: { ...context } } }
            : { visible };
    } catch (err) {
        return options.withDebug
            ? {
                  visible: false,
                  debug: {
                      condition: trimmed,
                      result: false,
                      variables: { ...context },
                      error: (err as Error).message,
                  },
              }
            : { visible: false };
    }
}
