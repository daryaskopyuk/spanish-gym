import '@/i18n';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettingsHydrated } from '@/settings/settingsStore';
import { useTheme } from '@/theme';

// Keep the splash screen until saved settings are loaded, so screens never flash the defaults.
void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const hydrated = useSettingsHydrated();

  useEffect(() => {
    if (hydrated) void SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  if (!hydrated) return null;

  return (
    <ThemeProvider
      value={{
        ...base,
        colors: {
          ...base.colors,
          background: theme.colors.background,
          card: theme.colors.background,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
        },
      }}
    >
      <Stack>
        <Stack.Screen name="index" options={{ title: t('app.title'), headerShown: false }} />
        <Stack.Screen name="practice" options={{ title: t('practice.title') }} />
        <Stack.Screen name="about" options={{ title: t('about.title') }} />
        <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
      </Stack>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
