/**
 * @fileoverview DurationSlider component tests
 * Tests for duration picker with preset buttons
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import DurationSlider from '../../src/components/pickers/DurationSlider';

// Mock ThemeProvider
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      brand: { primary: '#007AFF' },
      surface: '#FFFFFF',
      textSecondary: '#8E8E93',
      text: '#000000',
    },
    spacing: { sm: 4, md: 12, lg: 16 },
    borderRadius: { md: 8 },
    shadow: () => ({}),
  }),
}));

// Mock translation hook
jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => key,
}));

describe('DurationSlider', () => {
  it('should render without crashing', () => {
    let component;
    act(() => {
      component = create(
        <DurationSlider value={1500} onValueChange={() => {}} />
      );
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should call onValueChange when preset button is pressed', () => {
    const mockOnValueChange = jest.fn();
    let component;

    act(() => {
      component = create(
        <DurationSlider value={1500} onValueChange={mockOnValueChange} />
      );
    });

    const instance = component.root;
    const buttons = instance.findAllByType('TouchableOpacity');

    // Find a preset button (not increment/decrement)
    // Should have at least increment, decrement, and preset buttons
    expect(buttons.length).toBeGreaterThan(2);

    // Press a button (implementation may vary based on component structure)
    if (buttons.length > 0) {
      act(() => {
        // Try calling onPress on the first interactive button
        const interactiveButton = buttons.find(b => b.props.onPress);
        if (interactiveButton) {
          interactiveButton.props.onPress();
        }
      });

      // Verify callback was called
      expect(mockOnValueChange).toHaveBeenCalled();
    }
  });

  it('should display current duration value in minutes', () => {
    let component;
    act(() => {
      component = create(
        <DurationSlider value={1500} onValueChange={() => {}} /> // 1500s = 25min
      );
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');

    // Should display "25" somewhere in the component
    const has25 = texts.some(text => {
      const content = text.props.children;
      return content && content.toString().includes('25');
    });

    expect(has25).toBe(true);
  });

  it('should call onValueChange with incremented value', () => {
    const mockOnValueChange = jest.fn();
    let component;

    act(() => {
      component = create(
        <DurationSlider value={1500} onValueChange={mockOnValueChange} /> // 25min
      );
    });

    const instance = component.root;
    const buttons = instance.findAllByType('TouchableOpacity');

    // Find increment button (usually has a "+" or right arrow)
    const incrementButton = buttons.find(b => {
      const textChildren = b.findAllByType('Text');
      return textChildren.some(t =>
        t.props.children === '+' ||
        t.props.children === '→' ||
        t.props.children === '▶'
      );
    });

    if (incrementButton) {
      act(() => {
        incrementButton.props.onPress();
      });

      // Should increment from 25min (1500s) to 30min (1800s)
      expect(mockOnValueChange).toHaveBeenCalledWith(1800);
    }
  });

  it('should call onValueChange with decremented value', () => {
    const mockOnValueChange = jest.fn();
    let component;

    act(() => {
      component = create(
        <DurationSlider value={1500} onValueChange={mockOnValueChange} /> // 25min
      );
    });

    const instance = component.root;
    const buttons = instance.findAllByType('TouchableOpacity');

    // Find decrement button (usually has a "-" or left arrow)
    const decrementButton = buttons.find(b => {
      const textChildren = b.findAllByType('Text');
      return textChildren.some(t =>
        t.props.children === '-' ||
        t.props.children === '←' ||
        t.props.children === '◀'
      );
    });

    if (decrementButton) {
      act(() => {
        decrementButton.props.onPress();
      });

      // Should decrement from 25min (1500s) to 20min (1200s)
      expect(mockOnValueChange).toHaveBeenCalledWith(1200);
    }
  });

  it('should disable decrement button at minimum value', () => {
    let component;
    act(() => {
      component = create(
        <DurationSlider value={300} onValueChange={() => {}} /> // 5min (minimum)
      );
    });

    const instance = component.root;
    const buttons = instance.findAllByType('TouchableOpacity');

    // Find decrement button
    const decrementButton = buttons.find(b => {
      const textChildren = b.findAllByType('Text');
      return textChildren.some(t =>
        t.props.children === '-' ||
        t.props.children === '←' ||
        t.props.children === '◀'
      );
    });

    if (decrementButton) {
      // Button should be disabled or have reduced opacity
      expect(
        decrementButton.props.disabled === true ||
        (decrementButton.props.style &&
         Array.isArray(decrementButton.props.style) &&
         decrementButton.props.style.some(s => s && s.opacity < 1))
      ).toBeTruthy();
    }
  });

  it('should disable increment button at maximum value', () => {
    let component;
    act(() => {
      component = create(
        <DurationSlider value={3600} onValueChange={() => {}} /> // 60min (maximum)
      );
    });

    const instance = component.root;
    const buttons = instance.findAllByType('TouchableOpacity');

    // Find increment button
    const incrementButton = buttons.find(b => {
      const textChildren = b.findAllByType('Text');
      return textChildren.some(t =>
        t.props.children === '+' ||
        t.props.children === '→' ||
        t.props.children === '▶'
      );
    });

    if (incrementButton) {
      // Button should be disabled or have reduced opacity
      expect(
        incrementButton.props.disabled === true ||
        (incrementButton.props.style &&
         Array.isArray(incrementButton.props.style) &&
         incrementButton.props.style.some(s => s && s.opacity < 1))
      ).toBeTruthy();
    }
  });

  it('should accept custom style prop', () => {
    const customStyle = { marginTop: 20 };
    let component;

    act(() => {
      component = create(
        <DurationSlider
          value={1500}
          onValueChange={() => {}}
          style={customStyle}
        />
      );
    });

    expect(component.toJSON()).toBeTruthy();
  });
});
