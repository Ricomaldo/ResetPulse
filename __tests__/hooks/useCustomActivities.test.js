// Tests for useCustomActivities hook - P0
import { renderHook, act } from '../test-utils';
import { useCustomActivities } from '../../src/hooks/useCustomActivities';

// Mock usePersistedState to simulate AsyncStorage without actual storage
const mockSetCustomActivities = jest.fn((updater) => {
  if (typeof updater === 'function') {
    return updater([]);
  }
  return updater;
});

jest.mock('../../src/hooks/usePersistedState', () => ({
  usePersistedState: jest.fn(() => [
    [], // customActivities
    mockSetCustomActivities, // setCustomActivities
    false, // isLoading
  ]),
}));

describe('useCustomActivities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock to return empty array
    require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
      [],
      mockSetCustomActivities,
      false,
    ]);
  });

  describe('Initialization', () => {
    it('initializes with empty activities array', () => {
      const { result } = renderHook(() => useCustomActivities());

      expect(result.current.customActivities).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('provides all expected methods', () => {
      const { result } = renderHook(() => useCustomActivities());

      expect(typeof result.current.createActivity).toBe('function');
      expect(typeof result.current.updateActivity).toBe('function');
      expect(typeof result.current.deleteActivity).toBe('function');
      expect(typeof result.current.incrementUsage).toBe('function');
      expect(typeof result.current.getActivityById).toBe('function');
      expect(typeof result.current.getCustomActivitiesCount).toBe('function');
    });
  });

  describe('createActivity', () => {
    it('creates activity with unique id', () => {
      const { result } = renderHook(() => useCustomActivities());

      let newActivity;
      act(() => {
        newActivity = result.current.createActivity('🎯', 'Focus', 1500);
      });

      expect(newActivity.id).toMatch(/^custom_\d+$/);
      expect(newActivity.emoji).toBe('🎯');
      expect(newActivity.name).toBe('Focus');
      expect(newActivity.label).toBe('Focus');
      expect(newActivity.defaultDuration).toBe(1500);
    });

    it('creates activity with correct default properties', () => {
      const { result } = renderHook(() => useCustomActivities());

      let newActivity;
      act(() => {
        newActivity = result.current.createActivity('📚', 'Study', 2700);
      });

      expect(newActivity.isPremium).toBe(true);
      expect(newActivity.isCustom).toBe(true);
      expect(newActivity.timesUsed).toBe(0);
      expect(newActivity.suggestedColor).toBe('calm');
      expect(newActivity.pulseDuration).toBe(800);
      expect(newActivity.createdAt).toBeDefined();
    });

    it('calls setCustomActivities to add activity', () => {
      const { result } = renderHook(() => useCustomActivities());

      act(() => {
        result.current.createActivity('🎮', 'Gaming', 3600);
      });

      expect(mockSetCustomActivities).toHaveBeenCalled();
    });
  });

  describe('updateActivity', () => {
    it('updates existing activity fields', () => {
      // Setup with existing activity
      const existingActivity = {
        id: 'custom_123',
        emoji: '🎯',
        name: 'Focus',
        label: 'Focus',
        defaultDuration: 1500,
        isPremium: true,
        isCustom: true,
        timesUsed: 5,
      };

      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [existingActivity],
        mockSetCustomActivities,
        false,
      ]);

      const { result } = renderHook(() => useCustomActivities());

      act(() => {
        result.current.updateActivity('custom_123', { name: 'Deep Focus', defaultDuration: 1800 });
      });

      expect(mockSetCustomActivities).toHaveBeenCalled();
    });

    it('syncs label with name when name is updated', () => {
      const existingActivity = {
        id: 'custom_456',
        emoji: '📝',
        name: 'Notes',
        label: 'Notes',
        defaultDuration: 900,
      };

      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [existingActivity],
        mockSetCustomActivities,
        false,
      ]);

      const { result } = renderHook(() => useCustomActivities());

      // Capture the updater function to verify behavior
      let updaterResult;
      mockSetCustomActivities.mockImplementation((updater) => {
        if (typeof updater === 'function') {
          updaterResult = updater([existingActivity]);
        }
      });

      act(() => {
        result.current.updateActivity('custom_456', { name: 'Meeting Notes' });
      });

      expect(updaterResult[0].name).toBe('Meeting Notes');
      expect(updaterResult[0].label).toBe('Meeting Notes');
    });
  });

  describe('deleteActivity', () => {
    it('removes activity from list', () => {
      const activities = [
        { id: 'custom_1', name: 'Activity 1' },
        { id: 'custom_2', name: 'Activity 2' },
      ];

      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        activities,
        mockSetCustomActivities,
        false,
      ]);

      const { result } = renderHook(() => useCustomActivities());

      let updaterResult;
      mockSetCustomActivities.mockImplementation((updater) => {
        if (typeof updater === 'function') {
          updaterResult = updater(activities);
        }
      });

      act(() => {
        result.current.deleteActivity('custom_1');
      });

      expect(updaterResult).toHaveLength(1);
      expect(updaterResult[0].id).toBe('custom_2');
    });
  });

  describe('incrementUsage', () => {
    it('increments timesUsed counter', () => {
      const activity = {
        id: 'custom_test',
        name: 'Test',
        timesUsed: 3,
      };

      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [activity],
        mockSetCustomActivities,
        false,
      ]);

      const { result } = renderHook(() => useCustomActivities());

      let updaterResult;
      mockSetCustomActivities.mockImplementation((updater) => {
        if (typeof updater === 'function') {
          updaterResult = updater([activity]);
        }
      });

      act(() => {
        result.current.incrementUsage('custom_test');
      });

      expect(updaterResult[0].timesUsed).toBe(4);
    });

    it('handles missing timesUsed (defaults to 0 then 1)', () => {
      const activity = {
        id: 'custom_new',
        name: 'New Activity',
        // timesUsed not set
      };

      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [activity],
        mockSetCustomActivities,
        false,
      ]);

      const { result } = renderHook(() => useCustomActivities());

      let updaterResult;
      mockSetCustomActivities.mockImplementation((updater) => {
        if (typeof updater === 'function') {
          updaterResult = updater([activity]);
        }
      });

      act(() => {
        result.current.incrementUsage('custom_new');
      });

      expect(updaterResult[0].timesUsed).toBe(1);
    });
  });

  describe('getActivityById', () => {
    it('returns activity when found', () => {
      const activities = [
        { id: 'custom_a', name: 'Activity A' },
        { id: 'custom_b', name: 'Activity B' },
      ];

      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        activities,
        mockSetCustomActivities,
        false,
      ]);

      const { result } = renderHook(() => useCustomActivities());

      const found = result.current.getActivityById('custom_b');

      expect(found).toBeDefined();
      expect(found.name).toBe('Activity B');
    });

    it('returns undefined when not found', () => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [{ id: 'custom_x', name: 'X' }],
        mockSetCustomActivities,
        false,
      ]);

      const { result } = renderHook(() => useCustomActivities());

      const found = result.current.getActivityById('nonexistent');

      expect(found).toBeUndefined();
    });
  });

  describe('getCustomActivitiesCount', () => {
    it('returns correct count', () => {
      const activities = [
        { id: 'custom_1' },
        { id: 'custom_2' },
        { id: 'custom_3' },
      ];

      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        activities,
        mockSetCustomActivities,
        false,
      ]);

      const { result } = renderHook(() => useCustomActivities());

      expect(result.current.getCustomActivitiesCount()).toBe(3);
    });

    it('returns 0 for empty array', () => {
      const { result } = renderHook(() => useCustomActivities());

      expect(result.current.getCustomActivitiesCount()).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('handles emoji with multi-codepoint characters', () => {
      const { result } = renderHook(() => useCustomActivities());

      let newActivity;
      act(() => {
        // Emoji with skin tone modifier (multi-codepoint)
        newActivity = result.current.createActivity('👨‍🍳', 'Chef', 1800);
      });

      expect(newActivity.emoji).toBe('👨‍🍳');
    });

    it('handles long activity names', () => {
      const { result } = renderHook(() => useCustomActivities());

      let newActivity;
      act(() => {
        newActivity = result.current.createActivity('📚', 'A'.repeat(50), 1500);
      });

      // The hook should accept the name (validation is done at UI level)
      expect(newActivity.name.length).toBe(50);
    });

    it('handles special characters in activity names', () => {
      const { result } = renderHook(() => useCustomActivities());

      let newActivity;
      act(() => {
        newActivity = result.current.createActivity('🏃', 'Run & Stretch!', 600);
      });

      expect(newActivity.name).toBe('Run & Stretch!');
    });
  });
});
