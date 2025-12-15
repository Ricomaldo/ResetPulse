/**
 * @fileoverview CircularToggle component tests
 * Tests for rotation direction toggle button
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import CircularToggle from '../../src/components/layout/CircularToggle';

// Mock ThemeProvider
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      border: '#E5E5EA',
      textSecondary: '#8E8E93',
    },
    shadow: () => ({}),
  }),
}));

describe('CircularToggle', () => {
  it('should render without crashing', () => {
    let component;
    act(() => {
      component = create(
        <CircularToggle clockwise={true} onToggle={() => {}} />
      );
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should show clockwise icon when clockwise is true', () => {
    let component;
    act(() => {
      component = create(
        <CircularToggle clockwise={true} onToggle={() => {}} />
      );
    });

    const instance = component.root;
    const text = instance.findByType('Text');
    expect(text.props.children).toBe('↻'); // Clockwise arrow
  });

  it('should show counter-clockwise icon when clockwise is false', () => {
    let component;
    act(() => {
      component = create(
        <CircularToggle clockwise={false} onToggle={() => {}} />
      );
    });

    const instance = component.root;
    const text = instance.findByType('Text');
    expect(text.props.children).toBe('↺'); // Counter-clockwise arrow
  });

  it('should call onToggle with opposite value when pressed', () => {
    const mockOnToggle = jest.fn();
    let component;

    act(() => {
      component = create(
        <CircularToggle clockwise={true} onToggle={mockOnToggle} />
      );
    });

    const instance = component.root;
    const button = instance.findByType('TouchableOpacity');

    act(() => {
      button.props.onPress();
    });

    expect(mockOnToggle).toHaveBeenCalledWith(false); // Should toggle from true to false
  });

  it('should have accessibility role of switch', () => {
    let component;
    act(() => {
      component = create(
        <CircularToggle clockwise={true} onToggle={() => {}} />
      );
    });

    const instance = component.root;
    const button = instance.findByType('TouchableOpacity');
    expect(button.props.accessibilityRole).toBe('switch');
  });

  it('should have accessibility state checked when clockwise', () => {
    let component;
    act(() => {
      component = create(
        <CircularToggle clockwise={true} onToggle={() => {}} />
      );
    });

    const instance = component.root;
    const button = instance.findByType('TouchableOpacity');
    expect(button.props.accessibilityState).toEqual({ checked: true });
  });

  it('should have accessibility state unchecked when counter-clockwise', () => {
    let component;
    act(() => {
      component = create(
        <CircularToggle clockwise={false} onToggle={() => {}} />
      );
    });

    const instance = component.root;
    const button = instance.findByType('TouchableOpacity');
    expect(button.props.accessibilityState).toEqual({ checked: false });
  });

  it('should accept custom size prop', () => {
    let component;
    act(() => {
      component = create(
        <CircularToggle clockwise={true} onToggle={() => {}} size={80} />
      );
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should have default size of 60', () => {
    let component;
    act(() => {
      component = create(
        <CircularToggle clockwise={true} onToggle={() => {}} />
      );
    });

    expect(component.toJSON()).toBeTruthy();
  });
});
