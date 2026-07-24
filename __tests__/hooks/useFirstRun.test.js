// Tests for useFirstRun hook - Lot 2, C7 (Première fois)
import { renderHook, act } from '../test-utils';
import { useFirstRun } from '../../src/hooks/useFirstRun';

const mockSetHasSeenFirstRun = jest.fn();

jest.mock('../../src/hooks/usePersistedState', () => ({
  usePersistedState: jest.fn(() => [false, mockSetHasSeenFirstRun, false]),
}));

describe('useFirstRun', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
      false,
      mockSetHasSeenFirstRun,
      false,
    ]);
  });

  describe('Flag persisté', () => {
    it('uses the @ResetPulse:hasSeenFirstRun storage key with false as default', () => {
      const usePersistedStateMock = require('../../src/hooks/usePersistedState').usePersistedState;
      renderHook(() => useFirstRun());

      expect(usePersistedStateMock).toHaveBeenCalledWith('@ResetPulse:hasSeenFirstRun', false);
    });

    it('never renders a moment while loading, even if not yet seen', () => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        false,
        mockSetHasSeenFirstRun,
        true, // isLoading
      ]);

      const { result } = renderHook(() => useFirstRun());

      expect(result.current.moment).toBeNull();
    });

    it('never renders a moment once hasSeenFirstRun is true', () => {
      require('../../src/hooks/usePersistedState').usePersistedState.mockImplementation(() => [
        true,
        mockSetHasSeenFirstRun,
        false,
      ]);

      const { result } = renderHook(() => useFirstRun());

      expect(result.current.moment).toBeNull();
    });
  });

  describe('Progression des moments', () => {
    it('starts at moment 1 (welcome) with nothing touched', () => {
      const { result } = renderHook(() => useFirstRun());
      expect(result.current.moment).toBe(1);
    });

    it('advances to moment 2 (companion) once the activity is touched', () => {
      const { result } = renderHook(() => useFirstRun());

      act(() => {
        result.current.markActivityTouched();
      });

      expect(result.current.moment).toBe(2);
    });

    it('advances to moment 3 (dial/colors) once activity AND dial are touched', () => {
      const { result } = renderHook(() => useFirstRun());

      act(() => {
        result.current.markActivityTouched();
      });
      act(() => {
        result.current.markDialTouched();
      });

      expect(result.current.moment).toBe(3);
    });

    it('does not advance to moment 3 from a dial touch alone (activity untouched)', () => {
      const { result } = renderHook(() => useFirstRun());

      act(() => {
        result.current.markDialTouched();
      });

      expect(result.current.moment).toBe(1);
    });

    it('jumps straight to moment 4 (ready) once a color is chosen, even without dial touch', () => {
      const { result } = renderHook(() => useFirstRun());

      act(() => {
        result.current.markActivityTouched();
      });
      act(() => {
        result.current.markColorTouched();
      });

      expect(result.current.moment).toBe(4);
    });

    it('jumps to moment 4 on color choice alone — never blocks on a required order (ADR-014)', () => {
      const { result } = renderHook(() => useFirstRun());

      act(() => {
        result.current.markColorTouched();
      });

      expect(result.current.moment).toBe(4);
    });
  });

  describe('Complétion et skip', () => {
    it('completeFirstRun persists the flag as true', () => {
      const { result } = renderHook(() => useFirstRun());

      act(() => {
        result.current.completeFirstRun();
      });

      expect(mockSetHasSeenFirstRun).toHaveBeenCalledWith(true);
    });

    it('skipFirstRun also persists the flag as true (same gate, no distinction)', () => {
      const { result } = renderHook(() => useFirstRun());

      act(() => {
        result.current.skipFirstRun();
      });

      expect(mockSetHasSeenFirstRun).toHaveBeenCalledWith(true);
    });
  });
});
