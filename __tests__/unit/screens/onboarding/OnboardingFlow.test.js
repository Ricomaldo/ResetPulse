// Tests for OnboardingFlow component

// Must mock react-native BEFORE any imports
jest.mock('react-native', () => {
  const View = 'View';
  const Text = 'Text';
  const TouchableOpacity = 'TouchableOpacity';
  const ScrollView = 'ScrollView';
  const FlatList = 'FlatList';
  const Animated = {
    View,
    Text,
    timing: jest.fn(() => ({ start: jest.fn() })),
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
    })),
    spring: jest.fn(() => ({ start: jest.fn() })),
    parallel: jest.fn(() => ({ start: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn() })),
  };
  return {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Animated,
    StyleSheet: {
      create: (styles) => styles,
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 390, height: 844 })),
    },
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
  };
});

import React from 'react';
import { create, act } from 'react-test-renderer';

jest.mock('../../../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      surfaceElevated: '#EEEEEE',
      text: '#000000',
      primary: '#007AFF',
      accent: '#FF6B6B',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  }),
}));

jest.mock('../../../../src/services/analytics', () => ({
  __esModule: true,
  default: {
    trackOnboardingStarted: jest.fn(),
    trackOnboardingStepViewed: jest.fn(),
    trackOnboardingStepCompleted: jest.fn(),
    trackOnboardingAbandoned: jest.fn(),
    trackTimerConfigSaved: jest.fn(),
    trackOnboardingCompleted: jest.fn(),
  },
}));

// Mock all filter components - use jest.requireActual to get React inside factory
jest.mock('../../../../src/screens/onboarding/filters', () => {
  const React = require('react');
  return {
    Filter0Opening: ({ onContinue }) => {
      return React.createElement('View', { testID: 'filter-0' },
        React.createElement('Button', { testID: 'continue-0', onPress: onContinue })
      );
    },
    Filter1Needs: ({ onContinue }) => {
      return React.createElement('View', { testID: 'filter-1' },
        React.createElement('Button', {
          testID: 'continue-1',
          onPress: () => onContinue(['work', 'meditation'])
        })
      );
    },
    Filter2Creation: ({ needs, onContinue }) => {
      return React.createElement('View', { testID: 'filter-2' },
        React.createElement('Button', {
          testID: 'continue-2',
          onPress: () => onContinue({ activity: 'work', palette: 'terre', duration: 25 })
        })
      );
    },
    Filter3Test: ({ timerConfig, onContinue }) => {
      return React.createElement('View', { testID: 'filter-3' },
        React.createElement('Button', { testID: 'continue-3', onPress: onContinue })
      );
    },
    Filter4Vision: ({ needs, onContinue }) => {
      return React.createElement('View', { testID: 'filter-4' },
        React.createElement('Button', { testID: 'continue-4', onPress: onContinue })
      );
    },
    Filter5Paywall: ({ onComplete }) => {
      return React.createElement('View', { testID: 'filter-5' },
        React.createElement('Button', {
          testID: 'complete-trial',
          onPress: () => onComplete('trial_started')
        }),
        React.createElement('Button', {
          testID: 'complete-skip',
          onPress: () => onComplete('skipped')
        })
      );
    },
  };
});

import OnboardingFlow from '../../../../src/screens/onboarding/OnboardingFlow';
import Analytics from '../../../../src/services/analytics';

