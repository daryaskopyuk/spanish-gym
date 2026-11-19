import '@/i18n';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme';

export default function RootLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;

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
      </Stack>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
