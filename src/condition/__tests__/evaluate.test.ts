/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
import { describe, it, expect } from 'vitest';
import { buildConditionContext, evaluateCondition } from '../evaluate';

describe('evaluateCondition', () => {
    const ctx = buildConditionContext('web');

    it('treats a null/empty/whitespace condition as visible (no condition)', () => {
        expect(evaluateCondition(null, ctx).visible).toBe(true);
        expect(evaluateCondition('', ctx).visible).toBe(true);
        expect(evaluateCondition('   ', ctx).visible).toBe(true);
    });

    it('evaluates a true JSON-Logic rule to visible', () => {
        expect(evaluateCondition('{"==":[1,1]}', ctx).visible).toBe(true);
    });

    it('evaluates a false JSON-Logic rule to not visible', () => {
        expect(evaluateCondition('{"==":[1,2]}', ctx).visible).toBe(false);
    });

    it('resolves context variables (platform) from the condition context', () => {
        const rule = '{"==":[{"var":"platform"},"web"]}';
        expect(evaluateCondition(rule, buildConditionContext('web')).visible).toBe(true);
        expect(evaluateCondition(rule, buildConditionContext('mobile')).visible).toBe(false);
    });

    it('treats invalid JSON as not visible (fail closed, never throws)', () => {
        expect(evaluateCondition('{not json', ctx).visible).toBe(false);
    });

    it('exposes a debug payload with the error when withDebug is set', () => {
        const result = evaluateCondition('{not json', ctx, { withDebug: true });
        expect(result.visible).toBe(false);
        expect(result.debug?.error).toContain('Invalid JSON');
        expect(result.debug?.condition).toBe('{not json');
    });
});

describe('buildConditionContext', () => {
    it('builds deterministic date/time vars from a fixed "now" and includes the platform', () => {
        const now = new Date(2026, 4, 22, 9, 5, 3); // 2026-05-22 09:05:03 (month is 0-based)
        const ctx = buildConditionContext('mobile', { custom: 'x' }, now);

        expect(ctx.platform).toBe('mobile');
        expect(ctx.current_date).toBe('2026-05-22');
        expect(ctx.current_time).toBe('09:05:03');
        expect(ctx.current_datetime).toBe('2026-05-22 09:05:03');
        expect(ctx.custom).toBe('x');
    });
});
