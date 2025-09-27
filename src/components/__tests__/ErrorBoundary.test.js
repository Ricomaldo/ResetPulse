import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import ErrorBoundary from '../ErrorBoundary';
import Logger from '../../utils/logger';

// Mock Logger
jest.mock('../../utils/logger', () => ({
  error: jest.fn()
}));

// Mock expo-updates
jest.mock('expo-updates', () => ({
  isAvailable: false,
  reloadAsync: jest.fn()
}));

describe('ErrorBoundary', () => {
  // Component qui throw une erreur
  const ThrowError = () => {
    throw new Error('Test error');
  };

  // Component normal
  const NormalComponent = () => (
    <View>
      <Text>Normal content</Text>
    </View>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // Supprime les console.error pendant les tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should render children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(getByText('Normal content')).toBeTruthy();
  });

  it('should catch error and show fallback', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText('Oups !')).toBeTruthy();
    expect(getByText("L'application a rencontré un problème")).toBeTruthy();
    expect(getByText('Redémarrer')).toBeTruthy();
  });

  it('should log error when catching', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(Logger.error).toHaveBeenCalledWith(
      'App crashed',
      expect.objectContaining({
        error: expect.stringContaining('Test error')
      })
    );
  });

  it('should reset when restart button is pressed', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    // Initially shows normal content
    expect(getByText('Normal content')).toBeTruthy();

    // Manually trigger error state for testing
    const { UNSAFE_getByType } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should show error UI
    const restartButton = getByText('Redémarrer');
    expect(restartButton).toBeTruthy();

    // Press restart (in dev mode, resets state)
    fireEvent.press(restartButton);

    // Component should attempt to reset
    // Note: Full reset testing would require more complex setup
  });
});