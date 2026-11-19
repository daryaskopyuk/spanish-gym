// The only place colors are defined. Screens and components use these tokens
// through useTheme() (lint forbids color literals elsewhere).
// Palette: "Olive grove" (olive green on cream). Text/background pairs meet WCAG AA (4.5:1).

export type ColorTokens = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  onPrimary: string;
  success: string;
  warning: string;
  error: string;
};

export const lightColors: ColorTokens = {
  background: '#FAF7F0',
  surface: '#F0EBDC',
  text: '#1F2A1C',
  textMuted: '#5A6352',
  border: '#DCD4C2',
  primary: '#4A7326',
  onPrimary: '#FFFFFF',
  success: '#22703A',
  warning: '#8C4D06',
  error: '#BF3B28',
};

export const darkColors: ColorTokens = {
  background: '#161A12',
  surface: '#22281C',
  text: '#EEF0E6',
  textMuted: '#A3AA97',
  border: '#3A4230',
  primary: '#A3C962',
  onPrimary: '#161A12',
  success: '#7BD389',
  warning: '#F0A848',
  error: '#FF7B66',
};
