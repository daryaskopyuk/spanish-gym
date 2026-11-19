import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ColorTokens } from './colors';

export { darkColors, lightColors, type ColorTokens };

// Spacing and font sizes. Font sizes are in points; React Native scales them
// with the system font size setting automatically (allowFontScaling is on by default).
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const fontSize = { sm: 14, md: 17, lg: 22, xl: 30 } as const;

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
  spacing: typeof spacing;
  fontSize: typeof fontSize;
};

export function getTheme(scheme: 'light' | 'dark'): Theme {
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    spacing,
    fontSize,
  };
}

/** Current theme; follows the system light/dark setting. */
export function useTheme(): Theme {
  return getTheme(useColorScheme() === 'dark' ? 'dark' : 'light');
}
