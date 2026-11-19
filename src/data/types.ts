// Types for the conjugation data (docs/PLAN.md §4.2).
// Tense and person ids are stable: never rename one (saved progress refers to them).

export const PERSONS = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'] as const;
export type Person = (typeof PERSONS)[number];

export type TenseId =
  | 'present_indicative'
  | 'preterite_indicative'
  | 'imperfect_indicative'
  | 'future_indicative'
  | 'present_perfect'
  | 'conditional'
  | 'present_subjunctive'
  | 'imperfect_subjunctive'
  | 'imperative_affirmative'
  | 'imperative_negative';

/** A form; an array when there are real alternatives (e.g. -ra / -se). The first is preferred. */
export type Form = string | string[];

/** Persons are optional: e.g. the imperative has no `yo`. */
export type TenseForms = Partial<Record<Person, Form>>;

export type Verb = {
  infinitive: string;
  /** Keyed by language code; falls back to `en`. */
  translations: { en: string } & Partial<Record<string, string>>;
  frequencyRank?: number;
  regular?: boolean;
  reflexive: boolean;
  /** Past participle, e.g. "hablado" (used to build compound tenses). */
  participle: string;
  tags?: string[];
  forms: Partial<Record<TenseId, TenseForms>>;
};

export type VerbData = {
  version: number;
  source: string;
  verbs: Verb[];
};
