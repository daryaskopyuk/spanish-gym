// The ONLY module that reads verbs.json (enforced by lint). Everything else calls these functions.
import type { Form, Person, TenseForms, TenseId, Verb, VerbData } from './types';
import rawData from './verbs.json';

const data = rawData as VerbData;

export function getAllVerbs(): readonly Verb[] {
  return data.verbs;
}

export function getVerb(infinitive: string): Verb | undefined {
  return data.verbs.find((v) => v.infinitive === infinitive);
}

/** All forms of one verb in one tense (persons may be missing, e.g. imperative `yo`). */
export function getTenseForms(infinitive: string, tense: TenseId): TenseForms | undefined {
  return getVerb(infinitive)?.forms[tense];
}

export function getForm(infinitive: string, tense: TenseId, person: Person): Form | undefined {
  return getTenseForms(infinitive, tense)?.[person];
}

/** Tenses that at least one verb has forms for. */
export function getAvailableTenses(): TenseId[] {
  const tenses = new Set<TenseId>();
  for (const verb of data.verbs) {
    for (const tense of Object.keys(verb.forms) as TenseId[]) tenses.add(tense);
  }
  return [...tenses];
}

/** Translation in the given language, falling back to English. */
export function getTranslation(verb: Verb, language: string): string {
  return verb.translations[language] ?? verb.translations.en;
}

export function getDataSource(): string {
  return data.source;
}
