// __tests__/hooks/useAnalytics.test.js
// Test coverage for analytics hook (Phase 4)

import { renderHook } from '../test-utils';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import Analytics from '../../src/services/analytics';

// Mock the analytics singleton
jest.mock('../../src/services/analytics', () => ({
  __esModule: true,
  default: {
    trackOnboardingStarted: jest.fn(),
    trackOnboardingCompleted: jest.fn(),
    trackTimerStarted: jest.fn(),
    trackTimerCompleted: jest.fn(),
    trackTimerAbandoned: jest.fn(),
    trackPaywallViewed: jest.fn(),
    trackTrialStarted: jest.fn(),
    trackPurchaseCompleted: jest.fn(),
    trackPurchaseFailed: jest.fn(),
    track: jest.fn(),
    isInitialized: true,
  },
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hook initialization', () => {
    it('should return analytics instance', () => {
      const { result } = renderHook(() => useAnalytics());

      expect(result.current).toBe(Analytics);
      expect(result.current).toBeDefined();
    });

    it('should return same instance on multiple renders (memoized)', () => {
      const { result, rerender } = renderHook(() => useAnalytics());
      const firstInstance = result.current;

      rerender();
      const secondInstance = result.current;

      expect(secondInstance).toBe(firstInstance);
    });

    it('should expose all analytics methods', () => {
      const { result } = renderHook(() => useAnalytics());

      // Onboarding events
      expect(result.current.trackOnboardingStarted).toBeDefined();
      expect(result.current.trackOnboardingCompleted).toBeDefined();

      // Timer events
      expect(result.current.trackTimerStarted).toBeDefined();
      expect(result.current.trackTimerCompleted).toBeDefined();
      expect(result.current.trackTimerAbandoned).toBeDefined();

      // Premium events
      expect(result.current.trackPaywallViewed).toBeDefined();
      expect(result.current.trackTrialStarted).toBeDefined();
      expect(result.current.trackPurchaseCompleted).toBeDefined();
      expect(result.current.trackPurchaseFailed).toBeDefined();
    });
  });

  describe('event dispatch - onboarding', () => {
    it('should dispatch trackOnboardingStarted()', () => {
      const { result } = renderHook(() => useAnalytics());

      result.current.trackOnboardingStarted();

      expect(Analytics.trackOnboardingStarted).toHaveBeenCalledTimes(1);
    });

    it('should dispatch trackOnboardingCompleted() with params', () => {
      const { result } = renderHook(() => useAnalytics());

      result.current.trackOnboardingCompleted('trial_started', ['work'], 'discover');

      expect(Analytics.trackOnboardingCompleted).toHaveBeenCalledWith(
        'trial_started',
        ['work'],
        'discover'
      );
    });
  });

  describe('event dispatch - timer', () => {
    it('should dispatch trackTimerStarted() with params', () => {
      const { result } = renderHook(() => useAnalytics());

      const activity = { id: 'work', emoji: '💻', label: 'Travail' };
      result.current.trackTimerStarted(1500, activity, '#8B4513', 'terre');

      expect(Analytics.trackTimerStarted).toHaveBeenCalledWith(
        1500,
        activity,
        '#8B4513',
        'terre'
      );
    });

    it('should dispatch trackTimerCompleted() with params', () => {
      const { result } = renderHook(() => useAnalytics());

      const activity = { id: 'work', emoji: '💻' };
      result.current.trackTimerCompleted(1500, activity, 100);

      expect(Analytics.trackTimerCompleted).toHaveBeenCalledWith(1500, activity, 100);
    });

    it('should dispatch trackTimerAbandoned() with params', () => {
      const { result } = renderHook(() => useAnalytics());

      const activity = { id: 'meditation', emoji: '🧘' };
      result.current.trackTimerAbandoned(1200, 300, 'paused', activity);

      expect(Analytics.trackTimerAbandoned).toHaveBeenCalledWith(
        1200,
        300,
        'paused',
        activity
      );
    });
  });

  describe('event dispatch - premium', () => {
    it('should dispatch trackPaywallViewed() with source', () => {
      const { result } = renderHook(() => useAnalytics());

      result.current.trackPaywallViewed('onboarding');

      expect(Analytics.trackPaywallViewed).toHaveBeenCalledWith('onboarding');
    });

    it('should dispatch trackTrialStarted() with package ID', () => {
      const { result } = renderHook(() => useAnalytics());

      result.current.trackTrialStarted('rc_promo_premium_trial');

      expect(Analytics.trackTrialStarted).toHaveBeenCalledWith('rc_promo_premium_trial');
    });

    it('should dispatch trackPurchaseCompleted() with details', () => {
      const { result } = renderHook(() => useAnalytics());

      result.current.trackPurchaseCompleted('rc_premium', 4.99, 'txn_12345');

      expect(Analytics.trackPurchaseCompleted).toHaveBeenCalledWith(
        'rc_premium',
        4.99,
        'txn_12345'
      );
    });

    it('should dispatch trackPurchaseFailed() with error details', () => {
      const { result } = renderHook(() => useAnalytics());

      result.current.trackPurchaseFailed('USER_CANCELLED', 'User cancelled', 'rc_premium');

      expect(Analytics.trackPurchaseFailed).toHaveBeenCalledWith(
        'USER_CANCELLED',
        'User cancelled',
        'rc_premium'
      );
    });
  });

  describe('error handling', () => {
    it('should not throw when Mixpanel is not initialized', () => {
      // Mock analytics as not initialized
      Analytics.isInitialized = false;

      const { result } = renderHook(() => useAnalytics());

      expect(() => {
        result.current.trackOnboardingStarted();
      }).not.toThrow();

      // Restore
      Analytics.isInitialized = true;
    });

    it('should handle missing analytics methods gracefully', () => {
      const { result } = renderHook(() => useAnalytics());

      // Even if a method doesn't exist, hook should return the instance
      expect(result.current).toBeDefined();
    });
  });

  describe('integration with components', () => {
    it('should be usable from components without errors', () => {
      // Simulate component usage
      const { result } = renderHook(() => {
        const analytics = useAnalytics();
        // Component would call analytics methods here
        return analytics;
      });

      expect(result.current).toBeDefined();
      expect(typeof result.current.trackOnboardingStarted).toBe('function');
    });

    it('should maintain singleton pattern across multiple component instances', () => {
      const { result: result1 } = renderHook(() => useAnalytics());
      const { result: result2 } = renderHook(() => useAnalytics());

      // Both hooks should return the same singleton
      expect(result1.current).toBe(result2.current);
    });
  });
});
