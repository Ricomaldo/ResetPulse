/**
 * @fileoverview Button component smoke tests
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import {
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
  TextButton,
} from '../../src/components/buttons/Button';

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

jest.mock('../../src/styles/focusStyles', () => ({
  createFocusStyle: () => ({}),
}));

describe('Button Components', () => {
  it('PrimaryButton: should render', () => {
    let component;
    act(() => {
      component = create(<PrimaryButton label="Continue" onPress={() => {}} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('SecondaryButton: should render', () => {
    let component;
    act(() => {
      component = create(<SecondaryButton label="Cancel" onPress={() => {}} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('DestructiveButton: should render', () => {
    let component;
    act(() => {
      component = create(<DestructiveButton label="Delete" onPress={() => {}} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('TextButton: should render', () => {
    let component;
    act(() => {
      component = create(<TextButton label="Learn More" onPress={() => {}} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('PrimaryButton: should handle loading state', () => {
    let component;
    act(() => {
      component = create(<PrimaryButton label="Loading" onPress={() => {}} loading={true} />);
    });
    expect(component).toBeTruthy();
  });

  it('PrimaryButton: should handle disabled state', () => {
    let component;
    act(() => {
      component = create(<PrimaryButton label="Disabled" onPress={() => {}} disabled={true} />);
    });
    expect(component).toBeTruthy();
  });
});
