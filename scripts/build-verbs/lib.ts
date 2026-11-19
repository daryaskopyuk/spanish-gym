// Pure logic for turning Wiktionary (kaikki.org / Wiktextract) verb entries into our
// data format. No file or network access here, so everything is unit-testable.
// See docs/data-source.md for the findings behind each rule.
import type { Form, Person, TenseForms, TenseId } from '../../src/data/types.ts';

export type KaikkiForm = { form: string; tags?: string[]; source?: string };
export type KaikkiSense = { glosses?: string[]; tags?: string[] };
export type KaikkiEntry = {
  word: string;
  pos?: string;
  etymology_number?: number;
  forms?: KaikkiForm[];
  senses?: KaikkiSense[];
};

export type VerbListItem = {
  infinitive: string;
  /** For reflexive verbs: the base verb whose forms get the pronoun (levantarse → levantar). */
  base?: string;
  /**
   * Forms to drop (without pronoun), for entries that merge two different verbs. E.g. acostar
   * lists "acuesto" (to put to bed) and "acosto" (nautical: to come alongside).
   */
  dropForms?: string[];
};

export const PERSONS: readonly Person[] = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'];

const PERSON_TAGS: Record<Person, [string, string]> = {
  yo: ['first-person', 'singular'],
  tu: ['second-person', 'singular'],
  el: ['third-person', 'singular'],
  nosotros: ['first-person', 'plural'],
  vosotros: ['second-person', 'plural'],
  ellos: ['third-person', 'plural'],
};

/** Simple tenses read from the data: required tags, forbidden tags. */
const SIMPLE_TENSE_TAGS = {
  present_indicative: [['indicative', 'present'], []],
  preterite_indicative: [['indicative', 'preterite'], []],
  imperfect_indicative: [['indicative', 'imperfect'], []],
  future_indicative: [['indicative', 'future'], []],
  conditional: [['conditional'], []],
  present_subjunctive: [['subjunctive', 'present'], []],
} as const satisfies Partial<Record<TenseId, readonly [readonly string[], readonly string[]]>>;

export type SimpleTenseId = keyof typeof SIMPLE_TENSE_TAGS | 'imperfect_subjunctive';
export type CompoundTenseId = 'present_perfect';
export type SupportedTenseId = SimpleTenseId | CompoundTenseId;

export const SIMPLE_TENSES: readonly SimpleTenseId[] = [
  ...(Object.keys(SIMPLE_TENSE_TAGS) as (keyof typeof SIMPLE_TENSE_TAGS)[]),
  'imperfect_subjunctive',
];
/** Compound tense → the tense of *haber* it uses. */
export const COMPOUND_TENSES: Record<CompoundTenseId, SimpleTenseId> = {
  present_perfect: 'present_indicative',
};
export const SUPPORTED_TENSES: readonly SupportedTenseId[] = [
  ...SIMPLE_TENSES,
  ...(Object.keys(COMPOUND_TENSES) as CompoundTenseId[]),
];

/** Forms we never want: vos forms, verb + attached pronoun combos, archaic/obsolete/rare variants. */
const EXCLUDED_FORM_TAGS = ['vos-form', 'combined-form', 'archaic', 'obsolete', 'rare', 'dated'];
const REFLEXIVE_PRONOUN_RE = /^(me|te|se|nos|os) /;

export const REFLEXIVE_PRONOUNS: Record<Person, string> = {
  yo: 'me',
  tu: 'te',
  el: 'se',
  nosotros: 'nos',
  vosotros: 'os',
  ellos: 'se',
};

function hasAll(tags: readonly string[], required: readonly string[]): boolean {
  return required.every((t) => tags.includes(t));
}

/** Collects forms matching the tags, per person, in data order, without duplicates. */
function collect(
  entry: KaikkiEntry,
  required: readonly string[],
  forbidden: readonly string[],
): Partial<Record<Person, string[]>> {
  const ownReflexive = entry.word.endsWith('se');
  const out: Partial<Record<Person, string[]>> = {};
  for (const f of entry.forms ?? []) {
    const tags = f.tags ?? [];
    if (!hasAll(tags, required)) continue;
    if (forbidden.some((t) => tags.includes(t))) continue;
    if (EXCLUDED_FORM_TAGS.some((t) => tags.includes(t))) continue;
    // Some non-reflexive tables also list reflexive forms ("me hablo"): not ours.
    if (!ownReflexive && REFLEXIVE_PRONOUN_RE.test(f.form)) continue;
    const form = f.form.trim();
    if (form === '' || form === '-') continue;
    for (const person of PERSONS) {
      if (hasAll(tags, PERSON_TAGS[person])) {
        const list = (out[person] ??= []);
        if (!list.includes(form)) list.push(form);
      }
    }
  }
  return out;
}

function toForm(list: string[]): Form {
  return list.length === 1 ? list[0]! : list;
}

function toTenseForms(lists: Partial<Record<Person, string[]>>): TenseForms {
  const forms: TenseForms = {};
  for (const person of PERSONS) {
    const list = lists[person];
    if (list && list.length > 0) forms[person] = toForm(list);
  }
  return forms;
}

/** Reads one simple tense from an entry. */
export function extractSimpleTense(entry: KaikkiEntry, tense: SimpleTenseId): TenseForms {
  if (tense === 'imperfect_subjunctive') {
    // -ra and -se are both correct: one cell, -ra first.
    const ra = collect(entry, ['subjunctive', 'imperfect'], ['imperfect-se']);
    const se = collect(entry, ['subjunctive', 'imperfect', 'imperfect-se'], []);
    const merged: Partial<Record<Person, string[]>> = {};
    for (const person of PERSONS) {
      const list = [...(ra[person] ?? []), ...(se[person] ?? [])];
      if (list.length > 0) merged[person] = [...new Set(list)];
    }
    return toTenseForms(merged);
  }
  const [required, forbidden] = SIMPLE_TENSE_TAGS[tense];
  const lists = collect(entry, required, forbidden);
  // haber: 3rd person singular present lists "ha" and "hay"; "hay" is the impersonal
  // "there is", not the conjugated form (and compound tenses need "ha").
  if (entry.word === 'haber' && tense === 'present_indicative' && lists.el) {
    lists.el = lists.el.filter((f) => f !== 'hay');
  }
  return toTenseForms(lists);
}

