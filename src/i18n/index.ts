import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

export const resources = {
  en: { translation: en },
} as const;

export const supportedLanguages = Object.keys(resources);

/** Device language if we have a translation for it, otherwise English. */
export function pickLanguage(deviceLanguages: (string | null)[]): string {
  return deviceLanguages.find((l): l is string => !!l && supportedLanguages.includes(l)) ?? 'en';
}

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: pickLanguage(getLocales().map((l) => l.languageCode)),
  fallbackLng: 'en',
  initAsync: false, // resources are bundled, so initialise synchronously (no flash of keys)
  interpolation: { escapeValue: false }, // React already escapes
});

export default i18n;
