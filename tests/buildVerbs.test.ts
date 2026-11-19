import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { buildVerbData, type BuildInputs } from '../scripts/build-verbs/build';
import {
  dropForms,
  endingTag,
  extractParticiple,
  extractSimpleTense,
  makeCompound,
  makeReflexive,
  neededWords,
  pickEntry,
  slimEntry,
  type KaikkiEntry,
  type KaikkiForm,
} from '../scripts/build-verbs/lib';

// --- Fixtures shaped like kaikki.org entries -------------------------------------------

const P = {
  yo: ['first-person', 'singular'],
  tu: ['second-person', 'singular'],
  el: ['third-person', 'singular'],
  nosotros: ['first-person', 'plural'],
  vosotros: ['second-person', 'plural'],
  ellos: ['third-person', 'plural'],
} as const;
type Six = [string, string, string, string, string, string];

function table(tenseTags: string[], forms: Six, extraTags: string[] = []): KaikkiForm[] {
  return Object.values(P).map((personTags, i) => ({
    form: forms[i]!,
    tags: [...tenseTags, ...personTags, ...extraTags],
  }));
}

const hablar: KaikkiEntry = {
  word: 'hablar',
  forms: [
    { form: 'hablado', tags: ['masculine', 'participle', 'past', 'singular'] },
    { form: 'hablada', tags: ['feminine', 'participle', 'past', 'singular'] },
    ...table(
      ['indicative', 'present'],
      ['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan'],
    ),
    { form: 'hablás', tags: ['indicative', 'present', 'second-person', 'singular', 'vos-form'] },
    ...table(
      ['indicative', 'present'],
      ['me hablo', 'te hablas', 'se habla', 'nos hablamos', 'os habláis', 'se hablan'],
    ),
    { form: 'hablándole', tags: ['combined-form', 'gerund', 'object-third-person'] },
    ...table(
      ['indicative', 'preterite'],
      ['hablé', 'hablaste', 'habló', 'hablamos', 'hablasteis', 'hablaron'],
    ),
    ...table(
      ['subjunctive', 'imperfect'],
      ['hablara', 'hablaras', 'hablara', 'habláramos', 'hablarais', 'hablaran'],
    ),
    ...table(
      ['subjunctive', 'imperfect', 'imperfect-se'],
      ['hablase', 'hablases', 'hablase', 'hablásemos', 'hablaseis', 'hablasen'],
    ),
  ],
};

const haber: KaikkiEntry = {
  word: 'haber',
  forms: [
    { form: 'habido', tags: ['participle', 'past'] },
    ...table(['indicative', 'present'], ['he', 'has', 'ha', 'hemos', 'habéis', 'han']),
    { form: 'hay', tags: ['indicative', 'present', 'third-person', 'singular'] },
  ],
};

const levantar: KaikkiEntry = {
  word: 'levantar',
  forms: [
    { form: 'levantado', tags: ['masculine', 'participle', 'past', 'singular'] },
    ...table(
      ['indicative', 'present'],
      ['levanto', 'levantas', 'levanta', 'levantamos', 'levantáis', 'levantan'],
    ),
  ],
};

// --- lib -------------------------------------------------------------------------------

describe('extractSimpleTense', () => {
  it('maps tags to persons and ignores vos, reflexive and combined forms', () => {
    expect(extractSimpleTense(hablar, 'present_indicative')).toEqual({
      yo: 'hablo',
      tu: 'hablas',
      el: 'habla',
      nosotros: 'hablamos',
      vosotros: 'habláis',
      ellos: 'hablan',
    });
  });

  it('keeps reflexive forms in a reflexive verb’s own entry', () => {
    const llamarse: KaikkiEntry = {
      word: 'llamarse',
      forms: table(
        ['indicative', 'present'],
        ['me llamo', 'te llamas', 'se llama', 'nos llamamos', 'os llamáis', 'se llaman'],
      ),
    };
    expect(extractSimpleTense(llamarse, 'present_indicative').yo).toBe('me llamo');
  });

  it('merges -ra and -se into one imperfect subjunctive cell, -ra first', () => {
    expect(extractSimpleTense(hablar, 'imperfect_subjunctive').yo).toEqual(['hablara', 'hablase']);
  });

  it('keeps real alternatives as an array', () => {
    const adecuar: KaikkiEntry = {
      word: 'adecuar',
      forms: [
        { form: 'adecuo', tags: ['indicative', 'present', ...P.yo] },
        { form: 'adecúo', tags: ['indicative', 'present', ...P.yo] },
      ],
    };
    expect(extractSimpleTense(adecuar, 'present_indicative').yo).toEqual(['adecuo', 'adecúo']);
  });

  it('drops archaic forms', () => {
    const entry: KaikkiEntry = {
      word: 'placer',
      forms: [
        { form: 'plació', tags: ['indicative', 'preterite', ...P.el] },
        { form: 'plugo', tags: ['indicative', 'preterite', ...P.el, 'archaic'] },
      ],
    };
    expect(extractSimpleTense(entry, 'preterite_indicative').el).toBe('plació');
  });

  it('uses "ha", not the impersonal "hay", for haber', () => {
    expect(extractSimpleTense(haber, 'present_indicative').el).toBe('ha');
  });

  it('returns an empty table for a tense with no data', () => {
    expect(extractSimpleTense(hablar, 'future_indicative')).toEqual({});
  });
});

