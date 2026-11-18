import { darkColors, getTheme, lightColors } from '@/theme';

describe('theme', () => {
  it('returns the matching color tokens for each scheme', () => {
    expect(getTheme('light').colors).toBe(lightColors);
    expect(getTheme('dark').colors).toBe(darkColors);
  });

  it('defines the same tokens for light and dark', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
  });
});
