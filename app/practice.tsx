import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccentKeyboardRow } from '@/components/AccentKeyboardRow';
import { Button } from '@/components/Button';
import { ConjugationTable } from '@/components/ConjugationTable';
import { FeedbackBanner } from '@/components/FeedbackBanner';
import { getAllVerbs, getTranslation } from '@/data/verbRepository';
import type { TenseId } from '@/data/types';
import {
  conjugationInputExercise as exercise,
  type ConjugationQuestion,
} from '@/exercises/conjugationInput';
import type { CheckOutcome, ExerciseContext } from '@/exercises/types';
import { useSettings, visiblePersons } from '@/settings/settingsStore';
import { minTouchSize, useTheme, type Theme } from '@/theme';

// M1: present tense only. M4 adds the per-session tense selection (PLAN §7b).
const SESSION_TENSES: readonly TenseId[] = ['present_indicative'];

type Selection = { start: number; end: number };

export default function PracticeScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const settings = useSettings();

  const baseContext = useMemo<Omit<ExerciseContext, 'previous'>>(
    () => ({
      verbs: getAllVerbs(),
      tenses: SESSION_TENSES,
      persons: visiblePersons(settings),
      random: Math.random,
    }),
    [settings],
  );

  const [question, setQuestion] = useState<ConjugationQuestion | undefined>(() =>
    exercise.generate(baseContext),
  );
  const [answer, setAnswer] = useState('');
  const [outcome, setOutcome] = useState<CheckOutcome | undefined>();
  const [showTable, setShowTable] = useState(false);

  // Cursor position, so the accent row inserts at the cursor rather than at the end.
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const selectionRef = useRef<Selection>({ start: 0, end: 0 });
  const [forcedSelection, setForcedSelection] = useState<Selection | undefined>();

  useEffect(() => {
    if (forcedSelection) inputRef.current?.focus();
  }, [forcedSelection]);

  const insertChar = useCallback(
    (char: string) => {
      const { start, end } = selectionRef.current;
      const next = answer.slice(0, start) + char + answer.slice(end);
      const cursor = start + char.length;
      selectionRef.current = { start: cursor, end: cursor };
      setAnswer(next);
      setForcedSelection({ start: cursor, end: cursor });
    },
    [answer],
  );

  const check = useCallback(() => {
    if (!question || outcome || answer.trim() === '') return;
    setOutcome(exercise.check(question, answer));
  }, [question, outcome, answer]);

  const next = useCallback(() => {
    setQuestion((prev) => exercise.generate({ ...baseContext, previous: prev }));
    setAnswer('');
    setOutcome(undefined);
    setShowTable(false);
    selectionRef.current = { start: 0, end: 0 };
    setForcedSelection(undefined);
    inputRef.current?.focus();
  }, [baseContext]);

  if (!question) {
    return (
      <View style={styles.screen}>
        <Text style={styles.empty}>{t('practice.noQuestions')}</Text>
      </View>
    );
  }

  const translation = getTranslation(question.verb, i18n.language);
  const tableForms = question.verb.forms[question.tense];
  const checked = outcome !== undefined;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.prompt}>
        <Text style={styles.verb} testID="prompt-verb">
          {question.infinitive}
        </Text>
        {settings.showTranslation === 'before' && (
          <Text style={styles.translation} testID="translation">
            {translation}
          </Text>
        )}
        <Text style={styles.tense} testID="prompt-tense">
          {t(`tenses.${question.tense}`)}
        </Text>
        <Text style={styles.pronoun} testID="prompt-pronoun">
          {t(`persons.${question.person}`)}
        </Text>
      </View>

      <TextInput
        ref={inputRef}
        value={answer}
        onChangeText={setAnswer}
        onSelectionChange={(e) => {
          selectionRef.current = e.nativeEvent.selection;
          if (forcedSelection) setForcedSelection(undefined);
        }}
        selection={forcedSelection}
        onSubmitEditing={check}
        submitBehavior="submit"
        editable={!checked}
        autoFocus
        autoCorrect={false}
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        returnKeyType="done"
        placeholder={t('practice.answerPlaceholder')}
        placeholderTextColor={theme.colors.textMuted}
        accessibilityLabel={t('practice.answerLabel')}
        style={[styles.input, checked && styles.inputChecked]}
        testID="answer-input"
      />

      <AccentKeyboardRow onInsert={insertChar} disabled={checked} />

      {!checked ? (
        <Button
          label={t('practice.check')}
          onPress={check}
          disabled={answer.trim() === ''}
          testID="check-button"
        />
      ) : (
        <View style={styles.after}>
          <FeedbackBanner
            outcome={outcome}
            answer={answer}
            translation={settings.showTranslation === 'after' ? translation : undefined}
          />
          {outcome.result === 'wrong' && tableForms && (
            <>
              <Button
                label={showTable ? t('practice.hideAllForms') : t('practice.showAllForms')}
                onPress={() => setShowTable((s) => !s)}
                variant="secondary"
                testID="show-all-forms"
              />
              {showTable && (
                <ConjugationTable
                  infinitive={question.infinitive}
                  tense={question.tense}
                  forms={tableForms}
                  highlight={question.person}
                />
              )}
            </>
          )}
          <Button label={t('practice.next')} onPress={next} testID="next-button" />
        </View>
      )}
    </ScrollView>
  );
}

function makeStyles({ colors, spacing, fontSize, radius }: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg, gap: spacing.md },
    empty: { padding: spacing.lg, fontSize: fontSize.md, color: colors.text },
    prompt: {
      gap: spacing.xs,
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    verb: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
    translation: { fontSize: fontSize.md, color: colors.textMuted },
    tense: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    pronoun: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
    input: {
      minHeight: minTouchSize + spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: fontSize.lg,
      color: colors.text,
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: radius.md,
    },
    inputChecked: { backgroundColor: colors.surface },
    after: { gap: spacing.md },
  });
}