describe('OnboardingFlow', () => {
  let mockOnComplete;

  beforeEach(() => {
    mockOnComplete = jest.fn();
    jest.clearAllMocks();
  });

  describe('Initial render', () => {
    it('should render without crashing', () => {
      let renderer;
      act(() => {
        renderer = create(<OnboardingFlow onComplete={mockOnComplete} />);
      });
      expect(renderer.toJSON()).toBeTruthy();
    });

    it('should start at filter 0', () => {
      let renderer;
      act(() => {
        renderer = create(<OnboardingFlow onComplete={mockOnComplete} />);
      });
      const tree = renderer.toJSON();
      expect(renderer.root.findByProps({ testID: 'filter-0' })).toBeTruthy();
    });

    it('should track onboarding_started on mount', () => {
      act(() => {
        create(<OnboardingFlow onComplete={mockOnComplete} />);
      });
      expect(Analytics.trackOnboardingStarted).toHaveBeenCalledTimes(1);
    });

    it('should track step 0 viewed on mount', () => {
      act(() => {
        create(<OnboardingFlow onComplete={mockOnComplete} />);
      });
      expect(Analytics.trackOnboardingStepViewed).toHaveBeenCalledWith(0, 'opening');
    });
  });

  describe('Navigation', () => {
    it('should navigate from filter 0 to filter 1', () => {
      let renderer;
      act(() => {
        renderer = create(<OnboardingFlow onComplete={mockOnComplete} />);
      });

      // Find and press continue button
      const continueBtn = renderer.root.findByProps({ testID: 'continue-0' });
      act(() => {
        continueBtn.props.onPress();
      });

      // Should now show filter 1
      expect(renderer.root.findByProps({ testID: 'filter-1' })).toBeTruthy();
    });

    it('should track step completed when navigating', () => {
      let renderer;
      act(() => {
        renderer = create(<OnboardingFlow onComplete={mockOnComplete} />);
      });

      const continueBtn = renderer.root.findByProps({ testID: 'continue-0' });
      act(() => {
        continueBtn.props.onPress();
      });

      expect(Analytics.trackOnboardingStepCompleted).toHaveBeenCalledWith(0, 'opening');
    });

    it('should track step viewed when filter changes', () => {
      let renderer;
      act(() => {
        renderer = create(<OnboardingFlow onComplete={mockOnComplete} />);
      });

      // Clear initial calls
      Analytics.trackOnboardingStepViewed.mockClear();

      const continueBtn = renderer.root.findByProps({ testID: 'continue-0' });
      act(() => {
        continueBtn.props.onPress();
      });

      expect(Analytics.trackOnboardingStepViewed).toHaveBeenCalledWith(1, 'needs');
    });
  });

  describe('Data flow', () => {
    it('should pass needs to Filter2Creation', () => {
      let renderer;
      act(() => {
        renderer = create(<OnboardingFlow onComplete={mockOnComplete} />);
      });

      // Navigate to filter 1 and complete it
      act(() => {
        renderer.root.findByProps({ testID: 'continue-0' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-1' }).props.onPress();
      });

      // Track should include needs data
      expect(Analytics.trackOnboardingStepCompleted).toHaveBeenCalledWith(
        1,
        'needs',
        expect.objectContaining({
          needs_selected: ['work', 'meditation'],
          needs_count: 2,
        })
      );
    });

    it('should track timer config when completing filter 2', () => {
      let renderer;
      act(() => {
        renderer = create(<OnboardingFlow onComplete={mockOnComplete} />);
      });

      // Navigate through filters 0, 1, 2
      act(() => {
        renderer.root.findByProps({ testID: 'continue-0' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-1' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-2' }).props.onPress();
      });

      expect(Analytics.trackTimerConfigSaved).toHaveBeenCalledWith({
        activity: 'work',
        palette: 'terre',
        duration: 25,
      });
    });
  });

  describe('Completion', () => {
    it('should call onComplete with trial_started result', () => {
      let renderer;
      act(() => {
        renderer = create(<OnboardingFlow onComplete={mockOnComplete} />);
      });

      // Navigate to filter 5
      act(() => {
        renderer.root.findByProps({ testID: 'continue-0' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-1' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-2' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-3' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-4' }).props.onPress();
      });

      // Complete with trial
      act(() => {
        renderer.root.findByProps({ testID: 'complete-trial' }).props.onPress();
      });

      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          result: 'trial_started',
        })
      );
    });

    it('should call onComplete with skipped result', () => {
      let renderer;
      act(() => {
        renderer = create(<OnboardingFlow onComplete={mockOnComplete} />);
      });

      // Navigate to filter 5
      act(() => {
        renderer.root.findByProps({ testID: 'continue-0' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-1' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-2' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-3' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-4' }).props.onPress();
      });

      // Complete with skip
      act(() => {
        renderer.root.findByProps({ testID: 'complete-skip' }).props.onPress();
      });

      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          result: 'skipped',
        })
      );
    });

    it('should track onboarding_completed on completion', () => {
      let renderer;
      act(() => {
        renderer = create(<OnboardingFlow onComplete={mockOnComplete} />);
      });

      // Navigate to filter 5 and complete
      act(() => {
        renderer.root.findByProps({ testID: 'continue-0' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-1' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-2' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-3' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-4' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'complete-trial' }).props.onPress();
      });

      expect(Analytics.trackOnboardingCompleted).toHaveBeenCalledWith(
        'trial_started',
        ['work', 'meditation']
      );
    });
  });

  describe('STEP_NAMES mapping', () => {
    it('should use correct step names for all filters', () => {
      let renderer;
      act(() => {
        renderer = create(<OnboardingFlow onComplete={mockOnComplete} />);
      });

      const expectedSteps = [
        { step: 0, name: 'opening' },
        { step: 1, name: 'needs' },
        { step: 2, name: 'creation' },
        { step: 3, name: 'test' },
        { step: 4, name: 'vision' },
        { step: 5, name: 'paywall' },
      ];

      // Navigate through all filters
      act(() => {
        renderer.root.findByProps({ testID: 'continue-0' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-1' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-2' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-3' }).props.onPress();
      });
      act(() => {
        renderer.root.findByProps({ testID: 'continue-4' }).props.onPress();
      });

      // Verify step viewed calls (excluding initial mount)
      expectedSteps.slice(1).forEach(({ step, name }) => {
        expect(Analytics.trackOnboardingStepViewed).toHaveBeenCalledWith(step, name);
      });
    });
  });
});
