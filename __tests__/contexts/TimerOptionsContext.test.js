// Tests for TimerOptionsContext - P1
import React from 'react';
import { renderHook, act } from '../test-utils';

// Mock dependencies
jest.mock('../../src/hooks/usePersistedState', () => ({
  usePersistedObject: jest.fn(() => ({
    values: {
      shouldPulse: false,
      showDigitalTimer: false,
      showActivityEmoji: true,
      keepAwakeEnabled: true,
      clockwise: false,
      scaleMode: '45min',
      currentActivity: 'work',
      currentDuration: 2700,
      favoriteActivities: ['work', 'break', 'meditation'],
      favoritePalettes: ['terre', 'softLaser'],
      commandBarConfig: [],
      carouselBarConfig: [],
      selectedSoundId: 'bell_classic',
      activityDurations: {},
      completedTimersCount: 0,
      hasSeenTwoTimersModal: false,
    },
    updateValue: jest.fn(),
    isLoading: false,
  })),
}));

jest.mock('../../src/config/activities', () => ({
  getDefaultActivity: () => 'work',
}));

// Import after mocks
import { TimerOptionsProvider, useTimerOptions } from '../../src/contexts/TimerOptionsContext';

// Custom wrapper for context
const wrapper = ({ children }) => (
  <TimerOptionsProvider>{children}</TimerOptionsProvider>
);

