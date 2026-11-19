// The ONLY module that reads verbs.json (enforced by lint). Everything else calls these functions.
import type { TenseId, Verb, VerbData } from './types';
import rawData from './verbs.json';

const data = rawData as VerbData;

export function getAllVerbs(): readonly Verb[] {
  return data.verbs;
}

export function getVerb(infinitive: string): Verb | undefined {
  return data.verbs.find((v) => v.infinitive === infinitive);
}

/** Tenses that at least one verb has forms for. */
export function getAvailableTenses(): TenseId[] {
  const tenses = new Set<TenseId>();
  for (const verb of data.verbs) {
    for (const tense of Object.keys(verb.forms) as TenseId[]) tenses.add(tense);
  }
  return [...tenses];
}

export function getDataSource(): string {
  return data.source;
}
