/**
 * @fileoverview StepIndicator component tests
 * Tests for onboarding progress indicator
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import StepIndicator from '../../src/components/onboarding/StepIndicator';

// Mock ThemeProvider
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      border: '#E5E5EA',
      brand: { primary: '#007AFF' },
      textSecondary: '#8E8E93',
    },
    spacing: { sm: 4, md: 12, lg: 16 },
  }),
}));

// Mock onboarding constants
jest.mock('../../src/screens/onboarding/onboardingConstants', () => ({
  rs: (value) => value, // Simple responsive scale mock
}));

describe('StepIndicator', () => {
  it('should render without crashing', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={0} total={6} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should display correct step count text', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={2} total={6} />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const stepText = texts.find(t => t.props.children && t.props.children.includes('3 / 6'));
    expect(stepText).toBeTruthy();
  });

  it('should render correct number of dots', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={0} total={5} />);
    });

    const instance = component.root;
    const views = instance.findAllByType('View');

    // Filter views that look like dots (have borderRadius)
    const dots = views.filter(v => {
      const style = Array.isArray(v.props.style) ? v.props.style.flat() : [v.props.style];
      return style.some(s => s && s.borderRadius !== undefined && s.width !== undefined && s.height !== undefined);
    });

    expect(dots.length).toBe(5);
  });

  it('should show first step as active', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={0} total={6} />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const stepText = texts.find(t => t.props.children && t.props.children.includes('1 / 6'));
    expect(stepText).toBeTruthy();
  });

  it('should show last step as active', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={5} total={6} />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const stepText = texts.find(t => t.props.children && t.props.children.includes('6 / 6'));
    expect(stepText).toBeTruthy();
  });

  it('should show middle step as active', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={3} total={6} />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const stepText = texts.find(t => t.props.children && t.props.children.includes('4 / 6'));
    expect(stepText).toBeTruthy();
  });

  it('should handle single step', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={0} total={1} />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const stepText = texts.find(t => t.props.children && t.props.children.includes('1 / 1'));
    expect(stepText).toBeTruthy();
  });

  it('should handle many steps', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={8} total={10} />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const stepText = texts.find(t => t.props.children && t.props.children.includes('9 / 10'));
    expect(stepText).toBeTruthy();
  });

  it('should render dots container', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={0} total={6} />);
    });

    const instance = component.root;
    const views = instance.findAllByType('View');

    // Should have at least container + dotsContainer + dots
    expect(views.length).toBeGreaterThanOrEqual(2);
  });

  it('should update when current step changes', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={0} total={6} />);
    });

    let instance = component.root;
    let texts = instance.findAllByType('Text');
    let stepText = texts.find(t => t.props.children && t.props.children.includes('1 / 6'));
    expect(stepText).toBeTruthy();

    // Update to step 2
    act(() => {
      component.update(<StepIndicator current={1} total={6} />);
    });

    instance = component.root;
    texts = instance.findAllByType('Text');
    stepText = texts.find(t => t.props.children && t.props.children.includes('2 / 6'));
    expect(stepText).toBeTruthy();
  });
});
