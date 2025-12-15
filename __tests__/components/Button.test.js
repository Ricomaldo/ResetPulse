/**
 * @fileoverview Button component tests
 * Tests for PrimaryButton, SecondaryButton, DestructiveButton, TextButton
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import {
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
  TextButton,
} from '../../src/components/buttons/Button';

// Mock ThemeProvider
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      brand: { primary: '#007AFF' },
      fixed: { white: '#FFFFFF' },
      text: { secondary: '#8E8E93' },
    },
    borderRadius: { lg: 12 },
    spacing: { md: 12, lg: 16 },
  }),
}));

// Mock focus styles
jest.mock('../../src/styles/focusStyles', () => ({
  createFocusStyle: () => ({}),
}));

describe('Button Components', () => {
  describe('PrimaryButton', () => {
    it('should render with label', () => {
      let component;
      act(() => {
        component = create(
          <PrimaryButton label="Continue" onPress={() => {}} />
        );
      });

      const instance = component.root;
      const text = instance.findByType('Text');
      expect(text.props.children).toBe('Continue');
    });

    it('should call onPress when pressed', () => {
      const mockOnPress = jest.fn();
      let component;

      act(() => {
        component = create(
          <PrimaryButton label="Press me" onPress={mockOnPress} />
        );
      });

      const instance = component.root;
      const button = instance.findByType('TouchableOpacity');

      act(() => {
        button.props.onPress();
      });

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      let component;
      act(() => {
        component = create(
          <PrimaryButton label="Disabled" onPress={() => {}} disabled={true} />
        );
      });

      const instance = component.root;
      const button = instance.findByType('TouchableOpacity');
      expect(button.props.disabled).toBe(true);
    });

    it('should show ActivityIndicator when loading', () => {
      let component;
      act(() => {
        component = create(
          <PrimaryButton label="Loading" onPress={() => {}} loading={true} />
        );
      });

      const instance = component.root;
      const indicators = instance.findAllByType('ActivityIndicator');
      expect(indicators.length).toBe(1);
    });

    it('should not show label when loading', () => {
      let component;
      act(() => {
        component = create(
          <PrimaryButton label="Hidden" onPress={() => {}} loading={true} />
        );
      });

      const instance = component.root;
      const texts = instance.findAllByType('Text');
      expect(texts.length).toBe(0); // No text when loading
    });
  });

  describe('SecondaryButton', () => {
    it('should render with label', () => {
      let component;
      act(() => {
        component = create(
          <SecondaryButton label="Cancel" onPress={() => {}} />
        );
      });

      const instance = component.root;
      const text = instance.findByType('Text');
      expect(text.props.children).toBe('Cancel');
    });

    it('should call onPress when pressed', () => {
      const mockOnPress = jest.fn();
      let component;

      act(() => {
        component = create(
          <SecondaryButton label="Press me" onPress={mockOnPress} />
        );
      });

      const instance = component.root;
      const button = instance.findByType('TouchableOpacity');

      act(() => {
        button.props.onPress();
      });

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should have transparent background', () => {
      let component;
      act(() => {
        component = create(
          <SecondaryButton label="Secondary" onPress={() => {}} />
        );
      });

      const instance = component.root;
      const button = instance.findByType('TouchableOpacity');
      const style = Array.isArray(button.props.style)
        ? button.props.style.flat()
        : [button.props.style];

      const hasTransparent = style.some(s => s && s.backgroundColor === 'transparent');
      expect(hasTransparent).toBe(true);
    });
  });

  describe('DestructiveButton', () => {
    it('should render with label', () => {
      let component;
      act(() => {
        component = create(
          <DestructiveButton label="Delete" onPress={() => {}} />
        );
      });

      const instance = component.root;
      const text = instance.findByType('Text');
      expect(text.props.children).toBe('Delete');
    });

    it('should call onPress when pressed', () => {
      const mockOnPress = jest.fn();
      let component;

      act(() => {
        component = create(
          <DestructiveButton label="Delete" onPress={mockOnPress} />
        );
      });

      const instance = component.root;
      const button = instance.findByType('TouchableOpacity');

      act(() => {
        button.props.onPress();
      });

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('TextButton', () => {
    it('should render with label', () => {
      let component;
      act(() => {
        component = create(
          <TextButton label="Learn More" onPress={() => {}} />
        );
      });

      const instance = component.root;
      const text = instance.findByType('Text');
      expect(text.props.children).toBe('Learn More');
    });

    it('should call onPress when pressed', () => {
      const mockOnPress = jest.fn();
      let component;

      act(() => {
        component = create(
          <TextButton label="Link" onPress={mockOnPress} />
        );
      });

      const instance = component.root;
      const button = instance.findByType('TouchableOpacity');

      act(() => {
        button.props.onPress();
      });

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should have underlined text', () => {
      let component;
      act(() => {
        component = create(
          <TextButton label="Underlined" onPress={() => {}} />
        );
      });

      const instance = component.root;
      const text = instance.findByType('Text');
      const style = Array.isArray(text.props.style)
        ? text.props.style.flat()
        : [text.props.style];

      const hasUnderline = style.some(s => s && s.textDecorationLine === 'underline');
      expect(hasUnderline).toBe(true);
    });
  });
});
