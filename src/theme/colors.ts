// The only place colors are defined. Screens and components use these tokens
// through useTheme() (lint forbids color literals elsewhere).
// Palette: "Olive grove". Light: beige page, white cards. Dark: warm charcoal page, lighter cards.
// Text/background pairs meet WCAG AA (4.5:1).

export type ColorTokens = {
  /** Page background. */
  background: string;
  /** Cards, inputs, keys and other elements that sit on the page. */
  surface: string;
  /** Tinted fill: pressed elements, the highlighted row in the conjugation table. */
  highlight: string;
  text: string;
  textMuted: string;
  /** Outlines; slightly darker than the page background. */
  border: string;
  primary: string;
  /** Pressed state of the primary button (flat style). */
  primaryPressed: string;
  onPrimary: string;
  success: string;
  warning: string;
  error: string;
  /** Shadow colour for the raised surface style. */
  shadow: string;
};

export const lightColors: ColorTokens = {
  background: '#F2ECE0',
  surface: '#FFFFFF',
  highlight: '#EDF2E3',
  text: '#1F2A1C',
  textMuted: '#59614F',
  border: '#DDD3BF',
  primary: '#4A7326',
  primaryPressed: '#3D611F',
  onPrimary: '#FFFFFF',
  success: '#22703A',
  warning: '#8C4D06',
  error: '#BF3B28',
  shadow: 'rgba(70, 55, 25, 0.14)',
};

export const darkColors: ColorTokens = {
  background: '#161A12',
  surface: '#22281C',
  highlight: '#2C3424',
  text: '#EEF0E6',
  textMuted: '#A3AA97',
  border: '#3A4230',
  primary: '#A3C962',
  primaryPressed: '#8DB34D',
  onPrimary: '#161A12',
  success: '#7BD389',
  warning: '#F0A848',
  error: '#FF7B66',
  shadow: 'rgba(0, 0, 0, 0.5)',
};
