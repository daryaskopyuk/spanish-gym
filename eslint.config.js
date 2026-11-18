// ESLint flat config. The custom blocks below enforce the architecture rules in
// docs/PLAN.md §3 / §10a. Never disable one of them to make `npm run check` pass.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactNative = require('eslint-plugin-react-native');
const i18next = require('eslint-plugin-i18next');
const prettier = require('eslint-config-prettier');

// Only src/data/verbRepository.ts may read the conjugation data.
const verbsJsonRestriction = {
  group: ['**/verbs.json', '**/data/verbs'],
  message: 'Only src/data/verbRepository.ts may import verbs.json. Use the repository instead.',
};

// Vendor SDKs (ads, IAP, crash reporting, analytics) may only be imported from
// src/monetization/ and src/telemetry/. Add each SDK's package name here when it is added.
const vendorSdkRestriction = {
  group: [
    'react-native-google-mobile-ads',
    'react-native-purchases',
    '@sentry/*',
    'sentry-expo',
    '@react-native-firebase/*',
  ],
  message: 'Vendor SDKs are only used inside src/monetization/ or src/telemetry/.',
};

module.exports = defineConfig([
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.expo/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'e2e/screenshots/**',
      'expo-env.d.ts',
    ],
  },
  expoConfig,

  // Architecture: restricted imports (everywhere).
  {
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [verbsJsonRestriction, vendorSdkRestriction] },
      ],
    },
  },
  {
    files: ['src/data/verbRepository.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [vendorSdkRestriction] }],
    },
  },
  {
    files: ['src/monetization/**', 'src/telemetry/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [verbsJsonRestriction] }],
    },
  },

  // Architecture: no hard-coded colors outside the theme.
  {
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    ignores: ['src/theme/**'],
    plugins: { 'react-native': reactNative },
    rules: {
      'react-native/no-color-literals': 'error',
    },
  },

  // Architecture: no hard-coded user-visible text in screens and components.
  {
    files: ['app/**/*.tsx', 'src/components/**/*.tsx'],
    ignores: ['**/*.test.tsx'], // tests may assert on literal text
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          'jsx-attributes': {
            include: [
              'title',
              'placeholder',
              'label',
              'accessibilityLabel',
              'accessibilityHint',
              'aria-label',
            ],
          },
        },
      ],
    },
  },

  // Must be last: turns off rules that conflict with Prettier.
  prettier,
]);
