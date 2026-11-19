import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { useTheme, type Theme } from '@/theme';

// Home screen. Tense chips, modes and stats come in M4.
export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.screen} testID="home-screen">
      <View style={styles.content}>
        <Text style={styles.title} accessibilityRole="header" testID="home-title">
          {t('app.title')}
        </Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        <View style={styles.start}>
          <Button
            label={t('home.start')}
            onPress={() => router.push('/practice')}
            testID="start-button"
          />
          <Button
            label={t('home.settings')}
            onPress={() => router.push('/settings')}
            variant="secondary"
            testID="settings-link"
          />
          <Button
            label={t('home.about')}
            onPress={() => router.push('/about')}
            variant="secondary"
            testID="about-link"
          />
        </View>
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
    start: { marginTop: spacing.lg, gap: spacing.sm },
  });
}
