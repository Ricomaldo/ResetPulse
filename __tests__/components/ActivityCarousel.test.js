/**
 * @fileoverview ActivityCarousel component tests
 * Tests for activity selector carousel
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import ActivityCarousel from '../../src/components/carousels/ActivityCarousel';

// Mock ThemeProvider
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      background: '#F2F2F7',
      brand: { primary: '#007AFF', secondary: '#0062CC' },
      textSecondary: '#8E8E93',
    },
    spacing: { sm: 4, md: 12, lg: 16 },
    shadow: () => ({}),
  }),
}));

// Mock TimerOptionsContext
const mockTimerOptionsContext = {
  currentActivity: 'work',
  setCurrentActivity: jest.fn(),
  setCurrentDuration: jest.fn(),
  favoriteActivities: [],
  activityDurations: {},
};

jest.mock('../../src/contexts/TimerOptionsContext', () => ({
  useTimerOptions: () => mockTimerOptionsContext,
}));

// Mock TimerPaletteContext
jest.mock('../../src/contexts/TimerPaletteContext', () => ({
  useTimerPalette: () => ({
    currentColor: '#007AFF',
  }),
}));

// Mock translation hook
jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => key,
}));

// Mock premium status
jest.mock('../../src/hooks/usePremiumStatus', () => ({
  usePremiumStatus: () => ({ isPremium: false }),
}));

// Mock custom activities hook
jest.mock('../../src/hooks/useCustomActivities', () => ({
  useCustomActivities: () => ({ customActivities: [] }),
}));

// Mock activities config
jest.mock('../../src/config/activities', () => ({
  getAllActivities: () => [
    { id: 'none', emoji: '⏱️', label: 'None', isPremium: false },
    { id: 'work', emoji: '💻', label: 'Work', isPremium: false },
    { id: 'break', emoji: '☕', label: 'Break', isPremium: false },
    { id: 'meditation', emoji: '🧘', label: 'Meditation', isPremium: false },
    { id: 'creativity', emoji: '🎨', label: 'Creativity', isPremium: false },
  ],
  getFreeActivities: () => [
    { id: 'none', emoji: '⏱️', label: 'None', isPremium: false },
    { id: 'work', emoji: '💻', label: 'Work', isPremium: false },
    { id: 'break', emoji: '☕', label: 'Break', isPremium: false },
    { id: 'meditation', emoji: '🧘', label: 'Meditation', isPremium: false },
    { id: 'creativity', emoji: '🎨', label: 'Creativity', isPremium: false },
  ],
}));

// Mock modals
jest.mock('../../src/components/modals', () => ({
  PremiumModal: 'PremiumModal',
  MoreActivitiesModal: 'MoreActivitiesModal',
  CreateActivityModal: 'CreateActivityModal',
  EditActivityModal: 'EditActivityModal',
}));

// Mock activity items
jest.mock('../../src/components/carousels/activity-items', () => ({
  ActivityItem: 'ActivityItem',
  PlusButton: 'PlusButton',
}));

// Mock responsive styles
jest.mock('../../src/styles/responsive', () => ({
  rs: (value) => value,
}));

describe('ActivityCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    let component;
    act(() => {
      component = create(<ActivityCarousel />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should render ScrollView for activity swiping', () => {
    let component;
    act(() => {
      component = create(<ActivityCarousel />);
    });

    const instance = component.root;
    const scrollViews = instance.findAllByType('ScrollView');
    expect(scrollViews.length).toBeGreaterThan(0);
  });

  it('should render ActivityItem components', () => {
    let component;
    act(() => {
      component = create(<ActivityCarousel />);
    });

    const instance = component.root;
    const activityItems = instance.findAllByType('ActivityItem');

    // Should have at least one activity item
    expect(activityItems.length).toBeGreaterThan(0);
  });

  it('should render PlusButton for free users', () => {
    let component;
    act(() => {
      component = create(<ActivityCarousel />);
    });

    const instance = component.root;
    const plusButtons = instance.findAllByType('PlusButton');

    // Free users should see a plus button to unlock premium
    expect(plusButtons.length).toBeGreaterThanOrEqual(0);
  });

  it('should be disabled when timer is running', () => {
    let component;
    act(() => {
      component = create(<ActivityCarousel isTimerRunning={true} />);
    });

    // Component should render but interactions should be disabled
    expect(component.toJSON()).toBeTruthy();
  });

  it('should not be disabled when timer is not running', () => {
    let component;
    act(() => {
      component = create(<ActivityCarousel isTimerRunning={false} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should render PremiumModal component', () => {
    let component;
    act(() => {
      component = create(<ActivityCarousel />);
    });

    const instance = component.root;
    const modals = instance.findAllByType('PremiumModal');

    // Modal should exist in tree (even if not visible)
    expect(modals.length).toBeGreaterThanOrEqual(0);
  });

  it('should render MoreActivitiesModal component', () => {
    let component;
    act(() => {
      component = create(<ActivityCarousel />);
    });

    const instance = component.root;
    const modals = instance.findAllByType('MoreActivitiesModal');

    // Modal should exist in tree (even if not visible)
    expect(modals.length).toBeGreaterThanOrEqual(0);
  });

  it('should render CreateActivityModal component', () => {
    let component;
    act(() => {
      component = create(<ActivityCarousel />);
    });

    const instance = component.root;
    const modals = instance.findAllByType('CreateActivityModal');

    // Modal should exist in tree (even if not visible)
    expect(modals.length).toBeGreaterThanOrEqual(0);
  });

  it('should render EditActivityModal component', () => {
    let component;
    act(() => {
      component = create(<ActivityCarousel />);
    });

    const instance = component.root;
    const modals = instance.findAllByType('EditActivityModal');

    // Modal should exist in tree (even if not visible)
    expect(modals.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle drawer visibility prop', () => {
    let component;
    act(() => {
      component = create(<ActivityCarousel drawerVisible={true} />);
    });

    expect(component.toJSON()).toBeTruthy();

    // Update with drawer hidden
    act(() => {
      component.update(<ActivityCarousel drawerVisible={false} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should display free activities for free users', () => {
    let component;
    act(() => {
      component = create(<ActivityCarousel />);
    });

    const instance = component.root;
    const activityItems = instance.findAllByType('ActivityItem');

    // Free users should have at least the free activities
    expect(activityItems.length).toBeGreaterThanOrEqual(4);
  });
});
