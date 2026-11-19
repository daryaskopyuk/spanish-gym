import '@/i18n';

import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Person } from '@/data/types';
import { getVerb } from '@/data/verbRepository';
import { generateQuestion, type ConjugationQuestion } from '@/exercises/conjugationInput/generator';

import { lightColors } from '@/theme';

import PracticeScreen from '../app/practice';

jest.mock('@/exercises/conjugationInput/generator', () => ({
  ...jest.requireActual('@/exercises/conjugationInput/generator'),
  generateQuestion: jest.fn(),
}));

function question(infinitive: string, person: Person): ConjugationQuestion {
  const verb = getVerb(infinitive)!;
  return {
    infinitive,
    tense: 'present_indicative',
    person,
    verb,
    expected: verb.forms.present_indicative![person]!,
  };
}

const mockGenerate = generateQuestion as jest.MockedFunction<typeof generateQuestion>;

beforeEach(() => {
  mockGenerate.mockReset();
  mockGenerate
    .mockReturnValueOnce(question('hablar', 'vosotros'))
    .mockReturnValueOnce(question('ser', 'yo'));
});

async function answerWith(text: string) {
  await fireEvent.changeText(screen.getByTestId('answer-input'), text);
  await fireEvent.press(screen.getByTestId('check-button'));
}

describe('PracticeScreen', () => {
  it('shows the verb, tense and pronoun, without the translation before answering', async () => {
    await render(<PracticeScreen />);
    expect(screen.getByTestId('prompt-verb')).toHaveTextContent('hablar');
    expect(screen.getByTestId('prompt-tense')).toHaveTextContent('Present');
    expect(screen.getByTestId('prompt-pronoun')).toHaveTextContent('vosotros / vosotras');
    expect(screen.queryByTestId('translation')).toBeNull();
  });

  it('disables Check until something is typed', async () => {
    await render(<PracticeScreen />);
    expect(screen.getByTestId('check-button')).toBeDisabled();
    await fireEvent.changeText(screen.getByTestId('answer-input'), 'h');
    expect(screen.getByTestId('check-button')).toBeEnabled();
  });

  it('correct answer → green feedback with translation, and "Show all forms"', async () => {
    await render(<PracticeScreen />);
    await answerWith('habláis');
    expect(screen.getByTestId('feedback-correct')).toHaveTextContent(/Correct!/);
    expect(screen.getByTestId('translation')).toHaveTextContent(/to speak/);
    expect(screen.queryByTestId('correct-form')).toBeNull();

    expect(screen.queryByTestId('conjugation-table')).toBeNull();
    await fireEvent.press(screen.getByTestId('show-all-forms'));
    expect(screen.getByTestId('table-row-vosotros')).toHaveTextContent(/habláis/);
  });

  it('missing accent → counts as correct and shows the accented form', async () => {
    await render(<PracticeScreen />);
    await answerWith('hablais');
    expect(screen.getByTestId('feedback-correct_missing_accent')).toBeOnTheScreen();
    expect(screen.getByTestId('correct-form')).toHaveTextContent('habláis');
    expect(screen.getByTestId('show-all-forms')).toBeOnTheScreen();
  });

  it('wrong → correct form → Show all forms → Next', async () => {
    await render(<PracticeScreen />);
    await answerWith('hablo');

    expect(screen.getByTestId('feedback-wrong')).toBeOnTheScreen();
    expect(screen.getByText('Your answer: hablo')).toBeOnTheScreen();
    expect(screen.getByTestId('correct-form')).toHaveTextContent('habláis');
    expect(screen.getByTestId('answer-input').props.editable).toBe(false);

    expect(screen.queryByTestId('conjugation-table')).toBeNull();
    await fireEvent.press(screen.getByTestId('show-all-forms'));
    expect(screen.getByTestId('conjugation-table')).toBeOnTheScreen();
    expect(screen.getByTestId('table-row-yo')).toHaveTextContent('yohablo');
    expect(screen.getByTestId('table-row-vosotros')).toHaveTextContent(/habláis/);

    await fireEvent.press(screen.getByTestId('next-button'));
    expect(screen.getByTestId('prompt-verb')).toHaveTextContent('ser');
    expect(screen.getByTestId('answer-input')).toHaveDisplayValue('');
    expect(screen.queryByTestId('feedback')).toBeNull();
    expect(screen.queryByTestId('conjugation-table')).toBeNull();
    expect(mockGenerate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        previous: expect.objectContaining({ infinitive: 'hablar', person: 'vosotros' }),
      }),
    );
  });

  it.each([
    ['habláis', lightColors.success],
    ['hablais', lightColors.warning],
    ['hablo', lightColors.error],
  ])('colours the answer box by result (%s)', async (typed, colour) => {
    await render(<PracticeScreen />);
    await answerWith(typed);
    expect(screen.getByTestId('answer-input')).toHaveStyle({ borderColor: colour });
  });

  it('requires the reflexive pronoun', async () => {
    mockGenerate.mockReset().mockReturnValue(question('levantarse', 'yo'));
    await render(<PracticeScreen />);
    await answerWith('levanto');
    expect(screen.getByTestId('feedback-wrong')).toBeOnTheScreen();
    expect(screen.getByTestId('correct-form')).toHaveTextContent('me levanto');
  });

  it('checks when the keyboard "done" key is pressed', async () => {
    await render(<PracticeScreen />);
    const input = screen.getByTestId('answer-input');
    await fireEvent.changeText(input, 'habláis');
    await fireEvent(input, 'submitEditing');
    expect(screen.getByTestId('feedback-correct')).toBeOnTheScreen();
  });

  it('accent row inserts at the cursor', async () => {
    await render(<PracticeScreen />);
    const input = screen.getByTestId('answer-input');
    await fireEvent.changeText(input, 'hablis');
    await fireEvent(input, 'selectionChange', {
      nativeEvent: { selection: { start: 4, end: 4 } },
    });
    await fireEvent.press(screen.getByTestId('accent-key-á'));
    expect(input).toHaveDisplayValue('habláis');
  });

  it('accent row appends at the end when no cursor position was reported', async () => {
    await render(<PracticeScreen />);
    const input = screen.getByTestId('answer-input');
    await fireEvent.changeText(input, 'habl');
    await fireEvent.press(screen.getByTestId('accent-key-á'));
    expect(input).toHaveDisplayValue('hablá');
  });

  it('accent row inserts at the end after typing more letters', async () => {
    await render(<PracticeScreen />);
    const input = screen.getByTestId('answer-input');
    await fireEvent.changeText(input, 'habl');
    await fireEvent.press(screen.getByTestId('accent-key-á'));
    await fireEvent.changeText(input, 'hablá' + 'is');
    await fireEvent.press(screen.getByTestId('accent-key-ñ'));
    expect(input).toHaveDisplayValue('habláisñ');
  });

  it('accent row replaces a selected range', async () => {
    await render(<PracticeScreen />);
    const input = screen.getByTestId('answer-input');
    await fireEvent.changeText(input, 'ano');
    await fireEvent(input, 'selectionChange', {
      nativeEvent: { selection: { start: 1, end: 2 } },
    });
    await fireEvent.press(screen.getByTestId('accent-key-ñ'));
    expect(input).toHaveDisplayValue('año');
  });

  it('shows a message when there is nothing to practise', async () => {
    mockGenerate.mockReset().mockReturnValue(undefined);
    await render(<PracticeScreen />);
    expect(screen.getByText('There are no verbs to practise yet.')).toBeOnTheScreen();
  });
});
