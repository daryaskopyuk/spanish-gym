import {
  checkAnswer,
  displayForm,
  normalize,
  stripAccents,
} from '@/exercises/conjugationInput/checker';

// Cases required by docs/PLAN.md §5.
describe('checkAnswer', () => {
  it('accepts the exact accented form', () => {
    expect(checkAnswer('habláis', 'habláis')).toEqual({
      result: 'correct',
      correctForm: 'habláis',
    });
  });

  it('accepts a missing accent and returns the accented form', () => {
    expect(checkAnswer('hablais', 'habláis')).toEqual({
      result: 'correct_missing_accent',
      correctForm: 'habláis',
    });
    expect(checkAnswer('se', 'sé').result).toBe('correct_missing_accent');
  });

  it('treats a misplaced or extra accent like a missing one', () => {
    expect(checkAnswer('háblo', 'hablo').result).toBe('correct_missing_accent');
  });

  it('handles ü like the other accents', () => {
    expect(checkAnswer('averiguen', 'averigüen').result).toBe('correct_missing_accent');
  });

  it('rejects a wrong letter', () => {
    expect(checkAnswer('hablo', 'habla')).toEqual({ result: 'wrong', correctForm: 'habla' });
  });

  it('never treats n as ñ', () => {
    expect(checkAnswer('ano', 'año').result).toBe('wrong');
    expect(checkAnswer('ensenamos', 'enseñamos').result).toBe('wrong');
    expect(checkAnswer('año', 'ano').result).toBe('wrong');
  });

  it('ignores surrounding and repeated spaces', () => {
    expect(checkAnswer('  me   levanto ', 'me levanto').result).toBe('correct');
    expect(checkAnswer('\the\n hablado', 'he hablado').result).toBe('correct');
  });

  it('ignores capital letters, including accented capitals', () => {
    expect(checkAnswer('Hablo', 'hablo').result).toBe('correct');
    expect(checkAnswer('HABLÁIS', 'habláis').result).toBe('correct');
    expect(checkAnswer('HABLAIS', 'habláis').result).toBe('correct_missing_accent');
    expect(checkAnswer('AÑO', 'año').result).toBe('correct');
  });

  it('treats a decomposed accent (a + combining acute) like á', () => {
    expect(checkAnswer('habláis', 'habláis').result).toBe('correct');
  });

  it('accepts any alternative and reports the one that matched', () => {
    const form = ['hablara', 'hablase'];
    expect(checkAnswer('hablase', form)).toEqual({ result: 'correct', correctForm: 'hablase' });
    expect(checkAnswer('hablara', form)).toEqual({ result: 'correct', correctForm: 'hablara' });
    expect(checkAnswer('adecuo', ['adecuo', 'adecúo']).result).toBe('correct');
  });

  it('accepts an alternative with a missing accent', () => {
    expect(checkAnswer('hablaramos', ['habláramos', 'hablásemos'])).toEqual({
      result: 'correct_missing_accent',
      correctForm: 'habláramos',
    });
  });

  it('shows all alternatives when the answer is wrong', () => {
    expect(checkAnswer('hablo', ['hablara', 'hablase'])).toEqual({
      result: 'wrong',
      correctForm: 'hablara / hablase',
    });
  });

  it('requires the reflexive pronoun', () => {
    expect(checkAnswer('me levanto', 'me levanto').result).toBe('correct');
    expect(checkAnswer('levanto', 'me levanto').result).toBe('wrong');
    expect(checkAnswer('te levanto', 'me levanto').result).toBe('wrong');
  });

  it('compares compound tenses as whole multi-word answers', () => {
    expect(checkAnswer('he hablado', 'he hablado').result).toBe('correct');
    expect(checkAnswer('hablado', 'he hablado').result).toBe('wrong');
    expect(checkAnswer('ha hablado', 'he hablado').result).toBe('wrong');
  });

  it('rejects an empty answer', () => {
    expect(checkAnswer('', 'hablo').result).toBe('wrong');
    expect(checkAnswer('   ', 'hablo').result).toBe('wrong');
  });
});

describe('helpers', () => {
  it('normalize trims, collapses spaces and lowercases', () => {
    expect(normalize('  Me   LEVANTO ')).toBe('me levanto');
  });

  it('stripAccents removes á é í ó ú ü but keeps ñ', () => {
    expect(stripAccents('áéíóúüñ')).toBe('aeiouuñ');
  });

  it('displayForm joins alternatives', () => {
    expect(displayForm('hablo')).toBe('hablo');
    expect(displayForm(['hablara', 'hablase'])).toBe('hablara / hablase');
  });
});
