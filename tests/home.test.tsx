import '@/i18n';

import { render, screen } from '@testing-library/react-native';

import HomeScreen from '../app/index';

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native');
  return { SafeAreaView: View };
});

describe('HomeScreen', () => {
  it('shows the app title and a Start button from the English strings', async () => {
    await render(<HomeScreen />);
    expect(screen.getByTestId('home-title')).toHaveTextContent('Spanish Gym');
    expect(screen.getByRole('button', { name: 'Start' })).toBeOnTheScreen();
  });
});
