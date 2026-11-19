import type { Verb } from '@/data/types';
import { generateQuestion, listCandidates } from '@/exercises/conjugationInput/generator';
import type { ExerciseContext } from '@/exercises/types';

function verb(infinitive: string, forms: Verb['forms']): Verb {
  return { infinitive, translations: { en: infinitive }, reflexive: false, participle: '', forms };
}

const hablar = verb('hablar', {
  present_indicative: { yo: 'hablo', tu: 'hablas', vosotros: 'habláis' },
});
const comer = verb('comer', { present_indicative: { yo: 'como' } });
// Imperative has no `yo`.
const ir = verb('ir', { imperative_affirmative: { tu: 've', vosotros: 'id' } });

/** Deterministic pseudo-random sequence for repeat-avoidance tests. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2 ** 31;
    return s / 2 ** 31;
  };
}

function ctx(overrides: Partial<ExerciseContext> = {}): ExerciseContext {
  return {
    verbs: [hablar, comer, ir],
    tenses: ['present_indicative'],
    persons: ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'],
    random: () => 0,
    ...overrides,
  };
}

describe('listCandidates', () => {
  it('only lists persons that exist in the data', () => {
    const keys = listCandidates(ctx()).map((c) => `${c.infinitive}:${c.person}`);
    expect(keys).toEqual(['hablar:yo', 'hablar:tu', 'hablar:vosotros', 'comer:yo']);
  });

  it('skips persons the user has hidden (e.g. vosotros)', () => {
    const persons = listCandidates(ctx({ persons: ['yo', 'tu'] })).map((c) => c.person);
    expect(persons).not.toContain('vosotros');
  });

  it('only uses the selected tenses and skips missing persons there too', () => {
    const items = listCandidates(ctx({ tenses: ['imperative_affirmative'] }));
    expect(items.map((c) => `${c.infinitive}:${c.person}`)).toEqual(['ir:tu', 'ir:vosotros']);
  });

  it('includes the expected form', () => {
    expect(listCandidates(ctx())[2]).toMatchObject({
      infinitive: 'hablar',
      tense: 'present_indicative',
      person: 'vosotros',
      expected: 'habláis',
      verb: hablar,
    });
  });
});

describe('generateQuestion', () => {
  it('returns undefined when there is nothing to ask', () => {
    expect(generateQuestion(ctx({ verbs: [] }))).toBeUndefined();
    expect(generateQuestion(ctx({ tenses: ['future_indicative'] }))).toBeUndefined();
  });

  it('picks using the injected random function', () => {
    expect(generateQuestion(ctx({ random: () => 0 }))?.person).toBe('yo');
    expect(generateQuestion(ctx({ random: () => 0.999 }))?.infinitive).toBe('comer');
  });

  it('never asks the same item twice in a row', () => {
    const random = seeded(42);
    let previous = generateQuestion(ctx({ random }));
    for (let i = 0; i < 200; i++) {
      const q = generateQuestion(ctx({ random, previous }));
      expect(q).toBeDefined();
      expect(`${q!.infinitive}:${q!.person}`).not.toBe(
        `${previous!.infinitive}:${previous!.person}`,
      );
      previous = q;
    }
  });

  it('avoids the same verb back-to-back when another verb is available', () => {
    const previous = { infinitive: 'hablar', tense: 'present_indicative', person: 'yo' } as const;
    for (const r of [0, 0.3, 0.6, 0.99]) {
      expect(generateQuestion(ctx({ random: () => r, previous }))?.infinitive).toBe('comer');
    }
  });

  it('repeats the verb (with another person) when it is the only verb', () => {
    const previous = { infinitive: 'hablar', tense: 'present_indicative', person: 'yo' } as const;
    const q = generateQuestion(ctx({ verbs: [hablar], previous }));
    expect(q?.infinitive).toBe('hablar');
    expect(q?.person).not.toBe('yo');
  });

  it('repeats the only item when there is exactly one', () => {
    const previous = { infinitive: 'comer', tense: 'present_indicative', person: 'yo' } as const;
    expect(generateQuestion(ctx({ verbs: [comer], previous }))?.person).toBe('yo');
  });
});
