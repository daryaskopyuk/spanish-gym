import type { Exercise } from '@/exercises/types';

import { checkAnswer } from './checker';
import { generateQuestion, type ConjugationQuestion } from './generator';

export type { ConjugationQuestion };

/** Exercise type #1: see verb + tense + pronoun, type the form. */
export const conjugationInputExercise: Exercise<ConjugationQuestion, string> = {
  type: 'conjugation_input',
  generate: generateQuestion,
  check: (question, answer) => checkAnswer(answer, question.expected),
};
