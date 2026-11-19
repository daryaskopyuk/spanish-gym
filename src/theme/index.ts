import { useMemo } from 'react';
import { Platform, useColorScheme } from 'react-native';

import type { CheckResult } from '@/exercises/types';

import { darkColors, lightColors, type ColorTokens } from './colors';

export { darkColors, lightColors, type ColorTokens };

// Spacing and font sizes. Font sizes are in points; on iOS/Android React Native scales
// them with the system font size setting automatically (allowFontScaling is on by default).
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
const baseFontSize = { sm: 14, md: 17, lg: 22, xl: 30 } as const;
export const radius = { md: 12 } as const;
/** Minimum touch target (Apple HIG 44pt, Material 48dp). */
export const minTouchSize = 48;

export type FontSizes = { [K in keyof typeof baseFontSize]: number };

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
  spacing: typeof spacing;
  fontSize: FontSizes;
  radius: typeof radius;
};

export function getTheme(scheme: 'light' | 'dark', fontScale = 1): Theme {
  const fontSize = Object.fromEntries(
    Object.entries(baseFontSize).map(([k, v]) => [k, Math.round(v * fontScale)]),
  ) as FontSizes;
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    spacing,
    fontSize,
    radius,
  };
}

/**
 * Browsers don't apply the phone's font-size setting, so the browser UI tests simulate a
 * large system font by setting `window.__E2E_FONT_SCALE__`. Native always returns 1 because
 * the OS already scales text.
 */
function webTestFontScale(): number {
  if (Platform.OS !== 'web') return 1;
  const scale = (globalThis as { __E2E_FONT_SCALE__?: unknown }).__E2E_FONT_SCALE__;
  return typeof scale === 'number' && scale > 0 ? scale : 1;
}

/** Current theme; follows the system light/dark setting. */
export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const fontScale = webTestFontScale();
  return useMemo(() => getTheme(scheme, fontScale), [scheme, fontScale]);
}

/** Feedback colour for an answer result: green / amber / red. */
export function resultColor(colors: ColorTokens, result: CheckResult): string {
  return result === 'correct'
    ? colors.success
    : result === 'correct_missing_accent'
      ? colors.warning
      : colors.error;
}
