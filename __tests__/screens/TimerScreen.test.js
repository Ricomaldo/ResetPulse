/**
 * @fileoverview TimerScreen component tests
 * Tests for main timer screen with drawer, modals, and timer controls
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import TimerScreen from '../../src/screens/TimerScreen';

// Mock SafeAreaContext
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
}));

// Mock ThemeProvider
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      background: '#F2F2F7',
      brand: { primary: '#007AFF', secondary: '#0062CC' },
      text: '#000000',
      textSecondary: '#8E8E93',
      fixed: { white: '#FFFFFF' },
      border: '#E5E5EA',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
    borderRadius: { lg: 12 },
    shadow: () => ({}),
    shadows: { md: {}, lg: {} },
  }),
}));

// Mock TimerOptionsContext
const mockTimerOptionsContext = {
  currentDuration: 1500, // 25 minutes
  setCurrentDuration: jest.fn(),
  showDigitalTimer: true,
  setShowDigitalTimer: jest.fn(),
  currentActivity: { id: 'work', emoji: '💻', label: 'Work', pulseDuration: 800 },
  clockwise: false,
  setClockwise: jest.fn(),
  incrementCompletedTimers: jest.fn(() => 1),
  completedTimersCount: 0,
  hasSeenTwoTimersModal: false,
  setHasSeenTwoTimersModal: jest.fn(),
  shouldPulse: true,
  setShouldPulse: jest.fn(),
  scaleMode: '60min',
  setScaleMode: jest.fn(),
  commandBarConfig: [],
  carouselBarConfig: [],
  favoritePalettes: [],
  toggleFavoritePalette: jest.fn(),
};

jest.mock('../../src/contexts/TimerOptionsContext', () => ({
  TimerOptionsProvider: ({ children }) => children,
  useTimerOptions: () => mockTimerOptionsContext,
}));

// Mock TimerPaletteContext
jest.mock('../../src/contexts/TimerPaletteContext', () => ({
  useTimerPalette: () => ({
    currentColor: '#007AFF',
  }),
}));

// Mock useTimerKeepAwake hook
jest.mock('../../src/hooks/useTimerKeepAwake', () => ({
  useTimerKeepAwake: jest.fn(),
}));

// Mock useAnimatedDots hook
jest.mock('../../src/hooks/useAnimatedDots', () => ({
  __esModule: true,
  default: jest.fn(() => '...'),
}));

// Mock layout components (TimerScreen uses DialZone and AsideZone)
jest.mock('../../src/components/layout', () => ({
  DialZone: 'DialZone',
  AsideZone: 'AsideZone',
}));

// Mock hooks used by TimerScreen
jest.mock('../../src/hooks/useScreenOrientation', () => ({
  useScreenOrientation: () => ({ isLandscape: false }),
}));

jest.mock('../../src/config/activityMessages', () => ({
  getActivityStartMessage: () => 'Start',
  getActivityEndMessage: () => 'Done',
}));

// Mock modals
jest.mock('../../src/components/modals', () => ({
  TwoTimersModal: 'TwoTimersModal',
  PremiumModal: 'PremiumModal',
  SettingsModal: 'SettingsModal',
}));

// Mock responsive styles
jest.mock('../../src/styles/responsive', () => ({
  rs: (value) => value,
}));

// Mock dial constants
jest.mock('../../src/components/dial/timerConstants', () => ({
  getDialMode: (mode) => ({
    maxMinutes: parseInt(mode) || 60,
  }),
  TIMER: { DEFAULT_DURATION: 1500 },
}));

// Mock analytics
jest.mock('../../src/services/analytics', () => ({
  __esModule: true,
  default: {
    trackTwoTimersMilestone: jest.fn(),
  },
}));

// Theme tokens are mocked in jest.setup.js

describe('TimerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should render DialZone component', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const dialZone = instance.findAllByType('DialZone');
    expect(dialZone.length).toBe(1);
  });

  it('should render AsideZone component in portrait mode', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const asideZone = instance.findAllByType('AsideZone');
    expect(asideZone.length).toBe(1);
  });


  it('should render TwoTimersModal component', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const twoTimersModal = instance.findAllByType('TwoTimersModal');
    expect(twoTimersModal.length).toBe(1);
  });

  it('should render PremiumModal component', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const premiumModal = instance.findAllByType('PremiumModal');
    expect(premiumModal.length).toBe(1);
  });

  it('should pass correct props to DialZone', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const dialZone = instance.findByType('DialZone');

    expect(dialZone.props.onRunningChange).toBeDefined();
    expect(dialZone.props.onTimerRef).toBeDefined();
    expect(dialZone.props.onDialTap).toBeDefined();
    expect(dialZone.props.onTimerComplete).toBeDefined();
    expect(dialZone.props.isLandscape).toBeDefined();
  });

  it('should pass correct props to AsideZone', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const asideZone = instance.findByType('AsideZone');

    expect(asideZone.props.timerState).toBeDefined();
    expect(asideZone.props.displayMessage).toBeDefined();
    expect(asideZone.props.isTimerRunning).toBeDefined();
    expect(asideZone.props.onPlay).toBeDefined();
    expect(asideZone.props.onReset).toBeDefined();
    expect(asideZone.props.onStop).toBeDefined();
  });
});
