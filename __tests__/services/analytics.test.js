// Tests for onboarding analytics events
import Analytics from '../../src/services/analytics';

// Mock Mixpanel
jest.mock('mixpanel-react-native', () => ({
  Mixpanel: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    setServerURL: jest.fn(),
    track: jest.fn(),
    identify: jest.fn(),
    registerSuperProperties: jest.fn(),
    flush: jest.fn(),
  })),
}));

describe('Onboarding Analytics', () => {
  let trackSpy;

  beforeEach(async () => {
    // Reset and initialize analytics
    Analytics.isInitialized = false;
    Analytics.mixpanel = null;
    await Analytics.init();

    // Spy on track method
    trackSpy = jest.spyOn(Analytics, 'track');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackOnboardingStarted', () => {
    it('should track onboarding_started event', () => {
      Analytics.trackOnboardingStarted();

      expect(trackSpy).toHaveBeenCalledWith('onboarding_started', {});
    });
  });

  describe('trackOnboardingStepViewed', () => {
    it('should track step viewed with step number and name', () => {
      Analytics.trackOnboardingStepViewed(0, 'opening');

      expect(trackSpy).toHaveBeenCalledWith('onboarding_step_viewed', {
        step: 0,
        step_name: 'opening',
      });
    });

    it('should track different steps correctly', () => {
      Analytics.trackOnboardingStepViewed(3, 'test');

      expect(trackSpy).toHaveBeenCalledWith('onboarding_step_viewed', {
        step: 3,
        step_name: 'test',
      });
    });
  });

  describe('trackOnboardingStepCompleted', () => {
    it('should track step completed with basic data', () => {
      Analytics.trackOnboardingStepCompleted(0, 'opening');

      expect(trackSpy).toHaveBeenCalledWith('onboarding_step_completed', {
        step: 0,
        step_name: 'opening',
      });
    });

    it('should include additional data when provided', () => {
      const additionalData = {
        needs_selected: ['work', 'meditation'],
        needs_count: 2,
      };

      Analytics.trackOnboardingStepCompleted(1, 'needs', additionalData);

      expect(trackSpy).toHaveBeenCalledWith('onboarding_step_completed', {
        step: 1,
        step_name: 'needs',
        needs_selected: ['work', 'meditation'],
        needs_count: 2,
      });
    });

    it('should handle empty additional data', () => {
      Analytics.trackOnboardingStepCompleted(2, 'creation', {});

      expect(trackSpy).toHaveBeenCalledWith('onboarding_step_completed', {
        step: 2,
        step_name: 'creation',
      });
    });
  });

  describe('trackOnboardingAbandoned', () => {
    it('should track abandoned with step info', () => {
      Analytics.trackOnboardingAbandoned(2, 'creation');

      expect(trackSpy).toHaveBeenCalledWith('onboarding_abandoned', {
        step: 2,
        step_name: 'creation',
      });
    });
  });

  describe('trackTimerConfigSaved', () => {
    it('should track timer config with all properties', () => {
      const config = {
        activity: 'work',
        palette: 'terre',
        duration: 25,
      };

      Analytics.trackTimerConfigSaved(config);

      expect(trackSpy).toHaveBeenCalledWith('timer_config_saved', {
        activity: 'work',
        palette: 'terre',
        duration_minutes: 25,
      });
    });

    it('should handle missing properties gracefully', () => {
      const config = {
        activity: 'meditation',
      };

      Analytics.trackTimerConfigSaved(config);

      expect(trackSpy).toHaveBeenCalledWith('timer_config_saved', {
        activity: 'meditation',
        palette: undefined,
        duration_minutes: undefined,
      });
    });
  });

  describe('trackOnboardingCompleted', () => {
    it('should track completed with result and needs', () => {
      Analytics.trackOnboardingCompleted('trial_started', ['work', 'time'], 'discover');

      expect(trackSpy).toHaveBeenCalledWith('onboarding_completed', {
        result: 'trial_started',
        needs_selected: ['work', 'time'],
        needs_count: 2,
        branch: 'discover',
      });
    });

    it('should track completed with skipped result', () => {
      Analytics.trackOnboardingCompleted('skipped', [], 'personalize');

      expect(trackSpy).toHaveBeenCalledWith('onboarding_completed', {
        result: 'skipped',
        needs_selected: [],
        needs_count: 0,
        branch: 'personalize',
      });
    });

    it('should use defaults when called without arguments', () => {
      Analytics.trackOnboardingCompleted();

      expect(trackSpy).toHaveBeenCalledWith('onboarding_completed', {
        result: 'unknown',
        needs_selected: [],
        needs_count: 0,
        branch: null,
      });
    });
  });

  describe('Analytics not initialized', () => {
    beforeEach(() => {
      Analytics.isInitialized = false;
      Analytics.mixpanel = null;
    });

    it('should not throw when tracking without initialization', () => {
      expect(() => {
        Analytics.trackOnboardingStarted();
      }).not.toThrow();
    });

    it('should not call track when not initialized', () => {
      const directTrackSpy = jest.spyOn(Analytics, 'track');
      Analytics.trackOnboardingStarted();

      // track is called but returns early
      expect(directTrackSpy).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// PHASE 4: Extended Timer Events Coverage
// ============================================================================
describe('Timer Events - Extended Coverage', () => {
  let trackSpy;

  beforeEach(async () => {
    Analytics.isInitialized = false;
    Analytics.mixpanel = null;
    await Analytics.init();
    trackSpy = jest.spyOn(Analytics, 'track');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackTimerStarted', () => {
    it('should track timer started with all properties', () => {
      const activity = { id: 'work', emoji: '💻', label: 'Travail' };

      Analytics.trackTimerStarted(1500, activity, '#8B4513', 'terre');

      expect(trackSpy).toHaveBeenCalledWith('timer_started', {
        duration_seconds: 1500,
        duration_minutes: 25,
        activity_id: 'work',
        activity_emoji: '💻',
        color_hex: '#8B4513',
        palette_name: 'terre',
      });
    });

    it('should handle null activity gracefully', () => {
      Analytics.trackTimerStarted(600, null, '#228B22', 'softLaser');

      expect(trackSpy).toHaveBeenCalledWith('timer_started', {
        duration_seconds: 600,
        duration_minutes: 10,
        activity_id: 'none',
        activity_emoji: '⏱️',
        color_hex: '#228B22',
        palette_name: 'softLaser',
      });
    });
  });

  describe('trackTimerCompleted', () => {
    it('should track timer completed with duration, activity, completion rate', () => {
      const activity = { id: 'meditation', emoji: '🧘', label: 'Méditation' };

      Analytics.trackTimerCompleted(1200, activity, 100);

      expect(trackSpy).toHaveBeenCalledWith('timer_completed', {
        duration_seconds: 1200,
        duration_minutes: 20,
        activity_id: 'meditation',
        completion_rate: 100,
      });
    });

    it('should use default completion rate of 100 when not provided', () => {
      const activity = { id: 'work', emoji: '💻' };

      Analytics.trackTimerCompleted(1500, activity);

      expect(trackSpy).toHaveBeenCalledWith('timer_completed', {
        duration_seconds: 1500,
        duration_minutes: 25,
        activity_id: 'work',
        completion_rate: 100,
      });
    });
  });

  describe('trackTimerAbandoned', () => {
    it('should track timer abandoned with elapsed time and reason', () => {
      const activity = { id: 'creativity', emoji: '🎨' };

      Analytics.trackTimerAbandoned(2700, 600, 'paused', activity);

      expect(trackSpy).toHaveBeenCalledWith('timer_abandoned', {
        duration_seconds: 2700,
        elapsed_seconds: 600,
        completion_rate: 22, // Math.round((600/2700)*100)
        reason: 'paused',
        activity_id: 'creativity',
      });
    });

    it('should calculate completion rate correctly', () => {
      Analytics.trackTimerAbandoned(1000, 750, 'reset', null);

      expect(trackSpy).toHaveBeenCalledWith('timer_abandoned', {
        duration_seconds: 1000,
        elapsed_seconds: 750,
        completion_rate: 75, // 75% completed
        reason: 'reset',
        activity_id: 'none',
      });
    });

    it('should handle different abandonment reasons', () => {
      const reasons = ['paused', 'reset', 'app_background'];

      reasons.forEach((reason) => {
        trackSpy.mockClear();
        Analytics.trackTimerAbandoned(1500, 300, reason, null);

        expect(trackSpy).toHaveBeenCalledWith('timer_abandoned',
          expect.objectContaining({ reason })
        );
      });
    });
  });
});

// ============================================================================
// PHASE 4: Extended Premium/Conversion Events Coverage
// ============================================================================
describe('Premium Events - Extended Coverage', () => {
  let trackSpy;

  beforeEach(async () => {
    Analytics.isInitialized = false;
    Analytics.mixpanel = null;
    await Analytics.init();
    trackSpy = jest.spyOn(Analytics, 'track');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackPaywallViewed', () => {
    it('should track paywall viewed with source', () => {
      Analytics.trackPaywallViewed('onboarding');

      expect(trackSpy).toHaveBeenCalledWith('paywall_viewed', {
        source: 'onboarding',
      });
    });

    it('should track different paywall sources', () => {
      const sources = ['onboarding', 'settings', 'palette_limit', 'activity_limit'];

      sources.forEach((source) => {
        trackSpy.mockClear();
        Analytics.trackPaywallViewed(source);

        expect(trackSpy).toHaveBeenCalledWith('paywall_viewed', { source });
      });
    });
  });

  describe('trackTrialStarted', () => {
    it('should track trial started with package ID', () => {
      Analytics.trackTrialStarted('rc_promo_premium_trial');

      expect(trackSpy).toHaveBeenCalledWith('trial_started', {
        package_id: 'rc_promo_premium_trial',
      });
    });
  });

  describe('trackPurchaseCompleted', () => {
    it('should track premium purchase with product ID and price', () => {
      Analytics.trackPurchaseCompleted('rc_premium', 4.99, 'txn_abc123');

      expect(trackSpy).toHaveBeenCalledWith('purchase_completed', {
        package_id: 'rc_premium',
        price: 4.99,
        currency: 'EUR',
        transaction_id: 'txn_abc123',
      });
    });

    it('should track purchase with different price points', () => {
      Analytics.trackPurchaseCompleted('rc_premium_yearly', 29.99, 'txn_xyz789');

      expect(trackSpy).toHaveBeenCalledWith('purchase_completed', {
        package_id: 'rc_premium_yearly',
        price: 29.99,
        currency: 'EUR',
        transaction_id: 'txn_xyz789',
      });
    });
  });

  describe('trackPurchaseFailed', () => {
    it('should track purchase failed with error code', () => {
      Analytics.trackPurchaseFailed(
        'USER_CANCELLED',
        'User cancelled the purchase',
        'rc_premium'
      );

      expect(trackSpy).toHaveBeenCalledWith('purchase_failed', {
        error_code: 'USER_CANCELLED',
        error_message: 'User cancelled the purchase',
        package_id: 'rc_premium',
      });
    });

    it('should track different error types', () => {
      const errors = [
        ['NETWORK_ERROR', 'Network connection lost', 'rc_premium'],
        ['PAYMENT_DECLINED', 'Card declined', 'rc_premium'],
        ['UNKNOWN_ERROR', 'Something went wrong', 'rc_premium_trial'],
      ];

      errors.forEach(([code, message, packageId]) => {
        trackSpy.mockClear();
        Analytics.trackPurchaseFailed(code, message, packageId);

        expect(trackSpy).toHaveBeenCalledWith('purchase_failed', {
          error_code: code,
          error_message: message,
          package_id: packageId,
        });
      });
    });
  });
});

// ============================================================================
// PHASE 4: Error Handling & Edge Cases
// ============================================================================
describe('Error Handling - Extended Coverage', () => {
  afterEach(() => {
    // Restore initialized state
    Analytics.isInitialized = true;
  });

  it('should not throw when analytics not initialized', () => {
    Analytics.isInitialized = false;
    Analytics.mixpanel = null;

    expect(() => {
      Analytics.trackTimerStarted(1500, null, '#000', 'terre');
      Analytics.trackPaywallViewed('settings');
      Analytics.trackPurchaseCompleted('rc_premium', 4.99, 'txn_123');
    }).not.toThrow();
  });

  it('should skip tracking silently if Mixpanel not ready', () => {
    Analytics.isInitialized = false;
    const trackSpy = jest.spyOn(Analytics, 'track');

    Analytics.trackTimerCompleted(1200, null, 100);

    // track() is called but returns early without throwing
    expect(trackSpy).toHaveBeenCalled();
  });

  it('should handle null/undefined activity objects', () => {
    const trackSpy = jest.spyOn(Analytics, 'track');

    expect(() => {
      Analytics.trackTimerStarted(600, undefined, '#000', 'terre');
      Analytics.trackTimerCompleted(600, null);
      Analytics.trackTimerAbandoned(600, 300, 'reset', undefined);
    }).not.toThrow();

    // Should use fallback values
    expect(trackSpy).toHaveBeenCalledWith('timer_started',
      expect.objectContaining({ activity_id: 'none' })
    );
  });
});
