import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { minTouchSize, useTheme, type Theme } from '@/theme';

export const ACCENT_CHARS = ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ'] as const;

type Props = {
  onInsert: (char: string) => void;
  disabled?: boolean;
};

/** Row of buttons that insert accented letters (faster than long-pressing on a phone keyboard). */
export function AccentKeyboardRow({ onInsert, disabled }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.row} testID="accent-row">
      {ACCENT_CHARS.map((char) => (
        <Pressable
          key={char}
          onPress={() => onInsert(char)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t('practice.accentKeyLabel', { char })}
          testID={`accent-key-${char}`}
          style={({ pressed }) => [
            styles.key,
            theme.elevation.card,
            pressed && !disabled && theme.elevation.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Text style={styles.char}>{char}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function makeStyles({ colors, spacing, fontSize, radius }: Theme) {
  return StyleSheet.create({
    // One row on phone widths: keys share the width (wraps only on very narrow screens).
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs + 2 },
    key: {
      flexGrow: 1,
      flexBasis: 40,
      minHeight: minTouchSize,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: { opacity: 0.4 },
    char: { fontSize: fontSize.lg, color: colors.text },
  });
}
