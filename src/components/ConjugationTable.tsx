import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PERSONS, type Person, type TenseForms, type TenseId } from '@/data/types';
import { displayForm } from '@/exercises/conjugationInput/checker';
import { useTheme, type Theme } from '@/theme';

type Props = {
  infinitive: string;
  tense: TenseId;
  forms: TenseForms;
  /** The person that was asked; its row is highlighted. */
  highlight?: Person;
};

/** Full conjugation of one verb in one tense ("Show all forms"). */
export function ConjugationTable({ infinitive, tense, forms, highlight }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const persons = PERSONS.filter((p) => forms[p] !== undefined);

  return (
    <View
      style={styles.table}
      testID="conjugation-table"
      accessibilityLabel={t('conjugationTable.label', {
        verb: infinitive,
        tense: t(`tenses.${tense}`),
      })}
    >
      {persons.map((person, i) => {
        const form = forms[person];
        const active = person === highlight;
        return (
          <View
            key={person}
            style={[styles.row, i > 0 && styles.divider, active && styles.activeRow]}
            testID={`table-row-${person}`}
          >
            <Text style={[styles.person, active && styles.activeText]}>
              {t(`persons.${person}`)}
            </Text>
            <Text style={[styles.form, active && styles.activeText]}>
              {form === undefined ? '' : displayForm(form)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function makeStyles({ colors, spacing, fontSize, radius }: Theme) {
  return StyleSheet.create({
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    divider: { borderTopWidth: 1, borderTopColor: colors.border },
    activeRow: { backgroundColor: colors.surface },
    person: { flexShrink: 1, fontSize: fontSize.md, color: colors.textMuted },
    // marginLeft auto keeps the form right-aligned when a large font wraps it onto its own line.
    form: { marginLeft: 'auto', fontSize: fontSize.md, fontWeight: '600', color: colors.text },
    activeText: { color: colors.primary },
  });
}
