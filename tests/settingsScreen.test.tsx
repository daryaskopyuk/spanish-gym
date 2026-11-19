import '@/i18n';

import { fireEvent, render, screen } from '@testing-library/react-native';

import { DEFAULT_SETTINGS, useSettingsStore } from '@/settings/settingsStore';

import SettingsScreen from '../app/settings';

beforeEach(() => useSettingsStore.setState(DEFAULT_SETTINGS));

describe('SettingsScreen', () => {
  it('shows the current settings', async () => {
    await render(<SettingsScreen />);
    expect(screen.getByTestId('setting-translation-after')).toBeChecked();
    expect(screen.getByTestId('setting-translation-before')).not.toBeChecked();
    expect(screen.getByTestId('setting-round-length-20')).toBeChecked();
    expect(screen.getByTestId('setting-vosotros')).toHaveProp('value', true);
  });

  it('changes "Show translation"', async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId('setting-translation-never'));
    expect(useSettingsStore.getState().showTranslation).toBe('never');
    expect(screen.getByTestId('setting-translation-never')).toBeChecked();
    expect(screen.getByTestId('setting-translation-after')).not.toBeChecked();
  });

  it('changes the round length', async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId('setting-round-length-10'));
    expect(useSettingsStore.getState().roundLength).toBe(10);
  });

  it('turns vosotros off', async () => {
    await render(<SettingsScreen />);
    await fireEvent(screen.getByTestId('setting-vosotros'), 'valueChange', false);
    expect(useSettingsStore.getState().showVosotros).toBe(false);
    expect(screen.getByTestId('setting-vosotros')).toHaveProp('value', false);
  });

  it('uses the English labels', async () => {
    await render(<SettingsScreen />);
    expect(screen.getByText('Show translation')).toBeOnTheScreen();
    expect(screen.getByText('Questions per round')).toBeOnTheScreen();
    expect(screen.getByText('Practise vosotros')).toBeOnTheScreen();
  });
});
