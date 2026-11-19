// User settings (docs/PLAN.md §8): kept in a Zustand store and saved on the device with
// AsyncStorage. Nothing leaves the phone.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { PERSONS, type Person } from '@/data/types';

export const TRANSLATION_MODES = ['before', 'after', 'never'] as const;
export type TranslationMode = (typeof TRANSLATION_MODES)[number];

export const ROUND_LENGTHS = [10, 20, 30] as const;
export type RoundLength = (typeof ROUND_LENGTHS)[number];

export type Settings = {
  /** When to show the verb's English meaning. */
  showTranslation: TranslationMode;
  /** vosotros is only used in Spain; Latin-America learners can hide it. */
  showVosotros: boolean;
  /** Questions per round (rounds arrive in M3.3). */
  roundLength: RoundLength;
};

export const DEFAULT_SETTINGS: Settings = {
  showTranslation: 'after',
  showVosotros: true,
  roundLength: 20,
};

/** Storage key and schema version of the saved settings. Bump the version on breaking changes. */
export const SETTINGS_STORAGE_KEY = 'settings';
export const SETTINGS_VERSION = 1;

/**
 * Turns whatever was saved (possibly from an older version, or corrupted) into valid settings.
 * Unknown or invalid fields fall back to the defaults.
 */
export function sanitizeSettings(raw: unknown): Settings {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const pick = <T>(value: unknown, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback;
  return {
    showTranslation: pick(r.showTranslation, TRANSLATION_MODES, DEFAULT_SETTINGS.showTranslation),
    showVosotros:
      typeof r.showVosotros === 'boolean' ? r.showVosotros : DEFAULT_SETTINGS.showVosotros,
    roundLength: pick(r.roundLength, ROUND_LENGTHS, DEFAULT_SETTINGS.roundLength),
  };
}

type SettingsState = Settings & {
  setShowTranslation: (mode: TranslationMode) => void;
  setShowVosotros: (show: boolean) => void;
  setRoundLength: (length: RoundLength) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setShowTranslation: (showTranslation) => set({ showTranslation }),
      setShowVosotros: (showVosotros) => set({ showVosotros }),
      setRoundLength: (roundLength) => set({ roundLength }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: SETTINGS_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      // Save only the values, not the setter functions.
      partialize: (s): Settings => ({
        showTranslation: s.showTranslation,
        showVosotros: s.showVosotros,
        roundLength: s.roundLength,
      }),
      // Older saved versions: keep what is still valid.
      migrate: (persisted) => sanitizeSettings(persisted),
      merge: (persisted, current) => ({ ...current, ...sanitizeSettings(persisted) }),
    },
  ),
);

/** Current settings (re-renders only when a setting changes). */
export function useSettings(): Settings {
  return useSettingsStore(
    useShallow((s) => ({
      showTranslation: s.showTranslation,
      showVosotros: s.showVosotros,
      roundLength: s.roundLength,
    })),
  );
}

/** True once saved settings have been loaded from the device (loading takes milliseconds). */
export function useSettingsHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useSettingsStore.persist.onFinishHydration(onChange),
    () => useSettingsStore.persist.hasHydrated(),
  );
}

/** Persons to practise, given the settings. */
export function visiblePersons(settings: Pick<Settings, 'showVosotros'>): Person[] {
  return PERSONS.filter((p) => settings.showVosotros || p !== 'vosotros');
}
