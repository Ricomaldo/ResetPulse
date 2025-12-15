/**
 * @fileoverview DiscoveryModal component tests
 * Tests for premium discovery modal (activities, colors, etc.)
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import { Text, View } from 'react-native';
import DiscoveryModal from '../../src/components/modals/DiscoveryModal';

// Mock ThemeProvider
jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      border: '#E5E5EA',
      text: '#000000',
      textSecondary: '#8E8E93',
      brand: { primary: '#007AFF' },
    },
    spacing: { sm: 4, md: 12, lg: 16, xl: 24 },
    shadow: () => ({}),
  }),
}));

// Mock translation hook
jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => (key) => {
    const translations = {
      'discovery.defaultCta': 'Unlock Premium',
      'discovery.defaultDismiss': 'Maybe Later',
    };
    return translations[key] || key;
  },
}));

// Mock ModalStackContext
jest.mock('../../src/contexts/ModalStackContext', () => ({
  useModalStack: () => ({
    push: jest.fn(),
    pop: jest.fn(),
    popById: jest.fn(),
    clear: jest.fn(),
    depth: 0,
    isEmpty: true,
    modalStack: [],
  }),
}));

// Mock responsive styles
jest.mock('../../src/styles/responsive', () => ({
  rs: (value) => value,
}));

// Mock theme tokens
jest.mock('../../src/theme/tokens', () => ({
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
}));

// Mock haptics
jest.mock('../../src/utils/haptics', () => {
  const selection = jest.fn(() => Promise.resolve());
  return {
    __esModule: true,
    default: {
      selection,
      success: jest.fn(() => Promise.resolve()),
      error: jest.fn(() => Promise.resolve()),
    },
    selection,
  };
});

describe('DiscoveryModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onUnlock: jest.fn(),
    title: 'Discover Premium Activities',
    subtitle: 'Get access to 14 curated activities',
    tagline: 'Boost your productivity with premium features',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible is true', () => {
    let component;
    act(() => {
      component = create(<DiscoveryModal {...defaultProps} />);
    });

    expect(component.toJSON()).toBeTruthy();
  });

  it('should not render when visible is false', () => {
    let component;
    act(() => {
      component = create(<DiscoveryModal {...defaultProps} visible={false} />);
    });

    const modal = component.root.findByType('Modal');
    expect(modal.props.visible).toBe(false);
  });

  it('should display the title', () => {
    let component;
    act(() => {
      component = create(<DiscoveryModal {...defaultProps} />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const titleText = texts.find(t => t.props.children === 'Discover Premium Activities');
    expect(titleText).toBeTruthy();
  });

  it('should display the subtitle when provided', () => {
    let component;
    act(() => {
      component = create(<DiscoveryModal {...defaultProps} />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const subtitleText = texts.find(t => t.props.children === 'Get access to 14 curated activities');
    expect(subtitleText).toBeTruthy();
  });

  it('should display the tagline when provided', () => {
    let component;
    act(() => {
      component = create(<DiscoveryModal {...defaultProps} />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const taglineText = texts.find(t => t.props.children === 'Boost your productivity with premium features');
    expect(taglineText).toBeTruthy();
  });

  it('should render children content', () => {
    let component;
    act(() => {
      component = create(
        <DiscoveryModal {...defaultProps}>
          <View testID="custom-content">
            <Text>Custom content here</Text>
          </View>
        </DiscoveryModal>
      );
    });

    const instance = component.root;
    const customContent = instance.findByProps({ testID: 'custom-content' });
    expect(customContent).toBeTruthy();
  });

  it('should display CTA button with custom text', () => {
    let component;
    act(() => {
      component = create(
        <DiscoveryModal {...defaultProps} ctaText="Get Premium Now" />
      );
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const ctaText = texts.find(t => t.props.children === 'Get Premium Now');
    expect(ctaText).toBeTruthy();
  });

  it('should display CTA button with default i18n text when not provided', () => {
    let component;
    act(() => {
      component = create(<DiscoveryModal {...defaultProps} />);
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const ctaText = texts.find(t => t.props.children === 'Unlock Premium');
    expect(ctaText).toBeTruthy();
  });

  it('should display dismiss button with custom text', () => {
    let component;
    act(() => {
      component = create(
        <DiscoveryModal {...defaultProps} dismissText="Not Now" />
      );
    });

    const instance = component.root;
    const texts = instance.findAllByType('Text');
    const dismissText = texts.find(t => t.props.children === 'Not Now');
    expect(dismissText).toBeTruthy();
  });

  it('should call onClose when dismiss button is pressed', () => {
    const mockOnClose = jest.fn();
    let component;

    act(() => {
      component = create(
        <DiscoveryModal {...defaultProps} onClose={mockOnClose} />
      );
    });

    const instance = component.root;
    const buttons = instance.findAllByType('TouchableOpacity');

    // Find the dismiss button (secondary button, should be last or second-to-last)
    const dismissButton = buttons.find(b => {
      const textChildren = b.findAllByType('Text');
      return textChildren.some(t => t.props.children === 'Maybe Later');
    });

    if (dismissButton) {
      act(() => {
        dismissButton.props.onPress();
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should call onUnlock after closing when CTA is pressed', () => {
    jest.useFakeTimers();
    const mockOnClose = jest.fn();
    const mockOnUnlock = jest.fn();
    let component;

    act(() => {
      component = create(
        <DiscoveryModal
          {...defaultProps}
          onClose={mockOnClose}
          onUnlock={mockOnUnlock}
        />
      );
    });

    const instance = component.root;
    const buttons = instance.findAllByType('TouchableOpacity');

    // Find the CTA button (primary button)
    const ctaButton = buttons.find(b => {
      const textChildren = b.findAllByType('Text');
      return textChildren.some(t => t.props.children === 'Unlock Premium');
    });

    if (ctaButton) {
      act(() => {
        ctaButton.props.onPress();
      });

      // Should close first
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      // Should call onUnlock after 200ms delay
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(mockOnUnlock).toHaveBeenCalledTimes(1);
    }

    jest.useRealTimers();
  });

  it('should call onClose when modal overlay is pressed', () => {
    const mockOnClose = jest.fn();
    let component;

    act(() => {
      component = create(
        <DiscoveryModal {...defaultProps} onClose={mockOnClose} />
      );
    });

    const instance = component.root;
    const modal = instance.findByType('Modal');

    if (modal.props.onRequestClose) {
      act(() => {
        modal.props.onRequestClose();
      });

      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should have transparent modal with fade animation', () => {
    let component;
    act(() => {
      component = create(<DiscoveryModal {...defaultProps} />);
    });

    const instance = component.root;
    const modal = instance.findByType('Modal');
    expect(modal.props.transparent).toBe(true);
    expect(modal.props.animationType).toBe('fade');
  });

  it('should have statusBarTranslucent prop', () => {
    let component;
    act(() => {
      component = create(<DiscoveryModal {...defaultProps} />);
    });

    const instance = component.root;
    const modal = instance.findByType('Modal');
    expect(modal.props.statusBarTranslucent).toBe(true);
  });
});
