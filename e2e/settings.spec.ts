import { expect, test } from '@playwright/test';

import en from '../src/i18n/locales/en.json';
import { VARIANTS, screenshotPath, typeAndCheck, useFontScale } from './helpers';

for (const variant of VARIANTS) {
  test(`settings screen (${variant.name})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: variant.colorScheme });
    await useFontScale(page, variant.fontScale);
    await page.goto('/');
    await page.getByTestId('settings-link').click();
    await expect(page.getByTestId('settings-screen')).toBeVisible();
    await expect(page.getByTestId('setting-translation-after')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await page.screenshot({ path: screenshotPath(`settings-${variant.name}`) });
  });
}

test('settings are saved and practice follows them', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByTestId('settings-link').click();

  await page.getByTestId('setting-translation-before').click();
  await page.getByTestId('setting-round-length-10').click();
  await page.getByTestId('setting-vosotros').click();

  // Saved on the device: still there after a full reload.
  await page.reload();
  await page.goto('/');
  await page.getByTestId('settings-link').click();
  await expect(page.getByTestId('setting-translation-before')).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.getByTestId('setting-round-length-10')).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('switch')).not.toBeChecked();

  // Practice: translation shown with the question; vosotros never asked.
  await page.goto('/');
  await page.getByTestId('start-button').click();
  for (let i = 0; i < 15; i++) {
    await expect(page.getByTestId('translation')).toBeVisible();
    await expect(page.getByTestId('prompt-pronoun')).not.toHaveText(en.persons.vosotros);
    await typeAndCheck(page, 'zzz');
    await page.getByTestId('next-button').click();
  }
  expect(errors).toEqual([]);
});
