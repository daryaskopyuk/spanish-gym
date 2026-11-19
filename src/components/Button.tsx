import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { minTouchSize, useTheme, type Theme } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  testID?: string;
};

export function Button({ label, onPress, variant = 'primary', disabled, testID }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const primary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, primary ? styles.primaryLabel : styles.secondaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

function makeStyles({ colors, spacing, fontSize, radius }: Theme) {
  return StyleSheet.create({
    base: {
      minHeight: minTouchSize,
      paddingVertical: spacing.sm + spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: { backgroundColor: colors.primary },
    secondary: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    pressed: { opacity: 0.8 },
    disabled: { opacity: 0.4 },
    label: { fontSize: fontSize.md, fontWeight: '600', textAlign: 'center' },
    primaryLabel: { color: colors.onPrimary },
    secondaryLabel: { color: colors.text },
  });
}
