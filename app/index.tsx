import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useTheme, type Theme } from '@/theme';

// Home screen. M0: title + a Start button placeholder. Tense chips and modes come later.
export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.screen} testID="home-screen">
      <View style={styles.content}>
        <Text style={styles.title} accessibilityRole="header" testID="home-title">
          {t('app.title')}
        </Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          accessibilityRole="button"
          testID="start-button"
        >
          <Text style={styles.buttonText}>{t('home.start')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function makeStyles({ colors, spacing, fontSize }: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: fontSize.md, color: colors.textMuted },
    button: {
      marginTop: spacing.lg,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonPressed: { opacity: 0.8 },
    buttonText: { fontSize: fontSize.md, fontWeight: '600', color: colors.onPrimary },
  });
}
