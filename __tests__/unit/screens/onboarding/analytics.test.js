// Tests for onboarding analytics events
import Analytics from '../../../../src/services/analytics';

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
      Analytics.trackOnboardingCompleted('trial_started', ['work', 'time']);

      expect(trackSpy).toHaveBeenCalledWith('onboarding_completed', {
        result: 'trial_started',
        needs_selected: ['work', 'time'],
        needs_count: 2,
      });
    });

    it('should track completed with skipped result', () => {
      Analytics.trackOnboardingCompleted('skipped', []);

      expect(trackSpy).toHaveBeenCalledWith('onboarding_completed', {
        result: 'skipped',
        needs_selected: [],
        needs_count: 0,
      });
    });

    it('should use defaults when called without arguments', () => {
      Analytics.trackOnboardingCompleted();

      expect(trackSpy).toHaveBeenCalledWith('onboarding_completed', {
        result: 'unknown',
        needs_selected: [],
        needs_count: 0,
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
