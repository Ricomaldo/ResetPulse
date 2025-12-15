/**
 * @fileoverview DurationSlider component tests
 * Smoke tests for duration picker
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import DurationSlider from '../../src/components/pickers/DurationSlider';

jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: { brand: { primary: '#007AFF' }, surface: '#FFFFFF' },
    spacing: { sm: 4, md: 12, lg: 16 },
    borderRadius: { md: 8 },
    shadow: () => ({}),
  }),
}));

jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => key,
}));

describe('DurationSlider', () => {
  const defaultProps = {
    value: 1500,
    onValueChange: jest.fn(),
  };

  it('should render without crashing', () => {
    let component;
    act(() => {
      component = create(<DurationSlider {...defaultProps} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('should handle value prop change', () => {
    let component;
    act(() => {
      component = create(<DurationSlider {...defaultProps} value={1500} />);
    });

    act(() => {
      component.update(<DurationSlider {...defaultProps} value={1800} />);
    });

    expect(component).toBeTruthy();
  });
});
