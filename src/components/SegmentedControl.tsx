import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { minTouchSize, useTheme, type Theme } from '@/theme';

type Option<T> = { value: T; label: string };

type Props<T extends string | number> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the group, e.g. "Show translation". */
  label: string;
  /** Each option gets `${testID}-${value}`. */
  testID: string;
};

/** A row of mutually exclusive options (like iOS's segmented control). */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
  testID,
}: Props<T>) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View
      style={styles.row}
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      testID={testID}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            aria-checked={selected}
            testID={`${testID}-${option.value}`}
            style={({ pressed }) => [
              styles.option,
              selected ? styles.selected : theme.elevation.card,
              pressed && !selected && theme.elevation.pressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function makeStyles({ colors, spacing, fontSize, radius }: Theme) {
  return StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    option: {
      flexGrow: 1,
      flexBasis: 80,
      minHeight: minTouchSize,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selected: { backgroundColor: colors.primary },
    label: { fontSize: fontSize.md, fontWeight: '600', color: colors.text, textAlign: 'center' },
    selectedLabel: { color: colors.onPrimary },
  });
}
