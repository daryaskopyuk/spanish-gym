import { expect, test } from '@playwright/test';

import { darkColors, lightColors } from '../src/theme/colors';

// Opens the home screen in light and dark mode and saves screenshots to e2e/screenshots/.
// An agent must look at these after any UI change.

/** '#RRGGBB' → 'rgb(r, g, b)', the format getComputedStyle returns. */
function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

const schemes = { light: lightColors, dark: darkColors } as const;

for (const [colorScheme, colors] of Object.entries(schemes)) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme: colorScheme as 'light' | 'dark' });

    test('home screen renders with the right theme', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/');
      const screen = page.getByTestId('home-screen');
      const title = page.getByTestId('home-title');
      const start = page.getByTestId('start-button');

      await expect(title).toHaveText('Spanish Gym');
      await expect(start).toBeVisible();
      // Guards against the theme not being applied (e.g. styles lost while the page starts up).
      await expect(screen).toHaveCSS('background-color', rgb(colors.background));
      await expect(title).toHaveCSS('color', rgb(colors.text));
      await expect(start).toHaveCSS('background-color', rgb(colors.primary));

      await page.screenshot({ path: `e2e/screenshots/home-${colorScheme}.png` });
      expect(errors).toEqual([]);
    });
  });
}
