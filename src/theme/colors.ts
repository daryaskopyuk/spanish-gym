// The only place colors are defined. Screens and components use these tokens
// through useTheme() (lint forbids color literals elsewhere).

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
  background: '#FFFFFF',
  surface: '#F2F4F7',
  text: '#11181C',
  textMuted: '#5B6670',
  border: '#D0D5DD',
  primary: '#1D6FD8',
  onPrimary: '#FFFFFF',
  success: '#1E8E3E',
  warning: '#B26A00',
  error: '#C5221F',
};

export const darkColors: ColorTokens = {
  background: '#0F1214',
  surface: '#1C2024',
  text: '#ECEDEE',
  textMuted: '#9BA1A6',
  border: '#33393F',
  primary: '#5AA2FF',
  onPrimary: '#0F1214',
  success: '#5BC877',
  warning: '#F2B43C',
  error: '#FF6B66',
};
