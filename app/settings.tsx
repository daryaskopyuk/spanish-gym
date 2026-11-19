import { useMemo, type ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '@/components/SegmentedControl';
import {
  ROUND_LENGTHS,
  TRANSLATION_MODES,
  useSettings,
  useSettingsStore,
} from '@/settings/settingsStore';
import { useTheme, type Theme } from '@/theme';

// Settings (docs/PLAN.md §8). Changes are saved on the device immediately.
export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const settings = useSettings();
  const { setShowTranslation, setShowVosotros, setRoundLength } = useSettingsStore.getState();

  const translationOptions = TRANSLATION_MODES.map((value) => ({
    value,
    label: t(`settings.translation.${value}`),
  }));
  const roundOptions = ROUND_LENGTHS.map((value) => ({ value, label: String(value) }));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      testID="settings-screen"
    >
      <Section
        title={t('settings.translation.title')}
        description={t('settings.translation.description')}
        styles={styles}
        theme={theme}
      >
        <SegmentedControl
          options={translationOptions}
          value={settings.showTranslation}
          onChange={setShowTranslation}
          label={t('settings.translation.title')}
          testID="setting-translation"
        />
      </Section>

      <Section
        title={t('settings.roundLength.title')}
        description={t('settings.roundLength.description')}
        styles={styles}
        theme={theme}
      >
        <SegmentedControl
          options={roundOptions}
          value={settings.roundLength}
          onChange={setRoundLength}
          label={t('settings.roundLength.title')}
          testID="setting-round-length"
        />
      </Section>

      <View style={[styles.card, styles.switchRow, theme.elevation.card]}>
        <View style={styles.switchText}>
          <Text style={styles.title}>{t('settings.vosotros.title')}</Text>
          <Text style={styles.description}>{t('settings.vosotros.description')}</Text>
        </View>
        <Switch
          value={settings.showVosotros}
          onValueChange={setShowVosotros}
          accessibilityLabel={t('settings.vosotros.title')}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.surface}
          // Web only: the "on" knob colour (react-native-web defaults to teal).
          {...(Platform.OS === 'web' ? ({ activeThumbColor: theme.colors.surface } as object) : {})}
          testID="setting-vosotros"
        />
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  description,
  children,
  styles,
  theme,
}: {
  title: string;
  description: string;
  children: ReactNode;
  styles: ReturnType<typeof makeStyles>;
  theme: Theme;
}) {
  return (
    <View style={[styles.card, theme.elevation.card]}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.description}>{description}</Text>
      {children}
    </View>
  );
}

function makeStyles({ colors, spacing, fontSize, radius }: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg, gap: spacing.md },
    card: {
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    title: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
    description: { fontSize: fontSize.sm, color: colors.textMuted },
    switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    switchText: { flex: 1, gap: spacing.xs },
  });
}
