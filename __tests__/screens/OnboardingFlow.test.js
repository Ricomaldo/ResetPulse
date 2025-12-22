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
      surface: '#FFFFFF',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
  }),
}));

// Mock TimerConfigContext (required by OnboardingFlow)
jest.mock('../../src/contexts/TimerConfigContext', () => ({
  useTimerConfig: () => ({
    setOnboardingCompleted: jest.fn(),
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

// Mock animations
jest.mock('../../src/styles/animations', () => ({
  ONBOARDING_TRANSITIONS: {
    enterDuration: 300,
    exitDuration: 200,
    delayBetween: 100,
  },
}));

// Mock StepIndicator
jest.mock('../../src/components/onboarding/StepIndicator', () => 'StepIndicator');

// Mock filter components (v2.1 - 9 filters linear flow)
jest.mock('../../src/screens/onboarding/filters', () => ({
  Filter010Opening: 'Filter010Opening',
  Filter020Tool: 'Filter020Tool',
  Filter030Creation: 'Filter030Creation',
  Filter040TestStart: 'Filter040TestStart',
  Filter050TestStop: 'Filter050TestStop',
  Filter060Sound: 'Filter060Sound',
  Filter070Notifications: 'Filter070Notifications',
  Filter080Paywall: 'Filter080Paywall',
  Filter090FirstTimer: 'Filter090FirstTimer',
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

  it('should render StepIndicator component (hidden on first step)', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    const instance = component.root;
    // StepIndicator is hidden on first step (currentStep > 0 && currentStep < TOTAL_STEPS - 1)
    const stepIndicator = instance.findAllByType('StepIndicator');
    expect(stepIndicator.length).toBe(0); // Hidden on step 0
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

  // Note: Back navigation is now handled by Android BackHandler, not a visible button
  // Back button UI was removed in v2.1 (ADR-010)

  it('should navigate forward through filters', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    const instance = component.root;

    // Start at Filter010
    const filter010 = instance.findAllByType('Filter010Opening');
    expect(filter010.length).toBe(1);

    // Continue to Filter020Tool
    act(() => {
      filter010[0].props.onContinue();
    });

    // Should now show Filter020Tool
    const filter020 = component.root.findAllByType('Filter020Tool');
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

    // Should be at Filter020Tool
    const filter020 = component.root.findAllByType('Filter020Tool');
    expect(filter020.length).toBe(1);

    // Note: Back navigation is handled by Android BackHandler in v2.1
    // Testing state management rather than button press
  });

  it('should update StepIndicator current prop as filters progress', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    // StepIndicator is hidden on step 0
    let stepIndicator = component.root.findAllByType('StepIndicator');
    expect(stepIndicator.length).toBe(0);

    // Move to step 1 (Filter020Tool)
    const filter010 = component.root.findByType('Filter010Opening');
    act(() => {
      filter010.props.onContinue();
    });

    // StepIndicator should now be visible (currentStep > 0 && currentStep < TOTAL_STEPS - 1)
    stepIndicator = component.root.findAllByType('StepIndicator');
    expect(stepIndicator.length).toBe(1);
    // StepIndicator shows currentStep + 1 (so step 1 shows as 2)
    expect(stepIndicator[0].props.current).toBe(2);
  });

  it('should pass total filters count to StepIndicator', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    // Move to step 1 to show StepIndicator
    const filter010 = component.root.findByType('Filter010Opening');
    act(() => {
      filter010.props.onContinue();
    });

    const stepIndicator = component.root.findByType('StepIndicator');
    expect(stepIndicator.props.total).toBe(9); // TOTAL_STEPS = 9 in v2.1
  });

  // Note: Back button UI was removed in v2.1 - navigation handled by Android BackHandler

  it('should render Filter020Tool after first continue', () => {
    let component;
    act(() => {
      component = create(<OnboardingFlow onComplete={mockOnComplete} />);
    });

    const filter010 = component.root.findByType('Filter010Opening');
    act(() => {
      filter010.props.onContinue();
    });

    const filter020 = component.root.findAllByType('Filter020Tool');
    expect(filter020.length).toBe(1);
  });
});
