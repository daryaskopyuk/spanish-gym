import { getAllVerbs, getAvailableTenses, getDataSource, getVerb } from '@/data/verbRepository';

// M0: verbs.json is an empty placeholder. M1 replaces it with sample data and real tests.
describe('verbRepository', () => {
  it('loads the data file', () => {
    expect(Array.isArray(getAllVerbs())).toBe(true);
    expect(getDataSource()).toEqual(expect.any(String));
  });

  it('returns undefined for an unknown verb', () => {
    expect(getVerb('no-such-verb')).toBeUndefined();
  });

  it('lists only tenses that have data', () => {
    const tenses = getAvailableTenses();
    for (const tense of tenses) {
      expect(getAllVerbs().some((v) => v.forms[tense])).toBe(true);
    }
  });
});
