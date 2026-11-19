import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { CheckOutcome } from '@/exercises/types';
import { useTheme, type Theme } from '@/theme';

type Props = {
  outcome: CheckOutcome;
  answer: string;
  /** Shown when the translation setting is "after". */
  translation?: string;
};

export function FeedbackBanner({ outcome, answer, translation }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { result, correctForm } = outcome;

  const accent =
    result === 'correct'
      ? theme.colors.success
      : result === 'correct_missing_accent'
        ? theme.colors.warning
        : theme.colors.error;
  const title =
    result === 'correct'
      ? t('feedback.correct')
      : result === 'correct_missing_accent'
        ? t('feedback.missingAccent')
        : t('feedback.wrong');

  return (
    <View
      style={[styles.banner, { borderLeftColor: accent }]}
      testID="feedback"
      accessibilityLiveRegion="polite"
      aria-live="polite"
    >
      <Text style={[styles.title, { color: accent }]} testID={`feedback-${result}`}>
        {title}
      </Text>

      {result === 'wrong' && (
        <>
          <Text style={styles.body}>{t('feedback.yourAnswer', { answer: answer.trim() })}</Text>
          <Text style={styles.body}>{t('feedback.correctAnswer')}</Text>
        </>
      )}
      {result !== 'correct' && (
        <Text style={styles.correctForm} testID="correct-form">
          {correctForm}
        </Text>
      )}
      {translation !== undefined && (
        <Text style={styles.meaning} testID="translation">
          {t('feedback.meaning', { translation })}
        </Text>
      )}
    </View>
  );
}

function makeStyles({ colors, spacing, fontSize, radius }: Theme) {
  return StyleSheet.create({
    banner: {
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: radius.md,
      borderLeftWidth: 6,
      backgroundColor: colors.surface,
    },
    title: { fontSize: fontSize.md, fontWeight: '700' },
    body: { fontSize: fontSize.md, color: colors.text },
    correctForm: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
    meaning: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  });
}
