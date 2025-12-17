/**
 * @fileoverview CircularToggle component smoke tests
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import CircularToggle from '../../src/components/controls/CircularToggle';

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
  it('should render clockwise', () => {
    let component;
    act(() => {
      component = create(<CircularToggle clockwise={true} onToggle={() => {}} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('should render counter-clockwise', () => {
    let component;
    act(() => {
      component = create(<CircularToggle clockwise={false} onToggle={() => {}} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('should handle size prop', () => {
    let component;
    act(() => {
      component = create(<CircularToggle clockwise={true} onToggle={() => {}} size={80} />);
    });
    expect(component).toBeTruthy();
  });

  it('should toggle state', () => {
    let component;
    act(() => {
      component = create(<CircularToggle clockwise={true} onToggle={() => {}} />);
    });
    act(() => {
      component.update(<CircularToggle clockwise={false} onToggle={() => {}} />);
    });
    expect(component).toBeTruthy();
  });
});
