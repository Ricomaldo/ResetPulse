/**
 * @fileoverview StepIndicator component smoke tests
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import StepIndicator from '../../src/components/onboarding/StepIndicator';

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

jest.mock('../../src/screens/onboarding/onboardingConstants', () => ({
  rs: (value) => value,
}));

describe('StepIndicator', () => {
  it('should render first step', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={0} total={6} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('should render middle step', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={3} total={6} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('should render last step', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={5} total={6} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('should handle single step', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={0} total={1} />);
    });
    expect(component).toBeTruthy();
  });

  it('should handle many steps', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={8} total={10} />);
    });
    expect(component).toBeTruthy();
  });

  it('should update when step changes', () => {
    let component;
    act(() => {
      component = create(<StepIndicator current={0} total={6} />);
    });
    act(() => {
      component.update(<StepIndicator current={3} total={6} />);
    });
    expect(component).toBeTruthy();
  });
});
