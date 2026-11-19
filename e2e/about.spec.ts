import { expect, test } from '@playwright/test';

import { VARIANTS, screenshotPath, useFontScale } from './helpers';

// About screen: version and the data attribution required by CC BY-SA 4.0.
for (const variant of VARIANTS) {
  test(`about screen (${variant.name})`, async ({ page }) => {
    test.info().annotations.push({ type: 'variant', description: variant.name });
    await page.emulateMedia({ colorScheme: variant.colorScheme });
    await useFontScale(page, variant.fontScale);
    await page.goto('/');
    await page.getByTestId('about-link').click();
    await expect(page.getByTestId('about-data')).toContainText('Wiktionary');
    await expect(page.getByTestId('about-data')).toContainText('CC BY-SA 4.0');
    await expect(page.getByTestId('open-license')).toBeVisible();
    await page.screenshot({ path: screenshotPath(`about-${variant.name}`) });
  });
}
