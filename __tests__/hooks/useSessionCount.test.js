// Tests for useSessionCount hook — Lot 3b (mandat Eric)
// Calqué sur __tests__/hooks/useCustomActivities.test.js : l'état vit dans un
// contexte PARTAGÉ (SessionCountContext) — renderHook monte le provider.
import React from 'react';
import { renderHook, act } from '../test-utils';
import { useSessionCount } from '../../src/hooks/useSessionCount';
import { SessionCountProvider } from '../../src/contexts/SessionCountContext';

const wrapper = ({ children }) => (
  <SessionCountProvider>{children}</SessionCountProvider>
);

// Mock usePersistedState to simulate AsyncStorage without actual storage
let mockStoredValue = 0;
const mockSetCompletedSessions = jest.fn((updater) => {
  mockStoredValue = typeof updater === 'function' ? updater(mockStoredValue) : updater;
  return mockStoredValue;
});

jest.mock('../../src/hooks/usePersistedState', () => ({
  usePersistedState: jest.fn(),
}));

describe('useSessionCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoredValue = 0;
    require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
      mockStoredValue,
      mockSetCompletedSessions,
      false,
    ]);
  });

  it('initializes with completedSessions at 0', () => {
    const { result } = renderHook(() => useSessionCount(), { wrapper });

    expect(result.current.completedSessions).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('provides an incrementSessionCount function', () => {
    const { result } = renderHook(() => useSessionCount(), { wrapper });

    expect(typeof result.current.incrementSessionCount).toBe('function');
  });

  it('increments the count via setCompletedSessions functional updater', () => {
    const { result } = renderHook(() => useSessionCount(), { wrapper });

    act(() => {
      result.current.incrementSessionCount();
    });

    expect(mockSetCompletedSessions).toHaveBeenCalledTimes(1);
    expect(mockStoredValue).toBe(1);
  });

  it('throws when used outside SessionCountProvider', () => {
    // Suppress the expected console.error from React for this negative test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSessionCount())).toThrow(
      'useSessionCount must be used within SessionCountProvider'
    );
    spy.mockRestore();
  });
});
