// Compares a typed answer with the expected form (docs/PLAN.md §5).
import type { Form } from '@/data/types';
import type { CheckOutcome } from '@/exercises/types';

// Only these accents may be missing. ñ is deliberately NOT here: "ano" ≠ "año".
const ACCENT_MAP: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u' };

/** Trim, collapse inner whitespace, lowercase. NFC so "á" typed as a + ◌́ equals "á". */
export function normalize(text: string): string {
  return text.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Remove á é í ó ú ü accents; keeps ñ. Expects normalized (lowercase, NFC) input. */
export function stripAccents(text: string): string {
  return text.replace(/[áéíóúü]/g, (c) => ACCENT_MAP[c] ?? c);
}

/** All accepted alternatives of a form, preferred first. */
export function formAlternatives(form: Form): string[] {
  return Array.isArray(form) ? form : [form];
}

/** Human-readable form: alternatives joined with " / ". */
export function displayForm(form: Form): string {
  return formAlternatives(form).join(' / ');
}

export function checkAnswer(answer: string, expected: Form): CheckOutcome {
  const alternatives = formAlternatives(expected);
  const given = normalize(answer);

  const exact = alternatives.find((alt) => normalize(alt) === given);
  if (exact !== undefined) return { result: 'correct', correctForm: exact };

  const unaccented = stripAccents(given);
  const nearly = alternatives.find((alt) => stripAccents(normalize(alt)) === unaccented);
  if (nearly !== undefined) return { result: 'correct_missing_accent', correctForm: nearly };

  return { result: 'wrong', correctForm: displayForm(expected) };
}
