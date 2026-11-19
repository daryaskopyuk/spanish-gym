import { expect, type Page } from '@playwright/test';

import { PERSONS, type Person } from '../src/data/types';
import { getForm } from '../src/data/verbRepository';
import en from '../src/i18n/locales/en.json';

export type Variant = { name: string; colorScheme: 'light' | 'dark'; fontScale: number };

/** Screenshot variants required after UI changes: light, dark, large system font. */
export const VARIANTS: Variant[] = [
  { name: 'light', colorScheme: 'light', fontScale: 1 },
  { name: 'dark', colorScheme: 'dark', fontScale: 1 },
  { name: 'large-font', colorScheme: 'light', fontScale: 1.6 },
];

/** Simulates a large system font (see webTestFontScale in src/theme). */
export async function useFontScale(page: Page, scale: number) {
  if (scale !== 1) {
    await page.addInitScript((s) => {
      (window as unknown as { __E2E_FONT_SCALE__: number }).__E2E_FONT_SCALE__ = s;
    }, scale);
  }
}

export function screenshotPath(name: string) {
  return `e2e/screenshots/${name}.png`;
}

/** Reads the prompt on screen and returns the expected answer(s) from the data. */
export async function expectedAnswer(page: Page): Promise<string[]> {
  const verb = (await page.getByTestId('prompt-verb').textContent())?.trim() ?? '';
  const label = (await page.getByTestId('prompt-pronoun').textContent())?.trim() ?? '';
  const person = PERSONS.find((p) => en.persons[p] === label) as Person | undefined;
  expect(person, `unknown pronoun label "${label}"`).toBeDefined();
  const form = getForm(verb, 'present_indicative', person!);
  expect(form, `no form for ${verb} / ${person}`).toBeDefined();
  return Array.isArray(form) ? form : [form!];
}

export async function typeAndCheck(page: Page, text: string) {
  await page.getByTestId('answer-input').fill(text);
  await page.getByTestId('check-button').click();
}
