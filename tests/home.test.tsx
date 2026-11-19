import '@/i18n';

import { fireEvent, render, screen } from '@testing-library/react-native';

import HomeScreen from '../app/index';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

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

  it('Start opens the practice screen', async () => {
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByTestId('start-button'));
    expect(mockPush).toHaveBeenCalledWith('/practice');
  });
});