/** Masculine singular past participle, e.g. "hablado". */
export function extractParticiple(entry: KaikkiEntry): string | undefined {
  const forms = entry.forms ?? [];
  const full = forms.find((f) =>
    hasAll(f.tags ?? [], ['participle', 'past', 'masculine', 'singular']),
  );
  if (full) return full.form;
  const bare = forms.find((f) => {
    const tags = f.tags ?? [];
    return tags.length === 2 && hasAll(tags, ['participle', 'past']);
  });
  return bare?.form;
}

/** Number of (tense, person) cells an entry fills, used to pick between duplicate entries. */
export function completeness(entry: KaikkiEntry): number {
  return SIMPLE_TENSES.reduce(
    (n, tense) => n + Object.keys(extractSimpleTense(entry, tense)).length,
    0,
  );
}

/**
 * Some words have several entries (different etymologies). Picks the one with the most
 * complete conjugation table; `tie` is true when another equally complete entry conjugates
 * differently.
 */
export function pickEntry(
  entries: KaikkiEntry[],
): { entry: KaikkiEntry; tie: boolean } | undefined {
  if (entries.length === 0) return undefined;
  const scored = entries.map((entry) => ({ entry, score: completeness(entry) }));
  scored.sort((a, b) => b.score - a.score);
  const first = scored[0]!;
  // Entries for unrelated meanings (planear "to plan" / "to glide") usually conjugate the same;
  // only a tie with a *different* table is worth reporting.
  const table = (e: KaikkiEntry) =>
    JSON.stringify(SIMPLE_TENSES.map((t) => extractSimpleTense(e, t)));
  const tie = scored.some(
    (s) => s !== first && s.score === first.score && table(s.entry) !== table(first.entry),
  );
  return { entry: first.entry, tie };
}

/** Removes the given forms; a person left with no form is removed too. */
export function dropForms(forms: TenseForms, drop: readonly string[]): TenseForms {
  if (drop.length === 0) return forms;
  const out: TenseForms = {};
  for (const person of PERSONS) {
    const form = forms[person];
    if (form === undefined) continue;
    const kept = (Array.isArray(form) ? form : [form]).filter((f) => !drop.includes(f));
    if (kept.length > 0) out[person] = kept.length === 1 ? kept[0]! : kept;
  }
  return out;
}

/** Prefixes each form with a reflexive pronoun: "levanto" → "me levanto". */
export function makeReflexive(forms: TenseForms): TenseForms {
  const out: TenseForms = {};
  for (const person of PERSONS) {
    const form = forms[person];
    if (form === undefined) continue;
    const add = (f: string) => `${REFLEXIVE_PRONOUNS[person]} ${f}`;
    out[person] = Array.isArray(form) ? form.map(add) : add(form);
  }
  return out;
}

/** haber + participle: "he hablado". */
export function makeCompound(haberForms: TenseForms, participle: string): TenseForms {
  const out: TenseForms = {};
  for (const person of PERSONS) {
    const form = haberForms[person];
    if (form === undefined) continue;
    const add = (f: string) => `${f} ${participle}`;
    out[person] = Array.isArray(form) ? form.map(add) : add(form);
  }
  return out;
}

/** "-ar" / "-er" / "-ir" ending tag, ignoring a reflexive "-se" (oír, reír → "ir"). */
export function endingTag(infinitive: string): 'ar' | 'er' | 'ir' | undefined {
  const base = infinitive.endsWith('se') ? infinitive.slice(0, -2) : infinitive;
  const plain = base.normalize('NFD').replace(/́/g, '');
  const ending = plain.slice(-2);
  return ending === 'ar' || ending === 'er' || ending === 'ir' ? ending : undefined;
}

/** Words whose entries the snapshot must contain for a verb list. */
export function neededWords(list: readonly VerbListItem[]): Set<string> {
  const words = new Set<string>(['haber']);
  for (const item of list) {
    words.add(item.infinitive);
    if (item.base) words.add(item.base);
  }
  return words;
}

/** Tags of forms worth keeping in the snapshot (conjugation-related only). */
const KEEP_FORM_TAGS = [
  'indicative',
  'subjunctive',
  'conditional',
  'imperative',
  'participle',
  'gerund',
  'infinitive',
];

/** Shrinks a raw kaikki entry to what the build needs, keeping the snapshot small. */
export function slimEntry(entry: KaikkiEntry): KaikkiEntry {
  return {
    word: entry.word,
    ...(entry.etymology_number !== undefined ? { etymology_number: entry.etymology_number } : {}),
    senses: (entry.senses ?? []).slice(0, 3).map((s) => ({
      ...(s.glosses ? { glosses: s.glosses.slice(0, 1) } : {}),
      ...(s.tags?.length ? { tags: s.tags } : {}),
    })),
    forms: (entry.forms ?? [])
      .filter((f) => {
        const tags = f.tags ?? [];
        return (
          tags.some((t) => KEEP_FORM_TAGS.includes(t)) &&
          !tags.includes('combined-form') &&
          !tags.includes('vos-form')
        );
      })
      .map((f) => ({ form: f.form, tags: f.tags ?? [] })),
  };
}
