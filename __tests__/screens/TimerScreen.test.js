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
  showDigitalTimer: true,
  setShowDigitalTimer: jest.fn(),
  currentActivity: { id: 'work', emoji: '💻', label: 'Work' },
  clockwise: false,
  setClockwise: jest.fn(),
  showRotationToggle: false,
  incrementCompletedTimers: jest.fn(() => 1),
  completedTimersCount: 0,
  hasSeenTwoTimersModal: false,
  setHasSeenTwoTimersModal: jest.fn(),
  shouldPulse: true,
  setShouldPulse: jest.fn(),
  useMinimalInterface: false,
  setUseMinimalInterface: jest.fn(),
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

// Mock layout components
jest.mock('../../src/components/layout', () => ({
  TimeTimer: 'TimeTimer',
  Drawer: 'Drawer',
  CircularToggle: 'CircularToggle',
  SwipeUpHint: 'SwipeUpHint',
}));

// Mock drawer content
jest.mock('../../src/components/drawers', () => ({
  ExpandableDrawerContent: 'ExpandableDrawerContent',
}));

// Mock DigitalTimer
jest.mock('../../src/components/timer/DigitalTimer', () => 'DigitalTimer');

// Mock modals
jest.mock('../../src/components/modals', () => ({
  SettingsModal: 'SettingsModal',
  TwoTimersModal: 'TwoTimersModal',
  PremiumModal: 'PremiumModal',
}));

// Mock responsive styles
jest.mock('../../src/styles/responsive', () => ({
  rs: (value) => value,
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

  it('should render current activity emoji and label', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    // Find activity label text
    const activityText = texts.find(t => {
      try {
        const children = t.props.children;
        return Array.isArray(children) &&
               children.includes('💻') &&
               children.includes(' ') &&
               children.includes('Work');
      } catch {
        return false;
      }
    });

    expect(activityText).toBeTruthy();
  });

  it('should render TimeTimer component', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const timeTimer = instance.findAllByType('TimeTimer');
    expect(timeTimer.length).toBe(1);
  });

  it('should render DigitalTimer component', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const digitalTimer = instance.findAllByType('DigitalTimer');
    expect(digitalTimer.length).toBe(1);
  });

  it('should render SwipeUpHint when timer is not running', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const swipeHint = instance.findAllByType('SwipeUpHint');
    expect(swipeHint.length).toBe(1);
  });

  it('should render Drawer component', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const drawer = instance.findAllByType('Drawer');
    expect(drawer.length).toBe(1);
  });

  it('should render ExpandableDrawerContent inside Drawer', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const drawerContent = instance.findAllByType('ExpandableDrawerContent');
    expect(drawerContent.length).toBe(1);
  });

  it('should render SettingsModal component', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const settingsModal = instance.findAllByType('SettingsModal');
    expect(settingsModal.length).toBe(1);
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

  it('should pass correct props to TimeTimer', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const timeTimer = instance.findByType('TimeTimer');

    expect(timeTimer.props.onRunningChange).toBeDefined();
    expect(timeTimer.props.onTimerRef).toBeDefined();
    expect(timeTimer.props.onDialRef).toBeDefined();
    expect(timeTimer.props.onDialTap).toBeDefined();
    expect(timeTimer.props.onTimerComplete).toBeDefined();
  });

  it('should pass correct props to DigitalTimer', () => {
    let component;
    act(() => {
      component = create(<TimerScreen />);
    });

    const instance = component.root;
    const digitalTimer = instance.findByType('DigitalTimer');

    expect(digitalTimer.props.remaining).toBeDefined();
    expect(digitalTimer.props.isRunning).toBeDefined();
    expect(digitalTimer.props.color).toBe('#007AFF');
    expect(digitalTimer.props.mini).toBe(false); // showDigitalTimer is true in mock
  });
});
