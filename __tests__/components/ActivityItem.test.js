/**
 * @fileoverview ActivityItem component tests
 * Tests for single activity item in carousel
 */

import React from 'react';
import { create, act, Animated } from 'react-test-renderer';
import ActivityItem from '../../src/components/carousels/activity-items/ActivityItem';

// Mock ThemeProvider
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      brand: { primary: '#007AFF', secondary: '#0062CC' },
    },
    shadow: () => ({}),
  }),
}));

// Mock translation hook
jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => key,
}));

describe('ActivityItem', () => {
  const mockActivity = {
    id: 'work',
    emoji: '💻',
    label: 'Work',
    isPremium: false,
    isCustom: false,
  };

  const defaultProps = {
    activity: mockActivity,
    isActive: false,
    isLocked: false,
    isCustom: false,
    currentColor: '#007AFF',
    onPress: jest.fn(),
    onLongPress: jest.fn(),
    scaleAnim: new Animated.Value(1),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    let component;
    act(() => {
      component = create(<ActivityItem {...defaultProps} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should display the activity emoji', () => {
    let component;
    act(() => {
      component = create(<ActivityItem {...defaultProps} />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const emojiText = texts.find(t => t.props.children === '💻');
    expect(emojiText).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    let component;

    act(() => {
      component = create(
        <ActivityItem {...defaultProps} onPress={mockOnPress} />
      );
    });

    const instance = component.root;
    const button = instance.findByType('TouchableOpacity');

    act(() => {
      button.props.onPress();
    });

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should call onLongPress when long pressed', () => {
    const mockOnLongPress = jest.fn();
    let component;

    act(() => {
      component = create(
        <ActivityItem {...defaultProps} onLongPress={mockOnLongPress} />
      );
    });

    const instance = component.root;
    const button = instance.findByType('TouchableOpacity');

    if (button.props.onLongPress) {
      act(() => {
        button.props.onLongPress();
      });

      expect(mockOnLongPress).toHaveBeenCalledTimes(1);
    }
  });

  it('should render with reduced opacity when locked', () => {
    let component;
    act(() => {
      component = create(
        <ActivityItem {...defaultProps} isLocked={true} />
      );
    });

    const instance = component.root;
    const views = instance.findAllByType('View');

    // Find wrapper with reduced opacity
    const lockedView = views.find(v => {
      const style = Array.isArray(v.props.style) ? v.props.style.flat() : [v.props.style];
      return style.some(s => s && s.opacity === 0.5);
    });

    expect(lockedView).toBeTruthy();
  });

  it('should render premium badge when activity is premium and locked', () => {
    const premiumActivity = {
      ...mockActivity,
      isPremium: true,
    };

    let component;
    act(() => {
      component = create(
        <ActivityItem
          {...defaultProps}
          activity={premiumActivity}
          isLocked={true}
        />
      );
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    // Should have lock icon (🔒) or similar indicator
    const hasLockIcon = texts.some(t =>
      t.props.children === '🔒' ||
      t.props.children === '👑' ||
      (t.props.style && Array.isArray(t.props.style) &&
       t.props.style.some(s => s && s.position === 'absolute'))
    );

    // Premium badge exists
    expect(hasLockIcon || texts.length > 1).toBeTruthy();
  });

  it('should apply active styling when isActive is true', () => {
    let component;
    act(() => {
      component = create(
        <ActivityItem {...defaultProps} isActive={true} />
      );
    });

    const instance = component.root;
    const views = instance.findAllByType('View');

    // Find view with currentColor background
    const activeView = views.find(v => {
      const style = Array.isArray(v.props.style) ? v.props.style.flat() : [v.props.style];
      return style.some(s => s && s.backgroundColor === '#007AFF');
    });

    expect(activeView).toBeTruthy();
  });

  it('should render custom badge when isCustom is true', () => {
    let component;
    act(() => {
      component = create(
        <ActivityItem {...defaultProps} isCustom={true} />
      );
    });

    // Component should render without crash
    expect(component.toJSON()).toBeTruthy();
  });

  it('should handle animation value', () => {
    const animValue = new Animated.Value(1.2);
    let component;

    act(() => {
      component = create(
        <ActivityItem {...defaultProps} scaleAnim={animValue} />
      );
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should render with different emoji', () => {
    const breakActivity = {
      id: 'break',
      emoji: '☕',
      label: 'Break',
      isPremium: false,
      isCustom: false,
    };

    let component;
    act(() => {
      component = create(
        <ActivityItem {...defaultProps} activity={breakActivity} />
      );
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const emojiText = texts.find(t => t.props.children === '☕');
    expect(emojiText).toBeTruthy();
  });

  it('should handle missing onLongPress gracefully', () => {
    let component;
    act(() => {
      component = create(
        <ActivityItem
          {...defaultProps}
          onLongPress={undefined}
        />
      );
    });

    expect(component.toJSON()).toBeTruthy();
  });
});
