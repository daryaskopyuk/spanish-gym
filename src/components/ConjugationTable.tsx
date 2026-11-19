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
  /** Persons to show (default: all that have a form). */
  persons?: readonly Person[];
};

/** Full conjugation of one verb in one tense ("Show all forms"). */
export function ConjugationTable({
  infinitive,
  tense,
  forms,
  highlight,
  persons: visible = PERSONS,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const persons = PERSONS.filter((p) => forms[p] !== undefined && visible.includes(p));

  return (
    <View
      style={[styles.table, theme.elevation.card]}
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
            style={[
              styles.row,
              i > 0 && styles.divider,
              i === 0 && styles.firstRow,
              i === persons.length - 1 && styles.lastRow,
              active && styles.activeRow,
            ]}
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
      borderRadius: radius.md,
      backgroundColor: colors.surface,
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
    activeRow: { backgroundColor: colors.highlight },
    // Rounded like the table, so a highlighted first/last row stays inside the corners.
    firstRow: { borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md },
    lastRow: { borderBottomLeftRadius: radius.md, borderBottomRightRadius: radius.md },
    person: { flexShrink: 1, fontSize: fontSize.md, color: colors.textMuted },
    // marginLeft auto keeps the form right-aligned when a large font wraps it onto its own line.
    form: { marginLeft: 'auto', fontSize: fontSize.md, fontWeight: '600', color: colors.text },
    activeText: { color: colors.primary },
  });
}
