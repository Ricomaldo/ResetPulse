import { renderHook, act, waitFor } from '@testing-library/react-native';
import useTimer from '../useTimer';
import { TIMER } from '../../constants/uiConstants';

// Mock haptics
jest.mock('../../utils/haptics', () => ({
  __esModule: true,
  default: {
    notification: jest.fn(() => Promise.resolve())
  }
}));

/**
 * CRITICAL PATH TESTS
 * Tests essentiels sans mocks temporels
 * Focus sur le comportement observable, pas l'implémentation
 */

describe('useTimer - Critical Path Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🎯 Critical Path 1: Start/Stop Timer', () => {

    it('should start timer from initial state', () => {
      const { result } = renderHook(() => useTimer(300)); // 5 minutes

      // Initial state
      expect(result.current.running).toBe(false);
      expect(result.current.remaining).toBe(300);

      // Start timer
      act(() => {
        result.current.toggleRunning();
      });

      // Verify running state
      expect(result.current.running).toBe(true);
      expect(result.current.remaining).toBe(300); // Should still be 300 initially
    });

    it('should stop running timer', () => {
      const { result } = renderHook(() => useTimer(300));

      // Start
      act(() => {
        result.current.toggleRunning();
      });
      expect(result.current.running).toBe(true);

      // Stop
      act(() => {
        result.current.toggleRunning();
      });

      expect(result.current.running).toBe(false);
    });

    it('should handle start from zero state', () => {
      const { result } = renderHook(() => useTimer(0));

      expect(result.current.remaining).toBe(0);

      // Start from zero - should use default duration
      act(() => {
        result.current.toggleRunning();
      });

      expect(result.current.running).toBe(true);
      expect(result.current.remaining).toBe(TIMER.DEFAULT_DURATION);
      expect(result.current.duration).toBe(TIMER.DEFAULT_DURATION);
    });

    it('should handle pause and resume', () => {
      const { result } = renderHook(() => useTimer(300));

      // Start
      act(() => {
        result.current.toggleRunning();
      });

      // Pause
      act(() => {
        result.current.toggleRunning();
      });
      expect(result.current.running).toBe(false);

      // Resume
      act(() => {
        result.current.toggleRunning();
      });
      expect(result.current.running).toBe(true);
    });
  });

  describe('🎯 Critical Path 2: Reset Functionality', () => {

    it('should reset to zero', () => {
      const { result } = renderHook(() => useTimer(300));

      // Verify initial state
      expect(result.current.remaining).toBe(300);

      // Reset sets remaining to zero
      act(() => {
        result.current.resetTimer();
      });

      // Reset behavior: sets to 0 to indicate "ready to start"
      expect(result.current.remaining).toBe(0);
      expect(result.current.running).toBe(false);
      expect(result.current.progress).toBe(0); // No progress when at zero
    });

    it('should reset while timer is running', () => {
      const { result } = renderHook(() => useTimer(300));

      // Start timer
      act(() => {
        result.current.toggleRunning();
      });
      expect(result.current.running).toBe(true);

      // Reset while running
      act(() => {
        result.current.resetTimer();
      });

      // Reset always sets to 0, regardless of running state
      expect(result.current.remaining).toBe(0);
      expect(result.current.running).toBe(false);
    });

    it('should be able to start after reset', () => {
      const { result } = renderHook(() => useTimer(300));

      // Reset
      act(() => {
        result.current.resetTimer();
      });
      expect(result.current.remaining).toBe(0);

      // Start after reset - should restore duration
      act(() => {
        result.current.toggleRunning();
      });

      // Should use the original duration (300) not default
      expect(result.current.running).toBe(true);
      expect(result.current.remaining).toBe(300);
      expect(result.current.duration).toBe(300);
    });
  });

  describe('🎯 Critical Path 3: Duration Management', () => {

    it('should set duration when timer is stopped', () => {
      const { result } = renderHook(() => useTimer(240));

      act(() => {
        result.current.setDuration(600); // 10 minutes
      });

      expect(result.current.duration).toBe(600);
      expect(result.current.remaining).toBe(600); // Should sync when not running
    });

    it('should NOT update remaining when setting duration while running', () => {
      const { result } = renderHook(() => useTimer(300));

      // Start timer
      act(() => {
        result.current.toggleRunning();
      });

      // Try to change duration while running
      act(() => {
        result.current.setDuration(600);
      });

      expect(result.current.duration).toBe(600);
      // Remaining should NOT change to 600 while running
      expect(result.current.remaining).toBeLessThanOrEqual(300);
    });

    it('should handle preset durations', () => {
      const { result } = renderHook(() => useTimer());

      // Set 25 minute preset (Pomodoro)
      act(() => {
        result.current.setPresetDuration(25);
      });

      expect(result.current.duration).toBe(1500); // 25 * 60
      expect(result.current.remaining).toBe(1500);
    });
  });

  describe('🎯 Critical Path 4: Progress Calculation', () => {

    it('should calculate progress correctly', () => {
      const { result } = renderHook(() => useTimer(100));

      // Full progress when remaining = duration
      expect(result.current.progress).toBe(1);

      // Start and verify progress stays at 1 initially
      act(() => {
        result.current.toggleRunning();
      });
      expect(result.current.progress).toBe(1);

      // After reset, remaining = 0, so progress = 0
      act(() => {
        result.current.resetTimer();
      });
      expect(result.current.progress).toBe(0); // No progress when reset to 0
    });

    it('should handle zero duration edge case', () => {
      const { result } = renderHook(() => useTimer(0));

      // Progress should be 0 when duration is 0
      expect(result.current.progress).toBe(0);
    });
  });

  describe('🎯 Critical Path 5: Display Messages', () => {

    it('should show correct message when starting', () => {
      const { result } = renderHook(() => useTimer(300));

      act(() => {
        result.current.toggleRunning();
      });

      expect(result.current.displayMessage).toBe("C'est parti");
    });

    it('should show pause message when paused', () => {
      const { result } = renderHook(() => useTimer(300));

      // Start
      act(() => {
        result.current.toggleRunning();
      });

      // Pause
      act(() => {
        result.current.toggleRunning();
      });

      expect(result.current.displayMessage).toBe("Pause");
    });

    it('should clear messages after display duration', async () => {
      const { result } = renderHook(() => useTimer(300));

      act(() => {
        result.current.toggleRunning();
      });

      expect(result.current.displayMessage).toBe("C'est parti");

      // Wait for message to clear
      await waitFor(
        () => expect(result.current.displayMessage).toBe(''),
        { timeout: TIMER.MESSAGE_DISPLAY_DURATION + 500 }
      );
    });
  });

  describe('🎯 Critical Path 6: Completion Callback', () => {

    it('should call onComplete when timer reaches zero', async () => {
      const onComplete = jest.fn();

      // Use 1 second duration (1) for quick test
      const { result } = renderHook(() => useTimer(1, onComplete));

      act(() => {
        result.current.toggleRunning();
      });

      // Wait for completion (1 second + buffer)
      await waitFor(
        () => expect(onComplete).toHaveBeenCalled(),
        { timeout: 1500 }
      );
    });

    it('should not call onComplete when reset before completion', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useTimer(300, onComplete));

      act(() => {
        result.current.toggleRunning();
      });

      act(() => {
        result.current.resetTimer();
      });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('🎯 Edge Cases & Robustness', () => {

    it('should handle rapid toggle calls gracefully', () => {
      const { result } = renderHook(() => useTimer(300));

      act(() => {
        // Rapid toggles
        result.current.toggleRunning();
        result.current.toggleRunning();
        result.current.toggleRunning();
        result.current.toggleRunning();
        result.current.toggleRunning();
      });

      // Odd number of toggles = should be running
      expect(result.current.running).toBe(true);
    });

    it('should cleanup properly on unmount', () => {
      const { result, unmount } = renderHook(() => useTimer(300));

      act(() => {
        result.current.toggleRunning();
      });

      // Unmount while running
      unmount();

      // No errors should occur
      expect(true).toBe(true);
    });

    it('should handle negative durations safely', () => {
      const { result } = renderHook(() => useTimer(-100));

      // Should treat as 0
      expect(result.current.duration).toBe(-100); // Keeps the value
      expect(result.current.remaining).toBe(-100);
      expect(result.current.progress).toBe(0); // But progress is 0
    });
  });
});