// Picks verb + tense + person for the next question (M1: random; M4 adds scheduling).
import type { Form, Verb } from '@/data/types';
import type { ExerciseContext, ItemKey } from '@/exercises/types';

export type ConjugationQuestion = ItemKey & {
  verb: Verb;
  expected: Form;
};

/** Every askable item: skips persons missing from the data and persons the user hid. */
export function listCandidates(ctx: ExerciseContext): ConjugationQuestion[] {
  const candidates: ConjugationQuestion[] = [];
  for (const verb of ctx.verbs) {
    for (const tense of ctx.tenses) {
      const forms = verb.forms[tense];
      if (!forms) continue;
      for (const person of ctx.persons) {
        const expected = forms[person];
        if (expected === undefined) continue;
        candidates.push({ infinitive: verb.infinitive, tense, person, verb, expected });
      }
    }
  }
  return candidates;
}

export function generateQuestion(ctx: ExerciseContext): ConjugationQuestion | undefined {
  const all = listCandidates(ctx);
  const prev = ctx.previous;

  // Never the same item twice in a row; avoid the same verb back-to-back when possible.
  const notSameItem = prev ? all.filter((c) => !isSameItem(c, prev)) : all;
  const otherVerb = prev ? notSameItem.filter((c) => c.infinitive !== prev.infinitive) : all;
  const pool = otherVerb.length > 0 ? otherVerb : notSameItem.length > 0 ? notSameItem : all;

  if (pool.length === 0) return undefined;
  const index = Math.min(Math.floor(ctx.random() * pool.length), pool.length - 1);
  return pool[index];
}

function isSameItem(a: ItemKey, b: ItemKey): boolean {
  return a.infinitive === b.infinitive && a.tense === b.tense && a.person === b.person;
}