describe('extractParticiple', () => {
  it('prefers the masculine singular participle', () => {
    expect(extractParticiple(hablar)).toBe('hablado');
  });
  it('falls back to a bare participle', () => {
    expect(extractParticiple(haber)).toBe('habido');
  });
  it('returns undefined when there is none', () => {
    expect(extractParticiple({ word: 'x', forms: [] })).toBeUndefined();
  });
});

describe('derivations', () => {
  it('makeReflexive adds the right pronoun to every person and alternative', () => {
    expect(makeReflexive({ yo: 'levanto', el: ['a', 'b'], vosotros: 'levantáis' })).toEqual({
      yo: 'me levanto',
      el: ['se a', 'se b'],
      vosotros: 'os levantáis',
    });
  });

  it('makeCompound builds haber + participle', () => {
    const haberPresent = extractSimpleTense(haber, 'present_indicative');
    expect(makeCompound(haberPresent, 'hablado')).toMatchObject({
      yo: 'he hablado',
      el: 'ha hablado',
      vosotros: 'habéis hablado',
    });
  });

  it('dropForms removes forms and empty persons', () => {
    expect(dropForms({ yo: ['acuesto', 'acosto'], tu: 'acostas' }, ['acosto', 'acostas'])).toEqual({
      yo: 'acuesto',
    });
  });

  it('endingTag ignores the reflexive -se and accents', () => {
    expect(endingTag('hablar')).toBe('ar');
    expect(endingTag('levantarse')).toBe('ar');
    expect(endingTag('oír')).toBe('ir');
    expect(endingTag('reírse')).toBe('ir');
  });
});

describe('pickEntry', () => {
  it('picks the most complete entry', () => {
    const partial: KaikkiEntry = { word: 'hablar', forms: hablar.forms!.slice(0, 4) };
    expect(pickEntry([partial, hablar])?.entry).toBe(hablar);
  });

  it('reports a tie only when equally complete entries conjugate differently', () => {
    const same = { ...hablar, etymology_number: 2 };
    expect(pickEntry([hablar, same])?.tie).toBe(false);
    const other: KaikkiEntry = {
      word: 'hablar',
      forms: hablar.forms!.map((f) => (f.form === 'hablo' ? { ...f, form: 'hablao' } : f)),
    };
    expect(pickEntry([hablar, other])?.tie).toBe(true);
  });

  it('returns undefined for no entries', () => {
    expect(pickEntry([])).toBeUndefined();
  });
});

describe('snapshot helpers', () => {
  it('neededWords includes bases and haber', () => {
    expect([...neededWords([{ infinitive: 'levantarse', base: 'levantar' }])].sort()).toEqual([
      'haber',
      'levantar',
      'levantarse',
    ]);
  });

  it('slimEntry keeps only conjugation forms and drops combined/vos forms', () => {
    const slim = slimEntry({
      ...hablar,
      forms: [...hablar.forms!, { form: 'hablador', tags: ['noun-from-verb'] }],
    });
    const forms = slim.forms!.map((f) => f.form);
    expect(forms).toContain('hablo');
    expect(forms).not.toContain('hablás');
    expect(forms).not.toContain('hablándole');
    expect(forms).not.toContain('hablador');
  });
});

// --- build -----------------------------------------------------------------------------

function inputs(overrides: Partial<BuildInputs> = {}): BuildInputs {
  return {
    entries: [hablar, haber, levantar],
    list: [{ infinitive: 'hablar' }, { infinitive: 'levantarse', base: 'levantar' }],
    translations: { hablar: 'to speak', levantarse: 'to get up' },
    spotChecks: [],
    enabledTenses: ['present_indicative'],
    source: 'test',
    ...overrides,
  };
}

