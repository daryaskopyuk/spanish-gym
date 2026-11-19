// Shared interface for all exercise types (docs/PLAN.md §6).
// Adding an exercise type = new folder under src/exercises/ + a component.

export type CheckResult = 'correct' | 'correct_missing_accent' | 'wrong';

/** Filled in as the repository, settings and progress stores are built (M1–M4). */
export type ExerciseContext = Record<string, never>;

export interface Exercise<Q, A> {
  type: string;
  generate(ctx: ExerciseContext): Q;
  check(question: Q, answer: A): CheckResult;
}
