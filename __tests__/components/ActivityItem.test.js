/**
 * @fileoverview ActivityItem component tests
 * Smoke tests for activity item in carousel
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import { Animated } from 'react-native';
import ActivityItem from '../../src/components/carousels/activity-items/ActivityItem';

// ThemeProvider is mocked globally in jest.setup.js

jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => key,
}));

describe('ActivityItem', () => {
  const mockActivity = {
    id: 'work',
    emoji: '💻',
    label: 'Work',
    isPremium: false,
  };

  const defaultProps = {
    activity: mockActivity,
    isActive: false,
    isLocked: false,
    currentColor: '#007AFF',
    onPress: jest.fn(),
    scaleAnim: new Animated.Value(1),
  };

  it('should render without crashing', () => {
    let component;
    act(() => {
      component = create(<ActivityItem {...defaultProps} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('should render with different activity', () => {
    let component;
    act(() => {
      component = create(
        <ActivityItem
          {...defaultProps}
          activity={{ ...mockActivity, emoji: '☕' }}
        />
      );
    });
    expect(component.toJSON()).toBeTruthy();
  });
});
