// Shared interface for all exercise types (docs/PLAN.md §6).
// Adding an exercise type = new folder under src/exercises/ + a component.
import type { Person, TenseId, Verb } from '@/data/types';

export type CheckResult = 'correct' | 'correct_missing_accent' | 'wrong';

export type CheckOutcome = {
  result: CheckResult;
  /** The form to show the user: the matched alternative, or all alternatives when wrong. */
  correctForm: string;
};

/** One practised item: verb + tense + person. These ids are what progress records use. */
export type ItemKey = { infinitive: string; tense: TenseId; person: Person };

export type ExerciseContext = {
  verbs: readonly Verb[];
  /** Tenses selected for this session. */
  tenses: readonly TenseId[];
  /** Persons the user wants to practise (e.g. without vosotros). */
  persons: readonly Person[];
  /** The previous question, to avoid asking the same thing twice in a row. */
  previous?: ItemKey;
  /** Returns a number in [0, 1). Injected so tests are deterministic. */
  random: () => number;
};

export interface Exercise<Q, A> {
  type: string;
  /** Returns undefined when nothing can be asked (e.g. no data for the selected tenses). */
  generate(ctx: ExerciseContext): Q | undefined;
  check(question: Q, answer: A): CheckOutcome;
}
