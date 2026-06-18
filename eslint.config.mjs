/*
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
*/

/**
 * ESLint flat config for @selfhelp/shared.
 *
 * This is a published, framework-free TypeScript library consumed by the
 * SelfHelp web frontend and mobile app. The config is intentionally
 * type-aware (it needs a TS program for the promise/unsafe rules) and is
 * scoped so the strict rules apply to the package source while test
 * fixtures and Node-side tooling get sensible, narrow relaxations.
 *
 * Type-aware linting uses `tsconfig.eslint.json` (a lint-only project that
 * also includes the `__tests__` files the build/typecheck `tsconfig.json`
 * excludes). It does not affect `tsup` output or `tsc --noEmit`.
 */

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
    // Never lint generated output, dependencies, or coverage reports.
    {
        ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
    },

    // Baseline JavaScript correctness for every linted file.
    js.configs.recommended,

    // TypeScript package source + tests: strict, type-aware rule set.
    {
        files: ['**/*.ts'],
        extends: [
            tseslint.configs.base,
            tseslint.configs.eslintRecommended,
        ],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.eslint.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            'unused-imports': unusedImports,
        },
        rules: {
            // TypeScript already enforces these far more accurately.
            'no-undef': 'off',
            'no-unused-vars': 'off',

            // Unused imports / variables. `unused-imports/no-unused-imports`
            // is auto-fixable (removes the import), which the base
            // `@typescript-eslint/no-unused-vars` is not — so we delegate to
            // it and keep the TS rule off to avoid duplicate reports.
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],

            // Type safety.
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
            '@typescript-eslint/no-for-in-array': 'error',

            // Promise handling.
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',

            // Imports.
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
            ],
            'no-duplicate-imports': 'error',

            // Control flow / correctness. The TS-aware `consistent-return`
            // understands `void`/`undefined` returns, so the core rule is
            // disabled in its favour.
            'consistent-return': 'off',
            '@typescript-eslint/consistent-return': 'error',
            'no-unreachable': 'error',
            'no-debugger': 'error',
            'no-console': 'error',
        },
    },

    // Test fixtures legitimately use loose, ad-hoc shapes and console output.
    // Relax only the type-noise rules; correctness rules stay on.
    {
        files: ['**/__tests__/**/*.ts', '**/*.{test,spec}.ts'],
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
        },
    },

    // Node-side tooling (this config + scripts). Not part of the published
    // package and not type-aware.
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: {
            sourceType: 'module',
            globals: { ...globals.node },
        },
    },
);
