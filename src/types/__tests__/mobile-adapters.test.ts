/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/
/**
 * Mobile UI adapter contract test (mobile rendering plan, section 14 "Shared":
 * "Mobile adapter contract type tests").
 *
 * The contract is the SINGLE public source both mobile tiers implement, so this
 * locks the milestone-one capability set. A capability added or removed without
 * a deliberate contract change (and matching OSS + Pro implementations) fails
 * here. The shapes themselves are enforced at compile time by the consumers
 * (`ossAdapters`/`proAdapters: IMobileUiAdapters` + the app `tsconfig.pro.json`).
 */
import { describe, expect, it } from 'vitest';
import type {
    ComponentType,
} from 'react';
import type {
    IMobileButtonProps,
    IMobileCardProps,
    IMobileCheckboxProps,
    IMobileContainerProps,
    IMobileInputProps,
    IMobileModalProps,
    IMobileSelectProps,
    IMobileSwitchProps,
    IMobileTextProps,
    IMobileTextareaProps,
    IMobileUiAdapters,
} from '../mobile-adapters';

/** The milestone-one capability set, as named keys. */
const CONTRACT_CAPABILITIES = [
    'MobileButton',
    'MobileText',
    'MobileContainer',
    'MobileCard',
    'MobileInput',
    'MobileTextarea',
    'MobileSwitch',
    'MobileCheckbox',
    'MobileSelect',
    'MobileModal',
] as const satisfies ReadonlyArray<keyof IMobileUiAdapters>;

/**
 * Compile-time exhaustiveness: every `IMobileUiAdapters` key must appear in the
 * list above and vice versa. If a capability is added to the interface without
 * being listed here (or removed), this assignment fails to type-check.
 */
type ContractKey = keyof IMobileUiAdapters;
type ListedKey = (typeof CONTRACT_CAPABILITIES)[number];
const _exhaustiveForward: ListedKey = '' as ContractKey;
const _exhaustiveBackward: ContractKey = '' as ListedKey;
void _exhaustiveForward;
void _exhaustiveBackward;

/**
 * Compile-time lock for the authored-colour button passthrough: `MobileButton`
 * accepts an optional `accentColor` (resolved hex) so a CMS style can colour the
 * button for cross-platform parity (e.g. `login`'s `color`). If the prop
 * is removed or retyped, this assignment fails to type-check.
 */
const _buttonAcceptsAccentColor: IMobileButtonProps = { accentColor: '#fab005' };
void _buttonAcceptsAccentColor;

describe('mobile UI adapter contract', () => {
    it('exposes exactly the milestone-one capability set', () => {
        // A trivial component every capability key can hold; proves a complete
        // implementation set is structurally assignable to the contract.
        const stub: ComponentType<never> = () => null;
        const adapters: IMobileUiAdapters = {
            MobileButton: stub as ComponentType<IMobileButtonProps>,
            MobileText: stub as ComponentType<IMobileTextProps>,
            MobileContainer: stub as ComponentType<IMobileContainerProps>,
            MobileCard: stub as ComponentType<IMobileCardProps>,
            MobileInput: stub as ComponentType<IMobileInputProps>,
            MobileTextarea: stub as ComponentType<IMobileTextareaProps>,
            MobileSwitch: stub as ComponentType<IMobileSwitchProps>,
            MobileCheckbox: stub as ComponentType<IMobileCheckboxProps>,
            MobileSelect: stub as ComponentType<IMobileSelectProps>,
            MobileModal: stub as ComponentType<IMobileModalProps>,
        };

        expect(Object.keys(adapters).sort()).toEqual([...CONTRACT_CAPABILITIES].sort());
        expect(CONTRACT_CAPABILITIES).toHaveLength(10);
    });
});
