// Turns the committed snapshot + curated files into the app's verb data.
// Pure: takes parsed inputs, returns data + problems. File I/O lives in cli-build.ts.
import type { Person, TenseForms, TenseId, Verb, VerbData } from '../../src/data/types.ts';
import {
  COMPOUND_TENSES,
  PERSONS,
  dropForms,
  SIMPLE_TENSES,
  endingTag,
  extractParticiple,
  extractSimpleTense,
  makeCompound,
  makeReflexive,
  pickEntry,
  type CompoundTenseId,
  type KaikkiEntry,
  type SimpleTenseId,
  type SupportedTenseId,
  type VerbListItem,
} from './lib.ts';

export type SpotCheck = { verb: string; tense: SupportedTenseId; person: Person; form: string };

export type BuildInputs = {
  entries: KaikkiEntry[];
  list: VerbListItem[];
  translations: Record<string, string>;
  spotChecks: SpotCheck[];
  /** Tenses written to the app's data file. */
  enabledTenses: readonly SupportedTenseId[];
  source: string;
};

export type BuildResult = {
  data: VerbData;
  /** Any error means the build must fail. */
  errors: string[];
  warnings: string[];
  /** Every supported tense for every verb (spot checks run against this). */
  allForms: Map<string, Partial<Record<SupportedTenseId, TenseForms>>>;
};

function sameForms(a: TenseForms, b: TenseForms): boolean {
  return PERSONS.every((p) => JSON.stringify(a[p] ?? null) === JSON.stringify(b[p] ?? null));
}

function allFormStrings(forms: TenseForms): string[] {
  return PERSONS.flatMap((p) => {
    const f = forms[p];
    return f === undefined ? [] : Array.isArray(f) ? f : [f];
  });
}

export function buildVerbData(inputs: BuildInputs): BuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const allForms: BuildResult['allForms'] = new Map();

  const byWord = new Map<string, KaikkiEntry[]>();
  for (const entry of inputs.entries) {
    const list = byWord.get(entry.word) ?? [];
    list.push(entry);
    byWord.set(entry.word, list);
  }
  const pick = (word: string): KaikkiEntry | undefined => {
    const picked = pickEntry(byWord.get(word) ?? []);
    if (picked?.tie) warnings.push(`${word}: several equally complete entries; used the first`);
    return picked?.entry;
  };

  const haber = pick('haber');
  const haberForms = new Map<SimpleTenseId, TenseForms>();
  if (!haber) errors.push('haber: not in snapshot (needed for compound tenses)');
  else for (const t of SIMPLE_TENSES) haberForms.set(t, extractSimpleTense(haber, t));

  const verbs: Verb[] = [];
  const seen = new Set<string>();

  inputs.list.forEach((item, index) => {
    const { infinitive, base } = item;
    if (seen.has(infinitive)) {
      errors.push(`${infinitive}: listed twice`);
      return;
    }
    seen.add(infinitive);

    const source = pick(base ?? infinitive);
    if (!source) {
      errors.push(`${base ?? infinitive}: not in snapshot (run npm run fetch:verbs)`);
      return;
    }
    const participle = extractParticiple(source);
    if (!participle) errors.push(`${infinitive}: no past participle`);

    const tenses: Partial<Record<SupportedTenseId, TenseForms>> = {};
    for (const t of SIMPLE_TENSES) {
      const plain = dropForms(extractSimpleTense(source, t), item.dropForms ?? []);
      tenses[t] = base ? makeReflexive(plain) : plain;
    }
    if (participle) {
      for (const [t, haberTense] of Object.entries(COMPOUND_TENSES) as [
        CompoundTenseId,
        SimpleTenseId,
      ][]) {
        const compound = makeCompound(haberForms.get(haberTense) ?? {}, participle);
        tenses[t] = base ? makeReflexive(compound) : compound;
      }
    }
    allForms.set(infinitive, tenses);

    // A reflexive verb's own entry (if Wiktionary has one) should agree with the derived forms.
    if (base) {
      const own = pickEntry(byWord.get(infinitive) ?? [])?.entry;
      if (own) {
        for (const t of inputs.enabledTenses) {
          if (!(SIMPLE_TENSES as readonly string[]).includes(t)) continue;
          const ownForms = extractSimpleTense(own, t as SimpleTenseId);
          if (Object.keys(ownForms).length > 0 && !sameForms(ownForms, tenses[t] ?? {})) {
            warnings.push(
              `${infinitive} ${t}: own entry differs from derived (${JSON.stringify(ownForms)} vs ${JSON.stringify(tenses[t])})`,
            );
          }
        }
      }
    }

    const translation = inputs.translations[infinitive]?.trim();
    if (!translation) errors.push(`${infinitive}: no translation in translations.en.json`);

    const forms: Partial<Record<TenseId, TenseForms>> = {};
    for (const t of inputs.enabledTenses) {
      const tf = tenses[t] ?? {};
      const missing = PERSONS.filter((p) => tf[p] === undefined);
      if (missing.length) errors.push(`${infinitive} ${t}: missing ${missing.join(', ')}`);
      if (allFormStrings(tf).some((f) => f.trim() === '')) {
        errors.push(`${infinitive} ${t}: empty form`);
      }
      forms[t] = tf;
    }

    const ending = endingTag(infinitive);
    verbs.push({
      infinitive,
      translations: { en: translation ?? '' },
      frequencyRank: index + 1,
      reflexive: !!base,
      participle: participle ?? '',
      ...(ending ? { tags: [ending] } : {}),
      forms,
    });
  });

  for (const word of Object.keys(inputs.translations)) {
    if (!seen.has(word)) warnings.push(`translations.en.json: "${word}" is not in the verb list`);
  }

  for (const check of inputs.spotChecks) {
    const form = allForms.get(check.verb)?.[check.tense]?.[check.person];
    const found = form === undefined ? [] : Array.isArray(form) ? form : [form];
    if (!found.includes(check.form)) {
      errors.push(
        `spot check: ${check.verb} ${check.tense} ${check.person} should be "${check.form}", got ${JSON.stringify(form)}`,
      );
    }
  }

  return { data: { version: 1, source: inputs.source, verbs }, errors, warnings, allForms };
}
