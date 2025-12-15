/**
 * @fileoverview DiscoveryModal component tests
 * Smoke tests for discovery modal
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import DiscoveryModal from '../../src/components/modals/DiscoveryModal';

jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      text: '#000000',
      brand: { primary: '#007AFF' },
    },
    spacing: { sm: 4, md: 12, lg: 16, xl: 24 },
    shadow: () => ({}),
  }),
}));

jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => key,
}));

jest.mock('../../src/contexts/ModalStackContext', () => ({
  useModalStack: () => ({ push: jest.fn(), pop: jest.fn() }),
}));

describe('DiscoveryModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onUnlock: jest.fn(),
    title: 'Discover',
    subtitle: 'New features',
  };

  it('should render when visible is true', () => {
    let component;
    act(() => {
      component = create(<DiscoveryModal {...defaultProps} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('should handle visible prop change', () => {
    let component;
    act(() => {
      component = create(<DiscoveryModal {...defaultProps} visible={true} />);
    });

    act(() => {
      component.update(<DiscoveryModal {...defaultProps} visible={false} />);
    });

    expect(component).toBeTruthy();
  });
});