describe('TimerOptionsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial values', () => {
    it('provides default values', () => {
      const { result } = renderHook(() => useTimerOptions(), { wrapper });

      expect(result.current.shouldPulse).toBe(false);
      expect(result.current.showDigitalTimer).toBe(false);
      expect(result.current.clockwise).toBe(false);
      expect(result.current.scaleMode).toBe('45min');
      expect(result.current.commandBarConfig).toEqual([]);
      expect(result.current.carouselBarConfig).toEqual([]);
      expect(result.current.favoritePalettes).toEqual(['terre', 'softLaser']);
    });

    it('provides timer defaults', () => {
      const { result } = renderHook(() => useTimerOptions(), { wrapper });

      expect(result.current.currentActivity).toBe('work');
      expect(result.current.currentDuration).toBe(2700); // 45 minutes
      expect(result.current.selectedSoundId).toBe('bell_classic');
    });

    it('provides completed timers count', () => {
      const { result } = renderHook(() => useTimerOptions(), { wrapper });

      expect(result.current.completedTimersCount).toBe(0);
      expect(result.current.hasSeenTwoTimersModal).toBe(false);
    });
  });

  describe('Setter functions', () => {
    it('provides all setter functions', () => {
      const { result } = renderHook(() => useTimerOptions(), { wrapper });

      expect(typeof result.current.setShouldPulse).toBe('function');
      expect(typeof result.current.setShowDigitalTimer).toBe('function');
      expect(typeof result.current.setClockwise).toBe('function');
      expect(typeof result.current.setScaleMode).toBe('function');
      expect(typeof result.current.setCurrentActivity).toBe('function');
      expect(typeof result.current.setCurrentDuration).toBe('function');
      expect(typeof result.current.setSelectedSoundId).toBe('function');
      expect(typeof result.current.toggleFavoritePalette).toBe('function');
    });

    it('calls updateValue when setter is called', () => {
      const mockUpdateValue = jest.fn();
      require('../../src/hooks/usePersistedState').usePersistedObject.mockReturnValue({
        values: {
          shouldPulse: false,
          showDigitalTimer: false,
          showActivityEmoji: true,
          keepAwakeEnabled: true,
          clockwise: false,
          scaleMode: '45min',
          currentActivity: 'work',
          currentDuration: 2700,
          favoriteActivities: ['work', 'break', 'meditation'],
          favoritePalettes: ['terre', 'softLaser'],
          commandBarConfig: [],
          carouselBarConfig: [],
          selectedSoundId: 'bell_classic',
          activityDurations: {},
          completedTimersCount: 0,
          hasSeenTwoTimersModal: false,
        },
        updateValue: mockUpdateValue,
        isLoading: false,
      });

      const { result } = renderHook(() => useTimerOptions(), { wrapper });

      act(() => {
        result.current.setShouldPulse(true);
      });

      expect(mockUpdateValue).toHaveBeenCalledWith('shouldPulse', true);
    });
  });

  describe('Helper functions', () => {
    it('saveActivityDuration merges into activityDurations', () => {
      const mockUpdateValue = jest.fn();
      require('../../src/hooks/usePersistedState').usePersistedObject.mockReturnValue({
        values: {
          shouldPulse: false,
          showActivities: true,
          showPalettes: true,
          useMinimalInterface: true,
          showDigitalTimer: false,
          showActivityEmoji: true,
          keepAwakeEnabled: true,
          showRotationToggle: true,
          clockwise: false,
          scaleMode: '45min',
          currentActivity: 'work',
          currentDuration: 2700,
          favoriteActivities: ['work', 'break', 'meditation'],
          selectedSoundId: 'bell_classic',
          activityDurations: { work: 1500 },
          completedTimersCount: 0,
          hasSeenTwoTimersModal: false,
        },
        updateValue: mockUpdateValue,
        isLoading: false,
      });

      const { result } = renderHook(() => useTimerOptions(), { wrapper });

      act(() => {
        result.current.saveActivityDuration('meditation', 1200);
      });

      expect(mockUpdateValue).toHaveBeenCalledWith('activityDurations', {
        work: 1500,
        meditation: 1200,
      });
    });

    it('incrementCompletedTimers returns new count', () => {
      const mockUpdateValue = jest.fn();
      require('../../src/hooks/usePersistedState').usePersistedObject.mockReturnValue({
        values: {
          shouldPulse: false,
          showActivities: true,
          showPalettes: true,
          useMinimalInterface: true,
          showDigitalTimer: false,
          showActivityEmoji: true,
          keepAwakeEnabled: true,
          showRotationToggle: true,
          clockwise: false,
          scaleMode: '45min',
          currentActivity: 'work',
          currentDuration: 2700,
          favoriteActivities: ['work', 'break', 'meditation'],
          selectedSoundId: 'bell_classic',
          activityDurations: {},
          completedTimersCount: 1,
          hasSeenTwoTimersModal: false,
        },
        updateValue: mockUpdateValue,
        isLoading: false,
      });

      const { result } = renderHook(() => useTimerOptions(), { wrapper });

      let newCount;
      act(() => {
        newCount = result.current.incrementCompletedTimers();
      });

      expect(newCount).toBe(2);
      expect(mockUpdateValue).toHaveBeenCalledWith('completedTimersCount', 2);
    });
  });

  describe('Error handling', () => {
    it('throws error when used outside provider', () => {
      // This test needs to be in a try-catch because renderHook will throw
      expect(() => {
        renderHook(() => useTimerOptions());
      }).toThrow('useTimerOptions must be used within TimerOptionsProvider');
    });
  });

  describe('Loading state', () => {
    it('returns isLoading from persisted state', () => {
      require('../../src/hooks/usePersistedState').usePersistedObject.mockReturnValue({
        values: {
          shouldPulse: false,
          showActivities: true,
          showPalettes: true,
          useMinimalInterface: true,
          showDigitalTimer: false,
          showActivityEmoji: true,
          keepAwakeEnabled: true,
          showRotationToggle: true,
          clockwise: false,
          scaleMode: '45min',
          currentActivity: 'work',
          currentDuration: 2700,
          favoriteActivities: ['work', 'break', 'meditation'],
          selectedSoundId: 'bell_classic',
          activityDurations: {},
          completedTimersCount: 0,
          hasSeenTwoTimersModal: false,
        },
        updateValue: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useTimerOptions(), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
