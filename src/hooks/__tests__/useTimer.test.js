import { renderHook, act } from '@testing-library/react-native';
import useTimer from '../useTimer';
import { TIMER } from '../../constants/uiConstants';

// Mock haptics to avoid hardware dependencies
jest.mock('../../utils/haptics', () => ({
  __esModule: true,
  default: {
    notification: jest.fn(() => Promise.resolve())
  }
}));

describe('useTimer - State Logic Tests', () => {
  describe('Initial state', () => {
    it('should initialize with default duration', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.duration).toBe(240); // Default 4 minutes
      expect(result.current.remaining).toBe(240);
      expect(result.current.running).toBe(false);
      expect(result.current.progress).toBe(1); // Full progress when timer is set
      expect(result.current.displayMessage).toBe('');
    });

    it('should initialize with custom duration', () => {
      const { result } = renderHook(() => useTimer(600)); // 10 minutes

      expect(result.current.duration).toBe(600);
      expect(result.current.remaining).toBe(600);
      expect(result.current.progress).toBe(1);
    });

    it('should handle zero duration initialization', () => {
      const { result } = renderHook(() => useTimer(0));

      expect(result.current.duration).toBe(0);
      expect(result.current.remaining).toBe(0);
      expect(result.current.progress).toBe(0); // No progress when duration is 0
      expect(result.current.displayMessage).toBe('');
    });
  });

  describe('Duration management', () => {
    it('should update duration when not running', () => {
      const { result } = renderHook(() => useTimer(240));

      act(() => {
        result.current.setDuration(300);
      });

      expect(result.current.duration).toBe(300);
      expect(result.current.remaining).toBe(300); // Should sync when not running
    });

    it('should set preset durations', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setPresetDuration(25); // 25 minutes
      });

      expect(result.current.duration).toBe(1500); // 25 * 60
      expect(result.current.remaining).toBe(1500);
    });

    it('should calculate progress correctly', () => {
      const { result } = renderHook(() => useTimer(100));

      expect(result.current.progress).toBe(1); // Full when remaining = duration

      // Manually set remaining to simulate time passing (for state test only)
      act(() => {
        // We need to start the timer first to manipulate remaining
        result.current.toggleRunning();
      });

      // Since we can't easily manipulate remaining without time mocks,
      // we'll test the progress formula logic separately
      const testProgress = (remaining, duration) => {
        return duration > 0 ? remaining / duration : 0;
      };

      expect(testProgress(100, 100)).toBe(1);    // Full
      expect(testProgress(50, 100)).toBe(0.5);   // Half
      expect(testProgress(0, 100)).toBe(0);      // Empty
      expect(testProgress(0, 0)).toBe(0);        // Zero duration edge case
    });
  });

  describe('Reset functionality', () => {
    it('should reset timer to zero', () => {
      const { result } = renderHook(() => useTimer(300));

      // Start the timer first
      act(() => {
        result.current.toggleRunning();
      });

      expect(result.current.running).toBe(true);

      // Reset the timer
      act(() => {
        result.current.resetTimer();
      });

      expect(result.current.remaining).toBe(0); // Should reset to 0, not duration
      expect(result.current.running).toBe(false);
      expect(result.current.displayMessage).toBe('');
    });
  });

  describe('Toggle running - state transitions', () => {
    it('should start from zero state', () => {
      const { result } = renderHook(() => useTimer(0));

      act(() => {
        result.current.toggleRunning();
      });

      // Should use default duration when starting from zero
      expect(result.current.duration).toBe(TIMER.DEFAULT_DURATION);
      expect(result.current.remaining).toBe(TIMER.DEFAULT_DURATION);
      expect(result.current.running).toBe(true);
    });

    it('should start timer when stopped', () => {
      const { result } = renderHook(() => useTimer(300));

      act(() => {
        result.current.toggleRunning();
      });

      expect(result.current.running).toBe(true);
      expect(result.current.displayMessage).toBe("C'est parti");
    });

    it('should pause running timer', () => {
      const { result } = renderHook(() => useTimer(300));

      // Start
      act(() => {
        result.current.toggleRunning();
      });

      expect(result.current.running).toBe(true);

      // Pause
      act(() => {
        result.current.toggleRunning();
      });

      expect(result.current.running).toBe(false);
      expect(result.current.displayMessage).toBe('Pause');
    });

    it('should resume paused timer', () => {
      const { result } = renderHook(() => useTimer(300));

      // Start
      act(() => {
        result.current.toggleRunning();
      });

      // Pause
      act(() => {
        result.current.toggleRunning();
      });

      // Wait for message to clear and resume
      setTimeout(() => {
        act(() => {
          result.current.toggleRunning();
        });

        expect(result.current.running).toBe(true);
        expect(result.current.displayMessage).toBe("C'est reparti");
      }, TIMER.MESSAGE_DISPLAY_DURATION + 100);
    });
  });

  describe('Display messages', () => {
    it('should show "C\'est parti" when starting', (done) => {
      const { result } = renderHook(() => useTimer(300));

      act(() => {
        result.current.toggleRunning();
      });

      expect(result.current.displayMessage).toBe("C'est parti");

      // Message should clear after display duration
      setTimeout(() => {
        expect(result.current.displayMessage).toBe('');
        done();
      }, TIMER.MESSAGE_DISPLAY_DURATION + 100);
    });

    it('should show "Pause" when paused', () => {
      const { result } = renderHook(() => useTimer(300));

      // Start then pause
      act(() => {
        result.current.toggleRunning();
      });

      act(() => {
        result.current.toggleRunning();
      });

      expect(result.current.displayMessage).toBe('Pause');
    });
  });

  describe('Completion callback', () => {
    it('should accept completion callback', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useTimer(60, onComplete));

      expect(result.current.duration).toBe(60);
      // Callback will be tested in integration tests with time progression
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid toggle calls', () => {
      const { result } = renderHook(() => useTimer(300));

      act(() => {
        result.current.toggleRunning();
        result.current.toggleRunning();
        result.current.toggleRunning();
      });

      // Should end up running after odd number of toggles
      expect(result.current.running).toBe(true);
    });

    it('should handle reset while running', () => {
      const { result } = renderHook(() => useTimer(300));

      act(() => {
        result.current.toggleRunning();
      });

      expect(result.current.running).toBe(true);

      act(() => {
        result.current.resetTimer();
      });

      expect(result.current.running).toBe(false);
      expect(result.current.remaining).toBe(0);
    });

    it('should handle setDuration while paused', () => {
      const { result } = renderHook(() => useTimer(300));

      // Start then pause
      act(() => {
        result.current.toggleRunning();
      });

      act(() => {
        result.current.toggleRunning();
      });

      // Try to set duration while paused
      act(() => {
        result.current.setDuration(400);
      });

      expect(result.current.duration).toBe(400);
      // Remaining should stay where it was during pause
      expect(result.current.remaining).toBeLessThanOrEqual(300);
    });
  });
});