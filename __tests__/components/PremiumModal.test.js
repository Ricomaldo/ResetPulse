/**
 * @fileoverview PremiumModal component tests
 * Smoke tests for premium paywall modal
 * @jest-environment jsdom
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import PremiumModal from '../../src/components/modals/PremiumModal';

// Mock dependencies
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      text: '#000000',
      brand: { primary: '#007AFF' },
      fixed: { white: '#FFFFFF' },
    },
    spacing: { sm: 4, md: 12, lg: 16, xl: 24 },
    shadow: () => ({}),
  }),
}));

jest.mock('../../src/contexts/PurchaseContext', () => ({
  usePurchases: () => ({
    purchaseProduct: jest.fn(),
    getOfferings: jest.fn(),
    isPurchasing: false,
  }),
}));

jest.mock('../../src/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackPaywallViewed: jest.fn(),
  }),
}));

jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => key,
}));

jest.mock('../../src/contexts/ModalStackContext', () => ({
  useModalStack: () => ({ push: jest.fn(), pop: jest.fn() }),
}));

describe('PremiumModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    highlightedFeature: 'activities',
  };

  it('should render when visible is true', () => {
    let component;
    act(() => {
      component = create(<PremiumModal {...defaultProps} />);
    });
    expect(component.toJSON()).toBeTruthy();
  });

  it('should handle visible prop change', () => {
    let component;
    act(() => {
      component = create(<PremiumModal {...defaultProps} visible={true} />);
    });

    // Update visibility
    act(() => {
      component.update(<PremiumModal {...defaultProps} visible={false} />);
    });

    // Component instance should exist
    expect(component).toBeTruthy();
  });
});
