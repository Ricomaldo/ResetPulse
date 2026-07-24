// Tests for useRituals hook - C6 (ADR-015)
import { renderHook, act } from '../test-utils';
import { useRituals } from '../../src/hooks/useRituals';
import { MAX_DURATION, MIN_DURATION } from '../../src/config/durations';

const mockSetRituals = jest.fn((updater) => {
  if (typeof updater === 'function') {
    return updater([]);
  }
  return updater;
});

jest.mock('../../src/hooks/usePersistedState', () => ({
  usePersistedState: jest.fn(() => [
    [], // rituals
    mockSetRituals,
    false, // isLoading
  ]),
}));

describe('useRituals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
      [],
      mockSetRituals,
      false,
    ]);
  });

  describe('Initialization', () => {
    it('provides all expected methods', () => {
      const { result } = renderHook(() => useRituals());

      expect(typeof result.current.createRitual).toBe('function');
      expect(typeof result.current.updateRitual).toBe('function');
      expect(typeof result.current.deleteRitual).toBe('function');
      expect(typeof result.current.getRitualById).toBe('function');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('createRitual', () => {
    it('creates a ritual with a unique id and the given fields', () => {
      const { result } = renderHook(() => useRituals());

      let created;
      act(() => {
        created = result.current.createRitual({
          name: 'Lecture',
          activityId: 'reading',
          colorIndex: 1,
          duration: 1800,
          soundId: 'bell_classic',
        });
      });

      expect(created.id).toMatch(/^ritual_\d+$/);
      expect(created.name).toBe('Lecture');
      expect(created.activityId).toBe('reading');
      expect(created.colorIndex).toBe(1);
      expect(created.duration).toBe(1800);
      expect(created.soundId).toBe('bell_classic');
      expect(created.steps).toEqual([]);
    });

    it('clamps duration and colorIndex on creation', () => {
      const { result } = renderHook(() => useRituals());

      let created;
      act(() => {
        created = result.current.createRitual({
          name: 'Trop long',
          activityId: 'work',
          colorIndex: 99,
          duration: 999999,
          soundId: 'timer_complete',
        });
      });

      expect(created.duration).toBe(MAX_DURATION);
      expect(created.colorIndex).toBe(3);
    });

    it('calls setRituals to add the ritual', () => {
      const { result } = renderHook(() => useRituals());

      act(() => {
        result.current.createRitual({
          name: 'Test',
          activityId: 'work',
          colorIndex: 0,
          duration: 600,
          soundId: 'timer_complete',
        });
      });

      expect(mockSetRituals).toHaveBeenCalled();
    });
  });

  describe('updateRitual', () => {
    const existing = {
      id: 'ritual_123',
      name: 'Deep Work',
      activityId: 'work',
      colorIndex: 3,
      duration: 3000,
      soundId: 'timer_complete',
      steps: [],
    };

    it('merges updates into the existing ritual', () => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [existing],
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals());

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater([existing]);
      });

      act(() => {
        result.current.updateRitual('ritual_123', { name: 'Deep Work XL', duration: 3600 });
      });

      expect(updaterResult[0].name).toBe('Deep Work XL');
      expect(updaterResult[0].duration).toBe(3600);
      expect(updaterResult[0].activityId).toBe('work'); // untouched fields survive
    });

    it('clamps duration when updated above MAX_DURATION', () => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [existing],
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals());

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater([existing]);
      });

      act(() => {
        result.current.updateRitual('ritual_123', { duration: 999999 });
      });

      expect(updaterResult[0].duration).toBe(MAX_DURATION);
    });

    it('leaves other rituals untouched', () => {
      const other = { ...existing, id: 'ritual_456', name: 'Other' };
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        [existing, other],
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals());

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater([existing, other]);
      });

      act(() => {
        result.current.updateRitual('ritual_123', { name: 'Changed' });
      });

      expect(updaterResult[1]).toEqual(other);
    });
  });

  describe('deleteRitual', () => {
    it('removes the ritual from the list', () => {
      const rituals = [
        { id: 'ritual_1', name: 'A' },
        { id: 'ritual_2', name: 'B' },
      ];

      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        rituals,
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals());

      let updaterResult;
      mockSetRituals.mockImplementation((updater) => {
        updaterResult = updater(rituals);
      });

      act(() => {
        result.current.deleteRitual('ritual_1');
      });

      expect(updaterResult).toHaveLength(1);
      expect(updaterResult[0].id).toBe('ritual_2');
    });
  });

  describe('getRitualById', () => {
    it('returns the ritual when found', () => {
      const rituals = [
        { id: 'ritual_a', name: 'A' },
        { id: 'ritual_b', name: 'B' },
      ];

      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        rituals,
        mockSetRituals,
        false,
      ]);

      const { result } = renderHook(() => useRituals());

      expect(result.current.getRitualById('ritual_b').name).toBe('B');
    });

    it('returns undefined when not found', () => {
      const { result } = renderHook(() => useRituals());
      expect(result.current.getRitualById('nope')).toBeUndefined();
    });
  });

  describe('Default seed', () => {
    it('is used as the persisted-state default value (3 base rituals)', () => {
      const usePersistedStateMock = require('../../src/hooks/usePersistedState').usePersistedState;
      renderHook(() => useRituals());

      const defaultArg = usePersistedStateMock.mock.calls[usePersistedStateMock.mock.calls.length - 1][1];
      expect(defaultArg).toHaveLength(3);
      expect(defaultArg.every((r) => r.steps.length === 0)).toBe(true);
    });
  });

  describe('Guard: MIN_DURATION floor is respected', () => {
    it('never returns a duration below MIN_DURATION on create', () => {
      const { result } = renderHook(() => useRituals());

      let created;
      act(() => {
        created = result.current.createRitual({
          name: 'Trop court',
          activityId: 'work',
          colorIndex: 0,
          duration: 0,
          soundId: 'timer_complete',
        });
      });

      expect(created.duration).toBe(MIN_DURATION);
    });
  });
});
