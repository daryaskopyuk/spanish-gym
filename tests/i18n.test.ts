import en from '@/i18n/locales/en.json';
import i18n, { pickLanguage } from '@/i18n';

describe('i18n', () => {
  it('falls back to English for unsupported or missing device languages', () => {
    expect(pickLanguage(['uk', 'de'])).toBe('en');
    expect(pickLanguage([null])).toBe('en');
    expect(pickLanguage([])).toBe('en');
  });

  it('picks the first supported device language', () => {
    expect(pickLanguage([null, 'en'])).toBe('en');
  });

  it('is initialised synchronously with the English strings', () => {
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.t('app.title')).toBe(en.app.title);
  });
});
