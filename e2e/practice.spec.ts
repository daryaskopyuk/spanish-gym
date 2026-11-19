import { expect, test } from '@playwright/test';

import { stripAccents } from '../src/exercises/conjugationInput/checker';
import { VARIANTS, expectedAnswer, screenshotPath, typeAndCheck, useFontScale } from './helpers';

// The practice loop (PLAN §6a): wrong → correct form → Show all forms → Next, correct
// (Show all forms available there too),
// missing accent. Screenshots in light, dark and large font.
for (const variant of VARIANTS) {
  test.describe(variant.name, () => {
    test.use({ colorScheme: variant.colorScheme });

    test('practice loop', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await useFontScale(page, variant.fontScale);

      await page.goto('/');
      await page.getByTestId('start-button').click();
      await expect(page.getByTestId('prompt-verb')).toBeVisible();
      await expect(page.getByTestId('answer-input')).toBeFocused();
      await page.screenshot({ path: screenshotPath(`practice-prompt-${variant.name}`) });

      // Wrong → correct form → Show all forms.
      let expected = await expectedAnswer(page);
      await typeAndCheck(page, 'zzz');
      await expect(page.getByTestId('feedback-wrong')).toBeVisible();
      await expect(page.getByTestId('correct-form')).toHaveText(expected.join(' / '));
      await page.getByTestId('show-all-forms').click();
      await expect(page.getByTestId('conjugation-table')).toBeVisible();
      await page.getByTestId('next-button').scrollIntoViewIfNeeded();
      await page.screenshot({ path: screenshotPath(`practice-wrong-${variant.name}`) });

      // Next → a fresh question.
      await page.getByTestId('next-button').click();
      await expect(page.getByTestId('feedback')).toHaveCount(0);
      await expect(page.getByTestId('answer-input')).toHaveValue('');

      // Correct (typed with the keyboard's Enter key).
      expected = await expectedAnswer(page);
      await page.getByTestId('answer-input').fill(expected[0]!);
      await page.getByTestId('answer-input').press('Enter');
      await expect(page.getByTestId('feedback-correct')).toBeVisible();
      await expect(page.getByTestId('translation')).toBeVisible();
      await page.screenshot({ path: screenshotPath(`practice-correct-${variant.name}`) });

      // "Show all forms" is available after a correct answer too.
      await page.getByTestId('show-all-forms').click();
      await expect(page.getByTestId('conjugation-table')).toBeVisible();

      // Missing accent: skip ahead to a question whose answer has an accent.
      let accented: string | undefined;
      for (let i = 0; i < 50 && !accented; i++) {
        await page.getByTestId('next-button').click();
        expected = await expectedAnswer(page);
        accented = expected.find((f) => stripAccents(f) !== f);
        if (!accented) await typeAndCheck(page, expected[0]!);
      }
      expect(accented, 'no accented form came up in 50 questions').toBeDefined();
      await typeAndCheck(page, stripAccents(accented!));
      await expect(page.getByTestId('feedback-correct_missing_accent')).toBeVisible();
      await expect(page.getByTestId('correct-form')).toHaveText(accented!);
      await page.screenshot({ path: screenshotPath(`practice-accent-${variant.name}`) });

      expect(errors).toEqual([]);
    });
  });
}

test('accent row inserts at the cursor', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('start-button').click();
  const input = page.getByTestId('answer-input');
  await input.fill('hablis');
  await input.press('ArrowLeft');
  await input.press('ArrowLeft');
  await page.getByTestId('accent-key-á').click();
  await expect(input).toHaveValue('habláis');
  // Typing continues at the cursor after the inserted letter.
  await input.pressSequentially('X');
  await expect(input).toHaveValue('hablá' + 'Xis');
});
