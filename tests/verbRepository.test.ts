import { PERSONS } from '@/data/types';
import {
  getAllVerbs,
  getAvailableTenses,
  getDataSource,
  getForm,
  getTenseForms,
  getTranslation,
  getVerb,
} from '@/data/verbRepository';
import { formAlternatives } from '@/exercises/conjugationInput/checker';

describe('verbRepository', () => {
  it('loads the generated data', () => {
    expect(getAllVerbs().length).toBeGreaterThanOrEqual(290);
    expect(getDataSource()).toMatch(/Wiktionary/);
    expect(getDataSource()).toEqual(expect.any(String));
  });

  it('finds verbs and forms', () => {
    expect(getVerb('hablar')?.translations.en).toBeTruthy();
    expect(getVerb('no-such-verb')).toBeUndefined();
    expect(getForm('ser', 'present_indicative', 'yo')).toBe('soy');
    expect(getForm('levantarse', 'present_indicative', 'nosotros')).toBe('nos levantamos');
    expect(getForm('hablar', 'future_indicative', 'yo')).toBe('hablaré');
    expect(getTenseForms('hablar', 'conditional')).toBeUndefined();
  });

  const M2_TENSES = ['present_indicative', 'preterite_indicative', 'future_indicative'] as const;

  it('has present, preterite and future with all six persons and no empty forms', () => {
    expect(getAvailableTenses().sort()).toEqual([...M2_TENSES].sort());
    for (const verb of getAllVerbs()) {
      for (const tense of M2_TENSES) {
        const forms = verb.forms[tense];
        expect(forms).toBeDefined();
        for (const person of PERSONS) {
          const form = forms?.[person];
          expect(form).toBeDefined();
          for (const alt of formAlternatives(form ?? '')) expect(alt.trim()).not.toBe('');
        }
      }
    }
  });

  it('orders verbs by frequency rank, starting at 1', () => {
    const ranks = getAllVerbs().map((v) => v.frequencyRank);
    expect(ranks).toEqual(ranks.map((_, i) => i + 1));
  });

  it('includes the reflexive pronoun in reflexive forms', () => {
    const pronouns = { yo: 'me', tu: 'te', el: 'se', nosotros: 'nos', vosotros: 'os', ellos: 'se' };
    const reflexive = getAllVerbs().filter((v) => v.reflexive);
    expect(reflexive.length).toBeGreaterThanOrEqual(2);
    for (const verb of reflexive) {
      for (const person of PERSONS) {
        for (const tense of M2_TENSES) {
          expect(getForm(verb.infinitive, tense, person)).toMatch(
            new RegExp(`^${pronouns[person]} `),
          );
        }
      }
    }
  });

  it('has a participle and an English translation for every verb', () => {
    for (const verb of getAllVerbs()) {
      expect(verb.participle).toMatch(/^\p{L}+$/u);
      expect(verb.translations.en.trim()).not.toBe('');
    }
  });

  it('falls back to English translations', () => {
    const hablar = getVerb('hablar')!;
    expect(getTranslation(hablar, 'uk')).toBe(hablar.translations.en);
  });

  it('spot-checks known irregular forms', () => {
    const known: [string, string, string][] = [
      ['ser', 'tu', 'eres'],
      ['ir', 'vosotros', 'vais'],
      ['tener', 'yo', 'tengo'],
      ['hacer', 'yo', 'hago'],
      ['decir', 'el', 'dice'],
      ['poder', 'ellos', 'pueden'],
      ['querer', 'tu', 'quieres'],
      ['saber', 'yo', 'sé'],
      ['estar', 'el', 'está'],
      ['ver', 'vosotros', 'veis'],
    ];
    for (const [verb, person, form] of known) {
      expect(getForm(verb, 'present_indicative', person as (typeof PERSONS)[number])).toBe(form);
    }
  });
});
