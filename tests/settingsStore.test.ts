import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  SETTINGS_VERSION,
  sanitizeSettings,
  useSettingsStore,
  visiblePersons,
} from '@/settings/settingsStore';

async function saved(): Promise<unknown> {
  const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
}

beforeEach(async () => {
  await AsyncStorage.clear();
  useSettingsStore.setState(DEFAULT_SETTINGS);
});

describe('defaults', () => {
  it('are after / vosotros on / 20 questions', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      showTranslation: 'after',
      showVosotros: true,
      roundLength: 20,
    });
  });
});

describe('sanitizeSettings', () => {
  it('keeps valid values', () => {
    expect(
      sanitizeSettings({ showTranslation: 'never', showVosotros: false, roundLength: 30 }),
    ).toEqual({ showTranslation: 'never', showVosotros: false, roundLength: 30 });
  });

  it('replaces invalid or missing values with defaults', () => {
    expect(sanitizeSettings({ showTranslation: 'sometimes', roundLength: 25 })).toEqual(
      DEFAULT_SETTINGS,
    );
    expect(sanitizeSettings({ showVosotros: 'yes' }).showVosotros).toBe(true);
  });

  it('handles non-objects', () => {
    for (const raw of [null, undefined, 42, 'x', []]) {
      expect(sanitizeSettings(raw)).toEqual(DEFAULT_SETTINGS);
    }
  });

  it('ignores unknown fields', () => {
    expect(sanitizeSettings({ ...DEFAULT_SETTINGS, theme: 'pink' })).toEqual(DEFAULT_SETTINGS);
  });
});

describe('settings store', () => {
  it('updates and saves each setting on the device', async () => {
    const s = useSettingsStore.getState();
    s.setShowTranslation('before');
    s.setShowVosotros(false);
    s.setRoundLength(10);

    expect(useSettingsStore.getState()).toMatchObject({
      showTranslation: 'before',
      showVosotros: false,
      roundLength: 10,
    });
    expect(await saved()).toEqual({
      state: { showTranslation: 'before', showVosotros: false, roundLength: 10 },
      version: SETTINGS_VERSION,
    });
  });

  it('does not save the setter functions', async () => {
    useSettingsStore.getState().setRoundLength(30);
    const state = (await saved()) as { state: Record<string, unknown> };
    expect(Object.keys(state.state).sort()).toEqual([
      'roundLength',
      'showTranslation',
      'showVosotros',
    ]);
  });

  it('loads saved settings when the app starts', async () => {
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        state: { showTranslation: 'never', showVosotros: false, roundLength: 30 },
        version: SETTINGS_VERSION,
      }),
    );
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState()).toMatchObject({
      showTranslation: 'never',
      showVosotros: false,
      roundLength: 30,
    });
    expect(useSettingsStore.persist.hasHydrated()).toBe(true);
  });

  it('falls back to defaults for corrupted saved values', async () => {
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ state: { showTranslation: 42, roundLength: 'many' }, version: 1 }),
    );
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState()).toMatchObject(DEFAULT_SETTINGS);
  });

  it('migrates settings saved by an older version, keeping valid values', async () => {
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ state: { showTranslation: 'before', oldSetting: true }, version: 0 }),
    );
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState()).toMatchObject({
      ...DEFAULT_SETTINGS,
      showTranslation: 'before',
    });
  });

  it('keeps defaults when nothing is saved (first launch)', async () => {
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState()).toMatchObject(DEFAULT_SETTINGS);
  });
});

describe('visiblePersons', () => {
  it('includes vosotros only when enabled', () => {
    expect(visiblePersons({ showVosotros: true })).toContain('vosotros');
    expect(visiblePersons({ showVosotros: false })).toEqual([
      'yo',
      'tu',
      'el',
      'nosotros',
      'ellos',
    ]);
  });
});