describe('buildVerbData', () => {
  it('builds verbs in list order with ranks, tags, participles and enabled tenses only', () => {
    const { data, errors } = buildVerbData(inputs());
    expect(errors).toEqual([]);
    expect(data.verbs.map((v) => [v.infinitive, v.frequencyRank, v.reflexive])).toEqual([
      ['hablar', 1, false],
      ['levantarse', 2, true],
    ]);
    const [h, l] = data.verbs;
    expect(Object.keys(h!.forms)).toEqual(['present_indicative']);
    expect(h!.tags).toEqual(['ar']);
    expect(l!.participle).toBe('levantado');
    expect(l!.forms.present_indicative?.nosotros).toBe('nos levantamos');
  });

  it('derives compound tenses for spot checks, including reflexive ones', () => {
    const { allForms } = buildVerbData(inputs());
    expect(allForms.get('hablar')?.present_perfect?.yo).toBe('he hablado');
    expect(allForms.get('levantarse')?.present_perfect?.nosotros).toBe('nos hemos levantado');
  });

  it('fails on a spot-check mismatch', () => {
    const { errors } = buildVerbData(
      inputs({
        spotChecks: [{ verb: 'hablar', tense: 'present_indicative', person: 'yo', form: 'hablao' }],
      }),
    );
    expect(errors.join()).toMatch(/spot check: hablar present_indicative yo/);
  });

  it('fails when a listed verb is not in the snapshot', () => {
    const { errors } = buildVerbData(inputs({ list: [{ infinitive: 'comer' }] }));
    expect(errors.join()).toMatch(/comer: not in snapshot/);
  });

  it('fails when a translation is missing', () => {
    const { errors } = buildVerbData(inputs({ translations: { hablar: 'to speak' } }));
    expect(errors.join()).toMatch(/levantarse: no translation/);
  });

  it('fails when an enabled tense is missing persons', () => {
    const { errors } = buildVerbData(inputs({ enabledTenses: ['preterite_indicative'] }));
    expect(errors.join()).toMatch(/levantarse preterite_indicative: missing yo/);
  });

  it('fails when a verb is listed twice', () => {
    const { errors } = buildVerbData(
      inputs({ list: [{ infinitive: 'hablar' }, { infinitive: 'hablar' }] }),
    );
    expect(errors.join()).toMatch(/hablar: listed twice/);
  });

  it('warns about translations for verbs that are not in the list', () => {
    const { warnings } = buildVerbData(
      inputs({ translations: { hablar: 'a', levantarse: 'b', comer: 'c' } }),
    );
    expect(warnings.join()).toMatch(/"comer" is not in the verb list/);
  });

  it('warns when a reflexive verb’s own entry disagrees with the derived forms', () => {
    const ownWrong: KaikkiEntry = {
      word: 'levantarse',
      forms: table(['indicative', 'present'], ['me levanta', 'x', 'x', 'x', 'x', 'x']),
    };
    const { warnings } = buildVerbData(inputs({ entries: [hablar, haber, levantar, ownWrong] }));
    expect(warnings.join()).toMatch(/levantarse present_indicative: own entry differs/);
  });

  it('applies dropForms before adding the reflexive pronoun', () => {
    const acostar: KaikkiEntry = {
      word: 'acostar',
      forms: [
        { form: 'acostado', tags: ['participle', 'past'] },
        ...table(
          ['indicative', 'present'],
          ['acuesto', 'acuestas', 'acuesta', 'acostamos', 'acostáis', 'acuestan'],
        ),
        { form: 'acosto', tags: ['indicative', 'present', ...P.yo] },
      ],
    };
    const { data, errors } = buildVerbData(
      inputs({
        entries: [haber, acostar],
        list: [{ infinitive: 'acostarse', base: 'acostar', dropForms: ['acosto'] }],
        translations: { acostarse: 'to go to bed' },
      }),
    );
    expect(errors).toEqual([]);
    expect(data.verbs[0]!.forms.present_indicative?.yo).toBe('me acuesto');
  });
});

// --- the committed data ----------------------------------------------------------------

describe('committed snapshot and curated files', () => {
  const dir = join(__dirname, '..', 'scripts', 'build-verbs');
  const read = (f: string) => readFileSync(join(dir, f), 'utf8');

  it('build without errors and pass every spot check', () => {
    const result = buildVerbData({
      entries: read('snapshot/kaikki-verbs.jsonl')
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => JSON.parse(l) as KaikkiEntry),
      list: JSON.parse(read('verb-list.json')),
      translations: JSON.parse(read('translations.en.json')),
      spotChecks: JSON.parse(read('spot-check.json')),
      enabledTenses: ['present_indicative', 'preterite_indicative', 'future_indicative'],
      source: 'test',
    });
    expect(result.errors).toEqual([]);
    expect(result.data.verbs.length).toBeGreaterThanOrEqual(290);
  });
});
