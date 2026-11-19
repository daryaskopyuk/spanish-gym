import Constants from 'expo-constants';
import { useMemo } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { useTheme, type Theme } from '@/theme';

const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';
const WIKTIONARY_URL = 'https://www.wiktionary.org/';

// Version and data attribution. The Wiktionary credit is required by its license (CC BY-SA 4.0).
export default function AboutScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const version = Constants.expoConfig?.version ?? '';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} testID="about-screen">
      <View style={[styles.card, theme.elevation.card]}>
        <Text style={styles.title} accessibilityRole="header">
          {t('app.title')}
        </Text>
        <Text style={styles.muted}>{t('about.version', { version })}</Text>
      </View>

      <View style={[styles.card, theme.elevation.card]} testID="about-data">
        <Text style={styles.heading} accessibilityRole="header">
          {t('about.dataHeading')}
        </Text>
        <Text style={styles.body}>{t('about.dataWiktionary')}</Text>
        <Text style={styles.body}>{t('about.dataFrequency')}</Text>
        <Text style={styles.body}>{t('about.dataLicense')}</Text>
      </View>

      <Button
        label={t('about.openLicense')}
        onPress={() => void Linking.openURL(LICENSE_URL)}
        variant="secondary"
        testID="open-license"
      />
      <Button
        label={t('about.openWiktionary')}
        onPress={() => void Linking.openURL(WIKTIONARY_URL)}
        variant="secondary"
        testID="open-wiktionary"
      />
    </ScrollView>
  );
}

function makeStyles({ colors, spacing, fontSize, radius }: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg, gap: spacing.md },
    card: {
      gap: spacing.sm,
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
    heading: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
    body: { fontSize: fontSize.md, lineHeight: Math.round(fontSize.md * 1.4), color: colors.text },
    muted: { fontSize: fontSize.md, color: colors.textMuted },
  });
}
