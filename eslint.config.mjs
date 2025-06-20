import js from '@eslint/js';
import {FlatCompat} from '@eslint/eslintrc';
import path from 'path';
import {fileURLToPath} from 'url';

// Determine directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a compatibility layer between new flat config and traditional .eslintrc format
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

export default [
    // Enable ESLint recommended rules
    js.configs.recommended,

    // Import traditional configs
    ...compat.extends('plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'),

    // Global settings and rules
    {
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
        },
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
    },

    // TypeScript files
    {
        files: ['**/*.ts'],
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            'no-case-declarations': 'off',
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            'prettier/prettier': 'warn',
        },
    },

    // JavaScript files (less strict)
    {
        files: ['**/*.js'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            'no-console': 'off',
        },
    },

    // Test files
    {
        files: ['**/*.spec.ts'],
        rules: {
            'max-len': 'off',
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-expressions': 'off', // Allow unused expressions for Chai assertions
        },
    },

    // Ignore patterns
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'app/**',
            '.gen/**',
            'coverage/**',
            '.coverage/**',
            '.nyc_output/**',
            'scripts/**',
            '**/*.nolint.*',
        ],
    },
];
