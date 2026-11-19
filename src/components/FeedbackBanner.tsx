import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { CheckOutcome } from '@/exercises/types';
import { resultColor, useTheme, type Theme } from '@/theme';

import { useReduceMotion } from './useReduceMotion';

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
  const accent = resultColor(theme.colors, result);

  // A short "pop" when the feedback appears (skipped when the user prefers reduced motion).
  const reduceMotion = useReduceMotion();
  const [appear] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduceMotion === undefined) return;
    if (reduceMotion) {
      appear.setValue(1);
      return;
    }
    Animated.timing(appear, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [appear, reduceMotion]);
  const popStyle = {
    opacity: appear.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0, 1, 1],
      extrapolate: 'clamp',
    }),
    transform: [{ scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
  };
  const title =
    result === 'correct'
      ? t('feedback.correct')
      : result === 'correct_missing_accent'
        ? t('feedback.missingAccent')
        : t('feedback.wrong');

  return (
    <Animated.View
      style={[styles.banner, { borderLeftColor: accent }, popStyle]}
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
    </Animated.View>
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
