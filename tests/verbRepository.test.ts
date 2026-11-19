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
  it('loads the sample data', () => {
    expect(getAllVerbs().length).toBeGreaterThanOrEqual(15);
    expect(getDataSource()).toEqual(expect.any(String));
  });

  it('finds verbs and forms', () => {
    expect(getVerb('hablar')?.translations.en).toBeTruthy();
    expect(getVerb('no-such-verb')).toBeUndefined();
    expect(getForm('ser', 'present_indicative', 'yo')).toBe('soy');
    expect(getForm('levantarse', 'present_indicative', 'nosotros')).toBe('nos levantamos');
    expect(getTenseForms('hablar', 'future_indicative')).toBeUndefined();
  });

  it('has the present tense, with all six persons and no empty forms, for every verb', () => {
    expect(getAvailableTenses()).toContain('present_indicative');
    for (const verb of getAllVerbs()) {
      const forms = verb.forms.present_indicative;
      expect(forms).toBeDefined();
      for (const person of PERSONS) {
        const form = forms?.[person];
        expect(form).toBeDefined();
        for (const alt of formAlternatives(form ?? '')) expect(alt.trim()).not.toBe('');
      }
    }
  });

  it('includes the reflexive pronoun in reflexive forms', () => {
    const pronouns = { yo: 'me', tu: 'te', el: 'se', nosotros: 'nos', vosotros: 'os', ellos: 'se' };
    const reflexive = getAllVerbs().filter((v) => v.reflexive);
    expect(reflexive.length).toBeGreaterThanOrEqual(2);
    for (const verb of reflexive) {
      for (const person of PERSONS) {
        expect(getForm(verb.infinitive, 'present_indicative', person)).toMatch(
          new RegExp(`^${pronouns[person]} `),
        );
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
