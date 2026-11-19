// User settings (docs/PLAN.md §8). M1: defaults only; the settings screen and
// persistence come in M3.
import { PERSONS, type Person } from '@/data/types';

export type TranslationMode = 'before' | 'after' | 'never';

export type Settings = {
  showTranslation: TranslationMode;
  showVosotros: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  showTranslation: 'after',
  showVosotros: true,
};

export function useSettings(): Settings {
  return DEFAULT_SETTINGS;
}

/** Persons to practise, given the settings. */
export function visiblePersons(settings: Settings): Person[] {
  return PERSONS.filter((p) => settings.showVosotros || p !== 'vosotros');
}
