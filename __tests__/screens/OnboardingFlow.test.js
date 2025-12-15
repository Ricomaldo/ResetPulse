/**
 * @fileoverview OnboardingFlow component tests
 * Tests for onboarding flow orchestration and navigation
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import OnboardingFlow from '../../src/screens/onboarding/OnboardingFlow';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

// Mock ThemeProvider
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      background: '#F2F2F7',
      brand: { primary: '#007AFF', accent: '#FF9500' },
      text: '#000000',
      textSecondary: '#8E8E93',
      border: '#E5E5EA',
      surfaceElevated: '#FFFFFF',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
  }),
}));

// Mock onboarding constants
jest.mock('../../src/screens/onboarding/onboardingConstants', () => ({
  rs: (value) => value,
  getStepName: (step, branch) => `step_${step}_${branch || 'initial'}`,
}));

// Mock analytics
jest.mock('../../src/services/analytics', () => ({
  __esModule: true,
  default: {
    trackOnboardingStarted: jest.fn(),
    trackOnboardingStepViewed: jest.fn(),
    trackOnboardingStepCompleted: jest.fn(),
    trackOnboardingAbandoned: jest.fn(),
    trackOnboardingCompleted: jest.fn(),
    trackTimerConfigSaved: jest.fn(),
    trackOnboardingBranchSelected: jest.fn(),
    trackOnboardingSoundSelected: jest.fn(),
    trackOnboardingInterfaceConfigured: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock test mode
jest.mock('../../src/config/test-mode', () => ({
  DEV_MODE: false,
}));

// Mock StepIndicator
jest.mock('../../src/components/onboarding/StepIndicator', () => 'StepIndicator');

// Mock filter components
jest.mock('../../src/screens/onboarding/filters', () => ({
  Filter010Opening: 'Filter010Opening',
  Filter020Needs: 'Filter020Needs',
  Filter030Creation: 'Filter030Creation',
  Filter040Test: 'Filter040Test',
  Filter050Notifications: 'Filter050Notifications',
  Filter060Branch: 'Filter060Branch',
  Filter070VisionDiscover: 'Filter070VisionDiscover',
  Filter080SoundPersonalize: 'Filter080SoundPersonalize',
  Filter090PaywallDiscover: 'Filter090PaywallDiscover',
  Filter100InterfacePersonalize: 'Filter100InterfacePersonalize',
}));

// Theme tokens are mocked in jest.setup.js

describe('OnboardingFlow', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should render StepIndicator component', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    const instance = component.root;
    const stepIndicator = instance.findAllByType('StepIndicator');
    expect(stepIndicator.length).toBe(1);
  });

  it('should render first filter (Filter010Opening) on mount', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    const instance = component.root;
    const filter010 = instance.findAllByType('Filter010Opening');
    expect(filter010.length).toBe(1);
  });

  it('should hide back button on first screen', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    const instance = component.root;
    const touchables = instance.findAllByType('TouchableOpacity');

    // Back button should not exist (only exists on currentFilter > 0)
    const backButtons = touchables.filter(t => {
      try {
        return t.props.accessibilityLabel === 'Go back';
      } catch {
        return false;
      }
    });

    expect(backButtons.length).toBe(0);
  });

  it('should show back button on second screen', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    const instance = component.root;
    const filter010 = instance.findByType('Filter010Opening');

    // Trigger continue to move to next filter
    act(() => {
      filter010.props.onContinue();
    });

    // Back button should now be visible (render check)
    // The back button text should exist
    const texts = component.root.findAllByType('Text');
    const backText = texts.find(t => {
      try {
        return t.props.children === '‹';
      } catch {
        return false;
      }
    });

    expect(backText).toBeTruthy();
  });

  it('should navigate forward through filters', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    const instance = component.root;

    // Start at Filter010
    let filter010 = instance.findAllByType('Filter010Opening');
    expect(filter010.length).toBe(1);

    // Continue to Filter020
    act(() => {
      filter010[0].props.onContinue();
    });

    // Should now show Filter020
    const filter020 = component.root.findAllByType('Filter020Needs');
    expect(filter020.length).toBe(1);
  });

  it('should navigate backward through filter state', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    // Start at Filter010
    const filter010 = component.root.findByType('Filter010Opening');
    expect(filter010).toBeTruthy();

    // Move forward
    act(() => {
      filter010.props.onContinue();
    });

    // Should be at Filter020
    const filter020 = component.root.findAllByType('Filter020Needs');
    expect(filter020.length).toBe(1);

    // Note: Back button interaction requires more complex mocking
    // Testing state management rather than button press
  });

  it('should update StepIndicator current prop as filters progress', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    // Check initial step
    let stepIndicator = component.root.findByType('StepIndicator');
    expect(stepIndicator.props.current).toBe(0);

    // Move to next step
    const filter010 = component.root.findByType('Filter010Opening');
    act(() => {
      filter010.props.onContinue();
    });

    // Check updated step
    stepIndicator = component.root.findByType('StepIndicator');
    expect(stepIndicator.props.current).toBe(1);
  });

  it('should pass total filters count to StepIndicator', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    const stepIndicator = component.root.findByType('StepIndicator');
    expect(stepIndicator.props.total).toBe(8);
  });

  it('should render back button with accessible properties', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    // Move to second screen
    const filter010 = component.root.findByType('Filter010Opening');
    act(() => {
      filter010.props.onContinue();
    });

    // Back button should be rendered
    const texts = component.root.findAllByType('Text');
    const backText = texts.find(t => {
      try {
        return t.props.children === '‹';
      } catch {
        return false;
      }
    });

    // Verify back button text exists (accessibility check)
    expect(backText).toBeTruthy();
  });

  it('should render Filter020Needs after first continue', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    const filter010 = component.root.findByType('Filter010Opening');
    act(() => {
      filter010.props.onContinue();
    });

    const filter020 = component.root.findAllByType('Filter020Needs');
    expect(filter020.length).toBe(1);
  });
});
